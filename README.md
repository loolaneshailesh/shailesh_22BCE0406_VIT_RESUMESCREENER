 AI Career Co-Pilot

The AI Career Co-Pilot is a sophisticated web application designed to streamline and enhance the processes of resume screening and career preparation. It provides a suite of powerful, integrated tools for both recruiters and job seekers, delivered through a clean and responsive user interface.

## Core Features

-   **AI Resume Screener:** Enables users to upload multiple resumes (in `.txt`, `.pdf`, and `.docx` formats) for an in-depth analysis and match-scoring against a provided job description. Includes a "Preset Roles" feature with over 30 common job titles for rapid setup.
-   **AI Recruitment Consultant:** An interactive chat assistant that provides expert advice on improving job descriptions, identifying key candidate attributes, and general recruitment strategies based on the current context.
-   **AI Resume Builder:** A guided, form-based interface that allows users to input their career details and generate a complete, professional resume crafted with strong, action-oriented language.
-   **Session Archives:** Screening sessions are automatically saved to a private, client-side archive, allowing users to instantly reload and review past results.
-   **Interactive Mock Interview:** A voice-powered tool that simulates a real job interview, providing tailored questions and a full performance review based on a user's resume and a target job description.
-   **Interview Preparation Module:** Generates common HR and technical questions and answers for specific job roles, allowing users to practice and prepare effectively.

---

## System Architecture

The AI Career Co-Pilot is built on a modern, secure, and efficient architecture that prioritizes user privacy, performance, and scalability. The system is logically separated into three main tiers.

### Frontend Application

The user interface is a dynamic single-page application (SPA) built with **React** and **TypeScript**.

-   **Orchestration (`App.tsx`):** This is the central component that manages the application's global state, including the active view, user inputs, and the data returned from the backend services.
-   **Modular Component System:** The UI is composed of modular, reusable components (e.g., `CandidateCard.tsx`, `ResumeBuilder.tsx`, `AiInterview.tsx`). This approach ensures the codebase is clean, maintainable, and scalable.
-   **Client-Side File Parsing:** To ensure user privacy, resume files are parsed directly **in the browser** using the `services/fileParsers.ts` module, which leverages the `pdf.js` and `mammoth.js` libraries. The files are never uploaded to a server for parsing, ensuring sensitive user data remains on the client machine.
-   **Styling:** The application's visual theme is implemented with **Tailwind CSS**. The `index.html` file contains a custom configuration for the color palette, visual effects, and animations, while the `FallingStarsBackground.tsx` component generates the animated backdrop.

### Serverless Backend

Instead of a traditional, monolithic server, this project utilizes a **Serverless Function** as its backend. This is a modern, cost-effective, and highly scalable approach.

-   **Implementation (`api/proxy.ts`):** This single file constitutes the entire backend. When deployed to a platform like Vercel, it becomes an on-demand API endpoint that executes only when a request is made.
-   **API Key Security:** The primary function of this proxy is to securely manage the secret Gemini API key. The line `const API_KEY = process.env.API_KEY;` executes on the secure Vercel server. This provides a secure mechanism for handling the secret API key, adding it to requests to the Gemini API *after* they have left the user's browser. This is the industry-standard best practice to prevent API key exposure.
-   **Intelligent Response Handling:** The function determines whether a streaming or non-streaming response is required based on a `stream` flag sent from the frontend.
    -   For long-running, conversational requests (e.g., AI Assistant, Mock Interview), it **streams** the response back to the client. This prevents the function from exceeding the 10-second execution timeout on Vercel's free tier.
    -   For requests that require a complete data structure (e.g., the main resume analysis), it waits for the **full JSON object** from the AI before returning it.

### Data Persistence Strategy

For storing user data such as screening history, the application uses the browser's built-in **`localStorage`**.

