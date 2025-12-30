# FastAPI Supply Chain Automation

A secure, role-based supply chain automation system built using **FastAPI**, **React**, and **MySQL**.  
This project automates the complete distributor and order management lifecycle through a clean, scalable, API-first architecture.

---

## 🧩 Overview

**FastAPI Supply Chain Automation** is a full-stack distributor management platform designed to handle real-world supply chain workflows.  
It supports four core user roles with strict access control and manages orders from placement to delivery with inventory and payment tracking.

The backend is powered by **FastAPI**, providing high-performance, well-structured REST APIs with automatic documentation via Swagger and ReDoc.  
The frontend is built with **React** and **Material UI** for a clean and responsive user experience.

---

## 🏗️ Tech Stack

### Backend
- **FastAPI**
- **MySQL**
- **JWT Authentication**
- **SQLAlchemy**
- **Docker**

### Frontend
- **React**
- **Material UI**

---

## 👥 User Roles

The system supports four distinct roles, each with dedicated permissions:

- **Shopkeeper** – Place and track orders
- **Salesman** – Confirm and manage assigned orders
- **Warehouse Manager** – Handle inventory and dispatch
- **Manufacturer** – Manage production and stock requests

All endpoints are protected using **JWT-based role access control**.

---

## 🔄 Order Workflow

The complete order lifecycle is automated:

Placed → Confirmed → Dispatched / Stock Requested → Delivered

yaml
Copy code

---

## ✨ Key Features

- Role-based authentication and authorization (JWT)
- Fully documented RESTful APIs
- End-to-end order management workflow
- Multi-product inventory with real-time stock tracking
- Payment handling (advance and remaining balance)
- PDF invoice generation via API
- Responsive frontend using React and Material UI
- Dockerized setup for easy deployment

---

## 📘 API Documentation

FastAPI automatically generates API documentation:

- **Swagger UI:** http://localhost:8000/docs  
- **ReDoc:** http://localhost:8000/redoc  

Includes request validation, response schemas, and authorization handling.

---

## 🚀 Quick Start

### Clone the Repository

```bash
git clone https://github.com/ahmedkhan753/FastAPI-Supply-Chain-Automation.git
cd FastAPI-Supply-Chain-Automation
Run with Docker
bash
Copy code
docker-compose up --build
🌐 Access the Application
Backend API (Swagger): http://localhost:8000/docs

Frontend: http://localhost:3000

🎯 Use Cases
Startup MVPs

Supply chain automation demos

Role-based backend architecture examples

FastAPI + React full-stack projects

🔐 Security
JWT authentication

Role-protected API endpoints

Clear 401 Unauthorized and 403 Forbidden responses

📦 Deployment
The project is fully Dockerized and can be deployed using a single command.
Environment variables can be managed using .env files.















