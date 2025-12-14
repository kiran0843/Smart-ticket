# Agentic AI: Smart Customer Support Ticket Resolver

## Architecture Overview

This project is a production-style, agentic, autonomous customer support system using:
- **React** (frontend)
- **Node.js + Express** (backend microservices)
- **MongoDB** (database)
- **RESTful APIs**

### Backend Microservices
- **ticket-service**: Handles ticket CRUD, status, and admin queries
- **agent-orchestrator-service**: Runs the agent pipeline (Classifier, Resolution, Escalation, Feedback)
- **knowledge-service**: Manages knowledge base articles

### Agents
- **Classifier Agent**: Categorizes and prioritizes tickets with confidence and reasoning
- **Resolution Agent**: Matches tickets to KB articles, decides if auto-resolvable
- **Escalation Agent**: Escalates based on confidence/risk/unknowns, explains why
- **Feedback Agent**: Logs outcomes, can update rules (no ML)

### Decision Flow
1. Ticket submitted to ticket-service
2. agent-orchestrator-service processes ticket through agents
3. Ticket status and agent decisions updated
4. All decisions logged for audit and learning

## How to Run Locally

### Prerequisites
- Node.js (18+ recommended)
- MongoDB (local or Atlas)

### Backend
1. Install dependencies in each backend service folder:
   ```bash
   # Terminal 1 - Ticket Service
   cd backend/ticket-service
   npm init -y
   npm install express mongoose cors axios dotenv
   
   # Terminal 2 - Agent Orchestrator Service
   cd backend/agent-orchestrator-service
   npm init -y
   npm install express cors axios mongoose dotenv
   
   # Terminal 3 - Knowledge Service
   cd backend/knowledge-service
   npm init -y
   npm install express mongoose cors dotenv
   ```

2. Start MongoDB (if local):
   ```bash
   # Windows: MongoDB should start automatically if installed as service
   # Or run: mongod
   
   # macOS/Linux:
   sudo systemctl start mongod
   ```

3. Start each service (in 3 separate terminals):
   ```bash
   # Terminal 1 - Ticket Service (Port 4001)
   cd backend/ticket-service
   node index.js
   
   # Terminal 2 - Agent Orchestrator Service (Port 4002)
   cd backend/agent-orchestrator-service
   node index.js
   
   # Terminal 3 - Knowledge Service (Port 4003)
   cd backend/knowledge-service
   node index.js
   ```

### Frontend
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   npm install axios  # Required dependency
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will be available at http://localhost:5173

### Example Test Ticket
- Title: "Password reset not working"
- Description: "I can't reset my password, getting an error."

## Agent Roles
- **Classifier**: Assigns category/priority/confidence, explains logic
- **Resolution**: Checks KB, suggests auto-resolution if possible
- **Escalation**: Escalates if low confidence/high risk/unknown
- **Feedback**: Logs all agent outcomes

## Notes
- All agent logic is in backend, not UI
- Minimal UI, no design libraries
- All decisions are explained and logged
