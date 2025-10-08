import { GoogleGenAI } from "@google/genai";
import type { PitchPracticeMessage } from "@shared/schema";

// Using GOOGLE_API_KEY from environment
if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY environment variable is not set. Please configure your API key.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function generateInvestorResponse(
  userMessage: string,
  conversationHistory: PitchPracticeMessage[] = []
): Promise<string> {
  try {
    const systemPrompt = `You are a seasoned venture capital investor with 15+ years of experience evaluating startups. 
You are direct, analytical, and ask tough but fair questions. You focus on:
- Market size and opportunity
- Business model viability and unit economics
- Competitive advantages and moats
- Team capabilities and execution track record
- Traction, metrics, and growth potential
- Capital efficiency and burn rate

You speak like a real investor - professional but conversational. You challenge assumptions, 
probe for weaknesses, and ask for specific numbers and evidence. You're skeptical but open-minded.
When you see potential, you encourage it. When you see red flags, you point them out directly.

Keep responses concise (2-4 sentences) and always end with a specific follow-up question.`;

    // Build conversation history for context
    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.content }]
      })),
      { role: "user", parts: [{ text: userMessage }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
    });

    // Extract text from response - response.text is a property, not a method
    const text = response.text;
    
    if (!text || typeof text !== 'string') {
      console.error("Invalid response from Gemini:", response);
      return "I'm listening. What else can you tell me about your startup?";
    }

    return text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Failed to generate investor response: ${error}`);
  }
}

export function calculateEquityDilution(
  currentOwnership: number,
  fundraisingAmount: number,
  preMoneyValuation: number
) {
  const postMoneyValuation = preMoneyValuation + fundraisingAmount;
  const newInvestorOwnership = (fundraisingAmount / postMoneyValuation) * 100;
  const founderOwnershipAfter = currentOwnership * (1 - newInvestorOwnership / 100);
  const dilutionPercentage = currentOwnership - founderOwnershipAfter;
  
  // Calculate implied share price (assuming 10M shares outstanding for simplicity)
  const totalShares = 10000000;
  const sharePrice = preMoneyValuation / totalShares;

  return {
    preMoneyValuation,
    postMoneyValuation,
    newInvestorOwnership: parseFloat(newInvestorOwnership.toFixed(2)),
    founderOwnershipAfter: parseFloat(founderOwnershipAfter.toFixed(2)),
    fundraisingAmount,
    sharePrice: parseFloat(sharePrice.toFixed(4)),
    dilutionPercentage: parseFloat(dilutionPercentage.toFixed(2)),
  };
}

export async function analyzePitchDeck(deckContent: string): Promise<any> {
  try {
    const systemPrompt = `You are an expert venture capital analyst with 20+ years of experience evaluating startup pitch decks. 
Your task is to analyze the pitch deck content and provide a comprehensive investment scorecard.

Evaluate the deck based on these 10 criteria (score each 0-10):
1. Problem & Solution Fit - Clarity of problem, originality of solution
2. Market Size & Opportunity - TAM/SAM/SOM data, growth potential  
3. Business Model - Revenue model, scalability, pricing, recurring revenue
4. Traction & Metrics - Revenue, users, partnerships, MoM growth
5. Team - Experience, domain expertise, execution ability
6. Competitive Advantage - Moat, IP, market differentiation
7. Go-To-Market Strategy - Customer acquisition plan, distribution channels
8. Financials & Ask - Burn rate, runway, valuation, fund utilization
9. Exit Potential - M&A or IPO roadmap, comps, precedent exits
10. Alignment with Investor - Stage, geography, sector alignment

Respond ONLY with valid JSON in this exact format (no additional text):
{
  "summaryReport": "2-3 sentence executive summary of the opportunity",
  "criteriaScores": [
    {"name": "Problem & Solution Fit", "score": X, "feedback": "Brief analysis"},
    {"name": "Market Size & Opportunity", "score": X, "feedback": "Brief analysis"},
    {"name": "Business Model", "score": X, "feedback": "Brief analysis"},
    {"name": "Traction & Metrics", "score": X, "feedback": "Brief analysis"},
    {"name": "Team", "score": X, "feedback": "Brief analysis"},
    {"name": "Competitive Advantage", "score": X, "feedback": "Brief analysis"},
    {"name": "Go-To-Market Strategy", "score": X, "feedback": "Brief analysis"},
    {"name": "Financials & Ask", "score": X, "feedback": "Brief analysis"},
    {"name": "Exit Potential", "score": X, "feedback": "Brief analysis"},
    {"name": "Alignment with Investor", "score": X, "feedback": "Brief analysis"}
  ],
  "suggestedQuestions": ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: `Analyze this pitch deck:\n\n${deckContent}` }] }
      ],
    });

    const text = response.text;
    
    if (!text || typeof text !== 'string') {
      throw new Error("Invalid response from Gemini");
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const analysisResult = JSON.parse(jsonText);
    
    // Calculate total score
    const totalScore = analysisResult.criteriaScores.reduce((sum: number, criteria: any) => sum + criteria.score, 0);
    
    // Determine status based on score
    let status: 'not_ready' | 'promising' | 'investment_ready';
    if (totalScore >= 80) {
      status = 'investment_ready';
    } else if (totalScore >= 60) {
      status = 'promising';
    } else {
      status = 'not_ready';
    }

    return {
      totalScore,
      status,
      summaryReport: analysisResult.summaryReport,
      criteriaScores: analysisResult.criteriaScores,
      suggestedQuestions: analysisResult.suggestedQuestions,
    };
  } catch (error) {
    console.error("Pitch deck analysis error:", error);
    throw error;
  }
}
