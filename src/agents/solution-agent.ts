# Create solution agent

import { BaseAgent } from './agent-base';

export class SolutionAgent extends BaseAgent {
  constructor(client, name = 'SolutionAgent', role = 'Remediation strategy specialist') {
    super(client, name, role);
  }
  
  async proposeRemediation(issue: string, analysisData?: any): Promise<any> {
    console.log(`[${this.name}] Proposing remediation for issue: ${issue}`);
    this.remember(`Proposing remediation for issue: ${issue}`);
    
    try {
      // Get remediation strategies for the issue
      const strategies = await this.callTool('get_remediation_strategies', { issue });
      this.remember(`Retrieved remediation strategies for issue: ${issue}`);
      
      // If no exact matches, try with more general terms
      if ((!strategies.exactMatches || strategies.exactMatches.length === 0) && 
          (!strategies.partialMatches || strategies.partialMatches.length === 0)) {
        
        // Extract key terms from the issue
        const terms = issue.split(' ')
          .filter(term => term.length > 3)
          .map(term => term.toLowerCase());
        
        for (const term of terms) {
          const termStrategies = await this.callTool('get_remediation_strategies', { issue: term });
          if ((termStrategies.exactMatches && termStrategies.exactMatches.length > 0) || 
              (termStrategies.partialMatches && termStrategies.partialMatches.length > 0)) {
            
            // Combine the strategies
            strategies.exactMatches = strategies.exactMatches || [];
            strategies.partialMatches = strategies.partialMatches || [];
            
            if (termStrategies.exactMatches) {
              strategies.exactMatches = [...strategies.exactMatches, ...termStrategies.exactMatches];
            }
            
            if (termStrategies.partialMatches) {
              strategies.partialMatches = [...strategies.partialMatches, ...termStrategies.partialMatches];
            }
          }
        }
      }
      
      // Rank and customize the remediation plan
      const remediationPlan = await this.createCustomRemediationPlan(issue, strategies, analysisData);
      
      return remediationPlan;
    } catch (error) {
      console.error(`[${this.name}] Error proposing remediation:`, error);
      this.remember(`Error proposing remediation: ${error.message}`);
      throw error;
    }
  }
  
  private async createCustomRemediationPlan(issue: string, strategies: any, analysisData?: any): Promise<any> {
    const planPrompt = `
      You are ${this.name}, a remediation strategy specialist.
      You need to create a customized remediation plan for the following issue:
      "${issue}"
      
      Available remediation strategies:
      ${JSON.stringify(strategies, null, 2)}
      
      ${analysisData ? `Additional analysis data:
      ${JSON.stringify(analysisData, null, 2)}` : ''}
      
      Please create a comprehensive remediation plan that:
      1. Ranks the available strategies from most to least appropriate for this specific issue
      2. Customizes the implementation steps for this particular context
      3. Includes immediate actions to mitigate the problem
      4. Suggests longer-term solutions to prevent recurrence
      
      Format your response as valid JSON with the following structure:
      {
        "immediateActions": [{"action": "string", "rationale": "string", "steps": ["string"]}],
        "longTermSolutions": [{"solution": "string", "benefits": "string", "implementation": ["string"]}],
        "potentialChallenges": ["string"],
        "successMetrics": ["string"]
      }
    `;
    
    try {
      const planResponse = await this.callLLM(planPrompt, 2000);
      
      // Extract and parse JSON from the response
      const jsonMatch = planResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                        planResponse.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
      } else {
        console.error(`[${this.name}] Failed to parse JSON from LLM response`);
        return {
          error: "Failed to generate structured remediation plan",
          rawPlan: planResponse
        };
      }
    } catch (error) {
      console.error(`[${this.name}] Error creating remediation plan:`, error);
      return {
        error: `Error creating remediation plan: ${error.message}`
      };
    }
  }
  
  override async receiveMessage(senderName: string, message: string): Promise<string> {
    this.remember(`Received from ${senderName}: ${message}`);
    
    // Check if the message is requesting remediation
    if (message.toLowerCase().includes('remediat') || 
        message.toLowerCase().includes('fix') || 
        message.toLowerCase().includes('solve') || 
        message.toLowerCase().includes('solution')) {
      
      // Extract issue description
      let issue = message;
      if (message.toLowerCase().includes('issue:')) {
        const match = message.match(/issue:(.+?)(?=\.|$)/i);
        if (match) {
          issue = match[1].trim();
        }
      }
      
      try {
        const remediationPlan = await this.proposeRemediation(issue);
        
        // Generate a response based on the remediation plan
        const responsePrompt = `
          You are ${this.name}, a remediation strategy specialist.
          You were asked: "${message}"
          
          You've developed the following remediation plan:
          ${JSON.stringify(remediationPlan, null, 2)}
          
          Please provide a concise, helpful response summarizing your plan.
          Focus on the most important immediate actions and key long-term solutions.
          Keep your response under 250 words.
        `;
        
        const response = await this.callLLM(responsePrompt);
        this.remember(`Sent to ${senderName}: ${response}`);
        
        return response;
      } catch (error) {
        return `I encountered an error while creating a remediation plan: ${error.message}`;
      }
    }
    
    // For other types of messages, use the default handler
    return super.receiveMessage(senderName, message);
  }
}
