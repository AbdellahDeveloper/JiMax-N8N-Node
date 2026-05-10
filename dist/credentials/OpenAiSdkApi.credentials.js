"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiSdkApi = void 0;
class OpenAiSdkApi {
    constructor() {
        this.name = 'openAiSdkApi';
        this.displayName = 'OpenAI SDK API';
        this.documentationUrl = 'https://platform.openai.com/docs/api-reference';
        this.properties = [
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
exports.OpenAiSdkApi = OpenAiSdkApi;
//# sourceMappingURL=OpenAiSdkApi.credentials.js.map