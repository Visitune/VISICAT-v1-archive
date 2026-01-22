import { GoogleGenAI, Type } from "@google/genai";

const getClient = (apiKey: string) => {
    if (!apiKey) {
        throw new Error("Gemini API Key is missing.");
    }
    return new GoogleGenAI({ apiKey });
};

const MODEL_NAME = "gemini-3-flash-preview";

export const generateRCA = async (problemDescription: string, severity: string, language: 'en' | 'fr' = 'en', apiKey: string) => {
  const ai = getClient(apiKey);
  
  const langInstruction = language === 'fr' ? "Respond in French." : "Respond in English.";

  const prompt = `
    You are a Quality Assurance expert specializing in GFSI standards (BRCGS, IFS).
    Analyze the following Non-Conformance.
    Problem: "${problemDescription}"
    Severity: "${severity}"

    Perform a 5 Whys analysis to find the root cause.
    ${langInstruction}
    Return the response in JSON format with the following structure:
    {
      "why1": "...",
      "why2": "...",
      "why3": "...",
      "why4": "...",
      "why5": "...",
      "rootCause": "The final root cause summary"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            why1: { type: Type.STRING },
            why2: { type: Type.STRING },
            why3: { type: Type.STRING },
            why4: { type: Type.STRING },
            why5: { type: Type.STRING },
            rootCause: { type: Type.STRING },
          },
          required: ["why1", "why2", "why3", "why4", "why5", "rootCause"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini RCA Error:", error);
    throw error;
  }
};

export const generateIshikawa = async (problemDescription: string, language: 'en' | 'fr' = 'en', apiKey: string) => {
    const ai = getClient(apiKey);
    const langInstruction = language === 'fr' ? "Respond in French." : "Respond in English.";
  
    const prompt = `
      You are a Quality Assurance expert. Perform a Root Cause Analysis using the Ishikawa (Fishbone) 6M method for this problem:
      Problem: "${problemDescription}"
      
      Categorize potential causes into: Man, Machine, Material, Method, Environment (Milieu), Measurement.
      
      ${langInstruction}
      Return JSON:
      {
        "man": "...",
        "machine": "...",
        "material": "...",
        "method": "...",
        "environment": "...",
        "measurement": "...",
        "rootCause": "Summary of likely root cause"
      }
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
                man: { type: Type.STRING },
                machine: { type: Type.STRING },
                material: { type: Type.STRING },
                method: { type: Type.STRING },
                environment: { type: Type.STRING },
                measurement: { type: Type.STRING },
                rootCause: { type: Type.STRING },
            },
            required: ["man", "machine", "material", "method", "environment", "measurement", "rootCause"]
          }
        }
      });
  
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini Ishikawa Error:", error);
      throw error;
    }
};

export const generateActions = async (rootCause: string, severity: string, language: 'en' | 'fr' = 'en', apiKey: string) => {
  const ai = getClient(apiKey);

  const langInstruction = language === 'fr' ? "Respond in French." : "Respond in English.";

  const prompt = `
    You are a QA expert. Based on the following Root Cause, suggest 3 actions:
    1 Immediate Correction, 1 Corrective Action (to fix root cause), and 1 Preventive Action (long term).
    
    Root Cause: "${rootCause}"
    Severity: "${severity}"

    ${langInstruction}
    Return JSON format:
    {
      "actions": [
        {
          "description": "...",
          "type": "Immediate"
        },
        {
          "description": "...",
          "type": "Corrective"
        },
        {
          "description": "...",
          "type": "Preventive"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
         responseSchema: {
          type: Type.OBJECT,
          properties: {
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  type: { type: Type.STRING } // We will map string to Enum later
                },
                required: ["description", "type"]
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Actions Error:", error);
    throw error;
  }
};