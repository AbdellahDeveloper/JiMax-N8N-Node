"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpstashSearch = void 0;
const search_1 = require("@upstash/search");
class UpstashSearch {
    constructor() {
        this.description = {
            displayName: 'Upstash Search',
            name: 'upstashSearch',
            icon: 'fa:search',
            group: ['transform'],
            version: 1,
            description: 'Search, Upsert, Fetch and Delete documents in Upstash Search',
            defaults: {
                name: 'Upstash Search',
            },
            inputs: ['main'],
            outputs: ['main'],
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
                        { name: 'Search', value: 'search', description: 'Search for documents' },
                        { name: 'Upsert', value: 'upsert', description: 'Add or update documents' },
                        { name: 'Fetch', value: 'fetch', description: 'Fetch documents by ID' },
                        { name: 'Delete', value: 'delete', description: 'Delete documents by ID' },
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
                            displayName: 'Limit',
                            name: 'limit',
                            type: 'number',
                            default: 5,
                            description: 'Maximum number of results to retrieve',
                        },
                        {
                            displayName: 'Filter',
                            name: 'filter',
                            type: 'string',
                            default: '',
                            description: 'Optional search constraint using either a string expression or structured filter object',
                        },
                        {
                            displayName: 'Reranking',
                            name: 'reranking',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to use enhanced search result reranking',
                        },
                        {
                            displayName: 'Semantic Weight',
                            name: 'semanticWeight',
                            type: 'number',
                            typeOptions: { minValue: 0, maxValue: 1 },
                            default: 0.75,
                            description: 'Relevance balance between semantic and keyword search (0-1)',
                        },
                        {
                            displayName: 'Input Enrichment',
                            name: 'inputEnrichment',
                            type: 'boolean',
                            default: true,
                            description: 'Whether to enhance queries before searching',
                        },
                        {
                            displayName: 'Keep Original Query After Enrichment',
                            name: 'keepOriginalQueryAfterEnrichment',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to keep the original query alongside the enriched one',
                        },
                    ],
                },
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
                        { name: 'Single Document', value: 'single' },
                        { name: 'Batch (JSON)', value: 'batch' },
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
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('upstashSearchApi');
        const url = credentials.url;
        const token = credentials.token;
        const client = new search_1.Search({ url, token });
        for (let i = 0; i < items.length; i++) {
            try {
                const operation = this.getNodeParameter('operation', i);
                const indexName = this.getNodeParameter('indexName', i);
                const index = client.index(indexName);
                if (operation === 'search') {
                    const query = this.getNodeParameter('query', i);
                    const additionalFields = this.getNodeParameter('additionalFields', i);
                    const searchResults = await index.search({
                        query,
                        ...additionalFields,
                    });
                    if (Array.isArray(searchResults)) {
                        for (const result of searchResults) {
                            returnData.push({ json: result });
                        }
                    }
                    else {
                        returnData.push({ json: searchResults });
                    }
                }
                else if (operation === 'upsert') {
                    const upsertMode = this.getNodeParameter('upsertMode', i);
                    if (upsertMode === 'single') {
                        const id = this.getNodeParameter('id', i);
                        const content = this.getNodeParameter('content', i);
                        const metadata = this.getNodeParameter('metadata', i);
                        const res = await index.upsert({
                            id,
                            content: typeof content === 'string' ? JSON.parse(content) : content,
                            metadata: typeof metadata === 'string' ? JSON.parse(metadata) : (metadata || {}),
                        });
                        returnData.push({ json: { status: res } });
                    }
                    else {
                        const documentsJson = this.getNodeParameter('documentsJson', i);
                        const docs = typeof documentsJson === 'string' ? JSON.parse(documentsJson) : documentsJson;
                        const res = await index.upsert(docs);
                        returnData.push({ json: { status: res } });
                    }
                }
                else if (operation === 'fetch') {
                    const idsRaw = this.getNodeParameter('ids', i);
                    const ids = idsRaw.split(',').map(id => id.trim());
                    const results = await index.fetch(ids);
                    if (Array.isArray(results)) {
                        for (const result of results) {
                            if (result) {
                                returnData.push({ json: result });
                            }
                        }
                    }
                }
                else if (operation === 'delete') {
                    const idsRaw = this.getNodeParameter('ids', i);
                    const ids = idsRaw.split(',').map(id => id.trim());
                    const res = await index.delete(ids);
                    returnData.push({ json: res });
                }
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
exports.UpstashSearch = UpstashSearch;
//# sourceMappingURL=UpstashSearch.node.js.map