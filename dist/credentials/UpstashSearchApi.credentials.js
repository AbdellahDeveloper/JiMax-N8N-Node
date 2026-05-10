"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpstashSearchApi = void 0;
class UpstashSearchApi {
    constructor() {
        this.name = 'upstashSearchApi';
        this.displayName = 'Upstash Search API';
        this.documentationUrl = 'https://upstash.com/docs/search/overall/getstarted';
        this.properties = [
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
}
exports.UpstashSearchApi = UpstashSearchApi;
//# sourceMappingURL=UpstashSearchApi.credentials.js.map