FastAPI-Supply-Chain-Automation
A powerful, secure, role-based supply chain automation system built with FastAPI & React
FastAPI
React
MySQL
Docker
JWT
FastAPI-Supply-Chain-Automation is a modern, full-stack distributor management platform that automates the complete order lifecycle across four key roles: Shopkeepers, Salesmen, Warehouse Managers, and Manufacturers.
Powered by FastAPI, it delivers high-performance, auto-documented RESTful APIs with interactive Swagger UI — making development, testing, and integration lightning-fast.
✨ Key Features

4 Dedicated Roles with strict JWT-based access control
Rich RESTful API — fully documented at /docs (Swagger) and /redoc
End-to-End Order Workflowplaced → confirmed → dispatched / stock_requested → delivered
Multi-Product Inventory with real-time stock tracking
Payment System — advance + remaining, fully validated and recorded
PDF Invoice Generation via dedicated API endpoint
Clean, Responsive Frontend (React + Material UI)
Dockerized — one command deployment

🚀 Lightning-Fast APIs with FastAPI

Interactive Swagger UI: http://localhost:8000/docs
Alternative ReDoc: http://localhost:8000/redoc
Automatic validation, async support, and OpenAPI spec out of the box
Role-protected endpoints with clear 401/403 responses

🛠 Quick Start
Bashgit clone https://github.com/ahmedkhan753/FastAPI-Supply-Chain-Automation.git
cd FastAPI-Supply-Chain-Automation

docker-compose up --build

API Docs (Swagger): http://localhost:8000/docs
Frontend: http://localhost:3000

🎯 Perfect For
Startup MVPs
Real-world supply chain automation demos

Secure. Scalable. API-First.
Built with passion using FastAPI — because great supply chains deserve great APIs.
