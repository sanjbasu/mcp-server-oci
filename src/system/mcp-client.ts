# Create MCP client wrapper

import { MCPClient } from '@modelcontextprotocol/client-typescript';

// Create an MCP client that connects to our server
export const createMCPClient = async (serverUrl: string) => {
  const client = new MCPClient({
    serverUrl,
  });

  // Connect to the server
  await client.connect();
  console.log('Connected to MCP server at', serverUrl);

  return client;
};
