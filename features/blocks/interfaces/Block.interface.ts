import * as Crypto from 'expo-crypto';

type UUIDv4 = string;

class Block {
    id?: string;
    type: string;
    properties: {
        title: string;
    };
    content?: string[] | [];
    parent: string;
    parent_table?: string

    constructor({
        type,
        properties,
        content = [],
        parent,
        parent_table
    } : Block) {
        this.id = Crypto.randomUUID();;
        this.type = type;
        this.properties = properties;
        this.content = content;
        this.parent = parent;
        this.parent_table = parent_table
    }
}
export { Block, UUIDv4 };

// Blocks already handle structure, maybe the storage should only be responsible for storing all blocks