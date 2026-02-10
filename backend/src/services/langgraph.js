import OpenAI from "openai";
import fs from "fs";
import path from "path";



let client = null;
if (process.env.OPENAI_API_KEY) {
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}



const HISTORY_DIR = path.join(process.cwd(), "data", "conversation_history");
const MAX_HISTORY_FILES = 1000;

if (!fs.existsSync(HISTORY_DIR)) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
}

/**
 * Persist conversation history to disk for production reliability
 * @param {string} userId - Unique user identifier
 * @param {Array} history - Conversation history
 */
export function persistConversationHistory(userId, history) {
  try {
    const filename = path.join(HISTORY_DIR, `${userId}.json`);
    const data = {
      userId,
      timestamp: new Date().toISOString(),
      messageCount: history.length,
      history: history.slice(-100),
    };
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Failed to persist history for user ${userId}:`, error);
    return false;
  }
}

/**
 * Load conversation history from disk
 * @param {string} userId - Unique user identifier
 * @returns {Array} Conversation history or empty array
 */
export function loadConversationHistory(userId) {
  try {
    const filename = path.join(HISTORY_DIR, `${userId}.json`);
    if (!fs.existsSync(filename)) {
      return [];
    }
    const data = JSON.parse(fs.readFileSync(filename, "utf-8"));
    return data.history || [];
  } catch (error) {
    console.error(`Failed to load history for user ${userId}:`, error);
    return [];
  }
}

/**
 * Clear conversation history for a user
 * @param {string} userId - Unique user identifier
 */
export function clearUserHistory(userId) {
  try {
    const filename = path.join(HISTORY_DIR, `${userId}.json`);
    if (fs.existsSync(filename)) {
      fs.unlinkSync(filename);
    }
    return true;
  } catch (error) {
    console.error(`Failed to clear history for user ${userId}:`, error);
    return false;
  }
}

/**
 * Get user history statistics for monitoring
 * @returns {Object} Statistics about stored conversations
 */
export function getHistoryStats() {
  try {
    if (!fs.existsSync(HISTORY_DIR)) {
      return { totalUsers: 0, totalFiles: 0 };
    }
    
    const files = fs.readdirSync(HISTORY_DIR);
    let totalMessages = 0;
    
    files.forEach(file => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(HISTORY_DIR, file), "utf-8"));
        totalMessages += data.messageCount || 0;
      } catch (e) {
        
      }
    });

    return {
      totalUsers: files.length,
      totalFiles: files.length,
      estimatedTotalMessages: totalMessages,
    };
  } catch (error) {
    console.error("Failed to get history stats:", error);
    return { totalUsers: 0, totalFiles: 0, error: error.message };
  }
}


export async function summarizeConversation(userId, maxMessages = 100) {
  try {
    const history = loadConversationHistory(userId) || [];
    const recent = history.slice(-maxMessages).map(m => `${m.role}: ${m.content}`).join("\n");

    if (!client || recent.trim().length === 0) return null;

    const prompt = `Summarize the following conversation between a user and an assistant in 1-2 concise sentences. Focus on the user's goals or requested filters.\n\nConversation:\n${recent}`;

    const resp = await client.messages.create({
      model: "gpt-4o-mini",
      max_tokens: 120,
      messages: [{ role: "user", content: prompt }]
    });

    const summary = resp.content?.[0]?.text?.trim() || null;
    return summary;
  } catch (err) {
    console.error(`Failed to summarize conversation for ${userId}:`, err?.message || err);
    return null;
  }
}

