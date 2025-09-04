========Real-Time Compliance Finder=======

A real-time compliance guidance tool for U.S. small businesses. Owners enter their ZIP code, industry, and company size, and the app instantly streams applicable compliance rules.

Live Demo: https://bizreg-app-1.onrender.com/

Source Code: https://github.com/tarunreddy35/bizreg-app

============Features===========

Real-Time Results – Rules update instantly as users type (no “submit” button required).

Layered Rules – Handles Federal → State → Local → Industry → Size thresholds.

Streaming Updates – Built with Server-Sent Events (SSE) for progressive output.

Interactive Visualization – Live graph at the bottom shows which rule layers are active.

Scalable Model – Rules stored in a normalized schema with JSONLogic-style conditions.

Clean UI – Single-screen workflow, no training or docs needed.

========Tech Stack=====

Frontend: Next.js (React) + TypeScript + TailwindCSS + shadcn-ui

Backend: Node.js with SSE (Server-Sent Events)

Database/Rules Model: JSONLogic-style expressions, normalized by jurisdiction & industry

Deployment: Hosted on Render

========Getting Started==========

1. Clone the repo
git clone https://github.com/tarunreddy35/bizreg-app.git
cd bizreg-app

2. Install dependencies
npm install

3. Run locally
npm run dev