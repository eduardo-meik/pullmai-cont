# Project Backlog & Feature Roadmap

This document outlines the planned features, enhancements, and technical improvements for the ContractHub application. It is intended to serve as a roadmap for development, categorized by module, priority, and status.

**Last Updated**: June 22, 2025

---

## 🎉 Recently Completed Features

### ✅ Organizaciones / Contrapartes Module - **COMPLETED**
*Comprehensive management for partner organizations and relationships.*

- ✅ **Organization Detail View** - Detailed view with comprehensive relationship information, contracts, and analytics
- ✅ **CRUD for Organizations** - Full Create, Read, Update, and Delete functionality implemented
- ✅ **Comprehensive Service Layer** - ContraparteComprehensiveService with detailed organization insights
- ✅ **Permission-Based Access** - Granular user access control for organization data
- ✅ **Contract Import Workflows** - Request/approve flows for importing contracts between users
- ✅ **User Access Management UI** - Interface for managing user permissions and access levels
- ✅ **Enhanced Types & Models** - Complete TypeScript types for comprehensive contraparte management
- ✅ **Firestore Integration** - Organizations populated from existing contract contrapartes
- ✅ **Timestamp Conversion** - Fixed Firestore Timestamp to Date conversion issues

### ✅ Database & Infrastructure - **COMPLETED**
- ✅ **Organizations Population** - 13 organizations created from unique contract contrapartes
- ✅ **Contract-Organization Linking** - All contracts updated with contraparteOrganizacionId references
- ✅ **Enhanced Firestore Structure** - Support for contrapartePermissions, contractImportRequests, sharedContraparteData
- ✅ **Data Migration Scripts** - Python and JavaScript scripts for populating and updating data

---

## 🚀 Core Modules & Features

### 👥 Usuarios Module
*User administration and access control.*

| Feature                               | Priority | Status    | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :-------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **Enhanced RBAC Implementation**      |   High   |   TODO    |   Medium   | Implement the comprehensive RBAC system designed in the new architecture with specific roles and permissions. |
| **User Invitation System**            |  Medium  |   TODO    |   Medium   | Allow admins to invite new users to their organization via email.                                       |
| **User Profile & Settings**           |  Medium  |   TODO    |    Low     | A page for users to update their own profile information (name, password).                              |

### 📂 Plantillas (Templates) Module
*Streamline contract creation with reusable templates.*

| Feature                               | Priority | Status    | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :-------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **Template CRUD**                     |  Medium  |   TODO    |   Medium   | Create, Read, Update, and Delete contract templates with predefined fields and clauses.                 |
| **Generate Contract from Template**   |  Medium  |   TODO    |   Medium   | Populate a new contract form using a selected template to speed up creation.                            |
| **Shared Template System**            |   Low    |   TODO    |    High    | Allow organizations to share successful contract templates with partners (as implemented in contraparteComprehensive). |

### 🔎 Auditoría & Historial (Audit & History) Module
*Track all changes and maintain a clear record of activities.*

| Feature                               | Priority | Status    | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :-------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **Contract/Project History Log**      |   High   |   TODO    |   Medium   | Log and display a detailed history of all changes made to a contract or project (who, what, when).      |
| **Global Audit Trail**                |  Medium  |   TODO    |    High    | A system-wide, searchable log for critical events (logins, permission changes, deletions).              |
| **Contract Import Audit**             |  Medium  | PARTIAL   |    Low     | Audit trail for contract import requests/approvals (partially implemented in ContraparteComprehensiveService). |

---

## 🔧 Integration & Polish Tasks

### 📊 Data Population & Integration
*Complete the comprehensive contraparte system implementation.*

| Feature                               | Priority | Status    | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :-------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **Contract Import Data Population**   |   High   | PARTIAL   |   Medium   | Populate real user data and contracts in ContractImportModal (currently showing empty data).            |
| **User Access Management Data**       |   High   | PARTIAL   |   Medium   | Connect UserAccessManagement component to real user data and permissions.                               |
| **Best Practices & Guidelines**       |  Medium  |   TODO    |   Medium   | Implement and populate shared best practices, pricing guidelines, and negotiation tips functionality.   |
| **Risk Assessment Integration**       |   Low    |   TODO    |    High    | Implement automated risk assessment for partner organizations based on contract history.                |

