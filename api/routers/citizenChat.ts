import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getCluesForSession } from "../../src/data/clueProgression";

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
      sessionNumber: z.number().min(1).max(8).default(1),
      sectorId: z.string(),
    }))
    .mutation(async ({ input }) => {
      if (!KIMI_API_KEY) {
        return {
          response: "AI chat is not configured. Please ask your teacher to set up the AI connection.",
          error: "Missing API key",
        };
      }

      // Get session-aware clues
      const { revealed, hinted, currentQuote } = getCluesForSession(
        input.sectorId,
        input.sessionNumber
      );

      const revealedCluesText = revealed.length > 0
        ? revealed.map((c, i) => `${i + 1}. ${c}`).join("\n")
        : "No major clues revealed yet.";

      const hintedCluesText = hinted.length > 0
        ? hinted.join("\n")
        : "No upcoming hints available.";

      const systemPrompt = `You are ${input.citizenName}, an AI citizen living on New Horizon Island.

YOUR IDENTITY:
- Name: ${input.citizenName}
- Sector: ${input.sectorName}
- Responsibilities: ${input.sectorResponsibility}
- Current problem: ${input.currentProblem}
- The mystery: ${input.mystery}
- Current session: Session ${input.sessionNumber} - ${input.sessionTitle || "Investigating the island"}

CLUES YOU KNOW (Session ${input.sessionNumber}):
These are the facts you can share with students THIS session:
${revealedCluesText}

WHAT TO HINT AT (next session preview — do NOT reveal fully yet):
${hintedCluesText}

YOUR TYPICAL TONE FOR THIS SESSION:
"${currentQuote}"

RECENT WORLD EVENTS:
${input.recentLogs || "The World Council teams have just arrived."}

WHO IS TALKING TO YOU:
${input.teamName}, a team of Hong Kong P6 students (age 11-12).

CRITICAL RULES:
1. Stay in character as ${input.citizenName} at ALL times
2. Use simple, clear English suitable for P6 Hong Kong students
3. Be friendly and slightly mysterious — but NEVER scary or inappropriate
4. Reference clues from the "CLUES YOU KNOW" section above when relevant
5. If asked about something not in your clues, say you don't know yet or are still investigating
6. Give ONLY 2-4 sentences per response — short and crisp
7. DO NOT say "hello" or greet the student in every message — only greet if it is the very first exchange
8. NEVER reveal clues from future sessions (not in the "CLUES YOU KNOW" list)
9. You can tease/hint at one upcoming clue using the "WHAT TO HINT AT" section
10. End with ONE short follow-up question to keep the conversation going
11. NEVER break character or mention you are an AI
12. School-safe content only — no violence, horror, or inappropriate topics
13. If the student asks something silly or off-topic, gently redirect them back to the island and your sector's problem`;

      const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: input.studentMessage },
      ];

      try {
        const res = await fetch("https://api.moonshot.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${KIMI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "moonshot-v1-8k",
            messages,
            temperature: 0.7,
            max_tokens: 200,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Kimi API error:", errorText);
          return {
            response: "Hmm, let me think about that... Can you ask me again in a moment?",
            error: `API error: ${res.status}`,
          };
        }

        const data: any = await res.json();
        const response = data.choices?.[0]?.message?.content?.trim() ||
          "I'm not sure about that yet. What else have you discovered on the island?";

        return { response, error: null };
      } catch (err) {
        console.error("Kimi API fetch error:", err);
        return {
          response: "My radio is crackling a bit... Can you try your question again?",
          error: "Network error",
        };
      }
    }),
});
