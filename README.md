AI Job Tracker

**Architecture**

```mermaid
flowchart LR
  subgraph Frontend
    A[Browser UI]
  end
  subgraph Backend
    B[API Server]
    C[LangChain Job Matcher]
    D[LangGraph AI Assistant]
    E[Data Store]
  end
  ExternalJobs[(External Job API)]

  A --> |requests| B
  B --> |fetch jobs / store applications| E
  B --> |query| ExternalJobs
  B --> |match requests| C
  C --> |embedding/search| E
  D --> |assist / generate UI updates| B
  D --> |tool calls| C
  D --> |state| E

  classDef ext fill:#f9f,stroke:#333,stroke-width:1px;
  ExternalJobs class ext
```

**Data flow**: User -> Frontend -> Backend API -> (External Job API, LangChain matcher, LangGraph assistant) -> Data Store -> Frontend.

**Setup Instructions**

- **Local setup:**
  - **Backend:**
    - Install: `cd backend && npm install`
    - Run dev: `npm start` (or `npm run dev` if configured)
  - **Frontend:**
    - Install: `cd frontend && npm install`
    - Run dev: `npm run dev`
- **Environment variables:**
  - **BACKEND_PORT**: port for the API server (default: `3000`)
  - **EXTERNAL_JOB_API_KEY**: key for external job API (if required)
  - **VECTOR_DB_URL**: URL for vector store (optional)
  - **LANGGRAPH_API_KEY**: API key or endpoint for LangGraph assistant (if used externally)
  - **OPENAI_API_KEY**: OpenAI key for embeddings / LLM
  - **NODE_ENV**: `development` or `production`
- **Prerequisites:**
  - Node.js >= 16
  - npm or pnpm
  - (Optional) vector DB service such as Pinecone, Milvus, or local FAISS

**LangChain & LangGraph Usage**

- **LangChain purpose:**
  - `LangChain` is used to perform semantic job matching: resumes and job descriptions are embedded; similarity search returns candidate jobs.
  - Embeddings and a lightweight ranking pipeline live in `backend/src/services/langchainMatcher.js`.
- **LangGraph graph structure:**
  - Nodes: `ResumeNode`, `JobNode`, `SkillNode`, `CompanyNode`, `PreferenceNode`, `MatchScoreNode`.
  - Edges: `hasSkill`, `requiresSkill`, `appliesTo`, `scoredBy` capture domain relationships.
  - The graph is used primarily for intent detection, structured responses and tool-call generation, while the vector DB handles numeric similarity.
- **Tool / function calling for UI filter updates:**
  - LangGraph produces structured tool calls: `{action: "updateFilters", payload: {...}}`.
  - Backend endpoint accepts the tool call and returns a JSON diff which the frontend uses to apply or preview filter changes.
- **Prompt design:**
  - System prompt: domain-expert recruiter, strict JSON tool-call output requirement.
  - Include few-shot examples mapping conversational queries to filter updates and match operations.
- **State management approach:**
  - Short-term: ephemeral session store (in-memory or Redis) for assistant context.
  - Persistent: resumes, job snapshots, and match history in `backend/backend_store.json` (dev) or production DB.

**AI Matching Logic**

- **Scoring approach:**
  - Multi-stage pipeline:
    - **Embedding similarity**: cosine similarity between resume and job vectors.
    - **Skill overlap**: exact + fuzzy skill match counts.
    - **LLM reranker**: reranks top-N from vector search using a small LLM prompt that considers seniority, location, and preferences.
    - **Final score**: weighted sum e.g., 0.5*embedding + 0.3*skill_overlap + 0.2*reranker.
- **Why it works:**
  - Embeddings capture semantic matches; skill overlap enforces must-have skills; reranker adds nuance and removes false positives.
- **Performance considerations:**
  - Only rerank top-N candidates to limit LLM calls.
  - Cache embeddings and incremental update of vector index when new jobs/resumes are added.
  - Use batched and async operations for fetching and reranking.

**Popup Flow Design (Assistant popup / bubble)**

- **Design summary:**
  - Assistant shown as a bubble attached to job cards. Click opens a compact popup with explanation, suggested filters, and quick actions.
- **Why this design:**
  - Low-friction contextual help: keeps users in context while offering actionable suggestions.
- **Edge cases handled:**
  - Empty / low-confidence suggestions: show confidence and require confirmation for global changes.
  - Conflicting filters: show merged preview and allow rollback.
  - Missing fields: fallback to keyword matching and inform the user.
- **Alternatives considered:**
  - Sidebar (persistent conversation) — better for deep sessions but consumes screen real-estate.
  - Modal (full-screen) — used only for in-depth workflows.

**AI Assistant UI Choice**

- **Choice:** bubble + compact popup
- **UX reasoning:**
  - Quick accept/modify flow, less intrusive than sidebar, preserves browsing context.

**Scalability**

- **100+ jobs:**
  - Client-side pagination + vector search top-K is sufficient; precompute embeddings for job corpus.
- **10,000 users:**
  - Horizontal API scaling, Redis for sessions, managed vector DB for embeddings, async reranking jobs and rate limits.

**Tradeoffs**

- **Known limitations:**
  - Cost and latency for LLM reranking.
  - Dev JSON store is not production-ready.
  - Assistant may return overconfident suggestions without enough training data.
- **Improvements with more time:**
  - Integrate Pinecone/Milvus, Redis sessions, better telemetry and A/B prompt testing.

---

If you'd like, I can also:
- add an SVG export of the architecture diagram into `docs/`;
- run the backend locally and validate AI endpoints.

See implementation in [backend/src/services/langchainMatcher.js](backend/src/services/langchainMatcher.js) and [backend/src/services/langgraph.js](backend/src/services/langgraph.js).
