import * as Crypto from 'expo-crypto';

type UUIDv4 = string;

class Block {
    id?: string;
    type: "text" | "page" | "header" | "sub_header" | "sub_sub_header" | string;
    properties: {
        title: string;
    };
    format?: {
        
    };
    content?: string[] | [];
    parent: string;

    constructor({
        type,
        properties,
        content = [],
        parent,
    } : Block) {
        this.id = Crypto.randomUUID();;
        this.type = type;
        this.properties = properties;
        this.content = content;
        this.parent = parent;
    }
}
export { Block, UUIDv4 };

// Blocks already handle structure, maybe the storage should only be responsible for storing all blocks