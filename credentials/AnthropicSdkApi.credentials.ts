import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class AnthropicSdkApi implements ICredentialType {
	name = 'anthropicSdkApi';
	displayName = 'Anthropic SDK API';
	documentationUrl = 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api';
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
