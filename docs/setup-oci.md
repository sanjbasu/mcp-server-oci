# Setting up OCI Infrastructure

This guide walks through setting up the necessary infrastructure on Oracle Cloud Infrastructure for your MCP server.

## Prerequisites

- An Oracle Cloud account with access to the OCI Console
- Basic familiarity with OCI services
- OCI CLI installed and configured (optional but recommended)

## Step 1: Create a Compute Instance

1. Log in to the OCI Console
2. Navigate to Compute > Instances
3. Click "Create Instance"
4. Configure the instance:
   - Name: `mcp-server-instance`
   - Compartment: Select your compartment
   - Image: Oracle Linux 8
   - Shape: VM.Standard2.1 (1 OCPU, 15GB memory)
   - VCN and Subnet: Choose or create a VCN and public subnet
   - Assign a public IP
   - Add SSH keys for secure access
5. Click "Create"

## Step 2: Configure Security

1. Navigate to Networking > Virtual Cloud Networks
2. Select your VCN
3. Click on the subnet used by your instance
4. Click on the Security List
5. Add Ingress Rules:
   - Allow TCP traffic on port 22 (SSH)
   - Allow TCP traffic on port 8080 (MCP Server)
   - Source CIDR: 0.0.0.0/0 (or restrict to your IP for better security)

## Step 3: Connect to the Instance

```bash
ssh -i <your-private-key> opc@<instance-public-ip>
Step 4: Install Dependencies
bash# Update packages
sudo dnf update -y

# Install Node.js and npm
sudo dnf install -y nodejs npm

# Install Python and pip
sudo dnf install -y python3 python3-pip

# Install Git
sudo dnf install -y git

# Install Docker (optional, if you want to containerize the server)
sudo dnf install -y docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker opc
With these steps completed, your OCI infrastructure is ready for the MCP server deployment.
