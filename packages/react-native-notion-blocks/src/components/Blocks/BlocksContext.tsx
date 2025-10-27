import { createContext, useContext, useMemo, useState } from "react";
import { Block } from "../../interfaces/Block.interface";
import { updateBlock as updateBlockData, insertBlockIdIntoContent, findPrevTextBlockInContent } from "../../core";

interface BlocksContext {
    blocks: Record<string, Block>;
    rootBlockId: string;
    focusedBlockId: string;
    setFocusedBlockId: (blockId: string) => void;
    insertBlock: (
        newBlock: Block,
        position?: {
            prevBlockId?: string | undefined,
            nextBlockId?: string | undefined
        }
    ) => void;
    splitBlock: (block: Block, selection: { start: number; end: number }) => {
        splitResult: Block;
        updatedParentBlock: Block;
    };
    moveBlocks: (
        blockId: string,
        parentId: string,
        targetId: string,
        closestTo: "start" | "end"
    ) => void;
    mergeBlock: (block: Block) => {
        prevTitle: string;
        newTitle: string;
        mergeResult: Block;
    };
    removeBlock: (blockId: string) => Block;
    turnBlockInto: (blockId: string, blockType: string) => Block;
    updateBlock: (updatedBlock: Block) => void;
}

const BlocksContext = createContext<BlocksContext>({
    blocks: {},
    rootBlockId: "",
    focusedBlockId: "",
    setFocusedBlockId: () => null,
    insertBlock: () => null,
    splitBlock: () => null,
    moveBlocks: () => null,
    mergeBlock: () => null,
    removeBlock: () => null,
    turnBlockInto: () => null,
    updateBlock: () => null
});

function useBlocksContext() {
    const blocksContext = useContext(BlocksContext);
    if (!blocksContext) {
        throw new Error("useBlocksContext must be used within a BlocksContextProvider");
    }
    return blocksContext;
}

function useBlock(blockId: string) : Block {
    const { blocks } = useBlocksContext();
    return blocks[blockId];
}

