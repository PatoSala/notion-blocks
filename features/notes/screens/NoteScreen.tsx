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
    Platform
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
        updateBlock: (block: Block) => {
            setBlocks({
                ...blocks,
                [block.id]: block
            });
        },
        addBlock: (block: Block, contentIndex: number) => {
            let parentBlock = blocks[block.parent];
            if (contentIndex === undefined) {
                parentBlock.content.push(block.id);
            } else {
                parentBlock.content.splice(contentIndex, 0, block.id);
            }
            setBlocks({
                ...blocks,
                [block.parent]: parentBlock,
                [block.id]: block
            });
            return block;
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
        registerRef: (id, ref) => {
            refs.current[id] = ref;
        },
        unregisterRef: (id) => {
            delete refs.current[id];
        },
        focus: (id) => {
            refs.current[id]?.current?.focus();
        }
    }

    const handleNewLineBlock = () => {
        if (rootBlock.content.length === 0) {
            const newBlock = new Block({
                type: "text",
                properties: {
                    title: ""
                },
                content: [],
                parent: pageId
            });
            setBlocks({
                ...blocks,
                [pageId]: {
                    ...blocks[pageId],
                    content: [...blocks[pageId].content, newBlock.id]
                },
                [newBlock.id]: newBlock
            });
            return;
        }

        if (rootBlockLastChild?.properties.title.length > 0) {
            const newBlock = new Block({
                type: "text",
                properties: {
                    title: ""
                },
                content: [],
                parent: pageId
            });
            setBlocks({
                ...blocks,
                [pageId]: {
                    ...blocks[pageId],
                    content: [...blocks[pageId].content, newBlock.id]
                },
                [newBlock.id]: newBlock
            });
            return;
        }

        refs.current[rootBlockLastChild.id]?.current?.focus();
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
                    <TextInput style={styles.pageTitle}>{blocks[pageId].properties.title}</TextInput>

                    {blocks[pageId].content.map((blockId: string) => {
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