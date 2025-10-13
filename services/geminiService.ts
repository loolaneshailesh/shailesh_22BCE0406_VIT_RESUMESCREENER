import type { Candidate, Resume, ConsultantMessage, ResumeBuilderData } from "../types";

/**
 * A generic function to call our secure serverless proxy.
 * This is the ONLY function that communicates with the backend.
 * @param body The request body to send to the Gemini API via our proxy.
 * @returns The JSON response from the Gemini API.
 */
const callApiProxy = async (body: object): Promise<any> => {
  const response = await fetch('/api/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    // Read the raw response body as text ONCE. This is the key fix.
    const errorText = await response.text();
    try {
      // Then, try to parse that text as JSON.
      const errorBody = JSON.parse(errorText);
      console.error("API Proxy Error (JSON):", errorBody);
      // If successful, throw the structured error message.
      throw new Error(errorBody.error?.message || 'An error occurred while communicating with the API.');
    } catch (jsonError) {
      // If parsing fails, the error was plain text.
      console.error("API Proxy Error (Text):", errorText);
      // Throw the plain text error to be displayed in the UI.
      throw new Error(errorText || 'An unknown HTTP error occurred.');
    }
  }

  // If the response is OK, we expect it to be valid JSON.
  return response.json();
};


// --- All original functions, now adapted to use the secure proxy ---

export const analyzeResumes = async (jobDescription: string, resumes: Resume[]): Promise<Candidate[]> => {
  const resumeTexts = resumes.map(r => 
    `--- RESUME START ---\nID: ${r.id}\nFILENAME: ${r.fileName}\n\n${r.text}\n--- RESUME END ---`
  ).join('\n\n');

  const prompt = `
    You are an expert technical recruiter and hiring manager. Your task is to analyze provided resumes against a job description.

    JOB DESCRIPTION:
    ${jobDescription}

    RESUMES:
    ${resumeTexts}

    INSTRUCTIONS:
    For each resume, perform the following:
    1. Extract the candidate's full name. Use the FILENAME if not available.
    2. Assign a "matchScore" from 1 (poor fit) to 10 (perfect fit).
    3. Write a concise "justification" (2-3 sentences).
    4. Extract a list of key "extractedSkills".
    5. Provide a brief "extractedExperienceSummary".

    You MUST provide the output in a valid JSON array format. Do not include any text or markdown before or after the JSON array. The JSON schema for each object in the array should be:
    {
      "id": "string",
      "name": "string",
      "matchScore": "number",
      "justification": "string",
      "extractedSkills": ["string"],
      "extractedExperienceSummary": "string"
    }
  `;

  try {
    const response = await callApiProxy({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    
    // The proxy returns the full Gemini response, so we extract the text.
    const jsonText = response.candidates[0].content.parts[0].text;
    const parsedData: Candidate[] = JSON.parse(jsonText);
    return parsedData;

  } catch (error) {
    console.error("Failed to analyze resumes:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Could not parse the analysis from the AI model. The response was not valid JSON.");
    }
    throw error; // Re-throw other errors (like from callApiProxy)
  }
};


export const askQuestionAboutResume = async (
  resumeText: string, 
  question: string, 
  jobDescription: string
): Promise<string> => {
  const prompt = `
    You are an expert career coach and hiring manager. Answer the user's question about a resume, using both the resume and the job description for context. You can provide advice, suggest improvements, or identify gaps. Be insightful and constructive.

    --- JOB DESCRIPTION START ---
    ${jobDescription || 'No job description provided.'}
    --- JOB DESCRIPTION END ---

    --- RESUME TEXT START ---
    ${resumeText}
    --- RESUME TEXT END ---

    USER'S QUESTION:
    ${question}

    YOUR INSIGHTFUL ANSWER:
  `;
  const response = await callApiProxy({ contents: [{ parts: [{ text: prompt }] }] });
  return response.candidates[0].content.parts[0].text;
};


export const askConsultant = async (
  jobDescription: string,
  resumes: Resume[],
  messages: ConsultantMessage[]
): Promise<string> => {
  const resumeFileNames = resumes.map(r => r.fileName).join(', ') || 'None';
  const conversationHistory = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');

  const prompt = `
    You are an AI Recruitment Consultant. Provide actionable advice to help users improve their job descriptions or resumes, using the provided context. Be encouraging and professional.

    CONTEXT:
    - Current Job Description: ${jobDescription || 'Not provided yet.'}
    - Loaded Resumes: ${resumeFileNames}

    CONVERSATION HISTORY:
    ${conversationHistory}

    Based on all context, provide a helpful answer to the user's last message.
  `;
  const response = await callApiProxy({ contents: [{ parts: [{ text: prompt }] }] });
  return response.candidates[0].content.parts[0].text;
};

export const generateResumeFromDetails = async (data: ResumeBuilderData): Promise<string> => {
  const prompt = `
    You are a professional resume writer. Generate a clean, effective resume in plain text format based on the structured data provided. Use strong action verbs and a professional tone.

    USER-PROVIDED DATA:
    - Full Name: ${data.fullName}
    - Contact: ${data.email} | ${data.phoneNumber} | ${data.address}
    
    --- PROFESSIONAL SUMMARY ---
    ${data.summary}

    --- WORK EXPERIENCE ---
    ${data.workExperience.map(exp => `
    - Company: ${exp.company}
    - Job Title: ${exp.jobTitle}
    - Dates: ${exp.startDate} to ${exp.endDate}
    - Responsibilities:
      ${exp.responsibilities.split('\n').map(line => `  - ${line}`).join('\n')}
    `).join('\n')}

    --- EDUCATION ---
    ${data.education.map(edu => `
    - Institution: ${edu.school}
    - Degree: ${edu.degree}
    - Dates: ${edu.startDate} to ${edu.endDate}
    `).join('\n')}

    --- SKILLS ---
    ${data.skills}

    INSTRUCTIONS:
    Generate the complete resume text based on the data above. Ensure clean formatting. Do not include any introductory text. Just provide the resume content itself.
  `;
  const response = await callApiProxy({ contents: [{ parts: [{ text: prompt }] }] });
  return response.candidates[0].content.parts[0].text;
};