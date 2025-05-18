# Continuing with index.ts

import { IncidentManagementSystem } from './system/multi-agent-system';

// Sample incident descriptions for testing
const sampleIncidents = [
  {
    title: 'Authentication Service Failure',
    description: 'Users are reporting inability to log in to the application. Multiple login failures are being reported across all regions. The issue started approximately 30 minutes ago and is ongoing.'
  },
  {
    title: 'Database Performance Degradation',
    description: 'The application is experiencing slow response times for database queries. Users report timeouts when trying to access certain reports. System monitoring shows high CPU usage on the database server.'
  },
  {
    title: 'API Gateway Connectivity Issues',
    description: 'Internal services are unable to communicate through the API gateway. Timeout errors are being reported by multiple microservices when trying to access the authentication service.'
  }
];

async function main() {
  try {
    // Get the server URL from environment or use default
    const serverUrl = process.env.MCP_SERVER_URL || 'http://localhost:8080';
    
    // Create and initialize the incident management system
    console.log('Creating incident management system...');
    const system = new IncidentManagementSystem();
    await system.initialize(serverUrl);
    
    // Select which incident to handle
    const incidentIndex = process.argv[2] ? parseInt(process.argv[2]) : 0;
    const selectedIncident = sampleIncidents[incidentIndex] || sampleIncidents[0];
    
    console.log(`\n===== HANDLING INCIDENT: ${selectedIncident.title} =====\n`);
    
    // Handle the incident
    const result = await system.handleIncident(selectedIncident.description);
    
    // Display the results
    console.log('\n===== INCIDENT REPORT =====\n');
    console.log(`Title: ${result.incident.title}`);
    console.log(`ID: ${result.incident.id}`);
    console.log(`Symptoms:`);
    result.incident.symptoms.forEach((symptom: string) => console.log(`- ${symptom}`));
    console.log(`\nRoot Cause: ${result.incident.rootCause}`);
    console.log(`\nRemediation: ${result.incident.remediation}`);
    
    console.log('\n===== SPECIALIST INSIGHTS =====\n');
    console.log('Diagnostic Analysis:');
    console.log(result.specialistAnalysis.diagnostic);
    
    console.log('\nRemediation Strategy:');
    console.log(result.specialistAnalysis.remediation);
    
    console.log('\nHistorical Context:');
    console.log(result.specialistAnalysis.historical);
    
    console.log('\n===== DEMO COMPLETED SUCCESSFULLY =====');
    
    // Optional: Add other example functionalities
    if (process.argv.includes('--run-all')) {
      console.log('\n\n===== ADDITIONAL DEMONSTRATIONS =====');
      
      // Demo 1: Run diagnostics for a specific service
      console.log('\n[Demo] Running diagnostics for authentication service...');
      const diagnosticResults = await system.runDiagnosticProcess('authentication');
      console.log('Diagnostic results summary:');
      console.log(`- ${diagnosticResults.totalLogs} logs analyzed`);
      console.log(`- ${diagnosticResults.errorCount} errors identified`);
      console.log('Potential issues:');
      diagnosticResults.potentialIssues.forEach((issue: string) => console.log(`- ${issue}`));
      
      // Demo 2: Find remediation strategies for a specific issue
      console.log('\n[Demo] Finding remediation for database connection pool exhaustion...');
      const remediationPlan = await system.findRemediation('database connection pool exhaustion');
      console.log('Recommended immediate actions:');
      remediationPlan.immediateActions.forEach((action: any) => {
        console.log(`- ${action.action}: ${action.rationale}`);
      });
      
      // Demo 3: Search knowledge base
      console.log('\n[Demo] Searching knowledge base for similar incidents...');
      const knowledgeResults = await system.searchKnowledgeBase(['database', 'performance', 'cpu']);
      console.log(`Found ${knowledgeResults.incidents.length} similar historical incidents`);
      if (knowledgeResults.analysis.commonSymptoms) {
        console.log('Common symptoms:');
        knowledgeResults.analysis.commonSymptoms.forEach((symptom: any) => {
          console.log(`- ${symptom.symptom} (frequency: ${symptom.frequency})`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error running incident management system:', error);
  }
}

// Run the main function
main();
