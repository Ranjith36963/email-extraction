# NSP Cases — AI Enquiry Processor

An AI-powered workflow that automatically extracts customer details, dimensions, requirements, and use cases from flight case enquiry emails — then presents everything in a live dashboard.

**[Live Demo](https://nsp-dashboard.vercel.app)**

---

## Architecture

```
                          NSP Cases — Enquiry Processing Pipeline

  ┌──────────┐    ┌──────────┐    ┌───────────┐    ┌───────────────┐
  │  Gmail    │───▶│   n8n    │───▶│  GPT-4o   │───▶│ Google Sheets │
  │  Inbox    │    │ Workflow │    │  Extract   │    │   Database    │
  └──────────┘    └──────────┘    └───────────┘    └───────┬───────┘
                       │                                    │
                       │                              ┌─────┴─────┐
                       │                              │           │
                  ┌────▼─────┐                  ┌─────▼───┐ ┌─────▼──────┐
                  │ GPT-4o   │                  │  Slack  │ │   React    │
                  │ Vision   │                  │  Alert  │ │ Dashboard  │
                  │ (if CAD) │                  └─────────┘ └────────────┘
                  └──────────┘
```

## How It Works

1. **Email arrives** — A customer sends an enquiry to the NSP Cases inbox
2. **n8n triggers** — The automation platform detects the new email and checks for attachments
3. **GPT-4o extracts** — The email body (and any attached CAD drawings via Vision API) is processed to extract structured data: customer info, product types, dimensions, quantities, requirements, urgency, and use case
4. **Data stored** — Extracted JSON is appended to a Google Sheets tracker with confidence scoring
5. **Team notified** — A Slack message alerts the team with a summary, urgency flag, and any missing information
6. **Dashboard updates** — This React dashboard auto-refreshes every 15 seconds, showing all processed enquiries

## Features

- **Automated email extraction** — No manual data entry; AI reads and structures enquiry emails
- **Structured JSON output** — Customer details, product specs, dimensions, and requirements in a consistent format
- **Confidence scoring** — Each extraction gets a confidence percentage so the team knows what to trust
- **Urgency detection** — Automatically flags high-priority and critical enquiries
- **Missing info flagging** — Highlights what's missing (phone number, dimensions, etc.) for quick follow-up
- **Attachment analysis** — GPT-4o Vision processes CAD drawings and product images
- **Slack notifications** — Real-time team alerts with enquiry summaries
- **Live dashboard** — React-based UI with auto-refresh, filtering, and expandable detail cards

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 18, Vite |
| **Hosting** | Vercel (frontend + serverless API) |
| **Automation** | n8n (self-hosted workflow engine) |
| **AI Extraction** | GPT-4o (OpenAI) with JSON mode |
| **Vision Processing** | GPT-4o Vision API |
| **Database** | Google Sheets API |
| **Notifications** | Slack Incoming Webhooks |

## Screenshots

> Screenshots coming soon — visit the [live demo](https://nsp-dashboard.vercel.app) to see it in action.

## Setup

### Dashboard (React + Vercel)

```bash
# Clone the repo
git clone https://github.com/Ranjith36963/email-extraction.git
cd nsp-dashboard

# Install dependencies
npm install

# Set environment variables (create .env)
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_API_KEY=your_api_key

# Run locally
npm run dev

# Deploy to Vercel
vercel
```

### n8n Workflow

1. Import `n8n-workflow.json` into your n8n instance
2. Configure credentials:
   - **Gmail** — OAuth2 connection to the company inbox
   - **OpenAI** — API key for GPT-4o
   - **Google Sheets** — Service account or OAuth2 for the tracker spreadsheet
   - **Slack** — Incoming webhook URL for notifications
3. Activate the workflow

### Google Sheets

The sheet should have a tab named `Enquiries` with columns A through S. The serverless API reads from this range automatically. If using the `full_json` column, the API parses the complete extraction JSON directly.

## Project Structure

```
nsp-dashboard/
├── src/
│   ├── App.jsx          # Main dashboard component (UI + logic)
│   └── main.jsx         # React entry point
├── api/
│   └── enquiries.js     # Vercel serverless function (reads Google Sheets)
├── index.html           # HTML shell
├── package.json
├── vite.config.js
├── vercel.json          # Vercel routing config
├── n8n-workflow.json    # n8n workflow (import into your instance)
└── README.md
```

## Live Demo

**[https://nsp-dashboard.vercel.app](https://nsp-dashboard.vercel.app)**

---

Built by **Ranjith**
