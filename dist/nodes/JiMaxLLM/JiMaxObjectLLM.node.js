"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JiMaxObjectLLM = void 0;
const anthropic_1 = require("@ai-sdk/anthropic");
const google_1 = require("@ai-sdk/google");
const openai_1 = require("@ai-sdk/openai");
const openai_compatible_1 = require("@ai-sdk/openai-compatible");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const z = __importStar(require("zod"));
const messageSchema = z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
}));
class JiMaxObjectLLM {
    constructor() {
        this.description = {
            displayName: 'JiMax Object LLM',
            name: 'jiMaxObjectLlm',
            icon: 'fa:robot',
            group: ['transform'],
            version: 1,
            description: 'Generate structured objects using AI SDK with internal persistent memory',
            defaults: {
                name: 'JiMax Object LLM',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'openAiSdkApi',
                    required: true,
                    displayOptions: { show: { provider: ['openai'] } },
                },
                {
                    name: 'googleSdkApi',
                    required: true,
                    displayOptions: { show: { provider: ['google'] } },
                },
                {
                    name: 'anthropicSdkApi',
                    required: true,
                    displayOptions: { show: { provider: ['anthropic'] } },
                },
                {
                    name: 'openAiCompatibleSdkApi',
                    required: true,
                    displayOptions: { show: { provider: ['openai-compatible'] } },
                },
            ],
            properties: [
                {
                    displayName: 'Provider',
                    name: 'provider',
                    type: 'options',
                    options: [
                        { name: 'OpenAI', value: 'openai' },
                        { name: 'Google (Gemini)', value: 'google' },
                        { name: 'Anthropic', value: 'anthropic' },
                        { name: 'OpenAI Compatible', value: 'openai-compatible' },
                    ],
                    default: 'openai',
                },
                {
                    displayName: 'Model ID',
                    name: 'modelId',
                    type: 'string',
                    default: '',
                    placeholder: 'e.g. gpt-4o, gemini-1.5-pro',
                    required: true,
                },
                {
                    displayName: 'Prompt',
                    name: 'prompt',
                    type: 'string',
                    typeOptions: { rows: 4 },
                    default: '',
                    required: true,
                },
                {
                    displayName: 'Audio URL (OGG)',
                    name: 'audioUrl',
                    type: 'string',
                    default: '',
                    placeholder: 'e.g. https://example.com/audio.ogg',
                    description: 'Optional link to an OGG audio file to process',
                },
                {
                    displayName: 'Zod Schema',
                    name: 'zodSchema',
                    type: 'string',
                    typeOptions: {
                        rows: 6,
                        alwaysOpenEditWindow: true,
                    },
                    default: 'z.object({\n  name: z.string(),\n  age: z.number().nullable(),\n  labels: z.array(z.string()),\n})',
                    description: 'Define the output schema using Zod syntax. The variable "z" is available.',
                    required: true,
                },
                {
                    displayName: 'System Prompt',
                    name: 'systemPrompt',
                    type: 'string',
                    typeOptions: { rows: 3 },
                    default: '',
                },
                {
                    displayName: 'Initial Messages (JSON)',
                    name: 'initialMessages',
                    type: 'string',
                    typeOptions: {
                        rows: 4,
                        alwaysOpenEditWindow: true,
                    },
                    default: '[]',
                    description: 'A JSON array of starting messages',
                },
                {
                    displayName: 'Use Memory',
                    name: 'useMemory',
                    type: 'boolean',
                    default: false,
                },
                {
                    displayName: 'Session ID',
                    name: 'sessionId',
                    type: 'string',
                    displayOptions: { show: { useMemory: [true] } },
                    default: '',
                    placeholder: 'e.g. user-123',
                    description: 'Unique key for this conversation',
                    required: true,
                },
                {
                    displayName: 'Memory Window',
                    name: 'memoryWindow',
                    type: 'number',
                    displayOptions: { show: { useMemory: [true] } },
                    default: 5,
                    description: 'Number of previous interactions to remember',
                },
                {
                    displayName: 'Save in Background',
                    name: 'saveInBackground',
                    type: 'boolean',
                    displayOptions: { show: { useMemory: [true] } },
                    default: true,
                    description: 'Return response immediately without waiting for save',
                },
                {
                    displayName: 'Clear Memory',
                    name: 'clearMemory',
                    type: 'boolean',
                    displayOptions: { show: { useMemory: [true] } },
                    default: false,
                    description: 'If enabled, the memory for this Session ID will be deleted during this run',
                },
            ],
            usableAsTool: true,
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const storagePath = path.join(process.cwd(), 'jimax_memory.json');
        const { generateText: _generateText, Output } = require('ai');
        const loadStore = () => {
            try {
                if (fs.existsSync(storagePath)) {
                    return JSON.parse(fs.readFileSync(storagePath, 'utf8'));
                }
            }
            catch (e) { }
            return {};
        };
        const saveStore = async (store) => {
            try {
                await fs.promises.writeFile(storagePath, JSON.stringify(store, null, 2));
            }
            catch (e) {
                console.error('Failed to save memory:', e);
            }
        };
        for (let i = 0; i < items.length; i++) {
            try {
                const providerName = this.getNodeParameter('provider', i);
                const modelId = this.getNodeParameter('modelId', i);
                const prompt = this.getNodeParameter('prompt', i);
                const audioUrl = this.getNodeParameter('audioUrl', i);
                const systemPrompt = this.getNodeParameter('systemPrompt', i);
                const initialMessagesRaw = this.getNodeParameter('initialMessages', i);
                const zodSchemaString = this.getNodeParameter('zodSchema', i);
                const useMemory = this.getNodeParameter('useMemory', i);
                const sessionId = useMemory ? this.getNodeParameter('sessionId', i) : '';
                const memoryWindow = useMemory ? this.getNodeParameter('memoryWindow', i) : 0;
                const saveInBackground = useMemory ? this.getNodeParameter('saveInBackground', i) : false;
                const clearMemory = useMemory ? this.getNodeParameter('clearMemory', i) : false;
                if (useMemory && sessionId && clearMemory) {
                    const store = loadStore();
                    delete store[sessionId];
                    await saveStore(store);
                    returnData.push({ json: { status: 'success', message: `Memory cleared for session: ${sessionId}` } });
                    continue;
                }
                let initialHistory = [];
                if (initialMessagesRaw && initialMessagesRaw !== '[]') {
                    try {
                        const parsed = typeof initialMessagesRaw === 'string' ? JSON.parse(initialMessagesRaw) : initialMessagesRaw;
                        initialHistory = messageSchema.parse(parsed);
                    }
                    catch (e) {
                        throw new Error(`Invalid Initial Messages JSON: ${e.message}`);
                    }
                }
                let model;
                if (providerName === 'openai') {
                    const credentials = await this.getCredentials('openAiSdkApi');
                    const client = (0, openai_1.createOpenAI)({ apiKey: credentials.apiKey });
                    model = client(modelId);
                }
                else if (providerName === 'google') {
                    const credentials = await this.getCredentials('googleSdkApi');
                    const client = (0, google_1.createGoogleGenerativeAI)({ apiKey: credentials.apiKey });
                    model = client(modelId);
                }
                else if (providerName === 'anthropic') {
                    const credentials = await this.getCredentials('anthropicSdkApi');
                    const client = (0, anthropic_1.createAnthropic)({ apiKey: credentials.apiKey });
                    model = client(modelId);
                }
                else if (providerName === 'openai-compatible') {
                    const credentials = await this.getCredentials('openAiCompatibleSdkApi');
                    const client = (0, openai_compatible_1.createOpenAICompatible)({
                        name: 'custom',
                        baseURL: credentials.baseUrl,
                        apiKey: credentials.apiKey,
                    });
                    model = client(modelId);
                }
                let schema;
                try {
                    const schemaFunction = new Function('z', `return ${zodSchemaString}`);
                    schema = schemaFunction(z);
                }
                catch (e) {
                    throw new Error(`Failed to parse Zod schema: ${e.message}`);
                }
                let messages = [];
                if (systemPrompt) {
                    messages.push({ role: 'system', content: systemPrompt });
                }
                if (initialHistory.length > 0) {
                    messages = messages.concat(initialHistory);
                }
                if (useMemory && sessionId) {
                    const store = loadStore();
                    const history = store[sessionId] || [];
                    const windowedHistory = history.slice(-(memoryWindow * 2));
                    messages = messages.concat(windowedHistory);
                }
                let userContent = prompt;
                if (audioUrl) {
                    try {
                        const audioBuffer = await this.helpers.httpRequest({
                            method: 'GET',
                            url: audioUrl,
                            encoding: 'arraybuffer',
                        });
                        userContent = [
                            { type: 'text', text: prompt },
                            {
                                type: 'file',
                                data: Buffer.from(audioBuffer),
                                mediaType: 'audio/ogg',
                            },
                        ];
                    }
                    catch (e) {
                        throw new Error(`Failed to fetch audio from URL: ${e.message}`);
                    }
                }
                messages.push({ role: 'user', content: userContent });
                let outputData;
                for (let attempt = 1; attempt <= 3; attempt++) {
                    try {
                        const { output } = await _generateText({
                            model,
                            output: Output.object({ schema }),
                            messages: messages,
                        });
                        outputData = output;
                        break;
                    }
                    catch (e) {
                        if (attempt === 3)
                            throw e;
                    }
                }
                if (useMemory && sessionId) {
                    const store = loadStore();
                    if (!store[sessionId])
                        store[sessionId] = [];
                    let memoryUserContent = prompt;
                    if (audioUrl && outputData && outputData.user_message) {
                        memoryUserContent = outputData.user_message;
                    }
                    store[sessionId].push({ role: 'user', content: memoryUserContent });
                    store[sessionId].push({ role: 'assistant', content: JSON.stringify(outputData) });
                    if (store[sessionId].length > 100) {
                        store[sessionId] = store[sessionId].slice(-100);
                    }
                    if (saveInBackground) {
                        saveStore(store);
                    }
                    else {
                        await saveStore(store);
                    }
                }
                returnData.push({ json: outputData });
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.JiMaxObjectLLM = JiMaxObjectLLM;
//# sourceMappingURL=JiMaxObjectLLM.node.js.map