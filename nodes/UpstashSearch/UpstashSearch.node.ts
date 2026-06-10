import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { Search } from "@upstash/search";

export class UpstashSearch implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Upstash Search',
		name: 'upstashSearch',
		icon: 'file:upstash.svg',
		group: ['transform'],
		version: 1,
		description: 'Search, Upsert, Fetch and Delete documents in Upstash Search',
		subtitle: '={{$parameter["operation"]}}',
		defaults: {
			name: 'Upstash Search',
		},
		inputs: ['main' as any],
		outputs: ['main' as any],
		credentials: [
			{
				name: 'upstashSearchApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{ name: 'Document', value: 'document' },
				],
				default: 'document',
				noDataExpression: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['document'],
					},
				},
				options: [
					{ name: 'Create or Update', value: 'upsert', description: 'Create a new record, or update the current one if it already exists (upsert)', action: 'Upsert a document' },
					{ name: 'Delete', value: 'delete', description: 'Delete documents by ID', action: 'Delete a document' },
					{ name: 'Fetch', value: 'fetch', description: 'Fetch documents by ID', action: 'Fetch a document' },
					{ name: 'Search', value: 'search', description: 'Search for documents', action: 'Search a document' },
				],
				default: 'search',
				noDataExpression: true,
			},
			{
				displayName: 'Index Name',
				name: 'indexName',
				type: 'string',
				default: 'default',
				required: true,
				description: 'The name of the index to operate on',
			},
			// Search properties
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['search'],
					},
				},
				default: '',
				required: true,
				description: 'Text string used to find matching documents',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['search'],
					},
				},
				typeOptions: {
					minValue: 1,
				},
				default: 10,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Similarity Threshold',
				name: 'minScore',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['search'],
					},
				},
				typeOptions: {
					minValue: 0,
					maxValue: 1,
				},
				default: 0,
				description: 'The minimum score a result must have to be returned (0-1 range). 0 means no filtering.',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['search'],
					},
				},
				options: [
					{
						displayName: 'Filter',
						name: 'filter',
						type: 'string',
						default: '',
						description: 'Optional search constraint using either a string expression or structured filter object',
					},
					{
						displayName: 'Input Enrichment',
						name: 'inputEnrichment',
						type: 'boolean',
						default: true,
						description: 'Whether to enhance queries before searching (enabled by default)',
					},
					{
						displayName: 'Keep Original Query After Enrichment',
						name: 'keepOriginalQueryAfterEnrichment',
						type: 'boolean',
						default: false,
						description: 'Whether to keep the original query alongside the enriched one (false by default)',
					},
					{
						displayName: 'Reranking',
						name: 'reranking',
						type: 'boolean',
						default: false,
						description: 'Whether to use enhanced search result reranking. It will have additional cost when enabled.',
					},
					{
						displayName: 'Semantic Weight',
						name: 'semanticWeight',
						type: 'number',
						typeOptions: { minValue: 0, maxValue: 1 },
						default: 0.75,
						description: 'Relevance balance between semantic and keyword search (0-1 range). For instance, 0.2 applies 20% semantic matching with 80% full-text matching.',
					},
				],
			},
			// Upsert properties
			{
				displayName: 'Upsert Mode',
				name: 'upsertMode',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['upsert'],
					},
				},
				options: [
					{ name: 'Batch (JSON)', value: 'batch' },
					{ name: 'Single Document', value: 'single' },
				],
				default: 'single',
			},
			{
				displayName: 'Document ID',
				name: 'id',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['upsert'],
						upsertMode: ['single'],
					},
				},
				default: '',
				required: true,
				description: 'Unique identifier for the document',
			},
			{
				displayName: 'Content (JSON)',
				name: 'content',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['upsert'],
						upsertMode: ['single'],
					},
				},
				default: '{}',
				required: true,
				description: 'The content of the document',
			},
			{
				displayName: 'Metadata (JSON)',
				name: 'metadata',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['upsert'],
						upsertMode: ['single'],
					},
				},
				default: '{}',
				description: 'Optional metadata for the document',
			},
			{
				displayName: 'Documents (JSON)',
				name: 'documentsJson',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['upsert'],
						upsertMode: ['batch'],
					},
				},
				default: '[]',
				required: true,
				description: 'Array of documents to upsert',
			},
			// Fetch/Delete properties
			{
				displayName: 'Document IDs',
				name: 'ids',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['fetch', 'delete'],
					},
				},
				default: '',
				required: true,
				description: 'Comma-separated list of document IDs',
			},
		],
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('upstashSearchApi');
		const url = credentials.url as string;
		const token = credentials.token as string;

		const client = new Search({ url, token });

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const indexName = this.getNodeParameter('indexName', i) as string;
				const index = client.index(indexName);

				if (operation === 'search') {
					const query = this.getNodeParameter('query', i) as string;
					const limit = this.getNodeParameter('limit', i) as number;
					const minScore = this.getNodeParameter('minScore', i) as number;
					const additionalFields = this.getNodeParameter('additionalFields', i) as object;
					const searchResults = await index.search({
						query,
						limit,
						...additionalFields,
					});

					// Filter results by score if minScore > 0
					let results = searchResults;
					if (minScore > 0 && Array.isArray(searchResults)) {
						results = searchResults.filter(r => (r.score || 0) >= minScore);
					}

					// Return each result as a separate item if it's an array
					if (Array.isArray(results)) {
						for (const result of results) {
							returnData.push({
								json: result as unknown as IDataObject,
								pairedItem: { item: i },
							});
						}
					} else if (results) {
						returnData.push({
							json: results as unknown as IDataObject,
							pairedItem: { item: i },
						});
					}
				} else if (operation === 'upsert') {
					const upsertMode = this.getNodeParameter('upsertMode', i) as string;

					if (upsertMode === 'single') {
						const id = this.getNodeParameter('id', i) as string;
						const content = this.getNodeParameter('content', i) as IDataObject;
						const metadata = this.getNodeParameter('metadata', i) as IDataObject;

						const res = await index.upsert({
							id,
							content: typeof content === 'string' ? JSON.parse(content) : content,
							metadata: typeof metadata === 'string' ? JSON.parse(metadata) : (metadata || {}),
						});
						returnData.push({
							json: { status: res },
							pairedItem: { item: i },
						});
					} else {
						const documentsJson = this.getNodeParameter('documentsJson', i) as IDataObject[];
						const docs = typeof documentsJson === 'string' ? JSON.parse(documentsJson) : documentsJson;
						const res = await index.upsert(docs as any[]);
						returnData.push({
							json: { status: res },
							pairedItem: { item: i },
						});
					}
				} else if (operation === 'fetch') {
					const idsRaw = this.getNodeParameter('ids', i) as string;
					const ids = idsRaw.split(',').map((id) => id.trim());
					const results = await index.fetch(ids);

					if (Array.isArray(results)) {
						for (const result of results) {
							if (result) {
								returnData.push({
									json: result as unknown as IDataObject,
									pairedItem: { item: i },
								});
							}
						}
					}
				} else if (operation === 'delete') {
					const idsRaw = this.getNodeParameter('ids', i) as string;
					const ids = idsRaw.split(',').map((id) => id.trim());
					const res = await index.delete(ids);
					returnData.push({
						json: res,
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
