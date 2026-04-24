import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";

export const aiRouter = createRouter({
  augmentPost: authedQuery
    .input(z.object({ content: z.string().min(1).max(280) }))
    .mutation(async ({ input }) => {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return {
          augmented: `${input.content} (AI augmentation unavailable - no API key configured)`,
        };
      }

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are a social media writing assistant. Refine and expand the following draft post into something more engaging, concise, and impactful. Keep it under 280 characters. Return only the rewritten text, no explanations.\n\nDraft: "${input.content}"`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 200,
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json() as {
          candidates?: Array<{
            content?: {
              parts?: Array<{ text?: string }>;
            };
          }>;
        };
        const augmented =
          data?.candidates?.[0]?.content?.parts?.[0]?.text || input.content;
        return { augmented: augmented.trim() };
      } catch (error) {
        console.error("AI augmentation error:", error);
        return { augmented: input.content };
      }
    }),

  generateTrendSummary: authedQuery
    .input(z.object({ topic: z.string() }))
    .query(async ({ input }) => {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return {
          summary: `Trending topic: ${input.topic}. (AI summary unavailable)`,
        };
      }

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Summarize the trending topic "${input.topic}" in 2-3 sentences. Explain why it might be trending. Keep it factual and neutral.`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 150,
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json() as {
          candidates?: Array<{
            content?: {
              parts?: Array<{ text?: string }>;
            };
          }>;
        };
        const summary =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          `Trending: ${input.topic}`;
        return { summary: summary.trim() };
      } catch (error) {
        console.error("AI summary error:", error);
        return { summary: `Trending: ${input.topic}` };
      }
    }),
});
