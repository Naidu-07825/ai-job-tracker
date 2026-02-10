import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, START, END, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

const llm = process.env.OPENAI_API_KEY
  ? new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7,
      model: "gpt-4-turbo",
      maxTokens: 1024,
    })
  : null;


const AgentState = {
  userInput: "",
  detectedIntent: null,
  toolActions: [],
  conversationHistory: [],
  shouldRoute: false,
  finalResponse: "",
};


const searchJobsTool = tool(
  async ({ title, skills, location, workMode, datePosted, matchScore }) => {
    return JSON.stringify({
      type: "search",
      filters: {
        title: title || null,
        skills: skills || null,
        location: location || null,
        workMode: workMode || null,
        datePosted: datePosted || null,
        match: matchScore || null,
      },
    });
  },
  {
    name: "search_jobs",
    description:
      "Search for jobs based on user query. Extracts job title, skills, location, work mode, date range, and match score requirements.",
    schema: z.object({
      title: z.string().optional().describe("Job title or role"),
      skills: z.string().optional().describe("Required skills (comma-separated)"),
      location: z.string().optional().describe("Job location"),
      workMode: z
        .enum(["remote", "hybrid", "on-site"])
        .optional()
        .describe("Work mode preference"),
      datePosted: z
        .enum(["24h", "7d", "30d"])
        .optional()
        .describe("When the job was posted"),
      matchScore: z
        .enum(["high", "medium"])
        .optional()
        .describe("Minimum match score"),
    }),
  }
);

const updateFiltersTool = tool(
  async ({ filterKey, filterValue, action }) => {
    return JSON.stringify({
      type: "update_filters",
      action: action || "set",
      filters: {
        [filterKey]: filterValue,
      },
    });
  },
  {
    name: "update_filters",
    description:
      "Update UI filters directly. Can set individual filters or clear all.",
    schema: z.object({
      filterKey: z
        .string()
        .describe("Filter key: title, location, workMode, datePosted, match, jobType, skills"),
      filterValue: z.string().nullable().describe("Filter value or null to clear"),
      action: z
        .enum(["set", "clear_all"])
        .optional()
        .describe("Action to perform"),
    }),
  }
);

const helpTool = tool(
  async ({ topic }) => {
    const helpTopics = {
      resume_upload: "You can upload your resume in the Profile page (top-right menu) or UploadResume page.",
      job_matching: "Our AI matches your resume with jobs based on skills, experience, and job requirements. Matching scores are shown as percentages.",
      applications: "View your applied jobs in the Applications page. Track your application status and see which jobs you've already applied to.",
      filters: "Use filters to narrow down jobs by role, location, work mode (remote/hybrid/on-site), date posted, and match score.",
      ai_assistant: "I can help you search jobs using natural language. Just tell me what you're looking for! I can also update filters for you.",
      default: "I can help you search for jobs, update filters, upload your resume, or answer questions about how the platform works.",
    };

    return JSON.stringify({
      type: "help",
      answer: helpTopics[topic] || helpTopics.default,
    });
  },
  {
    name: "get_help",
    description: "Get help on various topics: resume_upload, job_matching, applications, filters, ai_assistant",
    schema: z.object({
      topic: z
        .string()
        .optional()
        .describe("Help topic: resume_upload, job_matching, applications, filters, ai_assistant"),
    }),
  }
);

const tools = [searchJobsTool, updateFiltersTool, helpTool];


const modelWithTools = llm ? llm.bindTools(tools) : null;


async function inputNode(state) {
  const { userInput, conversationHistory = [] } = state;
  
  if (!userInput || typeof userInput !== "string") {
    return {
      ...state,
      finalResponse: "Please provide a valid message.",
      shouldRoute: false,
    };
  }

  return {
    ...state,
    userInput: userInput.trim(),
    conversationHistory,
  };
}


async function intentNode(state) {
  const { userInput, conversationHistory } = state;
  let detectedIntent = "search"; 

  if (llm && modelWithTools) {
    try {
      const messages = [
        ...conversationHistory.map(m => 
          m.role === "user" 
            ? new HumanMessage(m.content)
            : new AIMessage(m.content)
        ),
      ];

      const response = await llm.invoke(`
You are an intent classifier for a job search AI assistant. Classify the user's message into one of these categories:
- "search": User is searching for jobs or asking about specific job types
- "filter": User wants to apply specific filters to the job list
- "help": User is asking for help or product information
- "casual": General conversation

User message: "${userInput}"

Respond with ONLY the category name, nothing else (lowercase).
      `);

      const intent = response.content.toLowerCase().trim();
      if (["search", "filter", "help", "casual"].includes(intent)) {
        detectedIntent = intent;
      }
    } catch (error) {
      console.error("LLM intent detection failed, using fallback:", error.message);
      detectedIntent = detectIntentKeywords(userInput);
    }
  } else {
    
    detectedIntent = detectIntentKeywords(userInput);
  }

  return {
    ...state,
    detectedIntent,
    shouldRoute: detectedIntent !== "casual",
  };
}


