import { createContext } from "react";
import { Block, UUIDv4 } from "../../blocks/interfaces/Block.interface";

interface BlocksContext {
    blocks: Record<UUIDv4, Block>;
    setBlocks: (updatedValues: Record<string, Block>) => void;
}

const BlocksContext : BlocksContext = createContext();

export {
    BlocksContext
}