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
exports.JiMaxObjectToolLLM = void 0;
const openai_1 = require("@ai-sdk/openai");
const google_1 = require("@ai-sdk/google");
const anthropic_1 = require("@ai-sdk/anthropic");
const openai_compatible_1 = require("@ai-sdk/openai-compatible");
const z = __importStar(require("zod"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const messageSchema = z.array(z.object({
    role: z.enum(['user', 'assistant', 'system', 'tool']),
    content: z.string(),
}));
class JiMaxObjectToolLLM {
    constructor() {
        this.description = {
            displayName: 'JiMax Object Tool LLM',
            name: 'jiMaxObjectToolLlm',
            icon: 'fa:tools',
            group: ['transform'],
            version: 1,
            description: 'Generate structured objects using AI SDK with tools (run other n8n flows)',
            defaults: {
                name: 'JiMax Object Tool LLM',
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
                    displayName: 'Zod Schema',
                    name: 'zodSchema',
                    type: 'string',
                    typeOptions: {
                        rows: 6,
                        alwaysOpenEditWindow: true,
                    },
                    default: 'z.object({\n  summary: z.string(),\n  actionTaken: z.string(),\n})',
                    description: 'Define the final output schema using Zod syntax. The variable "z" is available.',
                    required: true,
                },
                {
                    displayName: 'Tools',
                    name: 'tools',
                    type: 'fixedCollection',
                    typeOptions: {
                        multipleValues: true,
                    },
                    placeholder: 'Add Tool',
                    default: {},
                    options: [
                        {
                            name: 'toolValues',
                            displayName: 'Tool',
                            values: [
                                {
                                    displayName: 'Description',
                                    name: 'description',
                                    type: 'string',
                                    default: '',
                                    description: 'Describe what the tool does and when the LLM should use it',
                                    required: true,
                                },
                                {
                                    displayName: 'Include Parent Item Data',
                                    name: 'includeParentData',
                                    type: 'boolean',
                                    default: false,
                                    description: 'If enabled, the current item data will be passed to the sub-workflow as \'_parentData\'',
                                },
                                {
                                    displayName: 'Input Schema (Zod)',
                                    name: 'inputSchema',
                                    type: 'string',
                                    default: 'z.object({\n		input:	z.string(),\n})',
                                    description: 'Define the parameters the LLM should pass to this tool. Variable \'z\' is available.',
                                },
                                {
                                    displayName: 'Name',
                                    name: 'name',
                                    type: 'string',
                                    default: '',
                                    description: 'Unique name of the tool (alphanumeric and underscores only)',
                                    required: true,
                                },
                                {
                                    displayName: 'Workflow ID',
                                    name: 'workflowId',
                                    type: 'string',
                                    default: '',
                                    description: 'The ID of the n8n workflow to trigger',
                                    required: true,
                                },
                            ],
                        },
                    ],
                },
                {
                    displayName: 'Max Steps',
                    name: 'maxSteps',
                    type: 'number',
                    default: 5,
                    description: 'Maximum number of tool-calling iterations allowed',
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
            ],
            usableAsTool: true,
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const storagePath = path.join(process.cwd(), 'jimax_memory.json');
        const { generateText, Output, tool: aiToolHelper } = require('ai');
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
                const systemPrompt = this.getNodeParameter('systemPrompt', i);
                const initialMessagesRaw = this.getNodeParameter('initialMessages', i);
                const zodSchemaString = this.getNodeParameter('zodSchema', i);
                const useMemory = this.getNodeParameter('useMemory', i);
                const sessionId = useMemory ? this.getNodeParameter('sessionId', i) : '';
                const memoryWindow = useMemory ? this.getNodeParameter('memoryWindow', i) : 0;
                const saveInBackground = useMemory ? this.getNodeParameter('saveInBackground', i) : false;
                const maxSteps = this.getNodeParameter('maxSteps', i);
                const toolsConfig = this.getNodeParameter('tools', i, { toolValues: [] });
                const userTools = toolsConfig.toolValues || [];
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
                    throw new Error(`Failed to parse final Zod schema: ${e.message}`);
                }
                const aiTools = {};
                for (const t of userTools) {
                    if (!t.name)
                        continue;
                    const sanitizedName = t.name.replace(/[^a-zA-Z0-9_]/g, '_');
                    let toolParams;
                    try {
                        const paramsFunction = new Function('z', `return ${t.inputSchema || 'z.object({})'}`);
                        toolParams = paramsFunction(z);
                    }
                    catch (e) {
                        throw new Error(`Failed to parse input schema for tool "${t.name}": ${e.message}`);
                    }
                    aiTools[sanitizedName] = aiToolHelper({
                        description: t.description,
                        parameters: toolParams,
                        execute: async (args) => {
                            try {
                                const executionData = { ...args };
                                if (t.includeParentData) {
                                    executionData._parentData = items[i].json;
                                }
                                const result = await this.executeWorkflow(t.workflowId, [{ json: executionData }]);
                                if (result && result[0] && result[0][0]) {
                                    return result[0][0].json;
                                }
                                return { status: 'success', message: 'Workflow executed, but no output returned' };
                            }
                            catch (err) {
                                return { error: `Failed to execute sub-workflow: ${err.message}` };
                            }
                        },
                    });
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
                messages.push({ role: 'user', content: prompt });
                let outputData;
                const { output } = await generateText({
                    model,
                    tools: aiTools,
                    maxSteps: maxSteps,
                    output: Output.object({ schema }),
                    messages: messages,
                });
                outputData = output;
                if (useMemory && sessionId) {
                    const store = loadStore();
                    if (!store[sessionId])
                        store[sessionId] = [];
                    store[sessionId].push({ role: 'user', content: prompt });
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
exports.JiMaxObjectToolLLM = JiMaxObjectToolLLM;
//# sourceMappingURL=JiMaxObjectToolLLM.node.js.map