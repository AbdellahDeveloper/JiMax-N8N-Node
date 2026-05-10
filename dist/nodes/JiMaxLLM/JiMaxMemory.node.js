"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JiMaxMemory = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class JiMaxMemory {
    constructor() {
        this.description = {
            displayName: 'JiMax Memory',
            name: 'jiMaxMemory',
            icon: 'fa:database',
            group: ['transform'],
            version: 1,
            description: 'Persistent Multi-user Memory provider for JiMax LLM nodes',
            defaults: {
                name: 'JiMax Memory',
            },
            inputs: [],
            outputs: ['ai_memory'],
            properties: [
                {
                    displayName: 'Session ID',
                    name: 'sessionId',
                    type: 'string',
                    default: '',
                    placeholder: 'e.g. {{ $json.user_id }}',
                    description: 'The unique key for this conversation (e.g., user ID or email)',
                    required: true,
                },
                {
                    displayName: 'Memory Window Size',
                    name: 'windowSize',
                    type: 'number',
                    default: 5,
                    description: 'Number of previous interactions to remember',
                },
            ],
        };
    }
    async supplyData() {
        const sessionId = this.getNodeParameter('sessionId');
        const windowSize = this.getNodeParameter('windowSize');
        const storagePath = path.join(process.cwd(), 'jimax_memory.json');
        const loadStore = () => {
            try {
                if (fs.existsSync(storagePath)) {
                    return JSON.parse(fs.readFileSync(storagePath, 'utf8'));
                }
            }
            catch (e) { }
            return {};
        };
        const saveStore = (store) => {
            try {
                fs.writeFileSync(storagePath, JSON.stringify(store, null, 2));
            }
            catch (e) { }
        };
        return {
            getMessages: async () => {
                const store = loadStore();
                const history = store[sessionId] || [];
                return history.slice(-(windowSize * 2));
            },
            addMessage: async (msg) => {
                const store = loadStore();
                if (!store[sessionId])
                    store[sessionId] = [];
                let role = msg.role;
                if (role === 'ai' || role === 'assistant')
                    role = 'assistant';
                store[sessionId].push({
                    role,
                    content: msg.content,
                });
                if (store[sessionId].length > 100) {
                    store[sessionId] = store[sessionId].slice(-100);
                }
                saveStore(store);
            },
            clear: async () => {
                const store = loadStore();
                delete store[sessionId];
                saveStore(store);
            }
        };
    }
}
exports.JiMaxMemory = JiMaxMemory;
//# sourceMappingURL=JiMaxMemory.node.js.map