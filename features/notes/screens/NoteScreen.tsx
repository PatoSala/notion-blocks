import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { blocksData } from "../utils/initialBlocks";
import { Block  } from "../../blocks/interfaces/Block.interface";
import BlockElement from "../../blocks/components/Block";
import Footer from "../components/Footer";
import { useKeyboardStatus } from "../../blocks/hooks/useKeyboardStatus";
import { BlocksContext } from "../../blocks/context/BlocksContext";

export default function NoteScreen() {
    const insets = useSafeAreaInsets();
    const { isKeyboardOpen } = useKeyboardStatus();
    const pageId : string = "1";
    const [blocks, setBlocks] = useState(blocksData);
    const rootBlock : Block = blocks[pageId];
    const rootBlockLastChild : Block = blocks[rootBlock.content[rootBlock.content.length - 1]];

    const contextValue = {
        blocks,
        setBlocks,
        addBlock: (block: Block) => {
            let parentBlock = blocks[block.parent];
            parentBlock.content.push(block.id);
            setBlocks({
                ...blocks,
                [block.parent]: parentBlock,
                [block.id]: block
            });
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
        isKeyboardOpen
    }

    const handleNewLineBlock = () => {
        try {
            if (rootBlockLastChild.properties.title.length > 0) {
                const newBlock = new Block("parapraph", { title: "" }, [], pageId);
                setBlocks({
                    ...blocks,
                    [pageId]: {
                        ...blocks[pageId],
                        content: [...blocks[pageId].content, newBlock.id]
                    },
                    [newBlock.id]: newBlock
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}

        >
            <BlocksContext value={contextValue}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top }}
                >
                    <Text style={styles.pageTitle}>{blocks[pageId].properties.title}</Text>

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