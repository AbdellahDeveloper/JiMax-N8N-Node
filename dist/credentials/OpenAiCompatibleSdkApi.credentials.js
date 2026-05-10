"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiCompatibleSdkApi = void 0;
class OpenAiCompatibleSdkApi {
    constructor() {
        this.name = 'openAiCompatibleSdkApi';
        this.displayName = 'OpenAI Compatible SDK API';
        this.documentationUrl = 'https://sdk.vercel.ai/providers/ai-sdk-providers/openai-compatible';
        this.properties = [
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
}
exports.OpenAiCompatibleSdkApi = OpenAiCompatibleSdkApi;
//# sourceMappingURL=OpenAiCompatibleSdkApi.credentials.js.map