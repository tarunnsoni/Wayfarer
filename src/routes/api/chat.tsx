import { createFileRoute } from '@tanstack/react-router'
import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { google } from '@ai-sdk/google'

type ChatRequestBody = {
  messages?: unknown
  tripContext?: string
}

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, tripContext } =
          (await request.json()) as ChatRequestBody
        if (!Array.isArray(messages)) {
          return new Response('Messages are required', { status: 400 })
        }

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
          return new Response('Missing GOOGLE_GENERATIVE_AI_API_KEY', {
            status: 500,
          })
        }

        const system = `You are a warm, knowledgeable travel concierge helping the user refine and discuss their trip. Answer questions about the itinerary, suggest alternatives, give practical tips (visas, weather, transit, etiquette, safety), and recommend specific places. Keep answers concise, use markdown, and use small tables when comparing options.

${tripContext ? `Here is the trip itinerary the user is discussing:\n\n${tripContext}` : 'The user has not generated an itinerary yet — help them plan generally.'}`

        const result = streamText({
          model: google('gemini-2.5-flash'),
          system,
          messages: await convertToModelMessages(messages as UIMessage[]),
        })

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        })
      },
    },
  },
})
