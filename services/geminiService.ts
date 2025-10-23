import type { Candidate, Resume, ConsultantMessage, ResumeBuilderData } from "../types";

/**
 * A generic function to call our secure Vite server proxy.
 * This is the ONLY function that communicates with the backend.
 * @param body The request body to send to the Gemini API via our proxy.
 * @param stream Whether to handle a streaming response.
 * @returns The JSON response from the Gemini API or the assembled text from a stream.
 */
const callApiProxy = async (body: object, stream: boolean = false): Promise<any> => {
  // Choose the correct local proxy endpoint based on the stream flag.
  // The Vite dev server will forward these requests to the correct Gemini API endpoint.
  const proxyUrl = stream ? '/api/proxy-flash' : '/api/proxy-pro';

  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // The body is sent directly, no need for the { payload, stream } wrapper anymore.
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorBody = JSON.parse(errorText);
      console.error("API Proxy Error (JSON):", errorBody);
      throw new Error(errorBody.error?.message || 'An error occurred while communicating with the API.');
    } catch (jsonError) {
      console.error("API Proxy Error (Text):", errorText);
      throw new Error(errorText || 'An unknown HTTP error occurred.');
    }
  }

  // Handle streaming vs. non-streaming responses from our proxy
  if (stream) {
    if (!response.body) {
      throw new Error("Streaming response not available.");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      
      const matches = chunk.matchAll(/"text"\s*:\s*"([^"]*)"/g);
      for (const match of matches) {
        try {
          fullText += JSON.parse(`"${match[1]}"`);
        } catch (e) {
          console.error("Failed to parse chunk text:", match[1]);
        }
      }
    }
    return fullText;
  } else {
    // If not streaming, we expect a single JSON object.
    return response.json();
  }
};

// Defines the strict JSON schema for the resume analysis output.
// This ensures the Gemini API returns data in a consistent and reliable format.
const candidateSchema = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      id: { type: 'STRING', description: 'The resume ID from the input' },
      name: { type: 'STRING', description: "The candidate's full name" },
      matchScore: { type: 'INTEGER', description: 'A score from 1 to 10 indicating the match with the job description.' },
      justification: { type: 'STRING', description: 'A concise (2-3 sentences) justification for the match score.' },
      extractedSkills: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        description: 'A list of key skills extracted from the resume that are relevant to the job description.'
      },
      extractedExperienceSummary: { type: 'STRING', description: 'A brief (2-3 sentences) summary of the candidate\'s relevant work experience.' }
    },
    required: ['id', 'name', 'matchScore', 'justification', 'extractedSkills', 'extractedExperienceSummary']
  }
};


export const analyzeResumes = async (jobDescription: string, resumes: Resume[]): Promise<Candidate[]> => {
  const resumeTexts = resumes.map(r => 
    `--- RESUME START ---\nID: ${r.id}\nFILENAME: ${r.fileName}\n\n${r.text}\n--- RESUME END ---`
  ).join('\n\n');

  const prompt = `
    You are an expert technical recruiter. Your task is to analyze a list of resumes against a given job description and provide a structured JSON output based on the provided schema.

    JOB DESCRIPTION:
    ${jobDescription}

    RESUMES TO ANALYZE:
    ${resumeTexts}

    INSTRUCTIONS:
    1. Read the job description to understand key requirements.
    2. For each resume, provide:
        a. The candidate's name. Use the filename or "Unknown Candidate" if not found.
        b. A "matchScore" from 1 to 10 based on how well the candidate's skills and experience align with the job description.
        c. A concise "justification" (2-3 sentences) for the score.
        d. A list of "extractedSkills" from the resume relevant to the job.
        e. A brief "extractedExperienceSummary" (2-3 sentences) of their relevant work history.
    3. Your output MUST conform to the JSON schema provided in the request.
  `;

  try {
    // This function requires a full JSON object, so it does NOT stream.
    const response = await callApiProxy({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: candidateSchema,
      }
    }, false); // stream = false
    
    // The Gemini API response for JSON mode is nested.
    const jsonText = response.candidates[0].content.parts[0].text;
    const parsedData: Candidate[] = JSON.parse(jsonText);
    return parsedData;

  } catch (error) {
    console.error("Failed to analyze resumes:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Could not parse the analysis from the AI model. The response was not valid JSON.");
    }
    throw error;
  }
};

export const askQuestionAboutResume = async (
  resumeText: string, 
  question: string, 
  jobDescription: string
): Promise<string> => {
  const prompt = `
    You are an expert career coach and hiring manager. Your task is to provide insightful answers to questions about a candidate's resume, considering the context of a specific job description. Be helpful, insightful, and constructive. Go beyond what is just written in the resume and provide strategic advice.

    JOB DESCRIPTION CONTEXT:
    ${jobDescription}

    CANDIDATE'S RESUME:
    ${resumeText}

    USER'S QUESTION:
    ${question}

    YOUR INSIGHTFUL ANSWER:
  `;
  return callApiProxy({ contents: [{ parts: [{ text: prompt }] }] }, true); // stream = true
};

export const askConsultant = async (
  jobDescription: string,
  resumes: Resume[],
  messages: ConsultantMessage[]
): Promise<string> => {
  const resumeFileNames = resumes.map(r => r.fileName).join(', ') || 'None';
  const conversationHistory = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');

  const prompt = `
    You are an AI-powered Career and Recruitment Consultant. You have been provided with the context of a job description, a list of resume filenames that have been uploaded, and the current conversation history. Your goal is to provide expert advice.

    CONTEXT:
    - Job Description: ${jobDescription || 'Not provided yet.'}
    - Resumes Uploaded: ${resumeFileNames}
    - Conversation History:
    ${conversationHistory}

    Based on all available context, provide a helpful and concise answer to the user's last message. Do not repeat the context in your answer.
  `;
  return callApiProxy({ contents: [{ parts: [{ text: prompt }] }] }, true); // stream = true
};

export const generateResumeFromDetails = async (data: ResumeBuilderData): Promise<string> => {
  const experienceSection = data.workExperience
    .map(exp => `Company: ${exp.company}\nJob Title: ${exp.jobTitle}\nDates: ${exp.startDate} - ${exp.endDate}\nResponsibilities:\n${exp.responsibilities}`)
    .join('\n\n');
  
  const educationSection = data.education
    .map(edu => `School: ${edu.school}\nDegree: ${edu.degree}\nDates: ${edu.startDate} - ${edu.endDate}`)
    .join('\n\n');

  const prompt = `
    You are a professional resume writer. Your task is to generate a complete, well-formatted resume in plain text based on the structured data provided by a user. Use strong action verbs and a professional tone.

    USER DATA:
    - Full Name: ${data.fullName}
    - Email: ${data.email}
    - Phone Number: ${data.phoneNumber}
    - Address: ${data.address}
    - Professional Summary: ${data.summary}
    - Work Experience:\n${experienceSection}
    - Education:\n${educationSection}
    - Skills: ${data.skills}

    Generate the complete resume text based on the data above. Ensure clean formatting with clear headings (e.g., SUMMARY, WORK EXPERIENCE, EDUCATION, SKILLS). Do not include any introductory or concluding text. Just provide the resume content itself.
  `;
  return callApiProxy({ contents: [{ parts: [{ text: prompt }] }] }, true); // stream = true
};