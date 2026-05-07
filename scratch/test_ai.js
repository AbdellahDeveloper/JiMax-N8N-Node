const { generateObject, tool } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');
const { z } = require('zod');

async function test() {
    const google = createGoogleGenerativeAI({ apiKey: 'dummy' });
    const model = google('gemini-1.5-flash');

    try {
        await generateObject({
            model,
            schema: z.object({ result: z.string() }),
            tools: {
                test: tool({
                    description: 'test',
                    parameters: z.object({}),
                    execute: async () => ({ status: 'ok' }),
                }),
            },
            maxSteps: 5,
            prompt: 'test',
        });
        console.log('generateObject supports tools');
    } catch (e) {
        console.log('generateObject error:', e.message);
    }
}

test();
