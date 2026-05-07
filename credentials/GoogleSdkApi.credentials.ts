import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class GoogleSdkApi implements ICredentialType {
	name = 'googleSdkApi';
	displayName = 'Google (Gemini) SDK API';
	documentationUrl = 'https://ai.google.dev/docs';
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
