Running the Demo
This section provides instructions for running and testing the MCP server and multi-agent system.
Prerequisites

Completed the OCI infrastructure setup
Installed all dependencies
Set up the environment variables including the Anthropic API key

Step 1: Start the MCP Server
First, start the MCP server in a separate terminal session or background process:
bash
# Option 1: Run in the current terminal
npm run start-server

# Option 2: Run in a screen session
screen -S mcp-server
npm run start-server
# Detach: Ctrl+A, D

# Option 3: Run as a background process
nohup npm run start-server > mcp-server.log 2>&1 &

Step 2: Verify the Server is Running
Test the server is running properly:
bash
curl http://localhost:8080/

You should see a response like "Incident Management MCP Server is running".
Step 3: Run the Multi-Agent System
Now that the server is running, run the multi-agent system:
bash
# Run with the default incident (first one)
npm run start

# Run with a specific incident (0, 1, or 2)
npm run start -- 1

# Run with all demonstration features
npm run start -- --run-all

Step 4: Monitor the Output
The system will output detailed logs of the incident management process, including:

Agent initialization
MCP tool calls
Agent communications
Incident report generation

Step 5: Accessing the Visualization Dashboard (Optional)
If you've set up the visualization component:

Start the visualization server:
bash
# In a new screen session
screen -S visualization
cd public
python3 -m http.server 3000
# Detach: Ctrl+A, D

Access the dashboard in your web browser:
http://<your-instance-public-ip>:3000

Sample Incidents
The demo includes several sample incidents for testing:

Authentication Service Failure
bash
npm run start -- 0

API Gateway Connectivity Issues
bash
npm run start -- 2

Troubleshooting
MCP Server Issues

Server won't start:

Check for port conflicts: netstat -tulpn | grep 8080
Verify environment variables are set correctly
Check for syntax errors in the compiled JavaScript


Connection refused errors:

Ensure the server is running
Check that the correct URL is configured in the environment variables
Verify firewall rules allow the connection



Agent System Issues

Agent initialization errors:

Check the Anthropic API key is valid
Ensure the MCP server URL is correct
Look for any console errors during agent creation


Tool call failures:

Check that the requested tool is registered with the MCP server
Verify the parameters match the expected schema
Check for any exceptions thrown by the tool implementation



Visualization Issues

Dashboard not loading:

Ensure the visualization server is running
Check that port 3000 is open in your security list
Verify no JavaScript errors in the browser console