### 🎨 UI/UX Enhancements
*Improve user experience and visual consistency.*

| Feature                               | Priority | Status    | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :-------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **Loading States & Error Handling**  |   High   | PARTIAL   |    Low     | Add comprehensive loading states and error handling to all new contraparte components.                  |
| **Responsive Design Polish**          |  Medium  |   TODO    |    Low     | Ensure all new contraparte components are fully responsive on mobile devices.                           |
| **Branded Color Theme**               |  Medium  |   TODO    |    Low     | Implement a consistent, modern UI style with a brand-specific color theme in Tailwind CSS.              |
| **Display Organization in Navbar** ✅ |   High   |   DONE    |    Low     | Show the current user's active organization in the main navigation bar for better context. **COMPLETED** |
| **In-App Notifications**              |  Medium  |   TODO    |   Medium   | A system to notify users of important events (e.g., contract expiring, import requests).                |
| **Reporting & Analytics Dashboard**   |  Medium  |   TODO    |   Medium   | A dashboard with key metrics (e.g., active contracts, partner organizations, import activity).          |

---

## ✨ Advanced Features & Integrations

### 🤖 AI-Powered Contract Intelligence
*Leverage AI to enhance contract management capabilities.*

| Feature                               | Priority | Status    | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :-------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **AI Contract Drafting**              |   Low    |   TODO    |    High    | Use an AI agent (LLM) to generate draft contracts from a natural language prompt.                       |
| **AI Contract Analysis**              |   Low    |   TODO    |    High    | Implement AI to review uploaded contracts, summarize key terms, and identify potential risks.           |
| **Natural Language DB Queries**       |   Low    |   TODO    |    High    | "Ask your database" feature to find information using prompts (e.g., "show me all contracts expiring next month"). |
| **Smart Contract Matching**           |   Low    |   TODO    |    High    | AI-powered suggestions for contract imports based on organization relationships and contract patterns.   |

### ✍️ Digital Signatures & Email Integration
*Automate and secure the contract lifecycle.*

| Feature                               | Priority | Status    | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :-------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **Digital Signature Integration**     |  Medium  |   TODO    |    High    | Integrate with a third-party service (e.g., DocuSign, HelloSign) to manage digital signatures.        |
| **Email-to-Contract Service**         |   Low    |   TODO    |    High    | Parse incoming emails to automatically log communications or updates related to a specific contract.    |
| **Contract Import Notifications**     |  Medium  |   TODO    |   Medium   | Email notifications for contract import requests, approvals, and status updates.                        |

---

## ⚡ Performance & Scalability

### 🚀 Performance Optimization
*Ensure the application is fast, reliable, and ready for production.*

| Feature                               | Priority | Status    | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :-------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **Database Query Optimization**       |   High   |   TODO    |   Medium   | Review all Firestore queries, implement pagination, and limit data fetching to improve load times.      |
| **State Management/Caching**          |   High   |   TODO    |   Medium   | Use a robust library like React Query or SWR to handle data fetching, caching, and state synchronization. |
| **Full-Text Search Implementation**   |  Medium  |   TODO    |    High    | Integrate a dedicated search service (e.g., Algolia, Typesense) for fast, workspace-wide search.      |
| **Code Splitting**                    |  Medium  |   TODO    |   Medium   | Reduce initial bundle size by splitting code by route or feature.                                       |
| **Lazy Loading for Components**       |  Medium  |   TODO    |    Low     | Implement lazy loading for heavy components like ContraparteDetailedView and ContractImportModal.       |

---

## 🔧 Technical Foundation & DevOps

### 🛠️ Code Quality & Testing
*Build a stable and maintainable codebase.*

| Feature                               | Priority | Status    | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :-------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **Implement Testing Strategy**        |   High   |   TODO    |   Medium   | Introduce unit and integration tests (e.g., with Vitest, React Testing Library) to ensure reliability.  |
| **CI/CD Pipeline**                    |  Medium  |   TODO    |   Medium   | Set up a GitHub Actions pipeline to automate testing and deployments.                                   |
| **Environment Configuration**         |   High   |   TODO    |    Low     | Formalize the use of `.env` files for development, staging, and production environments.                |
| **Code Documentation**                |  Medium  | PARTIAL   |    Low     | Document all new services and components (partially done with comprehensive solution docs).             |
| **Remove Deprecated Code**            |  Medium  |   TODO    |    Low     | Remove old ContraparteService and related deprecated files to clean up codebase.                       |

