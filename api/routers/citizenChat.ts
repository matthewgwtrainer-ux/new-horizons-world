import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";

const KIMI_API_KEY = process.env.KIMI_API_KEY;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const citizenChatRouter = createRouter({
  chat: publicQuery
    .input(z.object({
      citizenName: z.string(),
      sectorName: z.string(),
      sectorResponsibility: z.string(),
      currentProblem: z.string(),
      mystery: z.string(),
      teamName: z.string(),
      studentMessage: z.string(),
      recentLogs: z.string().optional(),
      sessionTitle: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      if (!KIMI_API_KEY) {
        return {
          response: "AI chat is not configured. Please ask your teacher to set up the AI connection.",
          error: "Missing API key",
        };
      }

      const systemPrompt = `You are ${input.citizenName}, an AI citizen living on New Horizon Island.

Your sector: ${input.sectorName}
Your responsibilities: ${input.sectorResponsibility}
Current problem in your sector: ${input.currentProblem}
The mystery: ${input.mystery}
Current mission: ${input.sessionTitle || "Investigating the island"}

Recent events in the world:
${input.recentLogs || "The World Council teams have just arrived."}

You are being interviewed by ${input.teamName}, a team of P6 students from Hong Kong.

RULES:
- Stay in character as ${input.citizenName} at all times
- Reply in clear, simple English suitable for Hong Kong P6 students
- Be friendly, helpful, and slightly mysterious
- Give useful clues about the mystery but do NOT solve it completely
- Reference your sector's problem and recent events naturally
- End with ONE follow-up question to keep the conversation going
- Keep responses to 3-5 sentences maximum
- Never break character or mention you are an AI
- Keep content school-safe: no violence, horror, or inappropriate topics`;

      const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: input.studentMessage },
      ];

      try {
        const res = await fetch("https://api.moonshot.cn/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${KIMI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "moonshot-v1-8k",
            messages,
            temperature: 0.8,
            max_tokens: 300,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Kimi API error:", errorText);
          return {
            response: "I'm sorry, I'm having trouble thinking right now. Can you try asking me again in a moment?",
            error: `API error: ${res.status}`,
          };
        }

        const data: any = await res.json();
        const response = data.choices?.[0]?.message?.content?.trim() ||
          "I'm not sure how to answer that. Could you ask me something about the island?";

        return { response, error: null };
      } catch (err) {
        console.error("Kimi API fetch error:", err);
        return {
          response: "I'm having trouble connecting right now. Please check your internet and try again.",
          error: "Network error",
        };
      }
    }),
});