function BlocksProvider({ children, defaultBlocks, rootBlockId }: any) {
    const [blocks, setBlocks] = useState(defaultBlocks);
    const [focusedBlockId, setFocusedBlockId] = useState(rootBlockId);

    /** POC: Rendering order state (Related to the flat out root block improvement).
     * const [renderingOrder, setRenderingOrder] = useState<string[]>([parentBlock.id, ...parentBlock.content]);
     */

    /** Block actions
     * Note: I might change all this actions to reducers. reducers can be exported!
     */
    
    /**
     *  Inserts a block into the content array of the parent block. If a position object is provided, the block will be inserted at the specified position.
     */
    function insertBlock(newBlock: Block, position?: { prevBlockId?: string | undefined, nextBlockId?: string | undefined }) {
        const updatedBlock = updateBlockData(blocks[newBlock.parent], {
            content: insertBlockIdIntoContent(blocks[newBlock.parent].content, newBlock.id, position)
        });
        setBlocks(prevState => ({
            ...prevState,
            [newBlock.parent]: updatedBlock,
            [newBlock.id]: newBlock
        }));
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

        // If splitting root block, insert new text block below
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
            setBlocks({
                ...blocks,
                [newBlock.id]: newBlock, // new block
                [updatedParentBlock.id]: updatedParentBlock // source and parent block
            });

            /** Review */
            return {
                splitResult: newBlock,
                updatedBlock: updatedParentBlock
            }
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
            const updatedParentBlock = updateBlockData(blocks[block.parent], {
                content: insertBlockIdIntoContent(blocks[block.parent].content, newBlock.id, {
                    nextBlockId: block.id
                })
            });

            setBlocks(prevState => ({
                ...prevState,
                [newBlock.id]: newBlock,    // new block
                [block.id]: updatedBlock, // source block
                [block.parent]: updatedParentBlock // parent block
            }));

            /** Review */
            return {
                splitResult: updatedBlock,
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
    function mergeBlock(block: Block) {
        const sourceBlock = block;
        const parentBlock = blocks[sourceBlock.parent];
        const sourceBlockContentIndex = parentBlock.content.indexOf(sourceBlock.id);
        const isFirstChild = sourceBlockContentIndex === 0;
        /** Note: The following isn't considering the posibility of the target block not being a text block.
         * In said case the target block should be the last know text based block. 
         * 
         * Actually: If the source block is nested inside another block, the source block should be 
         * taken out of the content array and be placed as a sibling of it's parent block.
         * This should be repeated until the source block is a direct child of the root block.
         * Once it is a child of the rootblock it should be merged with the last child text block inside its previous block tree.
         * 
         * 
         * */
        const targetBlock = isFirstChild
            ? parentBlock
            : findPrevTextBlockInContent(sourceBlock, blocks, parentBlock.content);

        const sourceBlockText = sourceBlock.properties.title;
        const targetBlockText = targetBlock.properties.title;

        // If the block to merge with is the parent block (this can only happen for root block at the moment)
        if (targetBlock.id === parentBlock.id) {
            /** Remove source block from parent's content array and update title property. */
            const updatedParentBlock = updateBlockData(parentBlock, {
                properties: {
                    title: targetBlockText + sourceBlockText
                },
                content: parentBlock.content.filter((id: string) => id !== sourceBlock.id)
            });

            setBlocks(prevState => {
                const newBlocks = { ...prevState };
                delete newBlocks[sourceBlock.id];
                newBlocks[updatedParentBlock.id] = updatedParentBlock;
                return newBlocks;
            });

            return {
                prevTitle: sourceBlockText,
                newTitle: targetBlockText + sourceBlockText,
                mergeResult: updatedParentBlock
            }

        } else {
            /** Remove target block from parent's content array. */
            const updatedParentBlock = updateBlockData(parentBlock, {
                content: parentBlock.content.filter((id: string) => id !== targetBlock.id)
            });

            /** Update source block  */
            const updatedSourceBlock = updateBlockData(sourceBlock, {
                type: targetBlock.type,
                properties: {
                    title: targetBlockText + sourceBlockText
                }
            });

            setBlocks(prev => {
                const newBlocks = { ...prev };
                delete newBlocks[sourceBlock.id];

                newBlocks[parentBlock.id] = updatedParentBlock;
                newBlocks[updatedSourceBlock.id] = updatedSourceBlock;

                return newBlocks;
            });

            return {
                prevTitle: sourceBlockText,
                newTitle: updatedSourceBlock.properties.title,
                mergeResult: updatedSourceBlock
            };
        }
    }

    function removeBlock(blockId: string) {
        const block = blocks[blockId];
        const parentBlock = blocks[block.parent];

        /** Update parent block's content array */
        const updatedParentBlock = updateBlockData(parentBlock, {
            content: parentBlock.content.filter((id: string) => id !== blockId)
        });

        setBlocks(prevState => {
            delete prevState[blockId];
            return {
                ...prevState,
                [updatedParentBlock.id]: updatedParentBlock
            }
        });

        return updatedParentBlock;
    }

    function moveBlocks(blockId: string, parentId: string, targetId: string, closestTo: "start" | "end") {
        const blockIndexInContent = blocks[parentId].content?.indexOf(blockId);
        const parentContent = blocks[parentId].content;
        parentContent.splice(blockIndexInContent, 1);
        const updatedBlock = updateBlockData(blocks[parentId], {
            content: insertBlockIdIntoContent(
                parentContent,
                blockId,
                closestTo === "start" ? { nextBlockId: targetId } : { prevBlockId: targetId }
            )
        })
            setBlocks(prevState => ({
            ...prevState,
            [parentId]: updatedBlock
        }));
    }

    /**
     * Note: Only text based blocks can be turned into other text based block types.
     */
    function turnBlockInto(blockId: string, blockType: string) {
        const updatedBlock = updateBlockData(blocks[blockId], {
            type: blockType
        });
        setBlocks(prevState => ({
            ...prevState,
            [blockId]: updatedBlock
        }));
        return updatedBlock;
    }

    function updateBlock(updatedBlock: Block) {
        setBlocks(prevState => ({
            ...prevState,
            [updatedBlock.id]: updatedBlock
        }));
    }

    const value = {
        blocks: blocks,
        rootBlockId,
        focusedBlockId,
        setFocusedBlockId,
        insertBlock,
        splitBlock,
        mergeBlock,
        removeBlock,
        moveBlocks,
        turnBlockInto,
        updateBlock
    }

    return (
        <BlocksContext.Provider value={value}>
            {children}
        </BlocksContext.Provider>
    )

}

export { BlocksProvider, useBlocksContext, useBlock, BlocksContext };