import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import * as fs from 'fs';
import * as path from 'path';
import * as z from 'zod';

interface IMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

const messageSchema = z.array(
	z.object({
		role: z.enum(['user', 'assistant', 'system']),
		content: z.string(),
	})
);

export class JiMaxTextLLM implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'JiMax Text LLM',
		name: 'jiMaxTextLLM',
		icon: 'fa:robot',
		group: ['transform'],
		version: 1,
		description: 'Generate text using AI SDK with internal persistent memory',
		defaults: {
			name: 'JiMax Text LLM',
		},
		inputs: ['main' as any],
		outputs: ['main' as any],
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const storagePath = path.join(process.cwd(), 'jimax_memory.json');

		const loadStore = () => {
			try {
				if (fs.existsSync(storagePath)) {
					return JSON.parse(fs.readFileSync(storagePath, 'utf8'));
				}
			} catch (e) {}
			return {};
		};

		const saveStore = async (store: any) => {
			try {
				await fs.promises.writeFile(storagePath, JSON.stringify(store, null, 2));
			} catch (e) {
				console.error('Failed to save memory:', e);
			}
		};

		for (let i = 0; i < items.length; i++) {
			try {
				const providerName = this.getNodeParameter('provider', i) as string;
				const modelId = this.getNodeParameter('modelId', i) as string;
				const prompt = this.getNodeParameter('prompt', i) as string;
				const systemPrompt = this.getNodeParameter('systemPrompt', i) as string;
				const initialMessagesRaw = this.getNodeParameter('initialMessages', i) as string;
				const useMemory = this.getNodeParameter('useMemory', i) as boolean;
				const sessionId = useMemory ? this.getNodeParameter('sessionId', i) as string : '';
				const memoryWindow = useMemory ? this.getNodeParameter('memoryWindow', i) as number : 0;
				const saveInBackground = useMemory ? this.getNodeParameter('saveInBackground', i) as boolean : false;
				const clearMemory = useMemory ? this.getNodeParameter('clearMemory', i) as boolean : false;
				const debugHistory = this.getNodeParameter('debugHistory', i) as boolean;

				// Action: Clear Memory
				if (useMemory && sessionId && clearMemory) {
					const store = loadStore();
					delete store[sessionId];
					await saveStore(store);
					returnData.push({ json: { status: 'success', message: `Memory cleared for session: ${sessionId}` } });
					continue;
				}

				let initialHistory: IMessage[] = [];
				if (initialMessagesRaw && initialMessagesRaw !== '[]') {
					try {
						const parsed = typeof initialMessagesRaw === 'string' ? JSON.parse(initialMessagesRaw) : initialMessagesRaw;
						initialHistory = messageSchema.parse(parsed) as IMessage[];
					} catch (e) {
						throw new Error(`Invalid Initial Messages JSON: ${e.message}`);
					}
				}

				let model: any;

				if (providerName === 'openai') {
					const credentials = await this.getCredentials('openAiSdkApi');
					const client = createOpenAI({ apiKey: credentials.apiKey as string });
					model = client(modelId);
				} else if (providerName === 'google') {
					const credentials = await this.getCredentials('googleSdkApi');
					const client = createGoogleGenerativeAI({ apiKey: credentials.apiKey as string });
					model = client(modelId);
				} else if (providerName === 'anthropic') {
					const credentials = await this.getCredentials('anthropicSdkApi');
					const client = createAnthropic({ apiKey: credentials.apiKey as string });
					model = client(modelId);
				} else if (providerName === 'openai-compatible') {
					const credentials = await this.getCredentials('openAiCompatibleSdkApi');
					const client = createOpenAICompatible({
						name: 'custom',
						baseURL: credentials.baseUrl as string,
						apiKey: credentials.apiKey as string,
					});
					model = client(modelId);
				}

				let messages: IMessage[] = [];
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

				const { text } = await generateText({
					model,
					messages: messages as any,
				});

				if (useMemory && sessionId) {
					const store = loadStore();
					if (!store[sessionId]) store[sessionId] = [];
					store[sessionId].push({ role: 'user', content: prompt });
					store[sessionId].push({ role: 'assistant', content: text });
					
					if (store[sessionId].length > 100) {
						store[sessionId] = store[sessionId].slice(-100);
					}

					if (saveInBackground) {
						saveStore(store);
					} else {
						await saveStore(store);
					}
				}

				returnData.push({
					json: {
						response: text,
						...(debugHistory ? { _history: messages } : {}),
					},
				});
			} catch (error) {
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
