import * as Crypto from 'expo-crypto';

type UUIDv4 = string;

interface Block {
    /** A unique identifier for a block. */
    id: UUIDv4,
    /** The type of block. Defines how a block is displayed, and how the block’s properties are interpreted. */
    type: string,
    /** A data structure containing custom attributes about a specific block.  */
    properties: {
        title: string
    },
    /** An array (or ordered set) of block IDs representing the content inside this block, like nested bullet items in a bulleted list or the text inside a toggle. */
    content: UUIDv4[] | [],
    /** The block ID of the block’s parent. The parent block is only used for permissions. */
    parent: UUIDv4,
    /** The table that this block is stored in. */
    parent_table: string
}


class Block {
    id: string;
    type: string;
    properties: {
        title: string;
    };
    content: string[] | [];
    parent: string;
    parent_table: string

    constructor(
        type: string,
        properties: { title: string },
        content: string[] | [],
        parent: string,
        parent_table: string
    ) {
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