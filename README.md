# Field Service Management Platform

A full-stack Field Service Management Platform designed to streamline field operations, service requests, work orders, technician management, inventory tracking, SLA monitoring, and operational analytics.

The application provides a centralized platform for managing field-service workflows from service request creation to technician assignment, task execution, and completion.

---

## 🚀 Project Overview

Field service organizations often need to coordinate customers, technicians, work orders, inventory, schedules, and service-level agreements across multiple systems.

The **Field Service Management Platform** aims to provide a unified solution for managing these operations through a modern web-based application.

The project consists of:

- A **React + TypeScript frontend**
- A **Java Spring Boot backend**
- A **PostgreSQL database**
- RESTful APIs for communication between frontend and backend
- Authentication and authorization using Spring Security and JWT
- Service management and operational dashboards

---

## ✨ Key Features

### 👨‍🔧 Technician Management
- Technician registration and management
- Technician assignment to work orders
- Technician availability management
- Technician performance tracking

### 📋 Work Order Management
- Create and manage work orders
- Assign technicians to service requests
- Track work-order status
- Monitor service progress
- Manage work-order priorities

### 👥 Customer Management
- Customer information management
- Customer service requests
- Service history tracking
- Customer-related work-order management

### 📦 Inventory Management
- Inventory tracking
- Stock management
- Inventory allocation
- Monitoring of available resources

### ⏱️ SLA Management
- Service-level agreement tracking
- SLA deadline monitoring
- Priority-based service management
- Identification of overdue service requests

### 📊 Dashboard & Analytics
- Operational dashboards
- Work-order statistics
- Technician-related metrics
- Service performance monitoring
- Business insights and reporting

### 🔐 Authentication & Security
- User authentication
- JWT-based authentication
- Role-based authorization
- Protected API endpoints
- Spring Security integration

---

## 🛠️ Technology Stack

### Frontend

- React
- TypeScript
- Vite
- HTML5
- CSS3
- JavaScript
- REST API integration

### Backend

- Java
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- Hibernate
- Maven
- REST APIs

### Database

- PostgreSQL

### Development Tools

- Git
- GitHub
- Visual Studio Code
- IntelliJ IDEA
- Postman

---

## 🏗️ Project Architecture

The application follows a client-server architecture:

```text
┌──────────────────────────┐
│        Frontend          │
│   React + TypeScript     │
│          Vite            │
└────────────┬─────────────┘
             │
             │ REST APIs
             ▼
┌──────────────────────────┐
│         Backend          │
│       Spring Boot        │
│    Spring Security/JWT   │
│        JPA/Hibernate     │
└────────────┬─────────────┘
             │
             │ JDBC/JPA
             ▼
┌──────────────────────────┐
│        PostgreSQL        │
│         Database         │
└──────────────────────────┘
```

---

## 📁 Project Structure

```text
Field-Service-Management-Platform/
│
├── keystone-backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── keystone/
│   │   │   │           ├── config/
│   │   │   │           ├── controller/
│   │   │   │           ├── service/
│   │   │   │           ├── repository/
│   │   │   │           ├── entity/
│   │   │   │           └── KeystoneApplication.java
│   │   │   │
│   │   │   └── resources/
│   │   │
│   │   └── test/
│   │
│   ├── Dockerfile
│   └── pom.xml
│
├── keystone-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── .gitignore
├── package.json
├── render.yaml
├── run-all.bat
├── run-all.ps1
└── README.md
```

---

# ⚙️ Prerequisites

Before running the project, make sure the following are installed:

- Java 17 or later
- Maven
- Node.js
- npm
- PostgreSQL
- Git

Verify the installations:

```bash
java -version
mvn -version
node -v
npm -v
psql --version
git --version
```

---

# 🗄️ Database Setup

The backend uses PostgreSQL.

### 1. Create a PostgreSQL database

Open PostgreSQL or pgAdmin and create a database:

```sql
CREATE DATABASE keystone;
```

### 2. Configure database credentials

Update the Spring Boot database configuration according to your local PostgreSQL setup.

