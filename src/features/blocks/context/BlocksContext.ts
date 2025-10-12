import { createContext } from "react";
import { Block, UUIDv4 } from "../../blocks/interfaces/Block.interface";

/** 
 * Contains all data related to blocks (content, format, structure). \n
 * Does not include things like selection, focus, etc since does live inside the Editor.
 */
interface BlocksContext {
    blocks: Record<UUIDv4, Block>;
    setBlocks: (updatedValues: Record<string, Block>) => void;
}

const BlocksContext : BlocksContext = createContext();

export {
    BlocksContext
}