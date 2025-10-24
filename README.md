# ✨ Smart Resume Screener ✨

An intelligent tool to parse resumes, extract key information, and score candidates against a job description using the Google Gemini API. This project features a resume screener, a resume builder, and an AI-powered recruitment consultant, all wrapped in a sleek, futuristic UI.

## 🌐 Live Demo

You can try the live application here: **[shailesh-22-bce-0406-vit-resumescre.vercel.app](https://shailesh-22-bce-0406-vit-resumescre.vercel.app/)**

---

## 🚀 Key Features

*   **AI-Powered Resume Analysis:** Extracts skills, experience, and education from resumes and calculates a match score against a job description.
*   **Structured Data Extraction:** Uses the Gemini API's JSON mode for reliable and consistent data parsing, ensuring the UI always receives predictable data.
*   **Side-by-Side Comparison:** Displays shortlisted candidates in a clean interface with a clear justification for their match score and extracted details.
*   **AI Resume Builder:** Fill out a simple form with your personal details, experience, and skills, and let the AI generate a professional, well-formatted resume for you.
*   **Interactive AI Consultant:** Chat with an AI assistant that has context on the job description and uploaded resumes to get strategic recruitment advice.
*   **Local History:** Your screening sessions are automatically saved in your browser's local storage for easy access and review later.
*   **Flexible File Parsing:** Accepts both `.pdf` and `.txt` resume files, or you can paste resume text directly.
*   **Modern Tech Stack:** Built with React, TypeScript, and Vite for a fast, modern, and type-safe development experience.
*   **Dynamic UI:** A futuristic, space-themed interface with animated backgrounds, glowing effects, and a responsive design that works on all screen sizes.

---

## ⚙️ How to Run This Project Locally

There are two ways to run this application on your machine. The **Vite Method** is recommended for development, while the **Standalone File Method** is a quick and easy way to preview the app without any setup.

### Method 1: For Developers (Recommended)

This method uses **Vite**, a modern frontend build tool, to run a local development server. This is the most secure and feature-rich way to run the application.

#### Step 1: Get Your Google Gemini API Key

1.  Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
2.  Click **"Create API key"** to get your key. The free tier is generous and is all you need to run this application.

#### Step 2: Set Up the Environment File
This file securely stores your secret API key so it's not exposed in the browser.

1.  In the root directory of the project, create a new file named **`.env`**.
2.  Open the `.env` file and add your Google Gemini API key in the following format:
    ```
    VITE_API_KEY=your_gemini_api_key_goes_here
    ```
    **Important:** The variable name **must** start with `VITE_` for the application to be able to access it.

#### Step 3: Install Dependencies
This command downloads all the necessary libraries (like React) that the project needs to run.

1.  Open your terminal in the project's root folder.
2.  Run the following command:
    ```bash
    npm install
    ```

#### Step 4: Start the Development Server
This command will launch the application.

1.  In the same terminal, run:
    ```bash
    npm run dev
    ```
2.  Your terminal will display a local URL, usually **`http://localhost:5173`**. Open this URL in your web browser to see the application live!

---

### Method 2: Standalone File (Quick & Easy Preview)

If you want to try the app without installing Node.js or running any commands, you can use the self-contained HTML file.

#### Step 1: Open the File
Simply open the `run_local_no_server.html` file in a modern web browser like Chrome, Firefox, or Edge.

#### Step 2: Provide Your API Key
The application will prompt you to enter your Google Gemini API key. Get your key from **[Google AI Studio](https://aistudio.google.com/app/apikey)** and paste it into the input field to start using the app.

*   **Convenience:** The key will be saved in your browser's local storage, so you won't need to enter it again on the same machine.
*   **Security Note:** This method is provided for convenience. It is less secure because your API key is stored and handled directly in the browser. For the most secure setup, please use the Vite method described above.

---

## 🛠️ How It Works: A Technical Deep-Dive

This project uses a modern frontend architecture to deliver a seamless user experience while securely interacting with the powerful Google Gemini API.

### 1. Frontend: React & Vite
The user interface is a **Single-Page Application (SPA)** built with **React** and **TypeScript**. This provides a fast, responsive, and type-safe foundation. The entire local development environment is powered by **Vite**, which offers a lightning-fast development server and an optimized build process.

### 2. Backend Communication: The Vite Proxy
A critical aspect of this application is securely handling the Gemini API key. When using the recommended Vite method, the key is **never exposed to the browser for API calls**. This is achieved using Vite's built-in development server proxy, configured in `vite.config.ts`.

- When the frontend makes an API call to a local path like `/api/proxy-pro`, the Vite server intercepts it.
- It then forwards this request to the actual Google Generative AI endpoint (`https://generativelanguage.googleapis.com/...`).
- During this forwarding process, it securely attaches the `VITE_API_KEY` from your local `.env` file to the request.
- This means the browser only ever communicates with your local server, and the secret key remains safe on the server-side.

### 3. Gemini API Integration (`services/geminiService.ts`)
This file is the brain of the AI integration, orchestrating all calls to the Gemini API. To simplify the architecture and **allow the project to be run with a free-tier API key without a billing account**, it uses the versatile `gemini-2.5-flash` model for all tasks.

-   **`analyzeResumes` (JSON Mode):** For the complex resume analysis, the app makes a standard request and uses Gemini's JSON mode. By providing a strict schema, we ensure that the API's response is always a well-formed JSON object, which prevents runtime errors and makes the data easy to work with.
-   **Conversational Features (Streaming):** For interactive features like the AI Consultant and Resume Builder, the app uses streaming. This delivers the AI's response word-by-word, creating a real-time "typing" effect in the UI and providing a much more engaging user experience.

### 4. End-to-End Data Flow (Resume Screening Example)

1.  **User Input:** The user provides a job description and uploads resume files (`.pdf` or `.txt`).
2.  **Client-Side Parsing:** The browser uses the `pdf.js` library (in `services/fileParsers.ts`) to read the files and extract raw text content. No data has been sent to a server yet.
3.  **API Call:** The user clicks "Engage Hyperdrive". The `App.tsx` component calls the `analyzeResumes` function.
4.  **Prompt & Proxy:** `geminiService.ts` constructs a detailed prompt containing the job description, all resume texts, and the strict JSON schema. It sends this entire payload to the local `/api/proxy-pro` endpoint.
5.  **Secure Forwarding:** The Vite server proxies the request, attaching the API key and sending it to the Google Gemini API.
6.  **AI Processing:** Gemini processes the prompt, performs the analysis, and generates a JSON object that perfectly matches the requested schema.
7.  **Response:** The JSON response is sent back to the Vite proxy, which forwards it to the frontend application.
8.  **UI Update:** The frontend receives the structured data, parses it, and updates the state, causing React to render the `CandidateCard` components with the analysis results.

---

## 🔧 Troubleshooting

If you encounter issues with the **Vite method**, please check the following:

### API Key Connection Failed

-   **Check the `.env` file:**
    1.  Ensure the file is in the **root** of your project.
    2.  Ensure it is named exactly `.env` (not `.env.txt`).
    3.  Ensure the variable inside is named `VITE_API_KEY`.
-   **Check the Key and Project Settings:**
    1.  The issue might be with the key itself or your Google Cloud Project. Go to [Google AI Studio](https://aistudio.google.com/app/apikey), delete your current key, and **create a brand new one**.
    2.  Make sure the **"Generative Language API"** is enabled in your Google Cloud Project: [Enable the API](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com).
    3.  For full model access, a billing account must be linked to your Google Cloud Project.
-   **Restart the Server:** After creating or changing your `.env` file, you **must** stop (`Ctrl+C`) and restart (`npm run dev`) your Vite server for the changes to take effect.
