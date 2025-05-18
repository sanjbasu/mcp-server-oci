# Create diagnostic agent

import { BaseAgent } from './agent-base';

export class DiagnosticAgent extends BaseAgent {
  constructor(client, name = 'DiagnosticAgent', role = 'System diagnostics specialist') {
    super(client, name, role);
  }
  
  async diagnoseLogs(serviceFilter?: string): Promise<any> {
    console.log(`[${this.name}] Performing diagnostics${serviceFilter ? ` for service: ${serviceFilter}` : ''}`);
    this.remember(`Starting log diagnostics${serviceFilter ? ` for service: ${serviceFilter}` : ''}`);
    
    try {
      // Get system logs
      const logs = await this.callTool('get_system_logs', { 
        service: serviceFilter 
      });
      this.remember(`Retrieved ${logs.length} logs`);
      
      // Analyze the logs
      const analysis = await this.callTool('analyze_logs', { logs });
      this.remember(`Completed log analysis`);
      
      // Enrich the analysis with expertise
      const enrichedAnalysis = await this.enrichAnalysis(logs, analysis);
      
      return enrichedAnalysis;
    } catch (error) {
      console.error(`[${this.name}] Error in log diagnostics:`, error);
      this.remember(`Error in log diagnostics: ${error.message}`);
      throw error;
    }
  }
  
  private async enrichAnalysis(logs: any[], analysis: any): Promise<any> {
    const enrichmentPrompt = `
      You are ${this.name}, a system diagnostics specialist.
      You need to analyze system logs and provide expert insight.
      
      Logs:
      ${JSON.stringify(logs, null, 2)}
      
      Initial Analysis:
      ${JSON.stringify(analysis, null, 2)}
      
      Based on your expertise, please:
      1. Identify any patterns or issues not captured in the initial analysis
      2. Prioritize the issues by severity (Critical, High, Medium, Low)
      3. Suggest what additional data might be needed for a more complete diagnosis
      
      Format your response as valid JSON with the following structure:
      {
        "additionalPatterns": [{"pattern": "string", "description": "string"}],
        "prioritizedIssues": [{"issue": "string", "severity": "string", "reasoning": "string"}],
        "recommendedNextSteps": ["string"],
        "additionalDataNeeded": ["string"]
      }
    `;
    
    try {
      const enrichmentResponse = await this.callLLM(enrichmentPrompt, 2000);
      
      // Extract and parse JSON from the response
      const jsonMatch = enrichmentResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                         enrichmentResponse.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        const enrichmentJson = JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
        
        // Combine the initial analysis with the enriched analysis
        return {
          ...analysis,
          expertAnalysis: enrichmentJson
        };
      } else {
        console.error(`[${this.name}] Failed to parse JSON from LLM response`);
        return analysis;
      }
    } catch (error) {
      console.error(`[${this.name}] Error enriching analysis:`, error);
      return analysis;
    }
  }
  
  override async receiveMessage(senderName: string, message: string): Promise<string> {
    this.remember(`Received from ${senderName}: ${message}`);
    
    // Check if the message is requesting diagnostics
    if (message.toLowerCase().includes('diagnos') || 
        message.toLowerCase().includes('analyze') || 
        message.toLowerCase().includes('investigate')) {
      
      // Extract service name if mentioned
      const serviceMatch = message.match(/service\s+['":]?([a-zA-Z0-9-]+)/i);
      const serviceFilter = serviceMatch ? serviceMatch[1] : undefined;
      
      try {
        const diagnosticResults = await this.diagnoseLogs(serviceFilter);
        
        // Generate a response based on the diagnostic results
        const responsePrompt = `
          You are ${this.name}, a system diagnostics specialist.
          You were asked: "${message}"
          
          You've performed diagnostics and found the following:
          ${JSON.stringify(diagnosticResults, null, 2)}
          
          Please provide a concise, helpful response summarizing your findings.
          Focus on the most critical issues and important patterns.
          Keep your response under 200 words.
        `;
        
        const response = await this.callLLM(responsePrompt);
        this.remember(`Sent to ${senderName}: ${response}`);
        
        return response;
      } catch (error) {
        return `I encountered an error while performing diagnostics: ${error.message}`;
      }
    }
    
    // For other types of messages, use the default handler
    return super.receiveMessage(senderName, message);
  }
}
