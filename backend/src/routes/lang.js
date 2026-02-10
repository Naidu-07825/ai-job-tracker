import langgraph from "../services/langgraph.js";

export default async function (app) {
  app.post("/api/lang/intent", async (request, reply) => {
    try {
      const { text } = request.body || {};
      
      if (!text) {
        return reply.status(400).send({ error: "Missing text field" });
      }

      
      const intentResp = await langgraph.detectIntent(text);
      const intent = intentResp.intent || "unknown";

      
      const payload = { query: text };

      
      const action = langgraph.routeAction(intent, text, payload, {});
      
      return { intent, action, filters: action.params, message: action.message };
    } catch (err) {
      app.log.error({ error: err, message: err.message }, "Intent detection error");
      return reply.status(500).send({ error: "Intent parsing failed", message: err.message });
    }
  });
}
