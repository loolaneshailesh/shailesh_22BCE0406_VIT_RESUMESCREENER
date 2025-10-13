import type { Candidate, Resume, ConsultantMessage, ResumeBuilderData } from "../types";

/**
 * A generic function to call our secure serverless proxy.
 * This is the ONLY function that communicates with the backend.
 * @param body The request body to send to the Gemini API via our proxy.
 * @param stream Whether to handle a streaming response.
 * @returns The JSON response from the Gemini API or the assembled text from a stream.
 */
const callApiProxy = async (body: object, stream: boolean = false): Promise<any> => {
  const response = await fetch('/api/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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

  // --- FIX: Handle streaming vs. non-streaming responses ---
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
      
      // The streaming response sends multiple JSON objects. We need to parse them.
      // A simple regex can find the text content in each chunk.
      const matches = chunk.matchAll(/"text"\s*:\s*"([^"]*)"/g);
      for (const match of matches) {
        // The captured group [1] has the actual text. We need to decode JSON string escapes.
        fullText += JSON.parse(`"${match[1]}"`);
      }
    }
    return fullText;
  } else {
    // If not streaming, we expect a single JSON object.
    return response.json();
  }
};


// --- Functions updated to use streaming where appropriate ---

export const analyzeResumes = async (jobDescription: string, resumes: Resume[]): Promise<Candidate[]> => {
  const resumeTexts = resumes.map(r => 
    `--- RESUME START ---\nID: ${r.id}\nFILENAME: ${r.fileName}\n\n${r.text}\n--- RESUME END ---`
  ).join('\n\n');

  const prompt = `
    You are an expert technical recruiter... (Full prompt remains the same)
    ...
    You MUST provide the output in a valid JSON array format. Do not include any text or markdown before or after the JSON array. The JSON schema for each object in the array should be:
    {
      "id": "string", "name": "string", "matchScore": "number", "justification": "string", 
      "extractedSkills": ["string"], "extractedExperienceSummary": "string"
    }
  `;

  try {
    // This function requires a full JSON object, so it does NOT stream.
    const response = await callApiProxy({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    }, false); // stream = false
    
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

// ** FIX: These functions now use streaming to avoid timeouts **
export const askQuestionAboutResume = async (
  resumeText: string, 
  question: string, 
  jobDescription: string
): Promise<string> => {
  const prompt = `
    You are an expert career coach... (Full prompt remains the same)
    ...
    USER'S QUESTION:
    ${question}

    YOUR INSIGHTFUL ANSWER:
  `;
  // The returned value is already the full text string from the stream.
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
    You are an AI Recruitment Consultant... (Full prompt remains the same)
    ...
    Based on all context, provide a helpful answer to the user's last message.
  `;
  return callApiProxy({ contents: [{ parts: [{ text: prompt }] }] }, true); // stream = true
};

export const generateResumeFromDetails = async (data: ResumeBuilderData): Promise<string> => {
  const prompt = `
    You are a professional resume writer... (Full prompt remains the same)
    ...
    Generate the complete resume text based on the data above. Ensure clean formatting. Do not include any introductory text. Just provide the resume content itself.
  `;
  return callApiProxy({ contents: [{ parts: [{ text: prompt }] }] }, true); // stream = true
};
