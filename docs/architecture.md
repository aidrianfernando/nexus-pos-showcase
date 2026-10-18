# NEXUS V1 Architecture

NEXUS V1 uses a layered full-stack architecture built around a React frontend, a versioned REST API, an Express backend, and PostgreSQL persistence.

![NEXUS V1 Production Architecture](../assets/architecture/nexus-production-architecture.png)

## System Flow

User / Browser → React + Vite on Vercel → HTTPS REST API `/api/v1` → Node.js + Express on Railway → Routes → Middleware → Controllers → Services → Repositories → PostgreSQL on Railway.

The frontend never connects directly to PostgreSQL. All application data access passes through the backend API and repository layer.

## Frontend

The frontend is implemented with React and Vite and is deployed through Vercel.

Primary responsibilities include:

- application routing and navigation
- role-aware user interfaces
- Point of Sale workflows
- product and inventory interfaces
- purchasing and receiving interfaces
- sales and receipt presentation
- API communication through Axios

## Backend

The backend is implemented with Node.js and Express and follows a layered structure:

- Routes — define versioned HTTP endpoints under `/api/v1`
- Middleware — authentication, authorization, security, validation, and error handling
- Controllers — translate HTTP requests into application operations
- Services — coordinate business workflows and application rules
- Repositories — isolate PostgreSQL access from higher application layers

This separation keeps transport, business logic, and persistence responsibilities distinct.

## Database

NEXUS uses PostgreSQL for transactional and relational persistence.

The database layer supports:

- transactional sales and inventory operations
- relational constraints
- inventory consistency
- row-level locking where required
- versioned database migrations
- PostgreSQL connection pooling

The production database is hosted on Railway PostgreSQL.

## Security

Security controls include JWT authentication, bcrypt password hashing, RBAC, Helmet security headers, explicit production CORS configuration, and environment-based secret management.

Backend authorization remains the authoritative security boundary.

## Reliability and Testing

NEXUS verification includes backend and frontend automated tests, integration and regression checks, authenticated browser E2E validation, transaction reliability testing, inventory concurrency testing, production-readiness checks, and GitHub Actions CI.

## Deployment

- GitHub — source control and pull requests
- GitHub Actions — backend tests and frontend verification
- Vercel — React/Vite frontend
- Railway — Node.js/Express backend
- Railway PostgreSQL — production database

## Architecture Boundaries

NEXUS V1 does not currently use Docker, Redis, Kafka, microservices, object storage, or dedicated API gateway infrastructure.

These technologies would only be introduced when future product requirements justify them.

## Source Code Boundary

This public showcase documents the architecture and will include selected representative code samples. The complete production implementation, database migrations, proprietary transaction logic, and internal operational configuration remain private.
