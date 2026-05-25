# ATS Grader Frontend Application

React Vite application styled with Tailwind CSS v4, utilizing Axios for API requests, routing via React Router DOM, and managing session state with Context API. It incorporates interactive recruiter diagnostic visuals, layout compatibility checks, and a real-time resume editing workbench.

---

## 📂 Layout Components (`src/components/`)

1. **`Navbar.jsx`**: Top-bar displaying user session status and global page links.
2. **`FileUploader.jsx`**: Handles file selection for PDF and DOCX Word files.
3. **`ScoreCard.jsx`**: Displays double radial gauges comparing:
   - **ATS Score**: Raw matching filters rating.
   - **Shortlist Probability**: Calculated hiring manager screening survival chance.
4. **`SuggestionsPanel.jsx`**: Lists optimization ideas and collapsible accordion blocks mapping weak original bullet points to recommended rewrites.
5. **`ResumeViewer.jsx` (Workbench)**: Displays parsed resume contents side-by-side with section analysis checklists. Incorporates:
   - **Heatmap View**: Highlights visual hotspot areas and visualizes individual section scores (Summary, Experience, Skills, Education).
   - **Real-Time Editor View**: Multi-line editor enabling instant text updates and in-place re-grading.

---

## 📂 Page Layouts (`src/pages/`)

- `Analyze.jsx`: Features a target career role selection dropdown next to file uploader and job requirement textareas. Renders step-by-step progress tickers.
- `AnalysisView.jsx`: Dashboard displaying shortlist gauge charts, recruiter 6-second scan results (red flags list, skimmability index, first impressions), and ATS parser obstacles checklist.
- `Compare.jsx`: Allows choosing any two history reports and compares score improvement deltas, recruiter skimmability/readability gains, layout risk decreases, and lists newly matched keywords and resolved skills gaps.
- `Dashboard.jsx`: Tracks general user stats and Improvements curve.

---

## 🛠️ Tailwind CSS v4 Theme specs (`src/index.css`)

Custom theme variables configured inside the `@theme` directive:
- `--color-dark-950` / `--color-dark-900`: Midnight background zinc hues.
- `--color-brand-500` / `--color-brand-600`: Indigo/violet branding indicators.
- `--color-accent-500`: Emerald success elements (Check badges, shortlist success dials).
- `--color-danger-500`: Red alert highlights (Red flags, parsing layout risks, missing keywords).
