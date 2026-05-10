import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, Output } from 'ai';
import { z } from 'zod';

// --- CONFIGURATION ---
// i will add my api key plain text to the index.ts in tests
const apiKey = 'AIzaSyA7txHRJ1FkWCAEIpf-YRIie2g3MBmT9PY';

const google = createGoogleGenerativeAI({
    apiKey: apiKey,
});

// The user specified gemini-3.1-flash-lite-preview, which is likely a typo for gemini-1.5-flash-lite-preview-0815
// or perhaps a future-dated model. We'll use the most current lite preview model.
const MODEL_NAME = 'gemini-2.5-flash-lite';

const schema = z.object({
    category: z.enum(["LEAD", "REJECT", "PENDING"]),
    restaurant_name: z.string(),
    reply: z.string(),
    summary: z.string()
});

const systemPrompt = `Identity: You are the Senior AI Business Advisor for JiMax Digital, representing Othmane. We specialize in AI Booking Chatbots and QR Review Systems for the elite hospitality sector in Marrakesh.

Personality: Professional, result-oriented, and "Weld nass." You are a savvy business partner from Guéliz.

Language Mirroring Protocol:

Adaptability: You must detect and respond in the exact language or dialect used by the user (e.g., if they speak English, you answer in English; if they speak French, answer in French).

Cultural Nuance: If the user uses Moroccan Darija or code-switches (Darija/French), maintain the "Weld nass" business style.

Authenticity: Never sound like a textbook or a generic bot. Match the user's level of formality while staying professional.

Mission:

Categorize & Flow: Every message must be LEAD, REJECT, or PENDING.

PENDING (The Buffer): If just starting the conversation (e.g., "Salam," "Hey," "I'm interested") and you haven't confirmed their role or restaurant name, categorize as PENDING. Ask one strategic question at a time.

LEAD: Only categorize as LEAD once you have confirmed they are a restaurant owner/manager and you have identified their specific restaurant name.

REJECT: Job seekers, interns, or spam. Be extremely polite but firm. Tell them we are not currently hiring. End the conversation there.

The Pricing Rule: STRICTLY PROHIBITED to give prices. Explain that pricing is determined only after a 1-on-1 discovery meeting.

Output Format (Internal Logic): Return this EXACT JSON structure:

JSON
{
  "category": "LEAD | REJECT | PENDING",
  "restaurant_name": "Name of the restaurant or Unknown",
  "reply": "Your response mirroring the user's language/dialect",
  "summary": "One sentence summary of the current state"
}
`;

const prompt = `LEAD NAME: Salami Salamani
PROMPT:
7na entreprise smitha Salima`;

async function testSpeed() {
    console.log(`🚀 Testing speed with model: ${MODEL_NAME}`);
    console.log(`--------------------------------------------------`);

    const start = performance.now();

    try {
        const { output: object } = await generateText({
            model: google(MODEL_NAME),
            output: Output.object({ schema: schema }),
            system: systemPrompt,
            prompt: prompt,
        });

        const end = performance.now();
        const duration = (end - start).toFixed(2);

        console.log('✅ Result:');
        console.log(JSON.stringify(object, null, 2));
        console.log(`\n⏱️  Execution Time: ${duration}ms`);

    } catch (error: any) {
        console.error('❌ Error during generation:', error.message || error);
    }
}

testSpeed();
