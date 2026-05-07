import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class OpenAiSdkApi implements ICredentialType {
	name = 'openAiSdkApi';
	displayName = 'OpenAI SDK API';
	documentationUrl = 'https://platform.openai.com/docs/api-reference';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];
}
