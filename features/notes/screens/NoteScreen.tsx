import { useRef } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    Pressable,
    Keyboard,
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
import { BlocksContext } from "../../blocks/context/BlocksContext";
import * as Crypto from 'expo-crypto';
import { updateBlock, insertBlockIdIntoContent } from "../../blocks/core/updateBlock";

export default function NoteScreen() {
    const insets = useSafeAreaInsets();
    const refs = useRef({});
    const { isKeyboardOpen } = useKeyboardStatus();
    const pageId : string = "1";
    const [blocks, setBlocks] = useState(blocksData);
    console.dir(blocks);
    const [editorState, setEditorState] = useState({});
    const rootBlock : Block = blocks[pageId];

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
            parent_table: block.parent_table
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

    function moveBlock() {}

    /** Event handlers */
    function handleOnChangeText(blockId: string, text: string) {
        const updatedBlock = updateBlock(blocks[blockId], {
            properties: {
                title: text
            }
        });
        setBlocks({ ...blocks, [blockId]: updatedBlock });
    }

    function handleOnKeyPress (event: { nativeEvent: { key: string; }; }, blockId: string) {
        if (event.nativeEvent.key === "Backspace" && blocks[blockId].properties.title.length === 0) {
            removeBlock(blockId);
        }
    }

    const handleSubmitEditing = (block: Block, selection: { start: number, end: number }) => {
        if (block.type === "page" && block.id === pageId) {
            // Handle differently
        }

        if (block.type === "text") {
            splitBlock(block, selection);
        }
    };

    const handleNewLineBlock = () => {
        const newBlock = new Block({
            type: "text",
            properties: {
                title: ""
            },
            content: [],
            parent: pageId
        });

        insertBlock(newBlock);
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
                    /* handleOnBlur={handleOnBlur} */
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