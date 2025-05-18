# Create MCP server implementation

import { createServer } from 'http';
import { MCPServer, ToolCall, ToolResponse } from '@modelcontextprotocol/server-typescript';
import { 
  getLogsToolDefinition,
  analyzeLogsToolDefinition,
  searchHistoricalIncidentsToolDefinition,
  getRemediationStrategiesToolDefinition,
  createIncidentReportToolDefinition
} from './tools';
import { 
  systemLogs, 
  historicalIncidents, 
  remediationStrategies 
} from './data';

// Storage for generated incident reports
const incidentReports: any[] = [];

// Create the MCP server
const server = new MCPServer({
  title: 'Incident Management MCP Server',
  description: 'An MCP server for incident management and resolution',
  version: '1.0.0'
});

// Register get_system_logs tool
server.registerTool(getLogsToolDefinition, async (call: ToolCall) => {
  const { service, level, startTime, endTime } = call.params;
  console.log(`Fetching logs with filters: service=${service}, level=${level}`);
  
  // Apply filters if provided
  let filteredLogs = [...systemLogs];
  
  if (service) {
    filteredLogs = filteredLogs.filter(log => log.service.toLowerCase() === service.toLowerCase());
  }
  
  if (level) {
    filteredLogs = filteredLogs.filter(log => log.level.toLowerCase() === level.toLowerCase());
  }
  
  if (startTime) {
    const startDate = new Date(startTime);
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
  }
  
  if (endTime) {
    const endDate = new Date(endTime);
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
  }
  
  return new ToolResponse({
    content: JSON.stringify(filteredLogs)
  });
});

// Register analyze_logs tool
server.registerTool(analyzeLogsToolDefinition, async (call: ToolCall) => {
  const { logs } = call.params;
  console.log(`Analyzing ${logs.length} logs`);
  
  // In a real implementation, you would have sophisticated log analysis logic
  // This is a simplified mock implementation
  
  // Count errors by service
  const errorsByService: Record<string, number> = {};
  logs.forEach((log: any) => {
    if (log.level === 'ERROR') {
      errorsByService[log.service] = (errorsByService[log.service] || 0) + 1;
    }
  });
  
  // Identify common error patterns
  const errorMessages = logs
    .filter((log: any) => log.level === 'ERROR')
    .map((log: any) => log.message);
  
  const commonPatterns = [
    { pattern: 'connection', count: errorMessages.filter(msg => msg.toLowerCase().includes('connection')).length },
    { pattern: 'timeout', count: errorMessages.filter(msg => msg.toLowerCase().includes('timeout')).length },
    { pattern: 'database', count: errorMessages.filter(msg => msg.toLowerCase().includes('database')).length },
    { pattern: 'cpu', count: errorMessages.filter(msg => msg.toLowerCase().includes('cpu')).length }
  ].filter(pattern => pattern.count > 0);
  
  // Generate analysis
  const analysis = {
    totalLogs: logs.length,
    errorCount: logs.filter((log: any) => log.level === 'ERROR').length,
    warningCount: logs.filter((log: any) => log.level === 'WARN').length,
    errorsByService,
    commonPatterns,
    potentialIssues: []
  };
  
  // Identify potential issues based on patterns
  if (commonPatterns.find(p => p.pattern === 'connection' && p.count > 0)) {
    analysis.potentialIssues.push('Possible connection issues between services');
  }
  
  if (commonPatterns.find(p => p.pattern === 'database' && p.count > 0)) {
    analysis.potentialIssues.push('Database-related issues detected');
  }
  
  if (commonPatterns.find(p => p.pattern === 'cpu' && p.count > 0)) {
    analysis.potentialIssues.push('Potential resource exhaustion (high CPU)');
  }
  
  return new ToolResponse({
    content: JSON.stringify(analysis)
  });
});

// Register search_historical_incidents tool
server.registerTool(searchHistoricalIncidentsToolDefinition, async (call: ToolCall) => {
  const { keywords, service } = call.params;
  console.log(`Searching historical incidents with keywords: ${keywords.join(', ')}`);
  
  // Filter incidents that match the keywords and optional service
  const matchedIncidents = historicalIncidents.filter(incident => {
    // Check if any keyword matches in the title, symptoms, rootCause, or resolution
    const keywordMatch = keywords.some(keyword => 
      incident.title.toLowerCase().includes(keyword.toLowerCase()) ||
      incident.rootCause.toLowerCase().includes(keyword.toLowerCase()) ||
      incident.resolution.toLowerCase().includes(keyword.toLowerCase()) ||
      incident.symptoms.some(symptom => symptom.toLowerCase().includes(keyword.toLowerCase()))
    );
    
    // Check for service match if provided
    const serviceMatch = !service || incident.symptoms.some(symptom => 
      symptom.toLowerCase().includes(service.toLowerCase())
    );
    
    return keywordMatch && serviceMatch;
  });
  
  return new ToolResponse({
    content: JSON.stringify(matchedIncidents)
  });
});

// Register get_remediation_strategies tool
server.registerTool(getRemediationStrategiesToolDefinition, async (call: ToolCall) => {
  const { issue } = call.params;
  console.log(`Getting remediation strategies for issue: ${issue}`);
  
  // Find matching remediation strategies
  const matchingStrategies = remediationStrategies.filter(strategy => 
    strategy.issue.toLowerCase().includes(issue.toLowerCase())
  );
  
  if (matchingStrategies.length === 0) {
    // If no exact match, find partial matches
    const partialMatches = remediationStrategies.filter(strategy => {
      const issueWords = issue.toLowerCase().split(' ');
      return issueWords.some(word => 
        word.length > 3 && strategy.issue.toLowerCase().includes(word)
      );
    });
    
    return new ToolResponse({
      content: JSON.stringify({
        exactMatches: [],
        partialMatches
      })
    });
  }
  
  return new ToolResponse({
    content: JSON.stringify({
      exactMatches: matchingStrategies,
      partialMatches: []
    })
  });
});

// Register create_incident_report tool
server.registerTool(createIncidentReportToolDefinition, async (call: ToolCall) => {
  const { title, symptoms, rootCause, remediation } = call.params;
  console.log(`Creating incident report: ${title}`);
  
  // Create a new incident report
  const report = {
    id: `INC${(incidentReports.length + 4).toString().padStart(3, '0')}`, // Start from INC004
    title,
    timestamp: new Date().toISOString(),
    symptoms,
    rootCause,
    remediation,
    status: 'Open'
  };
  
  // Store the report
  incidentReports.push(report);
  
  return new ToolResponse({
    content: JSON.stringify({
      success: true,
      report
    })
  });
});

// Start the HTTP server
const httpServer = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Incident Management MCP Server is running');
    return;
  }
  
  server.handleRequest(req, res);
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Incident Management MCP Server running on port ${PORT}`);
});

// Export for testing
export { server, incidentReports };

// If this file is run directly, start the server
if (require.main === module) {
  console.log('Starting Incident Management MCP Server...');
}

