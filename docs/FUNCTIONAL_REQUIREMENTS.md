# CineVault Functional Requirements Document (FRD)

## 1. Inventory Transaction Workflow

### 1.1 Overview
The transactional workflow governs the core capability of the system. It permits authenticated personnel to navigate the catalog, verify inventory availability, and execute rental transactions leveraging a centralized digital ledger (wallet).

### 1.2 User Perspective

#### Catalog Navigation
- The default interface presents a structured catalog indicating metadata such as title, categorical classification, rating, pricing, and current inventory status.
- Users may execute targeted searches via an integrated search mechanism.
- Users may apply categorical filters to isolate specific genres.
- Status indicators reflect realtime inventory availability for each catalog item.

#### Asset Evaluation
- Interacting with a catalog item invokes a detailed metadata view.
- The detailed view exposes complete bibliographic data, cast information, narrative summary, and precise availability counts.
- Users may append items to a persistent wishlist for future action.
- Users may access and contribute to aggregated peer evaluations (reviews).

#### Transaction Execution
1. The user initiates a transaction via a standardized "Rent" interface element.
2. **Authentication Verification**: Unauthenticated sessions are redirected to the authorization portal with appropriate notification.
3. **Ledger Verification**: The system evaluates the user's digital wallet balance against the asset's rental cost. Insufficient funds prohibit transaction completion.
4. **Inventory Verification**: The backend system queries for an unreserved physical copy (`currentlyRented = false`). If zero units are available, the transaction is rejected with a 400 Bad Request status.
5. **State Mutation**: The specific physical copy is flagged as rented. The designated cost is deducted from the user's wallet. A persistent rental record is instantiated with a standard 7-day expiration boundary.
6. **Confirmation**: The interface acknowledges successful execution and updates the visible wallet balance dynamically.

#### Transaction Monitoring
- The user dashboard provides comprehensive oversight of active transactions, historical volumes, and accrued penalty fees.
- Interface elements denote transaction status (Active, Due Soon, Overdue, Returned).
- Historical data is presented in a structured, sortable format.

#### Asset Recovery (Administration)
- System administrators process asset returns via designated API endpoints.
- The system evaluates the return timestamp against the established due date to calculate potential overdue penalties (£0.50 per day).
- The returned physical copy is reverted to an available state within the inventory tracking system.

### 1.3 Business Logic Requirements
- The standard transaction duration is strictly set to 7 consecutive days.
- Overdue penalties accrue at a rate of £0.50 per day beyond the designated return date.
- A single transaction correlates to a single physical asset; however, users may initiate concurrent transactions for the same title provided sufficient inventory exists.
- New accounts are provisioned with a default ledger balance of £30.00 (adjustable via system environment parameters).

### 1.4 Exception Handling
| Scenario | Interface Response |
|---|---|
| Unauthenticated access attempt | Prompt for authentication credentials. |
| Insufficient ledger balance | Explicit notification of fund deficit relative to cost. |
| Inventory depletion | Explicit notification of zero availability. |
| Invalid asset identifier | Resource not found notification. |
| Infrastructure failure | Standardized generic system error notification. |

---

## 2. Identity and Access Management

### 2.1 Overview
The platform enforces a comprehensive identity management lifecycle encompassing registration, authentication, session persistence, and demographic profile administration.

### 2.2 User Perspective

#### Registration Workflow
1. The user accesses the account creation interface.
2. Required data parameters are collected: First Name, Last Name, Email Address, Phone Number, Password, and Password Confirmation.
3. Client-side logic executes strict validation constraints (e.g., minimum character counts, regex-based email formatting).
4. Upon submission, the backend system provisions the account, applying bcrypt hashing to secure the provided password.
5. The API provisions and returns a standard JSON Web Token (JWT).
6. The interface redirects the user to the secured dashboard area.

#### Authentication Workflow
1. The user provides registered credentials (email and password).
2. The backend system verifies the credentials against hashed records and issues a JWT.
3. The interface persists the token and grants access to protected routes.
4. Invalid credentials yield explicit error notifications.

#### Session Persistence
- The client application evaluates local storage for an existing, unexpired JWT upon initialization.
- Valid tokens trigger a silent background request to restore full session state.
- Expired or malformed tokens invoke automated session termination and redirection to public routes.

#### Profile Administration
- Authenticated users possess access to a centralized profile management interface.
- Read-only data includes the unique email identifier and historical platform usage metrics.
- Users may mutate demographic data (Name, Phone, Date of Birth) via validated forms.
- Users may upload localized media (profile pictures) which are processed server-side (Base64 encoded, resized) prior to database persistence.

### 2.3 Business Logic Requirements
- The email address functions as the globally unique identifier across the platform.
- Cryptographic hashing (bcrypt with a minimum of 10 salt rounds) is mandatory for all password storage.
- Session authorization relies exclusively on JWT architecture, with tokens expiring after 24 hours.
- Uploaded image assets are subject to standardized server-side mutation (resized to 200x200 dimensions and formatted as JPEG) to ensure interface consistency.

### 2.4 Exception Handling
| Scenario | Interface Response |
|---|---|
| Non-unique email submission | 409 Conflict notification indicating duplicate identity. |
| Invalid authentication parameters | 401 Unauthorized notification. |
| Client-side validation failure | Granular, field-specific error notifications. |
| Token expiration | Automated session invalidation and interface lockdown. |