async function toolDecisionNode(state) {
  const { detectedIntent, userInput } = state;
  let shouldRoute = false;
  let toolActions = [];

  if (detectedIntent === "help") {
    shouldRoute = false; 
  } else if (detectedIntent === "search" || detectedIntent === "filter") {
    shouldRoute = true; 
  }

  return {
    ...state,
    shouldRoute,
    toolActions,
  };
}


async function toolOrchestrationNode(state) {
  const { userInput, conversationHistory, shouldRoute } = state;
  let toolActions = [];

  if (!shouldRoute || !modelWithTools) {
    return {
      ...state,
      toolActions,
    };
  }

  try {
   
    const messages = [
      ...conversationHistory.map(m => 
        m.role === "user" 
          ? new HumanMessage(m.content)
          : new AIMessage(m.content)
      ),
      new HumanMessage(userInput),
    ];

  
    const response = await modelWithTools.invoke(messages.slice(-20));


    if (response.tool_calls && response.tool_calls.length > 0) {
      for (const toolCall of response.tool_calls) {
        try {
          let toolResult;

        
          if (toolCall.name === "search_jobs") {
            toolResult = await searchJobsTool.invoke(toolCall.args);
          } else if (toolCall.name === "update_filters") {
            toolResult = await updateFiltersTool.invoke(toolCall.args);
          } else if (toolCall.name === "get_help") {
            toolResult = await helpTool.invoke(toolCall.args);
          } else {
            toolResult = JSON.stringify({ error: `Unknown tool: ${toolCall.name}` });
          }

          toolActions.push({
            tool: toolCall.name,
            args: toolCall.args,
            result: JSON.parse(typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult)),
          });
        } catch (toolError) {
          console.error(`Error executing tool ${toolCall.name}:`, toolError);
          toolActions.push({
            tool: toolCall.name,
            args: toolCall.args,
            result: { error: toolError.message },
          });
        }
      }
    }

    return {
      ...state,
      toolActions,
    };
  } catch (error) {
    console.error("Tool orchestration error:", error);
    return {
      ...state,
      toolActions: [{
        tool: "error",
        args: {},
        result: { error: error.message },
      }],
    };
  }
}


async function logStateNode(state) {
  try {
   
    const { userInput, detectedIntent } = state;
    
    console.debug("AI Agent Log:", { detectedIntent, snippet: userInput?.slice(0, 120) });
  } catch (e) {
   
  }
  return state;
}


async function parallelToolsNode(state) {
  const tasks = [toolOrchestrationNode(state), logStateNode(state)];
  const results = await Promise.all(tasks.map(t => Promise.resolve(t)));

 
  const merged = {
    ...state,
    toolActions: (results[0] && results[0].toolActions) || state.toolActions || [],
  };
  return merged;
}


async function responseNode(state) {
  const { userInput, detectedIntent, toolActions, conversationHistory } = state;
  let finalResponse = "";

  if (detectedIntent === "help") {
    finalResponse = generateHelpResponse(userInput);
  } else if (toolActions.length > 0 && toolActions[0].result?.error) {
    
    finalResponse = generateFallbackResponse(userInput, toolActions);
  } else if (toolActions.length > 0) {
    
    finalResponse = generateSearchResponse(userInput, detectedIntent, toolActions);
  } else {
  
    finalResponse = generateDefaultResponse(userInput, detectedIntent);
  }

  return {
    ...state,
    finalResponse,
  };
}


async function memoryNode(state) {
  const { userInput, finalResponse, conversationHistory = [] } = state;
  
  const updatedHistory = [
    ...conversationHistory,
    { role: "user", content: userInput },
    { role: "assistant", content: finalResponse },
  ];


  const trimmedHistory = updatedHistory.slice(-50);

  return {
    ...state,
    conversationHistory: trimmedHistory,
  };
}



function generateHelpResponse(userInput) {
  const helpKeywords = userInput.toLowerCase();
  
  if (helpKeywords.includes("resume")) {
    return "You can upload your resume in the Profile page (top-right menu) or UploadResume page. Our AI uses it to match you with relevant jobs.";
  } else if (helpKeywords.includes("match")) {
    return "Our AI matches your resume with jobs based on skills, experience, and job requirements. Matching scores are shown as percentages (0-100%).";
  } else if (helpKeywords.includes("application") || helpKeywords.includes("applied")) {
    return "View your applied jobs in the Applications page. Track your application status and see which jobs you've already applied to.";
  } else if (helpKeywords.includes("filter")) {
    return "Use filters to narrow down jobs by role, location, work mode (remote/hybrid/on-site), date posted, and match score.";
  } else if (helpKeywords.includes("search") || helpKeywords.includes("find")) {
    return "I can help you search for jobs using natural language! Just tell me what you're looking for, like 'React developer jobs' or 'remote positions with Python'. I'll update the filters and search for you.";
  }
  
  return "I'm here to help you find jobs! You can ask me things like:\n- 'Show me React developer jobs'\n- 'Find remote positions with Python'\n- 'Jobs posted in the last 24 hours'\n- 'Find hybrid jobs in New York'\n\nI can also help with resume uploads, explain job matching, or guide you through the platform features.";
}

