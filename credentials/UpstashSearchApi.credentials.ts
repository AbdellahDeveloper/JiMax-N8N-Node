import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class UpstashSearchApi implements ICredentialType {
	name = 'upstashSearchApi';
	displayName = 'Upstash Search API';
	documentationUrl = 'https://upstash.com/docs/search/overall/getstarted';
	properties: INodeProperties[] = [
		{
			displayName: 'URL',
			name: 'url',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Token',
			name: 'token',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
	];
}
