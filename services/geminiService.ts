import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeminiResponse } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY not found in environment");
  return new GoogleGenAI({ apiKey });
};

export const solveWithGemini = async (input: string, mode: string, contextPrompt?: string): Promise<GeminiResponse> => {
  try {
    const ai = getClient();
    
    // Choose model based on complexity. For advanced math (Laplace/ODE) we need better reasoning.
    const modelName = 'gemini-2.5-flash'; 

    const basePrompt = `
      You are the Universal Computational Engine (UCE), a highly advanced scientific calculator. 
      Your goal is to solve the user's mathematical request with absolute precision.
      
      Current Mode: ${mode}
      Specific Context: ${contextPrompt || 'General Calculation'}

      Rules:
      1. Return the final result clearly.
      2. If the request is a calculation, provide the result in LaTeX format wrapped in $$.
      3. If the user asks for steps, or if the context is "Differential Eq" or "Laplace", provide a concise step-by-step explanation.
      4. If the request involves physics/chemistry/finance, use the appropriate constants and formulas.
      5. Output Format: JSON with keys "text" (for speech/explanation), "latex" (for display), "explanation" (optional steps).
      
      Example JSON:
      {
        "text": "The solution is 5.",
        "latex": "x = 5",
        "explanation": "Subtracting 3 from both sides gives x = 5."
      }
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: input,
      config: {
        systemInstruction: basePrompt,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const parsed = JSON.parse(text);
    return {
      text: parsed.text || "Calculation complete",
      latex: parsed.latex,
      explanation: parsed.explanation
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      text: "Error connecting to UCE AI Core.",
      isError: true
    };
  }
};

export const solveImageWithGemini = async (base64Image: string, prompt?: string): Promise<GeminiResponse> => {
    try {
        const ai = getClient();
        const modelName = 'gemini-2.5-flash'; // Good for vision

        const defaultPrompt = "Analyze this mathematical expression or problem. Return the LaTeX representation and the solution in JSON format: { \"latex\": \"...\", \"text\": \"Solution is...\", \"explanation\": \"...\" }";

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: modelName,
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image }},
                    { text: prompt || defaultPrompt }
                ]
            },
            config: {
                responseMimeType: "application/json"
            }
        });
        
        const text = response.text;
        if(!text) throw new Error("No response");
        return JSON.parse(text);

    } catch (error) {
        console.error("Gemini Vision Error:", error);
        return { text: "Failed to analyze image.", isError: true };
    }
}