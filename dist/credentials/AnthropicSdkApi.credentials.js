"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicSdkApi = void 0;
class AnthropicSdkApi {
    constructor() {
        this.name = 'anthropicSdkApi';
        this.displayName = 'Anthropic SDK API';
        this.documentationUrl = 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api';
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
exports.AnthropicSdkApi = AnthropicSdkApi;
//# sourceMappingURL=AnthropicSdkApi.credentials.js.map