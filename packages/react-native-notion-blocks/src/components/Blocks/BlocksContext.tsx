import { createContext, RefObject, useContext, useRef, useState } from "react";
import { Block } from "../../interfaces/Block.interface";
import { updateBlock as updateBlockData, insertBlockIdIntoContent, findPrevTextBlockInContent } from "../../core";

interface BlocksContext {
    blocks: RefObject<Record<string, Block>>;
    blocksOrder: string[];
    rootBlockId: string;
    focusedBlockId: string;
    movingBlockId: string | null;
    setMovingBlockId: (blockId: string | null) => void;
    setFocusedBlockId: (blockId: string) => void;
    insertBlock: (
        newBlock: Block,
        position?: {
            prevBlockId?: string | undefined,
            nextBlockId?: string | undefined
        }
    ) => void;
    splitBlock: (block: Block, selection: { start: number; end: number }) => {
        prevBlock: Block;
        nextBlock: Block;
    };
    moveBlock: (
        blockId: string,
        parentId: string,
        targetId: string,
        closestTo: "start" | "end"
    ) => void;
    mergeBlock: (block: Block, targetBlockId: string) => {
        prevTitle: string;
        newTitle: string;
        mergeResult: Block;
    };
    removeBlock: (blockId: string) => Block;
    turnBlockInto: (blockId: string, blockType: string) => Block;
    updateBlock: (updatedBlock: Block) => void;
}

const BlocksContext = createContext<BlocksContext | null>(null);

function useBlocksContext() {
    const blocksContext = useContext(BlocksContext);
    if (blocksContext === null) {
        throw new Error("useBlocksContext must be used within a BlocksContextProvider");
    }
    return blocksContext;
}

function useBlock(blockId: string) : Block {
    const { blocks } = useBlocksContext();
    return blocks[blockId];
}

