### Software Architecture: AI-Powered Document Insight Manager

This technical specification defines the structure of a **Serverless BaaS** application based on **Client-Side Clean Architecture**, utilizing Angular, AngularFire, Tailwind CSS and Vitest for testing.

---

### Quality Attributes (ISO/IEC 25010)

The following attributes are the pillars ensuring the system is production-grade and not just a prototype.

1.  **Security (Confidentiality):** Strict protection of PDF documents and insights, ensuring only the authenticated owner can access their data.
2.  **Performance Efficiency (Time Behavior):** Minimizing interface load latency and providing immediate feedback during document analysis.
3.  **Reliability (Recoverability):** System capacity to handle AI API failures or network interruptions without data loss.
4.  **Maintainability (Modularity):** A structure that allows switching service providers (e.g., swapping Gemini for another model) without rewriting core business logic.
5.  **Scalability:** Ability to process multiple simultaneous uploads without service degradation.

---

### 🚩 ASRs (Architecturally Significant Requirements)

Key requirements that shape the most critical technical decisions.

#### **ASR-01: Identity & Data Privacy (Security)**

- **Context:** Users upload sensitive PDF documents. These files and their derived insights must remain private and accessible only by the document owner.
- **Solution:** Integrate **Firebase Auth** using Google Sign-In for identity. Implement **Firestore and Storage Security Rules** that validate the `request.auth.uid` against the `userid` field in each document.
- **Justification:** Moving authorization to the infrastructure layer ensures that data cannot be leaked even if the client-side code is compromised.
- **Pros:** Robust security, zero backend code to maintain, and seamless integration with Google’s ecosystem.
- **Cons:** Tight coupling with Firebase's proprietary security rule language.

#### **ASR-02: Automated Analysis Workflow (Reliability)**

- **Context:** Extracting insights via LLM is an expensive and potentially slow process that may fail due to API timeouts or malformed PDFs.
- **Solution:** Utilize the **Firebase AI Logic Extension** configured with `gemini-3-flash-preview`. The UI observes a status field in Firestore to provide real-time feedback.
- **Justification:** An event-driven approach offloads heavy processing from the user's browser, allowing for managed retries and background execution.
- **Pros:** Scalable, asynchronous execution, and built-in retry logic.
- **Cons:** Potential "cold start" latency for initial cloud function triggers.

#### **ASR-03: Responsive "Vibe" & Interaction (Performance)**

- **Context:** Users require a fluid experience when navigating history or editing insights.
- **Solution:** Use **Angular/Tailwind CSS** for a lightweight UI and **Firestore Real-time Listeners** for state synchronization.
- **Justification:** Angular provides a robust framework for building complex UIs, while Firestore provides immediate "optimistic" updates.
- **Pros:** Near-instant load times, offline support, and a highly responsive UI.
- **Cons:** Requires manual DOM manipulation or a lightweight reactivity library to manage state in pure HTML.

### 6. US-002: PDF Upload (Zoneless)
- Implemented **Clean Architecture** patterns:
    - **Domain**: `AppDocument` interface for unified document metadata.
    - **Infrastructure**: `DocumentService` using `@angular/fire/storage` and `@angular/fire/firestore`.
- Developed **Premium UI Components**:
    - `LayoutComponent`: Shared sidebar and header based on "Process Document Simplified" design.
    - `UploadComponent`: Interactive drag-and-drop zone with real-time progress Signal tracking.
- **Routing**: Configured lazy loading and route protection via `authGuard`.
- **Zoneless Reactivity**: Leveraged `toSignal` and `computed` for a highly performant, zone-free UI.

## Validation Results

### Automated Tests
```bash
npx vitest run src/app/core/services/auth.service.spec.ts
npx vitest run src/app/core/services/document.service.spec.ts
```
> **Result**: 7/7 tests passed (3 Auth, 4 Document).

### Security Validation
- Firestore Rules: Validated via MCP (OK).
- Storage Rules: Validated via MCP (OK).

### Manual Verification
- Layout successfully unifies Sidebar and Header.
- Upload component handles file selection and drag-and-drop correctly.
- Application maintains "Vibe" and responsiveness in zoneless mode.

#### **ASR-04: Error Handling & Observability (Reliability)**

- **Context:** Without a custom backend, errors in AI extraction or storage must be visible to the user to avoid "silent failures."
- **Solution:** Implement an **Audit Log** collection in Firestore where the AI Extension writes execution status and errors.
- **Justification:** Provides a shared log between the agent and the developer to debug failed extractions and maintain system health.
- **Pros:** Improved troubleshooting and clear feedback for the end-user.
- **Cons:** Small increase in Firestore write operations.

#### **ASR-05: Integrity of Extracted Insights (Functional Suitability)**

- **Context:** AI-generated insights can be "hallucinated" or malformed, potentially breaking the UI structure.
- **Solution:** Implement a **Schema Validation** tactic in the "Human-in-the-Loop" review phase.
- **Justification:** Ensures that all saved insights adhere to a strict structure before being persisted, preventing technical debt in the data layer.
- **Pros:** Guaranteed data consistency and simplified frontend rendering.
- **Cons:** Slight increase in client-side processing logic.

---

### Architectural Patterns

Structural decisions to organize the system and solve domain problems.

- **Clean Architecture (Client-Side):** Layered organization (Entities, Use Cases, Adapters) within the frontend. This isolates business rules from changes in Firebase SDKs.
- **Backend-as-a-Service (BaaS):** Elimination of custom servers. All infrastructure is managed by Firebase, reducing operational complexity.
- **Repository Pattern:** Abstraction of Firestore and Storage calls. This ensures application logic does not depend directly on database implementation.
- **Observer Pattern (Real-time):** Utilization of Firestore listeners so the interface updates automatically as soon as the AI writes results to the database.

---

### Architectural Tactics

Specific technical actions to satisfy Quality Attributes and ASRs.

1.  **Authentication & Authorization (Security):**
    - Use of **Firebase Auth (Gmail)** for identity management.
    - Implementation of **Security Rules** in Firestore/Storage: `allow read: if request.auth.uid == resource.data.userid`.

2.  **Asynchronous Calls (Performance):**
    - Use of **Promises and Async/Await** to avoid blocking the main thread.
    - **Optimistic UI Tactic**: The interface reflects changes before the database confirms the write operation.

3.  **Serverless (Scalability & Availability):**
    - Use of **Firebase AI Logic Extension** to automatically scale PDF processing horizontally.
    - Deployment on a **Content Delivery Network (CDN)** to ensure global availability and low latency.

---

### Technical Stack

A selection of tools optimized for development speed and execution performance.

- **Frontend:** Angular and **Tailwind CSS v4+**
- **Client Logic:** TypeScript following Clean Architecture structure.
- **Authentication:** **Firebase Auth** (Google Provider).
- **Database:** **Cloud Firestore** (Real-time NoSQL).
- **Storage:** **Firebase Storage** (For PDF files).
- **AI Engine:** **Firebase AI Logic Extension** with the **gemini-3-flash-preview** model.

---