export async function detectIntent(text) {
  if (!text) return { intent: "none" };


  if (!client) {
    const t = text.toLowerCase();
    if (/filter|show|display|find|search/.test(t)) return { intent: "filter_jobs" };
    if (/apply|applied/.test(t)) return { intent: "apply_job" };
    if (/help|how|what|why|guide/.test(t)) return { intent: "help" };
    if (/clear|reset|remove/.test(t)) return { intent: "clear_filters" };
    return { intent: "unknown" };
  }

  const prompt = `You are a job search assistant. Classify the user's intent into ONE of: filter_jobs, apply_job, help, clear_filters, unknown.

User query: "${text}"

Return ONLY the intent word.`;

  try {
    const resp = await client.messages.create({ 
      model: "gpt-4o-mini", 
      max_tokens: 10,
      messages: [{ role: "user", content: prompt }]
    });
    const out = resp.content?.[0]?.text || "";
    const intent = (out.toLowerCase().match(/filter_jobs|apply_job|help|clear_filters/) || [])[0] || "unknown";
    return { intent };
  } catch (err) {
   
    const t = text.toLowerCase();
    if (/filter|show|display|find|search/.test(t)) return { intent: "filter_jobs" };
    if (/help|how|what/.test(t)) return { intent: "help" };
    if (/clear|reset/.test(t)) return { intent: "clear_filters" };
    return { intent: "unknown" };
  }
}

export function parseFiltersFromText(text) {
  const t = text.toLowerCase();
  const filters = {};

  
  const titleMatch = t.match(/(?:react|typescript|python|java|golang|node|backend|frontend|full.?stack|developer|engineer|architect)(?:\s+developer)?/i);
  if (titleMatch) filters.title = titleMatch[0];


  const locationMatch = t.match(/(?:in|at|from|near)\s+([a-z\s]+?)(?:\s+(?:jobs|roles|positions))?$/i);
  if (locationMatch) filters.location = locationMatch[1].trim();

 
  if (/remote/.test(t)) filters.workMode = "remote";
  if (/hybrid/.test(t)) filters.workMode = "hybrid";
  if (/onsite|on[\s-]?site|office/.test(t)) filters.workMode = "on-site";

  if (/full[\s-]?time/.test(t)) filters.jobType = "full-time";
  if (/part[\s-]?time/.test(t)) filters.jobType = "part-time";
  if (/contract|freelance/.test(t)) filters.jobType = "contract";
  if (/intern/.test(t)) filters.jobType = "internship";

  if (/high[\s-]?match|only[\s-]?(?:best|top)/.test(t)) filters.match = "high";
  if (/medium[\s-]?match|medium/.test(t)) filters.match = "medium";

 
  if (/last[\s-]?24[\s-]?hours?|today/.test(t)) filters.datePosted = "24h";
  if (/last[\s-]?week|this[\s-]?week/.test(t)) filters.datePosted = "7d";
  if (/last[\s-]?month|this[\s-]?month/.test(t)) filters.datePosted = "30d";


  const skillsMatch = t.match(/(?:with|using|knowing?|skills?[:\s]+)([a-z\s,&+#\-.]+?)(?:\s+(?:and|or)|$)/i);
  if (skillsMatch) {
    const skills = skillsMatch[1]
      .split(/[,&+]/)
      .map(s => s.trim())
      .filter(s => s && s.length > 1)
      .join(", ");
    if (skills) filters.skills = skills;
  }

  return filters;
}

export function routeAction(intent, text, payload, state) {
  switch (intent) {
    case "filter_jobs": {
      const filters = parseFiltersFromText(text);
      return { 
        action: "updateFilters", 
        params: filters,
        message: `Applying filters: ${Object.entries(filters).map(([k, v]) => `${k}=${v}`).join(", ")}` 
      };
    }
    case "clear_filters":
      return { 
        action: "clearFilters", 
        params: {},
        message: "All filters cleared." 
      };
    case "apply_job":
      return { 
        action: "showApplyPrompt", 
        params: { query: payload.query || "" },
        message: "Ready to apply. Click on a job to apply." 
      };
    case "help":
      return { 
        action: "showHelp", 
        params: {},
        message: `I can help you search for jobs! Try:\n- "React developer jobs"\n- "Remote full-time roles"\n- "Backend engineer in New York"\n- "Show me high match jobs"\n- "Clear all filters"` 
      };
    default:
      return { 
        action: "showHelp", 
        params: {},
        message: "I didn't understand that. Try asking about job search filters or typing 'help'." 
      };
  }
}

export default { detectIntent, parseFiltersFromText, routeAction };