function generateSearchResponse(userInput, intent, toolActions) {
  const filterActions = toolActions.filter(a => a.tool === "update_filters");
  
  if (filterActions.length > 0) {
    const filters = filterActions[0].result?.filters || {};
    const filterDescriptions = Object.entries(filters)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    
    return `I've updated your search filters: ${filterDescriptions}. Let me find the best matching jobs for you...`;
  }
  
  return "I'm searching for jobs that match your criteria. Check the job list for updated results!";
}

function generateFallbackResponse(userInput, toolActions) {
  const error = toolActions[0]?.result?.error || "Unknown error";
  return `I had trouble processing that request: ${error}. Please try being more specific, like 'React jobs' or 'remote positions in San Francisco'.`;
}

function generateDefaultResponse(userInput, intent) {
  if (intent === "filter") {
    return "I'm ready to filter jobs for you! Tell me what criteria you're looking for (location, role, work mode, etc.).";
  }
  return "I'm ready to help! Tell me what kind of jobs you're looking for.";
}


function detectIntentKeywords(userInput) {
  const lowerInput = userInput.toLowerCase();
  
  if (lowerInput.includes("help") || lowerInput.includes("what can you") || lowerInput.includes("how do i") || lowerInput.includes("explain")) {
    return "help";
  }
  if (lowerInput.includes("remote") || lowerInput.includes("filter") || lowerInput.includes("location") || lowerInput.includes("hybrid")) {
    return "filter";
  }
  if (/hi|hey|hello|thanks|thanks mate|cheers|bye|goodbye|see you/.test(lowerInput)) {
    return "casual";
  }
  return "search";
}


export function createAIValueGraph() {
  const workflow = new StateGraph(AgentState);

  workflow.addNode("input", inputNode);
  workflow.addNode("intent", intentNode);
  workflow.addNode("toolDecision", toolDecisionNode);
  workflow.addNode("toolOrchestration", toolOrchestrationNode);
  workflow.addNode("logState", logStateNode);
  workflow.addNode("parallelTools", parallelToolsNode);
  workflow.addNode("response", responseNode);
  workflow.addNode("memory", memoryNode);


  workflow.addEdge(START, "input"); 
  workflow.addEdge("input", "intent");
  workflow.addEdge("intent", "toolDecision");
  
  
  workflow.addConditionalEdges(
    "toolDecision",
    (state) => {
      return state.get("shouldRoute", false) ? "parallelTools" : "response";
    }
  );

  
  workflow.addEdge("parallelTools", "response");
  
  workflow.addEdge("toolOrchestration", "response");
  

  workflow.addEdge("response", "memory");
  

  workflow.addEdge("memory", END);


  return workflow.compile();
}

let graphInstance = null;

function getCompiledGraph() {
  if (!graphInstance) {
    graphInstance = createAIValueGraph();
  }
  return graphInstance;
}


/**
 * Process user input using the formal StateGraph workflow
 * @param {string} userInput - The user's message
 * @param {Array} conversationHistory - Previous conversation messages
 * @returns {Promise<Object>} Result with response, toolActions, intent, and updated history
 */
export async function processUserInput(userInput, conversationHistory = []) {
  try {
    const graph = getCompiledGraph();


    const initialState = {
      messages: [],
      userInput,
      detectedIntent: null,
      toolActions: [],
      conversationHistory,
      shouldRoute: false,
      finalResponse: "",
    };


    const result = await graph.invoke(initialState, {
      recursionLimit: 25,
    });

   
    const response = result.finalResponse || "I'm ready to help! What kind of jobs are you looking for?";
    const toolActions = result.toolActions || [];
    const intent = result.detectedIntent || "unknown";
    const updatedHistory = result.conversationHistory || conversationHistory;

    return {
      response,
      toolActions,
      intent,
      conversationHistory: updatedHistory,
    };
  } catch (error) {
    console.error("AI Agent StateGraph execution error:", error);
    
   
    return {
      response: "I'm having trouble connecting to the AI service. Try being more specific with what you're looking for, like 'remote JavaScript jobs' or 'hybrid positions in London'.",
      toolActions: [],
      intent: "error",
      conversationHistory: conversationHistory,
      error: error.message,
    };
  }
}

export default {
  processUserInput,
  createAIValueGraph,
  getCompiledGraph: () => getCompiledGraph(),
  detectIntentKeywords,
};
