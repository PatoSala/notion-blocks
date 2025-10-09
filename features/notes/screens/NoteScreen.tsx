import { useRef, useState, useCallback } from "react";
import {
    StyleSheet,
    ScrollView,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    View,
    Text,
    FlatList
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeyboardStatus } from "../../blocks/hooks/useKeyboardStatus";
import { blocksData } from "../utils/initialBlocks";
import { sampleData } from "../utils/sampleData";
import { Block  } from "../../blocks/interfaces/Block.interface";
import BlockElement from "../../blocks/components/Block";
import Footer from "../components/Footer";
import { updateBlock, insertBlockIdIntoContent } from "../../blocks/core/updateBlock";

// Temporary
const textBasedBlockTypes = ["text", "header", "sub_header", "sub_sub_header"];

export default function NoteScreen() {
    const insets = useSafeAreaInsets();
    const refs = useRef({}); // TextInputs refs
    const pageId : string = "1";
    const [blocks, setBlocks] = useState(sampleData);
    const rootBlock : Block = blocks[pageId];
    const [focusedBlockId, setFocusedBlockId] = useState(null);

    /** Editor configs */
    const [showSoftInputOnFocus, setShowSoftInputOnFocus] = useState(true);
    const footerActions = [
        {
            key: "add-block",
            onPress: () => {
                /* setAddBlockMenuOpen(true); */
                Keyboard.dismiss();
                setShowSoftInputOnFocus(false);
                requestAnimationFrame(() => {
                    refs.current[focusedBlockId]?.current.focus();
                });
            },
            Icon:  <Ionicons name="add-outline" size={24} color="black" />
        },
        {
            key: "turn-block-into",
            onPress: () => {
                /* setTurnBlockIntoMenuOpen(true);
                setAddBlockMenuOpen(false); */
                Keyboard.dismiss();
                setShowSoftInputOnFocus(false);
                requestAnimationFrame(() => {
                    refs.current[focusedBlockId]?.current.focus();
                });
            },
            Icon:  <Ionicons name="repeat-outline" size={24} color="black" />
        }
    ]

    /** Editor state actions */
    function registerRef(blockId: string, ref: any) {
        refs.current[blockId] = ref;
    }

    function unregisterRef(blockId: string) {
        delete refs.current[blockId];
    }

    /** Block actions */

    /**
     * Note: Currently the function below it's only insering into the root block.
     */
    function insertBlock(newBlock: Block) {
        const updatedBlock = updateBlock(blocks[pageId], {
            content: insertBlockIdIntoContent(blocks[pageId].content, newBlock.id, {})
        });
        setBlocks({
            ...blocks,
            [pageId]: updatedBlock,
            [newBlock.id]: newBlock
        });
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
     * [Note: Review return statements]
     */
    function splitBlock(block: Block, selection: { start: number, end: number }) {
        const textBeforeSelection = block.properties.title.substring(0, selection.start);
        const textAfterSelection = block.properties.title.substring(selection.end);

        // If splitting root block, insert new text block below
        if (block.id === pageId) {
            const newBlock = new Block({
                type: "text",
                properties: {
                    title: textAfterSelection
                },
                parent: block.id,
            });

            // Update parent block's content array (which is the current block in this case)
            const updatedParentBlock = updateBlock(block, {
                properties: {
                    title: textBeforeSelection
                },
                content: insertBlockIdIntoContent(block.content, newBlock.id, {
                    nextBlockId: block.content[0]
                })
            });

            setBlocks({
                ...blocks,
                [block.id]: updatedParentBlock, // source and parent block
                [newBlock.id]: newBlock // new block
            });

            /** Review */
            return {
                splitResult: newBlock,
                updatedBlock: updatedParentBlock
            }
        } else {
            const updatedBlock = updateBlock(block, {
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
            const updatedParentBlock = updateBlock(blocks[block.parent], {
                content: insertBlockIdIntoContent(blocks[block.parent].content, newBlock.id, {
                    nextBlockId: block.id
                })
            });

            setBlocks({
                ...blocks,
                [block.id]: updatedBlock, // source block
                [newBlock.id]: newBlock,    // new block
                [block.parent]: updatedParentBlock // parent block
            });

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
        const targetBlock = isFirstChild
            ? parentBlock
            : blocks[parentBlock.content[sourceBlockContentIndex - 1]]; // The block before the source block.

        const sourceBlockText = sourceBlock.properties.title;
        const targetBlockText = targetBlock.properties.title;

        // If the block to merge with is the parent block
        if (targetBlock.id === parentBlock.id) {
            /** Remove target block from parent's content array and update title property. */
            const updatedParentBlock = updateBlock(parentBlock, {
                properties: {
                    title: targetBlockText + sourceBlockText
                },
                content: parentBlock.content.filter((id: string) => id !== sourceBlock.id)
            });

            /** Remove source block */
            const copyOfBlocks = blocks;
            delete copyOfBlocks[sourceBlock.id];

            setBlocks({
                ...copyOfBlocks,
                [updatedParentBlock.id]: updatedParentBlock,
            });

            return {
                prevTitle: sourceBlockText,
                newTitle: targetBlockText + sourceBlockText,
                mergeResult: updatedParentBlock
            }

        } else {
            /** Remove target block from parent's content array. */
            const updatedParentBlock = updateBlock(parentBlock, {
                content: parentBlock.content.filter((id: string) => id !== targetBlock.id)
            });

            /** Update source block  */
            const updatedSourceBlock = updateBlock(sourceBlock, {
                type: targetBlock.type,
                properties: {
                    title: targetBlockText + sourceBlockText
                }
            });

            /** Remove target block */
            const copyOfBlocks = blocks;
            delete copyOfBlocks[targetBlock.id]

            /** Update state with changes */
            setBlocks({
                ...copyOfBlocks,
                [parentBlock.id]: updatedParentBlock,
                [updatedSourceBlock.id]: updatedSourceBlock
            });

            return {
                prevTitle: sourceBlockText,
                newTitle: updatedSourceBlock.properties.title,
                mergeResult: updatedSourceBlock
            }
        }
    }

    function removeBlock(blockId: string) {
        const block = blocks[blockId];
        const parentBlock = blocks[block.parent];

        const blocksState = blocks;
        delete blocksState[blockId];

        /** Update parent block's content array */
        const updatedParentBlock = updateBlock(parentBlock, {
            content: parentBlock.content.filter((id: string) => id !== blockId)
        });

        setBlocks({
            ...blocksState,
            [updatedParentBlock.id]: updatedParentBlock
        });
    }

    function moveBlocks() {}

    /**
     * Note: Only text based blocks can be turned into other block types.
     */
    function turnBlockInto(blockId: string, blockType: string) {
        const updatedBlock = updateBlock(blocks[blockId], {
            type: blockType
        });
        setBlocks({ ...blocks, [blockId]: updatedBlock });
        return updatedBlock;
    }

    /** Event handlers */
    function handleOnChangeText(blockId: string, text: string) {
        const updatedBlock = updateBlock(blocks[blockId], {
            properties: {
                title: text
            }
        });
        setBlocks({ ...blocks, [blockId]: updatedBlock });
    }

    function handleOnKeyPress (event: { nativeEvent: { key: string; }; }, block: Block, selection: { start: number, end: number }) {
        console.log(selection)
        if (block.id === pageId) return;
        /**
         * If block is not empty and cursor is at start, merge block with previous block.
         */
        if (event.nativeEvent.key === "Backspace" && (selection.start === 0 && selection.end === 0)) {
            const { prevTitle, newTitle, mergeResult } = mergeBlock(block);
            // Focus previous block here
            const newCursorPosition = newTitle.length - prevTitle.length;
            /* console.log("New cursor position: ", newCursorPosition); */
            requestAnimationFrame(() => {
                refs.current[mergeResult.id]?.current.focusWithSelection({
                    start: newCursorPosition,
                    end: newCursorPosition
                });
            })
            return;
        }
    }

    const handleSubmitEditing = (block: Block, selection: { start: number, end: number }) => {
        /* console.log("Splitting block...", block.id, selection); */
        // If block is current page (root block)
        if (block.type === "page" && block.id === pageId) {
            // Handle differently
            splitBlock(block, selection);

            let newBlockId = blocks[block.id].content[0];

            requestAnimationFrame(() => {
                refs.current[newBlockId]?.current.focusWithSelection({
                    start: 0,
                    end: 0
                });
            });
            return;
        }

        if (textBasedBlockTypes.includes(block.type)) {
            const { splitResult } = splitBlock(block, selection);
            
            /** 
             * In theory, If the new block is inserted before the current one focus wont be lost and should stay in the same position.
             * TextInput re-renders when changing its value through state.
             * The re-render resets cursor position at the end of the input.
             * To mantain cursor position we need to set selection before focusing.
             */
            requestAnimationFrame(() => {
                refs.current[splitResult.id]?.current.focusWithSelection({
                    start: 0,
                    end: 0
                });
            });
            return;
        }
    };

    const handleNewLineBlock = () => {
        if (rootBlock.content.length === 0 || blocks[rootBlock.content[rootBlock.content.length - 1]].properties.title.length > 0) {
            const newBlock = new Block({
                type: "text",
                properties: {
                    title: ""
                },
                content: [],
                parent: pageId
            });

            insertBlock(newBlock);
            // Focus new block
            requestAnimationFrame(() => {
                refs.current[newBlock.id]?.current.focus();
            });
        } else {
            // Focus new block
            requestAnimationFrame(() => {
                refs.current[rootBlock.content[rootBlock.content.length - 1]]?.current.focus();
            });
        }
    }

    /* Editor actions */
    const handleInsertNewBlock = (prevBlockId: string, blockType: string) => {
        const newBlock = new Block({
            type: blockType,
            properties: {
                title: ""
            },
            content: [],
            parent: pageId
        });

        // note: remember that the root block has no value for parent attribute.
        const parentBlock = blocks[prevBlockId].parent;
        const updateParentBlock = updateBlock(blocks[parentBlock], {
            content: insertBlockIdIntoContent(blocks[parentBlock].content, newBlock.id, {
                prevBlockId: prevBlockId
            })
        });

        setBlocks({
            ...blocks,
            [updateParentBlock.id]: updateParentBlock,
            [newBlock.id]: newBlock
        });

        // Focus new block
        requestAnimationFrame(() => {
            refs.current[newBlock.id]?.current.focus();
        });
    }

    const handleTurnBlockInto = (blockId: string, blockType: string) => {
        const updatedBlock = turnBlockInto(blockId, blockType);
        // Focus new block
        requestAnimationFrame(() => {
            refs.current[updatedBlock.id]?.current.focus();
        });
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <FlatList
                contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top, paddingHorizontal: 8 }}
                data={rootBlock.content}
                keyboardShouldPersistTaps="always"
                ListHeaderComponent={<BlockElement
                        key={pageId}
                        blockId={pageId}
                        block={rootBlock}
                        /* title={rootBlock.properties.title} */
                        handleOnChangeText={handleOnChangeText}
                        handleSubmitEditing={handleSubmitEditing}
                        handleOnKeyPress={handleOnKeyPress}
                        showSoftInputOnFocus={showSoftInputOnFocus}
                        registerRef={registerRef}
                        unregisterRef={unregisterRef}
                        onFocus={() => {
                            setFocusedBlockId(rootBlock.id);
                        }}
                    />}
                renderItem={({ item }) => {
                    const blockId = item;
                    return (
                        <BlockElement
                            key={blockId}
                            item={item}
                            blockId={blockId}
                            block={blocks[blockId]}
                            /* title={blocks[blockId].properties.title} */
                            handleOnChangeText={handleOnChangeText}
                            handleSubmitEditing={handleSubmitEditing}
                            handleOnKeyPress={handleOnKeyPress}
                            showSoftInputOnFocus={showSoftInputOnFocus}
                            registerRef={registerRef}
                            unregisterRef={unregisterRef}
                            onFocus={() => {
                                setFocusedBlockId(blockId);
                            }}
                        />
                    )
                }}
                ListFooterComponent={() => (
                    <Pressable
                        style={{
                            flexGrow: 1,
                            height: "100%",
                        }}
                        onPress={handleNewLineBlock}
                    />
                )}
            />

            <Footer 
                actions={footerActions}
                setShowSoftInputOnFocus={setShowSoftInputOnFocus}
                focusedBlockRef={refs.current[focusedBlockId]}
                focusedBlockId={focusedBlockId}
                handleInsertBlock={handleInsertNewBlock}
                handleTurnBlockInto={handleTurnBlockInto}
            />
        </KeyboardAvoidingView>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginLeft: 8
    },
    blockOptionsContainer: {
        backgroundColor: "#f5f5f5",
        padding: 16
    },
    blockOptionsRow: {
        flexDirection: "row",
        marginBottom: 8,
    },
    blockOptions: {
        backgroundColor: "white",
        height: 50,
        minWidth: "50%",
        borderRadius: 8,
        justifyContent: "center",
        paddingHorizontal: 16,
        boxSizing: "border-box",
        boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.1)"
    },
    blockOptionsText: {
        fontSize: 16,
        fontWeight: "bold",
    }
});