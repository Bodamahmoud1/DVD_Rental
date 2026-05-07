# CineVault

**CineVault** is an enterprise-grade, full-stack digital DVD rental management system. It provides a comprehensive platform for inventory management, user authentication, and transaction processing within a modern web architecture.

## Architecture Overview

The system utilizes a decoupled client-server architecture:
- **Frontend Layer:** Built with React 19 and Vite, ensuring high-performance rendering and a responsive user interface.
- **Backend Services:** A Node.js and Express 5 RESTful API, responsible for business logic, authentication, and transaction processing.
- **Data Persistence:** MongoDB with Mongoose ORM, providing a flexible schema design for complex relational data such as rentals and user profiles.

## Core Capabilities

- **Catalog Management:** Administrative tools for managing film metadata, categorization, and physical inventory tracking.
- **Transaction Processing:** Automated rental lifecycle management, including checkout validation, return processing, and overdue fee calculation.
- **Authentication & Authorization:** Secure JWT-based access control with distinct permission models for standard members and system administrators.
- **Media Handling:** Base64-encoded image processing for user profiles and integration with TMDB for high-resolution asset delivery.
- **Analytics & Reporting:** Administrative dashboards providing insights into inventory levels, specifically low-stock alerts and historical rental data.

## Technical Specifications

### Frontend
- Framework: React 19 (Vite Build System)
- State Management & Routing: React Router DOM 7
- Form Validation: Formik & Yup
- Styling: Custom CSS with modular variables and Bootstrap 5 grid system

### Backend
- Runtime: Node.js
- Framework: Express 5
- Database: MongoDB
- ORM: Mongoose 9
- Security: Helmet, Morgan, bcryptjs, JSON Web Tokens (JWT)
- Documentation: Swagger UI integration

## Environment Setup

### Prerequisites
- Node.js (v18.0.0 or later)
- MongoDB Database Instance (Local or Atlas)

### Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd cinevault-backend
   ```
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Establish environment variables:
   Copy `.env.example` to `.env` and configure the database connection string and secure tokens:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret
   PORT=5000
   ```
4. Initialize the database schema (initial deployment only):
   ```bash
   node src/seed.js
   ```
5. Execute the development server:
   ```bash
   npm run dev
   ```
   The API will initialize on `http://localhost:5000`. API documentation is available at `http://localhost:5000/api-docs`.

### Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd ../cinevault-react
   ```
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Execute the development build:
   ```bash
   npm run dev
   ```
   The client application will initialize on `http://localhost:5173`.

## System Administration

Administrative access is required to manage inventory and monitor transactions. The default system administrator credentials are:
- **Email:** admin@cinevault.com
- **Password:** Admin1234

## Reference Documentation

Comprehensive technical documentation is maintained in the `docs/` directory:
- [Project Overview](docs/PROJECT_OVERVIEW.md)
- [Functional Requirements](docs/FUNCTIONAL_REQUIREMENTS.md)
- [Technical Requirements](docs/TECHNICAL_REQUIREMENTS.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