-   **Data Manager (`hooks/useHistory.ts`):** This custom React hook encapsulates all logic for saving, loading, and deleting screening sessions from the user's private browser storage.
-   **Rationale for `localStorage` vs. a Traditional Database:** This was a deliberate architectural choice based on the following principles:
    1.  **User Privacy:** A user's resumes and screening data are sensitive. With `localStorage`, this data **never leaves the user's computer**. It is not transmitted to or stored on a central server, which is a significant advantage for user trust and security.
    2.  **Performance:** All data operations are instantaneous, with zero network latency.
    3.  **Simplicity and Cost:** This approach requires no backend database server, no hosting fees, and no complex user authentication system. It is a "zero-ops" solution that is completely free to run.

The trade-off is that data is not synced across devices. For the goal of a fast, private, and secure personal tool, this was the ideal solution.

---

## LLM Integration and Prompt Engineering

Getting reliable, structured results from a Large Language Model (LLM) requires a methodical approach to prompt design. This application uses **Prompt Engineering** to ensure communication with the Gemini API is precise and effective. The core strategy is to provide the AI with a clear **persona, context, detailed instructions, and a defined output format.**

### Example Prompt: Resume Analysis

The following is a simplified representation of the prompt used for the core Resume Screener feature.

```
You are an expert technical recruiter and hiring manager with years of experience. Your task is to analyze a list of resumes against a given job description and provide a structured JSON output.

## JOB DESCRIPTION:
${jobDescription} // The full job description is injected here.

## RESUMES TO ANALYZE:
--- RESUME START ---
ID: resume_12345
FILENAME: john_doe_resume.pdf

(The full text of John Doe's resume is injected here)
--- RESUME END ---

## INSTRUCTIONS:
1.  Carefully read the Job Description to understand the key requirements.
2.  For each resume, perform the following analysis:
    a.  Identify the candidate's name.
    b.  Calculate a "matchScore" from 1 to 10 based on the alignment of skills and experience.
    c.  Write a concise "justification" explaining the score.
    d.  Extract a list of the most relevant "extractedSkills".
    e.  Provide a brief "extractedExperienceSummary".
3.  You MUST provide the output in a valid JSON array format. The JSON schema for each object in the array should be:
{
  "id": "string (use the resume ID from the input)",
  "name": "string",
  "matchScore": "number (integer from 1-10)",
  "justification": "string",
  "extractedSkills": ["string"],
  "extractedExperienceSummary": "string"
}
```

#### Key Elements of the Prompt:

-   **Persona:** It tells the AI *how* to think (`"expert technical recruiter"`), which primes it for a higher quality analysis.
-   **Context:** It provides all necessary data, clearly separated and formatted for easy parsing by the model.
-   **Instructions:** It gives a clear, step-by-step process for the analysis, reducing ambiguity.
-   **Structured Output:** This is the most critical element. By demanding a specific JSON schema and instructing the Gemini model to use a JSON `responseMimeType`, we ensure the AI's output is machine-readable and reliable. This allows the application to directly render the data without complex or error-prone text parsing.

This same strategic approach is used for every AI-powered feature in the application.

---

## Deployment Instructions

This application is designed for easy, free deployment on **Vercel**.

### Step 1: Obtain a Gemini API Key

1.  Navigate to the **Google AI Studio**.
2.  Sign in with your Google Account.
3.  Select **"Get API key"** from the left menu and then **"Create API key"**.
4.  Copy the generated key and store it securely.

### Step 2: Deploy to Vercel

1.  **Fork** this repository to your own GitHub account.
2.  Go to **Vercel.com** and sign up with your GitHub account.
3.  On your Vercel dashboard, click **"Add New..." -> "Project"**.
4.  Import the GitHub repository you forked.
5.  Vercel will likely not require any changes to the build settings; you can leave them as the default.
6.  **Important:** Before deploying, expand the **"Environment Variables"** section.
7.  Add a new environment variable:
    -   **Name:** `API_KEY`
    -   **Value:** Paste your secret Gemini API key here.
8.  Click **"Deploy"**.

Vercel will deploy your application and provide a live, public URL.
