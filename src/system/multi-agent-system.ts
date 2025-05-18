# Create multi-agent system orchestrator

import { BaseAgent } from '../agents/agent-base';
import { IncidentManager } from '../agents/incident-manager';
import { DiagnosticAgent } from '../agents/diagnostic-agent';
import { SolutionAgent } from '../agents/solution-agent';
import { KnowledgeBaseAgent } from '../agents/knowledge-base-agent';
import { createMCPClient } from './mcp-client';

export class IncidentManagementSystem {
  private agents: Map<string, BaseAgent> = new Map();
  private incidentManager: IncidentManager | null = null;
  
  async initialize(serverUrl: string): Promise<void> {
    console.log('Initializing Incident Management System...');
    
    // Create shared MCP client for all agents
    const mcpClient = await createMCPClient(serverUrl);
    
    // Create specialized agents
    this.incidentManager = new IncidentManager(mcpClient);
    const diagnosticAgent = new DiagnosticAgent(mcpClient);
    const solutionAgent = new SolutionAgent(mcpClient);
    const knowledgeBaseAgent = new KnowledgeBaseAgent(mcpClient);
    
    // Register all agents
    this.registerAgent(this.incidentManager);
    this.registerAgent(diagnosticAgent);
    this.registerAgent(solutionAgent);
    this.registerAgent(knowledgeBaseAgent);
    
    console.log('Incident Management System initialized with 4 agents');
  }
  
  private registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.getName(), agent);
  }
  
  getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }
  
  async handleIncident(description: string): Promise<any> {
    if (!this.incidentManager) {
      throw new Error('Incident Management System not initialized');
    }
    
    console.log('===== HANDLING NEW INCIDENT =====');
    console.log(`Incident Description: ${description}`);
    console.log('=================================');
    
    // Step 1: Start the incident management process
    const report = await this.incidentManager.startIncidentManagement(description);
    
    // Step 2: Consult with specialized agents about specific aspects
    const diagnosticAgent = this.getAgent('DiagnosticAgent') as DiagnosticAgent;
    const solutionAgent = this.getAgent('SolutionAgent') as SolutionAgent;
    const knowledgeBaseAgent = this.getAgent('KnowledgeBaseAgent') as KnowledgeBaseAgent;
    
    // Request specialized diagnostic analysis
    const diagnosticTask = `Please provide a detailed diagnostic analysis for this incident: "${description}". Focus on identifying the root cause.`;
    const diagnosticResponse = await this.incidentManager.coordinateWithAgent(diagnosticAgent, diagnosticTask);
    
    // Request specialized remediation strategy
    const solutionTask = `Please provide optimal remediation strategies for this incident: "${description}". The root cause appears to be: "${report.rootCause}".`;
    const solutionResponse = await this.incidentManager.coordinateWithAgent(solutionAgent, solutionTask);
    
    // Request historical knowledge
    const historicalTask = `Please identify similar historical incidents to: "${description}". Keywords: ${report.symptoms.join(', ')}. What patterns can we learn from?`;
    const historicalResponse = await this.incidentManager.coordinateWithAgent(knowledgeBaseAgent, historicalTask);
    
    // Compile comprehensive results
    const results = {
      incident: report,
      specialistAnalysis: {
        diagnostic: diagnosticResponse,
        remediation: solutionResponse,
        historical: historicalResponse
      }
    };
    
    console.log('===== INCIDENT RESPONSE COMPLETE =====');
    return results;
  }
  
  async runDiagnosticProcess(serviceName?: string): Promise<any> {
    const diagnosticAgent = this.getAgent('DiagnosticAgent') as DiagnosticAgent;
    if (!diagnosticAgent) {
      throw new Error('Diagnostic Agent not found');
    }
    
    console.log(`Running diagnostic process${serviceName ? ` for service: ${serviceName}` : ''}`);
    
    // Run diagnostics
    return await diagnosticAgent.diagnoseLogs(serviceName);
  }
  
  async findRemediation(issue: string): Promise<any> {
    const solutionAgent = this.getAgent('SolutionAgent') as SolutionAgent;
    if (!solutionAgent) {
      throw new Error('Solution Agent not found');
    }
    
    console.log(`Finding remediation for issue: ${issue}`);
    
    // Generate remediation plan
    return await solutionAgent.proposeRemediation(issue);
  }
  
  async searchKnowledgeBase(keywords: string[]): Promise<any> {
    const knowledgeBaseAgent = this.getAgent('KnowledgeBaseAgent') as KnowledgeBaseAgent;
    if (!knowledgeBaseAgent) {
      throw new Error('Knowledge Base Agent not found');
    }
    
    console.log(`Searching knowledge base with keywords: ${keywords.join(', ')}`);
    
    // Search for similar incidents
    const incidents = await knowledgeBaseAgent.findSimilarIncidents(keywords);
    const analysis = await knowledgeBaseAgent.analyzeIncidentPatterns(incidents);
    
    return {
      incidents,
      analysis
    };
  }
}
