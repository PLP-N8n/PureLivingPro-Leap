import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { aiDB } from "./db";

const openAIKey = secret("OpenAIKey");

interface ChatRequest {
  message: string;
  sessionId: string;
  context?: string;
}

interface ChatResponse {
  response: string;
  recommendations?: Array<{
    productId: number;
    reason: string;
  }>;
}

// AI-powered health and wellness chat assistant.
export const chatAssistant = api<ChatRequest, ChatResponse>(
  { expose: true, method: "POST", path: "/ai/chat" },
  async (req) => {
    const startTime = Date.now();
    
    try {
      // Check if OpenAI key is available
      const apiKey = openAIKey();
      if (!apiKey) {
        // Fallback response when no AI key is configured
        const fallbackResponse = generateFallbackResponse(req.message);
        
        await aiDB.exec`
          INSERT INTO ai_conversations (session_id, user_message, ai_response, model_used, response_time_ms)
          VALUES (${req.sessionId}, ${req.message}, ${fallbackResponse}, 'fallback', ${Date.now() - startTime})
        `;
        
        return { response: fallbackResponse };
      }

      // Get conversation history for context
      const recentMessages = await aiDB.queryAll<{ userMessage: string; aiResponse: string }>`
        SELECT user_message as "userMessage", ai_response as "aiResponse"
        FROM ai_conversations
        WHERE session_id = ${req.sessionId}
        ORDER BY created_at DESC
        LIMIT 5
      `;

      // Build conversation context
      const conversationHistory = recentMessages.reverse().map(msg => 
        `User: ${msg.userMessage}\nAssistant: ${msg.aiResponse}`
      ).join('\n\n');

      const systemPrompt = `You are a knowledgeable health and wellness assistant for Pure Living Pro. 
      You provide helpful, accurate advice on nutrition, fitness, wellness, and healthy living. 
      Keep responses concise, friendly, and actionable. If appropriate, you can suggest relevant 
      products that might help the user achieve their health goals.
      
      Previous conversation:
      ${conversationHistory}`;

      // Make OpenAI API call
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: req.message }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json() as any;
      const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your request.';
      const tokensUsed = data.usage?.total_tokens || 0;

      // Store conversation
      await aiDB.exec`
        INSERT INTO ai_conversations (session_id, user_message, ai_response, model_used, tokens_used, response_time_ms)
        VALUES (${req.sessionId}, ${req.message}, ${aiResponse}, 'gpt-3.5-turbo', ${tokensUsed}, ${Date.now() - startTime})
      `;

      return { response: aiResponse };

    } catch (error) {
      console.error('AI chat error:', error);
      
      const fallbackResponse = generateFallbackResponse(req.message);
      
      await aiDB.exec`
        INSERT INTO ai_conversations (session_id, user_message, ai_response, model_used, response_time_ms)
        VALUES (${req.sessionId}, ${req.message}, ${fallbackResponse}, 'fallback', ${Date.now() - startTime})
      `;
      
      return { response: fallbackResponse };
    }
  }
);

function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('nutrition') || lowerMessage.includes('diet') || lowerMessage.includes('food')) {
    return "Great question about nutrition! A balanced diet with plenty of fruits, vegetables, lean proteins, and whole grains is key to good health. Consider consulting with a nutritionist for personalized advice.";
  }
  
  if (lowerMessage.includes('exercise') || lowerMessage.includes('fitness') || lowerMessage.includes('workout')) {
    return "Exercise is fantastic for your health! Start with activities you enjoy - walking, swimming, or yoga are great options. Aim for at least 150 minutes of moderate activity per week.";
  }
  
  if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('rest')) {
    return "Quality sleep is crucial for wellness! Aim for 7-9 hours per night, maintain a consistent sleep schedule, and create a relaxing bedtime routine. Consider limiting screen time before bed.";
  }
  
  if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('mental')) {
    return "Managing stress is important for overall health. Try meditation, deep breathing exercises, regular physical activity, or talking to a mental health professional. Remember, it's okay to ask for help.";
  }
  
  return "Thank you for your question! While I'd love to provide personalized advice, I recommend consulting with healthcare professionals for specific health concerns. In the meantime, focus on balanced nutrition, regular exercise, adequate sleep, and stress management.";
}
