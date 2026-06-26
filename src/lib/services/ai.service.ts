import { createServerFn } from '@tanstack/react-start'
import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'

export const planTrip = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      source: z.string().min(1).max(120),
      destination: z.string().min(1).max(120),
      startDate: z.string().min(1).max(40),
      endDate: z.string().min(1).max(40),
      budget: z.string().min(1).max(60),
      travelers: z.number().int().min(1).max(50),
      interests: z.string().max(500).optional().default(''),
    }),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

    if (!apiKey) {
      throw new Error('Missing GEMINI API KEY')
    }

    const ai = new GoogleGenAI({
      apiKey,
    })

    const prompt = `Plan a detailed travel itinerary.

From: ${data.source}
To: ${data.destination}
Dates: ${data.startDate} → ${data.endDate}
Budget: ${data.budget}
Travelers: ${data.travelers}
Interests: ${data.interests || 'general sightseeing'}

Return a beautifully formatted markdown response with:
- A short evocative intro paragraph about the destination
- Use GitHub Flavored Markdown tables (with | and --- separators) for any tabular data.
- **Trip Overview** (duration, vibe, best transport from source)
- **Day-by-day Itinerary** with morning / afternoon / evening blocks, named places, and short descriptions
- **Where to Stay** (2-3 neighborhood/hotel suggestions matching the budget)
- **Food to Try** (5-7 specific dishes/restaurants)
- **Estimated Budget Breakdown** as a clear markdown table with these exact columns: \`Category | Description | Per Person | Total (${data.travelers} pax) | % of Budget\`. Include rows for Transport, Accommodation, Food & Drink, Activities & Sightseeing, Local Transport, Miscellaneous/Buffer, and a final **Total** row in bold. The Total must be close to ${data.budget}. Use the same currency as the budget throughout.
- **Packing & Practical Tips** (5 bullets)
- **Transport Options** — final section. A markdown table comparing realistic ways to travel from ${data.source} to ${data.destination} with these exact columns: \`Mode | Provider | Duration | Approx. Cost | Book\`. Include at minimum (when applicable): Flights, Trains, Buses, Car Rental. In the **Book** column, put a real working markdown link like [Search](https://www.google.com/flights?q=Flights%20from%20${encodeURIComponent(data.source)}%20to%20${encodeURIComponent(data.destination)}). Use these booking sites depending on mode:
  - Flights: https://www.google.com/travel/flights, https://www.skyscanner.com, https://www.kayak.com
  - Trains: https://www.trainline.com, https://www.omio.com, https://www.irctc.co.in (India routes)
  - Buses: https://www.flixbus.com, https://www.redbus.in (India), https://www.omio.com
  - Car Rental: https://www.rentalcars.com, https://www.kayak.com/cars
  Pre-fill source and destination in the URL query when the site supports it. Every link must be a clickable markdown link.

Be specific, use real place names, keep it warm and inspiring. Use emojis sparingly as section accents. Always render tables with proper GFM syntax.`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    return {
      itinerary: response.text ?? '',
    }
  })
