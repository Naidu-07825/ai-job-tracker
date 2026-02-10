import { processUserInput } from "../services/aiAgent.js";
import {
  persistConversationHistory,
  loadConversationHistory,
  clearUserHistory,
  getHistoryStats,
  summarizeConversation,
} from "../services/langgraph.js";
export async function setupAIRoutes(fastify) {  
  const conversationCache = new Map();
  /**
    * Initialize conversation history for a user in the cache.
   * @param {string} userId - Unique user identifier
   */
  function initializeUserConversation(userId) {
    if (!conversationCache.has(userId)) {
      const history = loadConversationHistory(userId);
      conversationCache.set(userId, history);
    }
  }
  fastify.post("/api/ai/chat", async (request, reply) => {
    try {
      const { message, userId } = request.body;

      if (!message || typeof message !== "string") {
        return reply.status(400).send({
          success: false,
          error: "Message is required and must be a string",
        });
      }
      if (!userId) {
        return reply.status(400).send({
          success: false,
          error: "userId is required",
        });
      }     
      initializeUserConversation(userId);
      const userHistory = conversationCache.get(userId) || [];
      
      const result = await processUserInput(message, userHistory);

      
      const updatedHistory = result.conversationHistory || userHistory;
      conversationCache.set(userId, updatedHistory);

      
      persistConversationHistory(userId, updatedHistory).catch(err => {
        console.error("Non-critical: Failed to persist history:", err);
      });

      return reply.send({
        success: true,
        message: result.response,
        toolActions: result.toolActions || [],
        intent: result.intent || "unknown",
        conversationHistory: updatedHistory,
        metadata: {
          timestamp: new Date().toISOString(),
          messageCount: updatedHistory.length,
          userId,
        },
      });
    } catch (error) {
      console.error("AI Chat endpoint error:", error);
      return reply.status(500).send({
        success: false,
        error: "Failed to process message",
        details: error.message,
      });
    }
  });


  fastify.post("/api/ai/clear-history", async (request, reply) => {
    try {
      const { userId } = request.body;

      if (!userId) {
        return reply.status(400).send({
          success: false,
          error: "userId is required",
        });
      }

      
      conversationCache.delete(userId);

      
      const cleared = clearUserHistory(userId);

      return reply.send({
        success: cleared,
        message: "Conversation history cleared",
        userId,
      });
    } catch (error) {
      console.error("Clear history error:", error);
      return reply.status(500).send({
        success: false,
        error: "Failed to clear history",
      });
    }
  });


  fastify.get("/api/ai/suggestions", async (request, reply) => {
    const suggestions = [
      "Show me React developer jobs with Node.js",
      "Find ML engineer roles using PyTorch",
      "Remote frontend jobs",
      "Senior backend roles posted this week",
      "Full-time positions in Bangalore",
      "High match score jobs only",
      "Show me jobs with 5+ years experience",
      "Can you help me find jobs?",
      "What does the AI matching do?",
      "How do I upload my resume?",
    ];
    return reply.send({
      success: true,
      suggestions: suggestions,
    });
  });


  fastify.get("/api/ai/stats", async (request, reply) => {
    try {
      const stats = getHistoryStats();
      const cacheSize = conversationCache.size;

      return reply.send({
        success: true,
        statistics: {
          ...stats,
          cacheSize,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Stats error:", error);
      return reply.status(500).send({
        success: false,
        error: "Failed to get statistics",
      });
    }
  });


  fastify.get("/api/ai/summary", async (request, reply) => {
    try {
      const userId = request.query.userId;
      if (!userId) {
        return reply.status(400).send({ success: false, error: "userId query parameter is required" });
      }

      const summary = await summarizeConversation(userId);
      return reply.send({ success: true, userId, summary });
    } catch (error) {
      console.error("Summary endpoint error:", error);
      return reply.status(500).send({ success: false, error: "Failed to generate summary" });
    }
  });
}
export default setupAIRoutes;
