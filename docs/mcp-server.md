MCP Server Documentation
Setting Up OCI Infrastructure
This guide walks through setting up the necessary infrastructure on Oracle Cloud Infrastructure for your MCP server.
Prerequisites

An Oracle Cloud account with access to the OCI Console
Basic familiarity with OCI services
OCI CLI installed and configured (optional but recommended)

Step 1: Create a Compute Instance

Log in to the OCI Console
Navigate to Compute > Instances
Click "Create Instance"
Configure the instance:

Name: mcp-server-instance
Compartment: Select your compartment
Image: Oracle Linux 8
Shape: VM.Standard2.1 (1 OCPU, 15GB memory)
VCN and Subnet: Choose or create a VCN and public subnet
Assign a public IP
Add SSH keys for secure access


Click "Create"

Step 2: Configure Security

Navigate to Networking > Virtual Cloud Networks
Select your VCN
Click on the subnet used by your instance
Click on the Security List
Add Ingress Rules:

Allow TCP traffic on port 22 (SSH)
Allow TCP traffic on port 8080 (MCP Server)
Allow TCP traffic on port 3000 (Visualization Dashboard)
Source CIDR: 0.0.0.0/0 (or restrict to your IP for better security)



Step 3: Connect to the Instance
bashssh -i <your-private-key> opc@<instance-public-ip>
Step 4: Install Dependencies
bash# Update packages
sudo dnf update -y

# Install Node.js and npm
sudo dnf install -y nodejs npm

# Install Python and pip
sudo dnf install -y python3 python3-pip

# Install Git
sudo dnf install -y git

# Install additional utilities
sudo dnf install -y screen tmux

# Install Docker (optional, if you want to containerize the server)
sudo dnf install -y docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker opc
MCP Server Implementation
This section details the implementation of the Model Context Protocol (MCP) server.
Architecture Overview
The MCP server is built as a Node.js application using TypeScript and follows the Model Context Protocol specification to provide a standardized interface for AI agents to interact with tools and data sources.
Key Components

Server Core: Implements the MCP specification for request handling, tool registration, and response formatting
Tool Definitions: Defines the interface and schemas for each tool
Tool Implementations: Implements the actual functionality of each tool
Mock Data: Provides sample data for demonstration purposes

Directory Structure
src/
├── mcp-server/
│   ├── server.ts         # Main server implementation
│   ├── tools.ts          # Tool definitions and schemas
│   └── data.ts           # Mock incident data
Setting Up the MCP Server

Clone the repository:
bashgit clone https://github.com/yourusername/mcp-server-oci.git
cd mcp-server-oci

Install dependencies:
bashnpm install

Configure environment variables by creating a .env file:
bashcat > .env << 'EOF'
PORT=8080
ANTHROPIC_API_KEY=your_api_key_here
MCP_SERVER_URL=http://localhost:8080
EOF

Build the TypeScript code:
bashnpm run build

Start the MCP server:
bashnpm run start-server


Available Tools
The MCP server provides the following tools:
1. System Log Retrieval

Name: get_system_logs
Description: Retrieves system logs with optional filters
Parameters:

service (optional): Filter by service name
level (optional): Filter by log level (INFO, WARN, ERROR)
startTime and endTime (optional): ISO datetime range



2. Log Analysis

Name: analyze_logs
Description: Analyzes logs to identify patterns and issues
Parameters:

logs: Array of log entries to analyze



3. Historical Incident Search

Name: search_historical_incidents
Description: Searches for similar historical incidents
Parameters:

keywords: Array of search terms
service (optional): Filter by service name



4. Remediation Strategy Retrieval

Name: get_remediation_strategies
Description: Gets remediation strategies for a specific issue
Parameters:

issue: The issue to retrieve remediation strategies for



5. Incident Reporting

Name: create_incident_report
Description: Creates a structured incident report
Parameters:

title: Report title
symptoms: Array of observed symptoms
rootCause: Identified root cause
remediation: Recommended remediation steps



Customizing the Server
To add a new tool to the MCP server:

Define the tool in tools.ts:
typescriptexport const newToolDefinition: ToolDefinition = {
  name: 'new_tool_name',
  description: 'Description of the new tool',
  inputSchema: {
    type: 'object',
    properties: {
      // Define input parameters
      param1: {
        type: 'string',
        description: 'Description of parameter 1'
      }
    },
    required: ['param1']
  }
};

Register and implement the tool in server.ts:
typescriptserver.registerTool(newToolDefinition, async (call: ToolCall) => {
  const { param1 } = call.params;
  
  // Implement tool functionality
  
  return new ToolResponse({
    content: JSON.stringify(result)
  });
});