Example:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/keystone
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

> Do not commit real database passwords, JWT secrets, API keys, or other credentials to GitHub.

For production environments, use environment variables or a secure secrets-management solution.

---

# 🔧 Backend Setup

Navigate to the backend directory:

```bash
cd keystone-backend
```

Install dependencies and build the project:

```bash
mvn clean install
```

Run the Spring Boot application:

```bash
mvn spring-boot:run
```

The backend will be available at the configured Spring Boot port.

Typical Spring Boot URL:

```text
http://localhost:8080
```

---

# 💻 Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd keystone-frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will provide the local development URL in the terminal.

Typically:

```text
http://localhost:5173
```

---

# 🔄 Running Frontend and Backend

The application requires both services to be running.

```text
Frontend
   │
   │ HTTP/REST API
   ▼
Backend
   │
   │ JPA/Hibernate
   ▼
PostgreSQL
```

Start the backend:

```bash
cd keystone-backend
mvn spring-boot:run
```

Start the frontend in another terminal:

```bash
cd keystone-frontend
npm run dev
```

---

# 🔐 Security

The backend uses Spring Security and JWT-based authentication to protect application resources.

Security responsibilities include:

- User authentication
- JWT token validation
- Protected API endpoints
- Role-based authorization
- Secure access to application resources

### Security Best Practices

Never commit sensitive information such as:

```text
Database passwords
JWT secrets
API keys
Private credentials
Production environment variables
```

Use environment variables for sensitive configuration.

---

# 🔌 API

The backend exposes RESTful APIs for communication with the frontend.

Major API areas include:

- Authentication
- Customers
- Technicians
- Work Orders
- Dashboard
- Audit Logs
- Service Requests
- Inventory
- SLA Management

API endpoints can be tested using tools such as **Postman**.

---

# 🧪 Testing

Backend tests can be executed using Maven:

```bash
cd keystone-backend
mvn test
```

For frontend development, the application can be tested through the Vite development server.

---

# 🐳 Docker

The backend contains a Dockerfile that can be used to containerize the Spring Boot application.

Build the backend Docker image:

```bash
docker build -t field-service-backend ./keystone-backend
```

Run the container:

```bash
docker run -p 8080:8080 field-service-backend
```

---

# 🚀 Deployment

The project includes deployment configuration that can be adapted for cloud platforms such as Render or other container-based hosting services.

Before deploying:

1. Configure production database credentials.
2. Configure environment variables.
3. Configure JWT secrets securely.
4. Configure frontend API URLs.
5. Build and test both frontend and backend.
6. Deploy the backend.
7. Deploy the frontend.
8. Verify API connectivity.

---

# 👨‍💻 My Role

**Role:** Java Full Stack Developer

I am currently extending and customizing the existing Field Service Management Platform.

My current focus includes:

- Understanding the existing Spring Boot backend architecture
- Extending backend functionality
- Customizing REST APIs
- Working with the PostgreSQL database
- Enhancing frontend-backend integration
- Improving application functionality
- Implementing and integrating new requirements
- Debugging and maintaining the application

---

# 🔮 Future Enhancements

Potential future improvements include:

- Advanced technician scheduling
- Real-time technician location tracking
- Automated technician assignment
- Mobile application support
- Push notifications
- Advanced analytics and reporting
- Improved SLA prediction
- AI-assisted work-order prioritization
- Automated customer notifications
- Enhanced inventory forecasting

---

# 📸 Screenshots

Screenshots of the application can be added here.

### Dashboard

_Add dashboard screenshot here._

### Work Order Management

_Add work-order screenshot here._

### Technician Management

_Add technician-management screenshot here._

### Customer Management

_Add customer-management screenshot here._

---

# 📌 Project Status

**Status:** Actively being extended and customized.

The existing platform serves as the foundation, while additional functionality, improvements, and custom requirements are being developed.

---

# 📄 License

This project is intended for educational and development purposes.

---

# 👤 Author

**Amartya Prakash**

**Java Full Stack Developer**

GitHub:  
https://github.com/amartya69