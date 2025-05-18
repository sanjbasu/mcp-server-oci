# Create knowledge base agent

import { BaseAgent } from './agent-base';

export class KnowledgeBaseAgent extends BaseAgent {
  constructor(client, name = 'KnowledgeBaseAgent', role = 'Historical incident knowledge specialist') {
    super(client, name, role);
  }
  
  async findSimilarIncidents(keywords: string[]): Promise<any[]> {
    console.log(`[${this.name}] Searching for incidents with keywords: ${keywords.join(', ')}`);
    this.remember(`Searching for incidents with keywords: ${keywords.join(', ')}`);
    
    try {
      // Search for historical incidents
      const incidents = await this.callTool('search_historical_incidents', { keywords });
      this.remember(`Found ${incidents.length} similar incidents`);
      
      return incidents;
    } catch (error) {
      console.error(`[${this.name}] Error finding similar incidents:`, error);
      this.remember(`Error finding similar incidents: ${error.message}`);
      throw error;
    }
  }
  
  async analyzeIncidentPatterns(incidents: any[]): Promise<any> {
    if (!incidents || incidents.length === 0) {
      return {
        patterns: [],
        commonCauses: [],
        effectiveness: []
      };
    }
    
    const analysisPrompt = `
      You are ${this.name}, a historical incident knowledge specialist.
      You need to analyze patterns across these historical incidents:
      ${JSON.stringify(incidents, null, 2)}
      
      Please identify:
      1. Common patterns in symptoms across these incidents
      2. Recurring root causes
      3. Which resolution strategies were most effective
      4. How this knowledge can be applied to similar future incidents
      
      Format your response as valid JSON with the following structure:
      {
        "commonSymptoms": [{"symptom": "string", "frequency": "number", "significance": "string"}],
        "recurringCauses": [{"cause": "string", "frequency": "number", "indicators": ["string"]}],
        "effectiveStrategies": [{"strategy": "string", "effectiveness": "string", "applicability": "string"}],
        "lessonsLearned": ["string"]
      }
    `;
    
    try {
      const analysisResponse = await this.callLLM(analysisPrompt, 2000);
      
      // Extract and parse JSON from the response
      const jsonMatch = analysisResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                        analysisResponse.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
      } else {
        console.error(`[${this.name}] Failed to parse JSON from LLM response`);
        return {
          error: "Failed to generate structured pattern analysis",
          rawAnalysis: analysisResponse
        };
      }
    } catch (error) {
      console.error(`[${this.name}] Error analyzing incident patterns:`, error);
      return {
        error: `Error analyzing incident patterns: ${error.message}`
      };
    }
  }
  
  override async receiveMessage(senderName: string, message: string): Promise<string> {
    this.remember(`Received from ${senderName}: ${message}`);
    
    // Check if the message is requesting historical knowledge
    if (message.toLowerCase().includes('similar') || 
        message.toLowerCase().includes('historical') || 
        message.toLowerCase().includes('previous') || 
        message.toLowerCase().includes('pattern')) {
      
      // Extract keywords
      const keywordMatches = message.match(/keyword[s]?:(.+?)(?=\.|$)/i) || 
                            message.match(/similar to:(.+?)(?=\.|$)/i);
      
      let keywords: string[] = [];
      if (keywordMatches) {
        keywords = keywordMatches[1].split(',').map(k => k.trim());
      } else {
        // Extract potential keywords from the message
        keywords = message.split(' ')
          .filter(word => word.length > 4)
          .filter(word => !['similar', 'historical', 'previous', 'pattern', 'incident', 'about'].includes(word.toLowerCase()))
          .slice(0, 5);
      }
      
      if (keywords.length === 0) {
        return `I need some specific keywords to search for similar incidents. Could you provide some terms related to the current issue?`;
      }
      
      try {
        const similarIncidents = await this.findSimilarIncidents(keywords);
        
        if (similarIncidents.length === 0) {
          return `I couldn't find any historical incidents related to the keywords: ${keywords.join(', ')}. Could you try with different keywords?`;
        }
        
        const patternAnalysis = await this.analyzeIncidentPatterns(similarIncidents);
        
        // Generate a response based on the similar incidents and pattern analysis
        const responsePrompt = `
          You are ${this.name}, a historical incident knowledge specialist.
          You were asked: "${message}"
          
          You've found these similar historical incidents:
          ${JSON.stringify(similarIncidents, null, 2)}
          
          And analyzed these patterns:
          ${JSON.stringify(patternAnalysis, null, 2)}
          
          Please provide a concise, helpful response summarizing:
          1. The most relevant historical incidents
          2. Key patterns that might apply to the current situation
          3. The most successful resolution approaches based on history
          
          Keep your response under 300 words.
        `;
        
        const response = await this.callLLM(responsePrompt);
        this.remember(`Sent to ${senderName}: ${response}`);
        
        return response;
      } catch (error) {
        return `I encountered an error while searching for similar incidents: ${error.message}`;
      }
    }
    
    // For other types of messages, use the default handler
    return super.receiveMessage(senderName, message);
  }
}
