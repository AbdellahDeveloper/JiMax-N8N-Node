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
exports.JiMaxTextLLM = void 0;
const ai_1 = require("ai");
const openai_1 = require("@ai-sdk/openai");
const google_1 = require("@ai-sdk/google");
const anthropic_1 = require("@ai-sdk/anthropic");
const openai_compatible_1 = require("@ai-sdk/openai-compatible");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const z = __importStar(require("zod"));
const messageSchema = z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
}));
class JiMaxTextLLM {
    constructor() {
        this.description = {
            displayName: 'JiMax Text LLM',
            name: 'jiMaxTextLLM',
            icon: 'fa:robot',
            group: ['transform'],
            version: 1,
            description: 'Generate text using AI SDK with internal persistent memory',
            defaults: {
                name: 'JiMax Text LLM',
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
                {
                    displayName: 'Debug History',
                    name: 'debugHistory',
                    type: 'boolean',
                    default: false,
                    description: 'Include history in output for debugging',
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const storagePath = path.join(process.cwd(), 'jimax_memory.json');
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
                const useMemory = this.getNodeParameter('useMemory', i);
                const sessionId = useMemory ? this.getNodeParameter('sessionId', i) : '';
                const memoryWindow = useMemory ? this.getNodeParameter('memoryWindow', i) : 0;
                const saveInBackground = useMemory ? this.getNodeParameter('saveInBackground', i) : false;
                const clearMemory = useMemory ? this.getNodeParameter('clearMemory', i) : false;
                const debugHistory = this.getNodeParameter('debugHistory', i);
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
                const { text } = await (0, ai_1.generateText)({
                    model,
                    messages: messages,
                });
                if (useMemory && sessionId) {
                    const store = loadStore();
                    if (!store[sessionId])
                        store[sessionId] = [];
                    store[sessionId].push({ role: 'user', content: prompt });
                    store[sessionId].push({ role: 'assistant', content: text });
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
                returnData.push({
                    json: {
                        response: text,
                        ...(debugHistory ? { _history: messages } : {}),
                    },
                });
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
exports.JiMaxTextLLM = JiMaxTextLLM;
//# sourceMappingURL=JiMaxTextLLM.node.js.map