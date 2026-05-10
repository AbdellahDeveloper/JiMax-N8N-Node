"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSdkApi = void 0;
class GoogleSdkApi {
    constructor() {
        this.name = 'googleSdkApi';
        this.displayName = 'Google (Gemini) SDK API';
        this.documentationUrl = 'https://ai.google.dev/docs';
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
exports.GoogleSdkApi = GoogleSdkApi;
//# sourceMappingURL=GoogleSdkApi.credentials.js.map