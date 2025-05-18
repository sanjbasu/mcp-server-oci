import { ToolDefinition } from '@modelcontextprotocol/server-typescript';

// Tool for retrieving system logs
export const getLogsToolDefinition: ToolDefinition = {
  name: 'get_system_logs',
  description: 'Retrieve system logs for a specific time period or service',
  inputSchema: {
    type: 'object',
    properties: {
      service: {
        type: 'string',
        description: 'Optional service name to filter logs'
      },
      level: {
        type: 'string',
        description: 'Optional log level to filter (INFO, WARN, ERROR, etc.)'
      },
      startTime: {
        type: 'string',
        description: 'Optional start time in ISO format'
      },
      endTime: {
        type: 'string',
        description: 'Optional end time in ISO format'
      }
    }
  }
};

// Tool for analyzing logs to identify potential issues
export const analyzeLogsToolDefinition: ToolDefinition = {
  name: 'analyze_logs',
  description: 'Analyze system logs to identify patterns and potential issues',
  inputSchema: {
    type: 'object',
    properties: {
      logs: {
        type: 'array',
        description: 'Array of log entries to analyze'
      }
    },
    required: ['logs']
  }
};

// Tool for searching historical incidents
export const searchHistoricalIncidentsToolDefinition: ToolDefinition = {
  name: 'search_historical_incidents',
  description: 'Search historical incidents for similar patterns or issues',
  inputSchema: {
    type: 'object',
    properties: {
      keywords: {
        type: 'array',
        description: 'Keywords to search for in historical incidents'
      },
      service: {
        type: 'string',
        description: 'Optional service name to filter incidents'
      }
    },
    required: ['keywords']
  }
};

// Tool for retrieving remediation strategies
export const getRemediationStrategiesToolDefinition: ToolDefinition = {
  name: 'get_remediation_strategies',
  description: 'Get remediation strategies for a specific issue',
  inputSchema: {
    type: 'object',
    properties: {
      issue: {
        type: 'string',
        description: 'The issue to retrieve remediation strategies for'
      }
    },
    required: ['issue']
  }
};

// Tool for creating an incident report
export const createIncidentReportToolDefinition: ToolDefinition = {
  name: 'create_incident_report',
  description: 'Create a detailed incident report with findings and recommendations',
  inputSchema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Title of the incident'
      },
      symptoms: {
        type: 'array',
        description: 'Observed symptoms of the incident'
      },
      rootCause: {
        type: 'string',
        description: 'Identified root cause of the incident'
      },
      remediation: {
        type: 'string',
        description: 'Recommended remediation steps'
      }
    },
    required: ['title', 'symptoms', 'rootCause', 'remediation']
  }
};
