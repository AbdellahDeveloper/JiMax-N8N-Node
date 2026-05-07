import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class OpenAiCompatibleSdkApi implements ICredentialType {
	name = 'openAiCompatibleSdkApi';
	displayName = 'OpenAI Compatible SDK API';
	documentationUrl = 'https://sdk.vercel.ai/providers/ai-sdk-providers/openai-compatible';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://api.together.xyz/v1',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];
}
