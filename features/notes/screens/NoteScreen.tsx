import { useRef } from "react";
import {
    StyleSheet,
    ScrollView,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    Alert
} from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeyboardStatus } from "../../blocks/hooks/useKeyboardStatus";
import { blocksData } from "../utils/initialBlocks";
import { Block  } from "../../blocks/interfaces/Block.interface";
import BlockElement from "../../blocks/components/Block";
import Footer from "../components/Footer";
import { updateBlock, insertBlockIdIntoContent } from "../../blocks/core/updateBlock";

export default function NoteScreen() {
    const insets = useSafeAreaInsets();
    const refs = useRef({});
    const { isKeyboardOpen } = useKeyboardStatus();
    const pageId : string = "1";
    const [blocks, setBlocks] = useState(blocksData);
    const rootBlock : Block = blocks[pageId];

    /** Editor state actions */
    function registerRef(blockId: string, ref: any) {
        refs.current[blockId] = ref;
    }

    function unregisterRef(blockId: string) {
        delete refs.current[blockId];
    }

    /** Block actions */
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

    function splitBlock(block: Block, selection: { start: number, end: number }) {
        const textBeforeSelection = block.properties.title.substring(0, selection.start);
        const textAfterSelection = block.properties.title.substring(selection.end);
        const updatedBlock = updateBlock(block, {
            properties: {
                title: textBeforeSelection
            }
        });
        const newBlock = new Block({
            type: block.type,
            properties: {
                title: textAfterSelection
            },
            parent: block.parent,
        });
        const updatedParentBlock = updateBlock(blocks[block.parent], {
            content: insertBlockIdIntoContent(blocks[block.parent].content, newBlock.id, {
                prevBlockId: block.id
            })
        });

        setBlocks({
            ...blocks,
            [block.id]: updatedBlock,
            [newBlock.id]: newBlock,
            [block.parent]: updatedParentBlock
        });
    }

    function mergeBlock(block: Block) {
        const sourceBlock = block;
        const parentBlock = blocks[sourceBlock.parent];
        const sourceBlockContentIndex = parentBlock.content.indexOf(sourceBlock.id);
        const isFirstChild = sourceBlockContentIndex === 0;
        const targetBlock = isFirstChild
            ? parentBlock
            : blocks[parentBlock.content[sourceBlockContentIndex - 1]];

        // Join targetBlock text with sourceBlock text
        const sourceBlockText = sourceBlock.properties.title;
        const targetBlockText = targetBlock.properties.title;

        const copyOfBlocks = blocks;
        delete copyOfBlocks[sourceBlock.id];

        const updatedParentBlock = updateBlock(parentBlock, {
            content: parentBlock.content.filter((id: string) => id !== sourceBlock.id)
        });

        if (targetBlock.id === parentBlock.id) {

            const updatedTargetBlock = updateBlock(parentBlock, {
                properties: {
                    title: targetBlockText + sourceBlockText
                },
                content: updatedParentBlock.content
            });
            setBlocks({
                ...copyOfBlocks,
                [updatedTargetBlock.id]: updatedTargetBlock,
            });

        } else {
            const updatedTargetBlock = updateBlock(targetBlock, {
                properties: {
                    title: targetBlockText + sourceBlockText
                }
            });

            setBlocks({
                ...copyOfBlocks,
                [parentBlock.id]: updatedParentBlock,
                [updatedTargetBlock.id]: updatedTargetBlock
            });
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

    /** Event handlers */
    function handleOnChangeText(blockId: string, text: string) {
        const updatedBlock = updateBlock(blocks[blockId], {
            properties: {
                title: text
            }
        });
        setBlocks({ ...blocks, [blockId]: updatedBlock });
    }

    function handleOnKeyPress (event: { nativeEvent: { key: string; }; }, blockId: string, selection: { start: number, end: number }) {
        if (event.nativeEvent.key === "Backspace" && blocks[blockId].properties.title.length === 0) {
            const currentBlock = blocks[blockId];
            const parentBlock = blocks[currentBlock.parent];
            const currentBlockIndex = parentBlock.content?.indexOf(blockId);
            const isFirstChild = currentBlockIndex === 0;
            const prevBlockId = isFirstChild ? parentBlock.id : parentBlock.content[currentBlockIndex - 1];
            removeBlock(blockId);
            // Focus previous block
            refs.current[prevBlockId]?.current.focus();
            return;
        }

        if (event.nativeEvent.key === "Backspace" && blocks[blockId].properties.title.length > 0 && (selection.start === 0 && selection.end === 0)) {
            mergeBlock(blocks[blockId]);
        }
    }

    const handleSubmitEditing = (block: Block, selection: { start: number, end: number }) => {
        if (block.type === "page" && block.id === pageId) {
            // Handle differently
        }

        if (block.type === "text") {
            splitBlock(block, selection);
            // Focus new block
            const parentBlock = blocks[block.parent];
            const currentBlockIndex = parentBlock.content?.indexOf(block.id);
            const newBlockId = parentBlock.content[currentBlockIndex + 1];

            requestAnimationFrame(() => {
                refs.current[newBlockId]?.current.focusWithSelection({
                    start: 0,
                    end: 0
                });
            });
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

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top }}
                keyboardShouldPersistTaps="always"
            >
                <BlockElement
                    blockId={pageId}
                    block={rootBlock}
                    title={rootBlock.properties.title}
                    handleOnChangeText={handleOnChangeText}
                    handleSubmitEditing={handleSubmitEditing}
                    registerRef={registerRef}
                    unregisterRef={unregisterRef}
                />

                {rootBlock.content.length > 0 && rootBlock.content.map((blockId: string) => {
                    return <BlockElement
                        key={blockId}
                        blockId={blockId}
                        block={blocks[blockId]}
                        title={blocks[blockId].properties.title}
                        handleOnChangeText={handleOnChangeText}
                        handleSubmitEditing={handleSubmitEditing}
                        handleOnKeyPress={handleOnKeyPress}
                        registerRef={registerRef}
                        unregisterRef={unregisterRef}
                    />
                })}
                
                <Pressable
                    style={{
                        flex: 1,
                        backgroundColor: "red"
                    }}
                    onPress={handleNewLineBlock}
                />
            </ScrollView>
            {isKeyboardOpen && <Footer />}
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
    }
});