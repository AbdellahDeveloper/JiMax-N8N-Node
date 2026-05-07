import { INodeType, INodeTypeDescription, ISupplyDataFunctions } from 'n8n-workflow';
export declare class JiMaxMemory implements INodeType {
    description: INodeTypeDescription;
    supplyData(this: ISupplyDataFunctions): Promise<any>;
}
