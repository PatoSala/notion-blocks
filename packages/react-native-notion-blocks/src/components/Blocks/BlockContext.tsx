import { createContext, useContext, useState } from "react";
import { useBlocksContext } from "./BlocksContext";

const BlockContext = createContext({});

export function useBlockContext() {
    const blockContext = useContext(BlockContext);
    if (!blockContext) {
        throw new Error("useBlockContext must be used within a BlockContextProvider");
    }
    return blockContext;
}

export function BlockProvider({ children }: any) {
    const { blocks } = useBlocksContext();
    const [block, setBlock] = useState({});

    return (
        <BlockContext.Provider value={{}}>
            {children}
        </BlockContext.Provider>
    );
}

