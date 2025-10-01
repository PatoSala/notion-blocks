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

export default function NoteScreen() {
    const insets = useSafeAreaInsets();
    const refs = useRef({});
    const { isKeyboardOpen } = useKeyboardStatus();
    const pageId : string = "1";
    const [blocks, setBlocks] = useState(blocksData);
    const rootBlock : Block = blocks[pageId];
    const rootBlockLastChild : Block = blocks[rootBlock.content[rootBlock.content.length - 1]];

    const contextValue = {
        blocks,
        setBlocks,
        updateBlock: (block: Block, contentIndex?: number) => {
            setBlocks({
                ...blocks,
                [block.id]: block
            });
        },
        addBlock: (block: Block, contentIndex: number) => {

            // Update parent content
            let parentBlock = blocks[block.parent];
            if (contentIndex === undefined) {
                parentBlock.content.push(block.id);
            } else {
                parentBlock.content.splice(contentIndex, 0, block.id);
            }
            setBlocks({
                ...blocks,
                [block.parent]: parentBlock, // Set updated parent
                [block.id]: block // Set new block
            });
            return block;
        },
        splitBlock: (block: Block, selection,) => {
            const originalBlock = blocks[block.id];
            const textBeforeSelection = originalBlock.content.slice(0, selection.start);
            const textAfterSelection = originalBlock.content.slice(selection.end);
            contextValue.updateBlock({
                ...originalBlock,
                properties: {
                    ...originalBlock.properties,
                    title: textBeforeSelection
                }
            })
            const newBlock = new Block({
                type: originalBlock.type,
                properties: {
                    title: textAfterSelection
                },
                content: [],
                parent: originalBlock.parent
            });
            contextValue.addBlock(newBlock);
            
            return newBlock;
        },
        removeBlock: (block: Block) => {
            let parentBlock = blocks[block.parent];
            parentBlock.content.splice(parentBlock.content.indexOf(block.id), 1);
            setBlocks({
                ...blocks,
                [block.parent]: parentBlock,
                [block.id]: block
            });
        },
        textInputRefs: refs,
        registerRef: (id, ref) => {
            refs.current[id] = ref;
        },
        unregisterRef: (id) => {
            delete refs.current[id];
        },
        /**
         * @param {string} id - The id of the block to focus
         * @param {object} selection - The selection to set
         */
        focus: (id: string, selection: object) => {
            selection ? refs.current[id]?.current?.setSelection(selection) : null;
            refs.current[id]?.current?.focus();
        }
    }

    const handleNewLineBlock = () => {
        const newBlock = new Block({
            type: "text",
            properties: {
                title: ""
            },
            content: [],
            parent: pageId
        });

        // If there are no blocks
        if (rootBlock.content.length === 0) {
            contextValue.addBlock(newBlock, 0);
            return;
        }

        // If the last block is not empty
        if (rootBlockLastChild?.properties.title.length > 0) {
            contextValue.addBlock(newBlock);
            return;
        }

        requestAnimationFrame(() => {
            refs.current[rootBlockLastChild.id]?.current?.focus();
        })
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <BlocksContext value={contextValue}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top }}
                    keyboardShouldPersistTaps="always"
                >
                    <TextInput style={styles.pageTitle}>{rootBlock.properties.title}</TextInput>

                    {rootBlock.content.length > 0 && rootBlock.content.map((blockId: string) => {
                        return <BlockElement key={blockId} blockId={blockId}/>
                    })}
                    
                    <Pressable
                        style={{
                            flex: 1,
                            backgroundColor: "red"
                        }}
                        onPress={handleNewLineBlock}
                    />
                </ScrollView>
            </BlocksContext>
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