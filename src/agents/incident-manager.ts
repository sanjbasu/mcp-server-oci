# Create incident manager agent

import { BaseAgent } from './agent-base';

export class IncidentManager extends BaseAgent {
  private incidentData: any = {
    logs: [],
    analysis: null,
    historicalIncidents: [],
    remediationStrategies: [],
    report: null
  };
  
  constructor(client, name = 'IncidentManager', role = 'Incident management coordinator') {
    super(client, name, role);
  }
  
  async startIncidentManagement(description: string): Promise<any> {
    console.log(`[${this.name}] Starting incident management for: ${description}`);
    this.remember(`Starting incident management for: ${description}`);
    
    // Step 1: Get relevant system logs
    await this.getLogs();
    
    // Step 2: Analyze the logs
    await this.analyzeLogs();
    
    // Step 3: Generate an incident report
    const report = await this.generateIncidentReport(description);
    
    return report;
  }
  
  private async getLogs(): Promise<void> {
    try {
      // Get ERROR level logs
      const logs = await this.callTool('get_system_logs', { level: 'ERROR' });
      this.incidentData.logs = logs;
      this.remember(`Retrieved ${logs.length} ERROR logs`);
    } catch (error) {
      console.error(`[${this.name}] Error getting logs:`, error);
      this.remember(`Error getting logs: ${error.message}`);
    }
  }
  
  private async analyzeLogs(): Promise<void> {
    try {
      // Analyze the logs
      const analysis = await this.callTool('analyze_logs', { logs: this.incidentData.logs });
      this.incidentData.analysis = analysis;
      this.remember(`Performed log analysis: ${JSON.stringify(analysis)}`);
      
      // Search for similar historical incidents based on common patterns
      if (analysis.commonPatterns && analysis.commonPatterns.length > 0) {
        const keywords = analysis.commonPatterns.map((pattern: any) => pattern.pattern);
        const historicalIncidents = await this.callTool('search_historical_incidents', { keywords });
        this.incidentData.historicalIncidents = historicalIncidents;
        this.remember(`Found ${historicalIncidents.length} relevant historical incidents`);
      }
      
      // Get remediation strategies for potential issues
      if (analysis.potentialIssues && analysis.potentialIssues.length > 0) {
        for (const issue of analysis.potentialIssues) {
          const strategies = await this.callTool('get_remediation_strategies', { issue });
          this.incidentData.remediationStrategies.push({
            issue,
            strategies
          });
        }
        this.remember(`Retrieved remediation strategies for ${analysis.potentialIssues.length} issues`);
      }
    } catch (error) {
      console.error(`[${this.name}] Error analyzing logs:`, error);
      this.remember(`Error analyzing logs: ${error.message}`);
    }
  }
  
  private async generateIncidentReport(description: string): Promise<any> {
    try {
      // Use LLM to synthesize findings
      const synthesisPrompt = `
        You are ${this.name}, an incident management coordinator.
        You need to analyze the following information to create an incident report:
        
        Incident Description: ${description}
        
        System Logs:
        ${JSON.stringify(this.incidentData.logs, null, 2)}
        
        Log Analysis:
        ${JSON.stringify(this.incidentData.analysis, null, 2)}
        
        Historical Incidents:
        ${JSON.stringify(this.incidentData.historicalIncidents, null, 2)}
        
        Remediation Strategies:
        ${JSON.stringify(this.incidentData.remediationStrategies, null, 2)}
        
        Based on this information, please:
        1. Identify the likely root cause of the incident
        2. List the main symptoms observed
        3. Suggest the most appropriate remediation strategy
        4. Provide a concise title for this incident
        
        Format your response as follows:
        TITLE: [Incident title]
        SYMPTOMS: [Bullet list of symptoms]
        ROOT_CAUSE: [Identified root cause]
        REMEDIATION: [Recommended remediation steps]
      `;
      
      const synthesis = await this.callLLM(synthesisPrompt, 2000);
      
      // Parse the LLM output
      const titleMatch = synthesis.match(/TITLE:\s*(.+)/);
      const symptomsMatch = synthesis.match(/SYMPTOMS:\s*([\s\S]*?)(?=ROOT_CAUSE:|$)/);
      const rootCauseMatch = synthesis.match(/ROOT_CAUSE:\s*([\s\S]*?)(?=REMEDIATION:|$)/);
      const remediationMatch = synthesis.match(/REMEDIATION:\s*([\s\S]*?)(?=$)/);
      
      const title = titleMatch ? titleMatch[1].trim() : 'Unspecified Incident';
      const symptomsText = symptomsMatch ? symptomsMatch[1].trim() : '';
      const rootCause = rootCauseMatch ? rootCauseMatch[1].trim() : 'Unknown';
      const remediation = remediationMatch ? remediationMatch[1].trim() : 'No remediation steps provided';
      
      // Parse symptoms into array
      const symptoms = symptomsText
        .split('\n')
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(line => line);
      
      // Create the incident report
      const report = await this.callTool('create_incident_report', {
        title,
        symptoms,
        rootCause,
        remediation
      });
      
      this.incidentData.report = report.report;
      this.remember(`Generated incident report: ${title}`);
      
      return report.report;
    } catch (error) {
      console.error(`[${this.name}] Error generating incident report:`, error);
      this.remember(`Error generating incident report: ${error.message}`);
      throw error;
    }
  }
  
  async coordinateWithAgent(agent: BaseAgent, task: string): Promise<string> {
    console.log(`[${this.name}] Coordinating with ${agent.getName()} for task: ${task}`);
    this.remember(`Coordinating with ${agent.getName()} for task: ${task}`);
    
    // Send the task to the specialized agent
    const response = await agent.receiveMessage(this.name, task);
    this.remember(`Received response from ${agent.getName()}: ${response}`);
    
    return response;
  }
}