function BlocksProvider({ children, defaultBlocks, rootBlockId }: any) {
    const blocksRef = useRef(defaultBlocks);
    const [blocksOrder, setBlocksOrder] = useState<string[]>([rootBlockId, ...blocksRef.current[rootBlockId].content]);
    const [focusedBlockId, setFocusedBlockId] = useState(rootBlockId);
    const [movingBlockId, setMovingBlockId] = useState<string | null>(null);

    /** Block actions
     * Note: I might change all this actions to reducers. reducers can be exported!
     */
    
    /**
     *  Inserts a block into the content array of the parent block. If a position object is provided, the block will be inserted at the specified position.
     */
    function insertBlock(newBlock: Block, position?: { prevBlockId?: string | undefined, nextBlockId?: string | undefined }) {
        const updatedBlock = updateBlockData(blocksRef.current[newBlock.parent], {
            content: insertBlockIdIntoContent(blocksRef.current[newBlock.parent].content, newBlock.id, position)
        });

        blocksRef.current[newBlock.parent] = updatedBlock;
        blocksRef.current[newBlock.id] = newBlock;
        setBlocksOrder(prevState => [...prevState, newBlock.id]);
    }

    /**
     * 
     * @param block 
     * @param selection 
     * 
     * Split block into two blocks.
     * A new block will be inserted before the source block with the text before the cursor.
     * The source block will be updated with the text after the cursor.
     * 
     * [Note: Review return statements.]
     * [Note: Splitting a block is only available for text based blocks.]
     */

    function splitBlock(block: Block, selection: { start: number, end: number }) {
        const textBeforeSelection = block.properties.title.substring(0, selection.start);
        const textAfterSelection = block.properties.title.substring(selection.end);

        // Look for a way to manage all blocks the same
        if (block.id === rootBlockId) {
            const newBlockText = textAfterSelection;
            const newBlock = new Block({
                type: "text",
                properties: {
                    title: newBlockText
                },
                parent: block.id,
            });
            // Update parent block's content array (which is the current block in this case)
            const updatedParentBlock = updateBlockData(block, {
                properties: {
                    title: textBeforeSelection
                },
                content: insertBlockIdIntoContent(block.content, newBlock.id, {
                    nextBlockId: block.content[0]
                })
            });

            blocksRef.current[newBlock.id] = newBlock;
            blocksRef.current[updatedParentBlock.id] = updatedParentBlock;
            setBlocksOrder([rootBlockId, ...blocksRef.current[rootBlockId].content]);
            
            return {
                prevBlock: updatedParentBlock,
                nextBlock: newBlock
            };
        } else {
            const updatedBlock = updateBlockData(block, {
                type: selection.start === 0 && selection.end === 0 ? block.type : "text",
                properties: {
                    title: textAfterSelection
                }
            });
            // Will be inserted before the source block, pushing the source block down
            const newBlock = new Block({
                type: selection.start === 0 && selection.end === 0 ? "text" : block.type,
                properties: {
                    title: textBeforeSelection
                },
                parent: block.parent,
            });
            const updatedParentBlock = updateBlockData(blocksRef.current[block.parent], {
                content: insertBlockIdIntoContent(blocksRef.current[block.parent].content, newBlock.id, {
                    nextBlockId: block.id
                })
            });

            blocksRef.current[updatedParentBlock.id] = updatedParentBlock;
            blocksRef.current[updatedBlock.id] = updatedBlock;
            blocksRef.current[newBlock.id] = newBlock;

            setBlocksOrder([rootBlockId, ...blocksRef.current[rootBlockId].content]);
            
            return {
                prevBlock: newBlock,
                nextBlock: updatedBlock
            }
        }

    }

    /**
     * 
     * @param block 
     * @returns 
     * 
     * Merge block with the block text before it.
     * Appends the text from the target block at the beginning of the source block.
     * The source block type will be replaced with the target block type.
     * Last of all, the target block is removed.
     */
    function mergeBlock(block: Block, targetBlockId: string) {
        const soureBlock = block;
        const targetBlock = blocksRef.current[targetBlockId];
        const sourceBlockText = soureBlock.properties.title;
        const targetBlockText = targetBlock.properties.title;

        const updatedTargetBlock = updateBlockData(targetBlock, {
            properties: {
                title: targetBlockText + sourceBlockText
            }
        });

        const updatedParentBlock = updateBlockData(blocksRef.current[soureBlock.parent], {
            content: blocksRef.current[soureBlock.parent].content.filter(id => id !== soureBlock.id)
        });

        blocksRef.current[updatedTargetBlock.id] = updatedTargetBlock;
        blocksRef.current[updatedParentBlock.id] = updatedParentBlock;

        setBlocksOrder(prevState => prevState.filter((id: string) => id !== soureBlock.id));

        return {
            prevTitle: sourceBlockText,
            newTitle: updatedTargetBlock.properties.title,
            mergeResult: updatedTargetBlock
        }
    }

    function removeBlock(blockId: string) {
        const block = blocksRef.current[blockId];
        const parentBlock = blocksRef.current[block.parent];
        const updatedParentBlock = updateBlockData(parentBlock, {
            content: parentBlock.content.filter((id: string) => id !== blockId)
        });

        blocksRef.current[parentBlock.id] = updatedParentBlock;
        delete blocksRef.current[blockId];

        setBlocksOrder(prevState => prevState.filter((id: string) => id !== blockId));
    }

    const moveBlock = (blockId: string, parentId: string, targetId: string, closestTo: "start" | "end") => {
        const blockIndexInContent = blocksRef.current[parentId].content?.indexOf(blockId);
        const parentContent = blocksRef.current[parentId].content;

        parentContent.splice(blockIndexInContent, 1);
        const updatedBlock = updateBlockData(blocksRef.current[parentId], {
            content: insertBlockIdIntoContent(
                parentContent,
                blockId,
                closestTo === "start" ? { nextBlockId: targetId } : { prevBlockId: targetId }
            )
        });

        blocksRef.current[parentId] = updatedBlock;
        setBlocksOrder([rootBlockId, ...blocksRef.current[rootBlockId].content]);
    }

    /**
     * Note: Only text based blocks can be turned into other text based block types (Maybe a better way to define which blocks can be turned into other blocks are those who have the "title" property?).
     * Future note: If a block has nested blocks, does blocks should be popped out of it and place right under it when turnning it into a different block type.
     */
    function turnBlockInto(blockId: string, blockType: string) {
        const updatedBlock = updateBlockData(blocksRef.current[blockId], {
            type: blockType
        });
        blocksRef.current[updatedBlock.id] = updatedBlock;
        setBlocksOrder(prevState => [...prevState]); // re render blocks
        return updatedBlock;
    }

    /**
     * Does not trigger a re render
     */
    function updateBlock(updatedBlock: Block) {
        blocksRef.current[updatedBlock.id] = updatedBlock;
    }

    const value = {
        blocks: blocksRef.current,
        blocksOrder,
        rootBlockId,
        focusedBlockId,
        movingBlockId,
        setMovingBlockId,
        setFocusedBlockId,
        insertBlock,
        updateBlock,
        turnBlockInto,
        splitBlock: splitBlock,
        mergeBlock: mergeBlock,
        removeBlock: removeBlock,
        moveBlock: moveBlock
    }

    return (
        <BlocksContext.Provider value={value}>
            {children}
        </BlocksContext.Provider>
    )

}

export { BlocksProvider, useBlocksContext, useBlock, BlocksContext };