### 🔒 Security & Compliance
*Ensure data security and regulatory compliance.*

| Feature                               | Priority | Status    | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :-------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **Enhanced Firestore Rules**          |   High   | PARTIAL   |   Medium   | Implement the comprehensive security rules designed for the new contraparte system.                     |
| **Data Encryption at Rest**           |  Medium  |   TODO    |    High    | Implement additional encryption for sensitive contract data and personal information.                    |
| **Access Log Monitoring**             |  Medium  |   TODO    |   Medium   | Monitor and log all access to sensitive organization data for compliance and security auditing.         |

---

## 🧪 QA / Bugs & Investigation

| Task                                                                 | Priority | Status       | Notes                                                                                                   |
| -------------------------------------------------------------------- | :------: | :----------: | ------------------------------------------------------------------------------------------------------- |
| Check if restriction of linking a contract already linked to another proyecto is working |  High   |   TODO       | Test the new backend and UI logic for contract linking restrictions.                                    |
| Investigate double signin issue and console message: "DEBUG: User custom claims: ..." |  High   |   TODO       | User must sign in twice; check auth flow and why custom claims debug appears.                           |
| **Verify Contract Import Modal Data Flow** |  High   |   TODO       | Test the full contract import request/approval workflow with real data.                                 |
| **Test Organization Permission System** |  High   |   TODO       | Verify that user access controls work correctly for different permission levels.                        |
| **Remove DEBUG Console Logs** |  Medium  |   TODO       | Clean up console.log statements in organizacionService.ts and other files.                             |
| ~~Access Control Error in ContraparteDetailedView~~ | ~~High~~ | **FIXED** | ~~Error: "No tienes acceso a esta información" - Fixed by implementing fallback access for organizations with existing contracts~~ |

---

## 📋 Deployment & Production Readiness

| Task                                                                 | Priority | Status    | Notes                                                                                                   |  
| -------------------------------------------------------------------- | :------: | :-------: | ------------------------------------------------------------------------------------------------------- |
| **Production Firestore Rules** |   High   |   TODO    | Deploy enhanced firestore.rules.enhanced to production environment.                                     |
| **Environment Variables Setup** |   High   |   TODO    | Configure production environment variables and API keys.                                                |
| **Performance Testing** |  Medium  |   TODO    | Load test the new contraparte system with realistic data volumes.                                       |
| **User Acceptance Testing** |  Medium  |   TODO    | Conduct comprehensive UAT for all new contraparte management features.                                  |

---

## 🌟 Recent Fixes & Updates

### June 22, 2025
- ✅ **Fixed Access Control Error** - Resolved "No tienes acceso a esta información" error in ContraparteDetailedView
  - Modified `hasDetailedAccess()` method to allow basic detailed access for organizations with existing contracts
  - Added fallback UI when detailed information is not available due to permissions
  - Improved error handling with specific user feedback for access issues

---

## � Future Enhancements (Lower Priority)

### � Analytics & Reporting
*Advanced analytics and business intelligence.*

| Feature                               | Priority | Status    | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :-------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **Partner Relationship Analytics**    |   Low    |   TODO    |    High    | Advanced analytics on partner relationships, contract patterns, and negotiation success rates.          |
| **Predictive Contract Analysis**      |   Low    |   TODO    |    High    | Machine learning models to predict contract renewal likelihood and risk factors.                        |
| **Executive Dashboard**               |   Low    |   TODO    |   Medium   | High-level dashboard for executives with key business metrics and relationship insights.                |

### 🌐 Integration Ecosystem
*Connect with external business systems.*

| Feature                               | Priority | Status    | Difficulty | Description                                                                                             |
| ------------------------------------- | :------: | :-------: | :--------: | ------------------------------------------------------------------------------------------------------- |
| **ERP System Integration**            |   Low    |   TODO    |    High    | Integrate with popular ERP systems for seamless data flow and financial reporting.                      |
| **CRM Integration**                   |   Low    |   TODO    |    High    | Connect with CRM systems to sync partner organization data and relationship history.                    |
| **API for Third-Party Access**       |   Low    |   TODO    |   Medium   | RESTful API to allow other systems to access contract and organization data securely.                   |

