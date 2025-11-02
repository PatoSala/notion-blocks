import { createContext, RefObject, useContext, useRef, useState } from "react";
import { Block } from "../../interfaces/Block.interface";
import { updateBlock as updateBlockData, insertBlockIdIntoContent, findPrevTextBlockInContent } from "../../core";

interface BlocksContext {
    blocks: RefObject<Record<string, Block>>;
    blocksOrder: string[];
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

    function splitBlockV2(block: Block, selection: { start: number, end: number }) {
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
            console.log("NEW BLOCK", blocksRef.current[newBlock.id]);
            blocksRef.current[updatedParentBlock.id] = updatedParentBlock;
            console.log("CONTENT AFTER SPLIT: ", updatedParentBlock.content)
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
            setBlocks(prevState => ({
                ...prevState,
                [newBlock.id]: newBlock, 
                [updatedParentBlock.id]: {
                    ...prevState[updatedParentBlock.id],
                    ...updatedParentBlock.properties,
                    ...updatedParentBlock.content
                }
            }));

            /** Review */
            /* return {
                splitResult: newBlock,
                updatedBlock: updatedParentBlock,
                updatedParentBlock: updatedParentBlock
            } */

            return {
                prevBlock: updatedParentBlock,
                nextBlock: newBlock
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
                [block.id]: {
                    ...prevState[block.id],
                    type: updatedBlock.type,
                    ...updatedBlock.properties
                }, // source block
                [block.parent]: {
                    ...prevState[block.parent],
                    ...updatedParentBlock.content
                } // parent block
            }));

            console.log("updatedBlock", updatedBlock);
            console.log("updatedParentBlock", updatedParentBlock);

            /** Review */
            return {
                prevBlock: newBlock,
                nextBlock: updateBlock
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
    function mergeBlockV2(block: Block, targetBlockId: string) {
        console.log("MERGE");

        const sourceBlock = block;
        const parentBlock = blocksRef.current[sourceBlock.parent];
        const targetBlock = blocksRef.current[targetBlockId];

        const sourceBlockText = sourceBlock.properties.title;
        const targetBlockText = blocksRef.current[targetBlockId].properties.title;

        if (targetBlock.id === rootBlockId) {
            console.log("MERGFE WITHG ROOT BLOCK");
            const updatedParentBlock = updateBlockData(parentBlock, {
                properties: {
                    title: targetBlockText + sourceBlockText
                },
                content: parentBlock.content.filter((id: string) => id !== sourceBlock.id)
            });

            blocksRef.current[targetBlock.id] = updatedParentBlock;
            console.log("CONTENT AFTER MERGE: ", updatedParentBlock.content);
            setBlocksOrder([targetBlock.id, ...blocksRef.current[targetBlock.id].content]);

            return {
                prevTitle: sourceBlockText,
                newTitle: updatedParentBlock.properties.title,
                mergeResult: updatedParentBlock
            };
        } else {
            /** Remove target block from parent's content array. */
            const updatedParentBlock = updateBlockData(parentBlock, {
                content: parentBlock.content.filter((id: string) => id !== targetBlockId)
            });

            /** Update source block  */
            const updatedSourceBlock = updateBlockData(sourceBlock, {
                type: targetBlock.type,
                properties: {
                    title: targetBlockText + sourceBlockText
                }
            });

            blocksRef.current[sourceBlock.id] = updatedSourceBlock;
            blocksRef.current[parentBlock.id] = updatedParentBlock;
            console.log("CONTENT AFTER MERGE: ", updatedParentBlock.content);

            setBlocksOrder(prevState => prevState.filter((id: string) => id !== targetBlockId));

            return {
                prevTitle: sourceBlockText,
                newTitle: updatedSourceBlock.properties.title,
                mergeResult: updatedSourceBlock
            };
        }
    }

    function mergeBlock(block: Block, targetBlockId: string) {
        const sourceBlock = block;
        const parentBlock = blocks[sourceBlock.parent];
        const targetBlock = blocks[targetBlockId];
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
        const sourceBlockText = sourceBlock.properties.title;
        const targetBlockText = blocks[targetBlockId].properties.title;

        // If the block to merge with is the parent block (this can only happen for root block at the moment)
        // First if - deprecated
        if (targetBlockId === parentBlock.id) {
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
                content: parentBlock.content.filter((id: string) => id !== targetBlockId)
            });

            /** Update source block  */
            const updatedSourceBlock = updateBlockData(sourceBlock, {
                type: targetBlock.type,
                properties: {
                    title: targetBlockText + sourceBlockText
                }
            });

            setBlocks(prevState => ({
                    ...prevState,
                    [parentBlock.id]: {
                        ...prevState[parentBlock.id],
                        content: updatedParentBlock.content
                    },
                    [updatedSourceBlock.id]: {
                        ...prevState[updatedSourceBlock.id],
                        type: updatedSourceBlock.type,
                        properties: updatedSourceBlock.properties
                    }
                }));

            return {
                prevTitle: sourceBlockText,
                newTitle: updatedSourceBlock.properties.title,
                mergeResult: updatedSourceBlock
            };
        }
    }

    function removeBlockV2(blockId: string) {
        delete blocksRef.current[blockId];
        setBlocksOrder(prevState => prevState.filter((id: string) => id !== blockId));
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
                [updatedParentBlock.id]: {
                    ...prevState[updatedParentBlock.id],
                    content: updatedParentBlock.content
                }
            }
        });

        return updatedParentBlock;
    }

    const moveBlockV2 = (blockId: string, parentId: string, targetId: string, closestTo: "start" | "end") => {
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
            [parentId]: {
                ...prevState[parentId],
                content: updatedBlock.content
            }
        }));
    }

    /**
     * Note: Only text based blocks can be turned into other text based block types.
     */
    function turnBlockInto(blockId: string, blockType: string) {
        const updatedBlock = updateBlockData(blocksRef.current[blockId], {
            type: blockType
        });
        blocksRef.current[updatedBlock.id] = updatedBlock;
        setBlocksOrder(prevState => [...prevState]); // re render blocks
        return updatedBlock;
    }

    function updateBlock(updatedBlock: Block) {
        blocksRef.current[updatedBlock.id] = updatedBlock;
        /* setBlocks(prevState => ({
            ...prevState,
            [updatedBlock.id]: updatedBlock
        })); */
    }

    const value = {
        blocks: blocksRef.current,
        blocksOrder,
        rootBlockId,
        focusedBlockId,
        setFocusedBlockId,
        insertBlock,
        updateBlock,
        turnBlockInto,
        splitBlock: splitBlockV2,
        mergeBlock: mergeBlockV2,
        removeBlock: removeBlockV2,
        moveBlock: moveBlockV2
        /* insertBlock,
        splitBlock,
        mergeBlock,
        removeBlock,
        moveBlocks,
        turnBlockInto,
        updateBlock */
    }

    return (
        <BlocksContext.Provider value={value}>
            {children}
        </BlocksContext.Provider>
    )

}

export { BlocksProvider, useBlocksContext, useBlock, BlocksContext };