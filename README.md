# 🚀 DocCraft AI — Intelligent Document Automation Platform

> **Transform raw content into professionally structured, AI-reviewed documents with smart formatting, real-time error detection, and export capabilities.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![Express](https://img.shields.io/badge/Express-5-black?style=flat-square&logo=express)](https://expressjs.com)
[![TipTap](https://img.shields.io/badge/TipTap-Editor-purple?style=flat-square)](https://tiptap.dev)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Feature Walkthroughs](#feature-walkthroughs)
- [Export Formats](#export-formats)

---

## Overview

DocCraft AI is a full-stack intelligent document automation platform designed to help students and professionals turn raw, unstructured content into clean, professional documents. It detects AI-generated or poorly written text, highlights issues directly in the editor, allows users to set formatting preferences, and rewrites content using AI — all in one streamlined workflow.

---

## Features

### ✍️ Rich Text Editor
- TipTap-powered editor with full toolbar (Bold, Italic, Underline, Headings H1–H3, Lists, Alignment)
- Auto-save every 3 seconds
- Word count and character count display
- Real-time formatting applied to the document

### 🔍 Run Analysis (AI Detection)
- Detects issues **line-by-line** with line numbers shown for each error
- **Grammar errors** — capitalization, punctuation, duplicate words
- **AI-generated phrases** — "Furthermore", "Moreover", "Delve into", etc.
- **Repetition** — duplicate sentences and overused words
- **Poor structure** — missing headings, fragment sentences
- Issues are **visually highlighted directly in the editor**:
  - 🔴 Red solid underline → Grammar
  - 🟡 Yellow dashed underline → Repetition / Formatting
  - 🟣 Purple dashed underline → AI-generated phrase
  - 🔵 Blue dotted underline → Structure issue
- Hover any underlined text to see the exact error message

### ✨ Allow & Fix — Formatting Dialog
- After analysis, click **Allow & Fix** to open the Formatting Preferences Modal
- Customize before AI rewrites:
  - **Heading 1**: Font, Size, Color
  - **Heading 2**: Font, Size, Color
  - **Body Text**: Font, Size, Color, Alignment
  - **Line Height** slider (compact → wide)
  - **Paragraph Gap** slider
  - Live preview of all settings
- AI rewrites and restructures content using your preferences

### 🔬 Analyze Content (Final Check)
- Separate deep-quality analysis after editing
- Checks: **Clarity**, **Logical Flow**, **Completeness**, **Grammar**, **Structure**
- Returns a **quality score (0–100%)**
- Shows pass/fail for each category
- Returns verdict: *"Document is Perfect ✅"* or lists remaining issues

### 📊 Diagram Generator
- Enter a **custom topic** for the diagram (not just from document content)
- Generates:
  - **Flowchart** — step-by-step process flow
  - **Mind Map** — hierarchical concept map
  - **Sequence Diagram** — interaction flow between entities
- Powered by **Mermaid.js** with dark theme rendering
- **Insert into Document** — diagram appears as an image in the editor
- Edit the raw Mermaid code directly in the panel

### 🖼️ Image Search
- Search images via Unsplash / Pexels APIs
- Fallback to Picsum Photos (no API key needed)
- Click to insert directly into the document

### 💾 Save & Document Management
- Save document → instantly appears in the **sidebar** under Recent Docs
- Status tracking: `Draft → Analyzed → Fixed → Exported`
- **Soft Delete** — deletes move document to Trash, not permanently removed
- **History Page** with two tabs:
  - **All Documents** — browse, open, or delete any document
  - **Trash** — restore deleted docs or permanently delete with confirmation

### 📤 Export
- **Export DOCX** — fully formatted Word document with headings, body, footer
- **Export PDF** — professional PDF via server-side PDFKit generation
- Both maintain font, size, color, heading hierarchy, and alignment preferences

### 🔐 Authentication
- JWT-based login and signup
- Protected routes — unauthenticated users redirected to login
- Persistent sessions via localStorage token
- User preferences saved to profile

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **TipTap** | Rich text editor |
| **Mermaid.js** | Diagram rendering |
| **Zustand** | Global state management |
| **Axios** | HTTP client |
| **React Router v6** | Client-side routing |
| **Framer Motion** | Animations |
| **Lucide React** | Icon library |
| **jsPDF / html2canvas** | Client-side PDF utilities |
| **React Hot Toast** | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime |
| **Express 5** | Web framework |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT** | Authentication |
| **OpenAI API** | AI detection & rewriting |
| **docx.js** | DOCX file generation |
| **PDFKit** | PDF file generation |
| **bcrypt** | Password hashing |
| **cors** | Cross-origin requests |
| **dotenv** | Environment config |

---

## Project Structure

```
DocCraft AI/
├── frontend/                        # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor/
│   │   │   │   ├── DetectionPanel.jsx     # Issues panel with line numbers
│   │   │   │   ├── DiagramPanel.jsx       # Mermaid diagram generator
│   │   │   │   ├── FormattingDialog.jsx   # Post-Allow&Fix formatting modal
│   │   │   │   ├── FormattingPanel.jsx    # Format tab in right panel
│   │   │   │   └── ImageSearch.jsx        # Image search & insert
│   │   │   └── Layout/
│   │   │       ├── Layout.jsx             # Root layout wrapper
│   │   │       └── Sidebar.jsx            # Nav + Recent Docs list
│   │   ├── extensions/
│   │   │   └── ErrorMark.js              # Custom TipTap mark for error highlights
│   │   ├── lib/
│   │   │   └── api.js                    # Axios client with auth interceptor
│   │   ├── pages/
│   │   │   ├── Auth.jsx                  # Login / Signup split-panel
│   │   │   ├── Dashboard.jsx             # Document grid with stats
│   │   │   ├── Editor.jsx                # Main editor page (all features)
│   │   │   ├── History.jsx               # All Docs + Trash tabs
│   │   │   └── Settings.jsx              # Profile & preferences
│   │   ├── store/
│   │   │   ├── authStore.js              # Auth state (Zustand)
│   │   │   └── docStore.js               # Document CRUD + trash state
│   │   ├── App.jsx                       # Router + protected routes
│   │   ├── index.css                     # Global styles + TipTap editor CSS
│   │   └── main.jsx                      # React entry point
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env
│
├── backend/                          # Node.js + Express API
│   ├── middleware/
│   │   └── auth.js                   # JWT verification middleware
│   ├── models/
│   │   ├── User.js                   # User schema + bcrypt hook
│   │   ├── Document.js               # Document schema (soft delete support)
│   │   └── EditHistory.js            # Edit history tracking
│   ├── routes/
│   │   ├── auth.js                   # Login, signup, /me, preferences
│   │   ├── documents.js              # CRUD + soft-delete + trash + restore
│   │   ├── ai.js                     # Detect, Rewrite, Diagram, Final Check
│   │   ├── export.js                 # DOCX + PDF generation
│   │   └── images.js                 # Unsplash / Pexels / Picsum
│   ├── server.js                     # Express app, CORS, routes
│   ├── package.json
│   ├── .env
│   └── .env.example
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB Atlas account (free tier works)

### 1. Clone the project

```bash
git clone <your-repo-url>
cd "DocCraft AI"
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

**Backend** — create `backend/.env` (see [Environment Variables](#environment-variables)):

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

**Frontend** — create `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

### 5. Start the Backend

```bash
cd backend
node server.js
```

You should see:
```
✅ MongoDB connected
🚀 DocCraft AI Backend running on port 4000
🌐 Environment: development
```

### 6. Start the Frontend

```bash
cd frontend
npm run dev
```

Open your browser at: **http://localhost:5173** (or 5174 if 5173 is in use)

---

## Environment Variables

### `backend/.env`

```env
PORT=4000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/doccraft?retryWrites=true&w=majority&appName=doccraft

JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# Optional — fallback rule-based detection is used if not provided
OPENAI_API_KEY=sk-...

# Optional — Picsum fallback is used if not provided
UNSPLASH_ACCESS_KEY=your_unsplash_key
PEXELS_API_KEY=your_pexels_key

NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

> **Note:** The app works without OpenAI, Unsplash, and Pexels keys — it uses rule-based fallbacks automatically.

### `frontend/.env`

```env
VITE_API_URL=http://localhost:4000/api
```

---

## API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/signup` | Register new user |
| `POST` | `/login` | Login, returns JWT |
| `GET` | `/me` | Get current user profile |
| `PUT` | `/preferences` | Update user preferences |

### Document Routes — `/api/documents`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all active documents |
| `POST` | `/` | Create new document |
| `GET` | `/:id` | Get single document |
| `PUT` | `/:id` | Update document |
| `DELETE` | `/:id` | Soft delete (move to trash) |
| `POST` | `/:id/restore` | Restore from trash |
| `DELETE` | `/:id/permanent` | Permanently delete |
| `GET` | `/trash` | List trashed documents |
| `GET` | `/:id/history` | Get edit history |
| `GET` | `/stats/overview` | Dashboard statistics |

### AI Routes — `/api/ai`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/detect` | Analyze content — line-level issues |
| `POST` | `/rewrite` | Rewrite and restructure content |
| `POST` | `/diagram` | Generate Mermaid diagram code |
| `POST` | `/final-check` | Final quality analysis |
| `POST` | `/improve-paragraph` | Improve a single paragraph |

### Export Routes — `/api/export`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/docx` | Generate DOCX file |
| `POST` | `/pdf` | Generate PDF file |

### Image Routes — `/api/images`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/search?q=...` | Search images (Unsplash/Pexels/Picsum) |

---

## Feature Walkthroughs

### Run Analysis Flow
```
Paste Content
    ↓
Click "Run Analysis"
    ↓
Backend analyzes line-by-line
    ↓
Issues highlighted in editor (colored underlines)
    ↓
Issues Detected panel shows categorized list with line numbers
    ↓
Click "Allow & Fix"
    ↓
Formatting Dialog opens (set H1/H2/body styles)
    ↓
Click "Apply & Rewrite"
    ↓
AI rewrites content with your formatting preferences
    ↓
Click "Analyze Content" for final quality score
```

### Document Lifecycle
```
New Document (Draft)
    → Run Analysis (Analyzed)
    → AI Fix Applied (Fixed)
    → Exported (Exported)
    → Soft Deleted (Trash)
    → Restore or Permanently Delete
```

### Error Highlight Types
| Color | Style | Error Type |
|-------|-------|-----------|
| 🔴 Red | Solid underline | Grammar errors |
| 🟡 Yellow | Dashed underline | Repetition, formatting |
| 🟣 Purple | Dashed underline | AI-generated phrases |
| 🔵 Blue | Dotted underline | Structure issues |

---

## Export Formats

### DOCX
- Proper H1/H2/H3 heading hierarchy
- Styled body text with your chosen font and color
- Bullet points and numbered lists preserved
- Bold/italic inline formatting maintained
- Document footer with "Generated by DocCraft AI" + date

### PDF
- A4 page size, proper margins
- Headings with gradient underlines
- Body text at your chosen font size
- Lists indented properly
- Server-side generation via PDFKit (no browser print needed)

---

## Notes

- **Without OpenAI key:** The app uses rule-based analysis (capitalization, AI phrase detection, repetition, structure checks) — all features work, just less context-aware
- **Without image API keys:** Picsum Photos is used as fallback (random but beautiful images)
- **CORS:** Configured to accept any `localhost:*` port during development
- **Auto-save:** Documents are saved automatically 3 seconds after you stop typing (requires an existing saved document ID)

---

## License

MIT © 2024 DocCraft AI