---

## 🎯 Next Sprint Priorities

### Immediate (Next 2 weeks)
1. **Contract Import Data Population** - Make ContractImportModal functional with real data
2. **User Access Management Integration** - Connect UserAccessManagement to real permissions  
3. **Test Organization Permission System** - Verify access controls work with new fallback logic
4. **Remove DEBUG Console Logs** - Clean up development logging

### Short Term (Next Month)  
5. **Enhanced RBAC Implementation** - Deploy comprehensive permission system
6. **Production Firestore Rules** - Deploy enhanced security rules
7. **Loading States & Error Handling** - Polish remaining new component UX flows
8. **Testing Strategy Implementation** - Add unit tests for new services

### Medium Term (Next Quarter)
9. **Performance Optimization** - Optimize Firestore queries and implement caching
10. **Template System** - Implement contract template management
11. **Audit Trail System** - Complete audit logging for all operations
12. **Mobile Responsiveness** - Ensure all new components work on mobile

---

## 🧪 QA / Bugs & Investigation

| Task                                                                 | Priority | Status    | Notes                                                                                                   |
| -------------------------------------------------------------------- | :------: | :-------: | ------------------------------------------------------------------------------------------------------- |
| Check if restriction of linking a contract already linked to another proyecto is working |  High   |   TODO    | Test the new backend and UI logic for contract linking restrictions.                                    |
| Investigate double signin issue and console message: "DEBUG: User custom claims: ..."   |  High   |   TODO    | User must sign in twice; check auth flow and why custom claims debug appears.                           |
  console.log('=====================================')
  
  const uniqueContrapartes = extractUniqueContrapartes()
  
  uniqueContrapartes.forEach((contraparte, index) => {
    const orgId = generateOrgId(contraparte)
    const industry = determineIndustry(contraparte)
    const type = determineOrgType(contraparte)
    
    console.log(`${index + 1}. ${contraparte}`)
    console.log(`   ID: ${orgId}`)
    console.log(`   Type: ${type}`)
    console.log(`   Industry: ${industry}`)
    console.log('   ---')
  })
  
  console.log(`\nTotal: ${uniqueContrapartes.length} unique contrapartes`)
}

// Function to add "Papelería Corporativa Ltda" to contracts data
export function addPapeleriaCorporativaContract() {
  console.log('📝 Adding sample contract for Papelería Corporativa Ltda')
  
  const papeleriaContract = {
    titulo: "Suministro de Material de Oficina",
    descripcion: "Contrato de suministro mensual de material de oficina, papelería y consumibles para la organización",
    contraparte: "Papelería Corporativa Ltda",
    contraparteId: "org-papeleria-corporativa-ltda",
    fechaInicio: new Date('2024-03-01'),
    fechaTermino: new Date('2025-02-28'),
    monto: 2400000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/papeleria-suministro.pdf',
    categoria: 'compras' as const,
    periodicidad: 'mensual' as const,
    tipo: 'egreso' as const,
    proyecto: 'Operaciones Generales',
    proyectoId: 'proj-operaciones',
    estado: 'activo' as const,
    organizacionId: 'org-001',
    departamento: 'Administración',
    responsableId: 'user-admin',
    documentoNombre: 'contrato-papeleria-suministro.pdf',
    documentoTamaño: 1500000,
    etiquetas: ['suministros', 'papeleria', 'oficina', 'mensual']
  }
  
  console.log('Contract details:', papeleriaContract)
  return papeleriaContract
}

// Run immediately if this script is executed directly
if (require.main === module) {
  console.log('🚀 Starting Contrapartes to Organizations Migration Script')
  console.log('=========================================================')
  
  // First, list all contrapartes for review
  listAllContrapartes()
  
  // Then create organizations (uncomment to run)
  // createOrganizationsFromContrapartes()
  //   .then(() => {
  //     console.log('✨ Migration completed successfully!')
  //     process.exit(0)
  //   })
  //   .catch((error) => {
  //     console.error('💥 Migration failed:', error)
  //     process.exit(1)
  //   })
}
