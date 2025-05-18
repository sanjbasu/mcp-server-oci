# Create base agent

import { MCPClient } from '@modelcontextprotocol/client-typescript';
import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'your-api-key',
});

export class BaseAgent {
  protected client: MCPClient;
  protected name: string;
  protected role: string;
  protected memory: string[] = [];
  
  constructor(client: MCPClient, name: string, role: string) {
    this.client = client;
    this.name = name;
    this.role = role;
  }
  
  getName(): string {
    return this.name;
  }
  
  getRole(): string {
    return this.role;
  }
  
  getMemory(): string[] {
    return this.memory;
  }
  
  protected async callLLM(prompt: string, maxTokens: number = 1000): Promise<string> {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      });
      
      return response.content[0].text;
    } catch (error) {
      console.error(`Error calling LLM for ${this.name}:`, error);
      return `Error: Unable to generate response - ${error.message}`;
    }
  }
  
  protected async callTool(toolName: string, params: any): Promise<any> {
    try {
      console.log(`[${this.name}] Calling MCP tool: ${toolName}`);
      const result = await this.client.callTool(toolName, params);
      return result;
    } catch (error) {
      console.error(`Error calling MCP tool ${toolName} for ${this.name}:`, error);
      throw error;
    }
  }
  
  async receiveMessage(senderName: string, message: string): Promise<string> {
    this.remember(`Received from ${senderName}: ${message}`);
    
    // Default implementation just generates a response
    const prompt = `
      You are ${this.name}, a specialized agent with the role of ${this.role}.
      You received the following message from ${senderName}: "${message}"
      
      Respond directly and helpfully in your specialized role. Be concise and focused.
    `;
    
    const response = await this.callLLM(prompt);
    this.remember(`Sent to ${senderName}: ${response}`);
    
    return response;
  }
  
  protected remember(entry: string): void {
    this.memory.push(`[${new Date().toISOString()}] ${entry}`);
    // Keep memory size manageable
    if (this.memory.length > 100) {
      this.memory.shift();
    }
  }
}
