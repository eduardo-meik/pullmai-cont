# Project Backlog & Feature Roadmap

This document outlines the planned features, enhancements, and technical improvements for the ContractHub application. It is intended to serve as a roadmap for development, categorized by module, priority, and complexity.

---

## 🚀 Core Modules & Features

### 👤 Organizaciones / Contrapartes Module
*Centralized management for all partner organizations.*

| Feature                               | Priority | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **Organization Detail View**          |   High   |   Medium   | Create a dedicated page to view an organization's details, associated contracts, projects, and users.   |
| **CRUD for Organizations**            |   High   |   Medium   | Full Create, Read, Update, and Delete functionality for organizations.                                  |
| **User Management within Org**        |   High   |   Medium   | Ability for an `org_admin` to add, remove, and manage users within their own organization.              |

### 👥 Usuarios Module
*User administration and access control.*

| Feature                               | Priority | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **Granular RBAC**                     |   High   |   Medium   | Enhance the Role-Based Access Control system with more specific roles (e.g., Viewer, Editor, Manager). |
| **User Invitation System**            |  Medium  |   Medium   | Allow admins to invite new users to their organization via email.                                       |
| **User Profile & Settings**           |  Medium  |    Low     | A page for users to update their own profile information (name, password).                              |

### 📂 Plantillas (Templates) Module
*Streamline contract creation with reusable templates.*

| Feature                               | Priority | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **Template CRUD**                     |  Medium  |   Medium   | Create, Read, Update, and Delete contract templates with predefined fields and clauses.                 |
| **Generate Contract from Template**   |  Medium  |   Medium   | Populate a new contract form using a selected template to speed up creation.                            |

### 🔎 Auditoría & Historial (Audit & History) Module
*Track all changes and maintain a clear record of activities.*

| Feature                               | Priority | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **Contract/Project History Log**      |   High   |   Medium   | Log and display a detailed history of all changes made to a contract or project (who, what, when).      |
| **Global Audit Trail**                |  Medium  |    High    | A system-wide, searchable log for critical events (logins, permission changes, deletions).              |

---

## ✨ Advanced Features & Integrations

### 🤖 AI-Powered Contract Intelligence
*Leverage AI to enhance contract management capabilities.*

| Feature                               | Priority | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **AI Contract Drafting**              |   Low    |    High    | Use an AI agent (LLM) to generate draft contracts from a natural language prompt.                       |
| **AI Contract Analysis**              |   Low    |    High    | Implement AI to review uploaded contracts, summarize key terms, and identify potential risks.           |
| **Natural Language DB Queries**       |   Low    |    High    | "Ask your database" feature to find information using prompts (e.g., "show me all contracts expiring next month"). |

### ✍️ Digital Signatures & Email Integration
*Automate and secure the contract lifecycle.*

| Feature                               | Priority | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **Digital Signature Integration**     |  Medium  |    High    | Integrate with a third-party service (e.g., DocuSign, HelloSign) to manage digital signatures.        |
| **Email-to-Contract Service**         |   Low    |    High    | Parse incoming emails to automatically log communications or updates related to a specific contract.    |

---

## 🎨 UI/UX & Performance Enhancements

### ⚙️ General UI/UX
*Improve the user experience and visual design.*

| Feature                               | Priority | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **Branded Color Theme**               |  Medium  |    Low     | Implement a consistent, modern UI style with a brand-specific color theme in Tailwind CSS.              |
| **Display Organization in Navbar** ✅ |   High   |    Low     | Show the current user's active organization in the main navigation bar for better context. **COMPLETED** |
| **In-App Notifications**              |  Medium  |   Medium   | A system to notify users of important events (e.g., contract expiring, task assigned).                  |
| **Reporting & Analytics Dashboard**   |  Medium  |   Medium   | A dashboard with key metrics (e.g., active contracts, upcoming renewals).                               |

### ⚡ Performance & Scalability
*Ensure the application is fast, reliable, and ready for production.*

| Feature                               | Priority | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **Database Query Optimization**       |   High   |   Medium   | Review all Firestore queries, implement pagination, and limit data fetching to improve load times.      |
| **State Management/Caching**          |   High   |   Medium   | Use a robust library like React Query or SWR to handle data fetching, caching, and state synchronization. |
| **Full-Text Search Implementation**   |  Medium  |    High    | Integrate a dedicated search service (e.g., Algolia, Typesense) for fast, workspace-wide search.      |
| **Code Splitting**                    |  Medium  |   Medium   | Reduce initial bundle size by splitting code by route or feature.                                       |

---

## 🔧 Technical Foundation & DevOps

### 🛠️ Code Quality & Testing
*Build a stable and maintainable codebase.*

| Feature                               | Priority | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **Implement Testing Strategy**        |   High   |   Medium   | Introduce unit and integration tests (e.g., with Vitest, React Testing Library) to ensure reliability.  |
| **CI/CD Pipeline**                    |  Medium  |   Medium   | Set up a GitHub Actions pipeline to automate testing and deployments.                                   |
| **Environment Configuration**         |   High   |    Low     | Formalize the use of `.env` files for development, staging, and production environments.                |
