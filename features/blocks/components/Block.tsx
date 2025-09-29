import { useContext, useState, useRef, useEffect } from "react";
import { BlocksContext } from "../../blocks/context/BlocksContext";
import { Text, View, StyleSheet, TextInput, Keyboard } from "react-native";
import { useDetectKeyPress } from "../hooks/useDetectKeyPress";
import { useKeyboardStatus } from "../hooks/useKeyboardStatus";
import { Block } from "../interfaces/Block.interface";

interface Props {
    blockId: string;
}

export default function BlockElement({ blockId } : Props) {
    const textInputRef = useRef<TextInput>(null);
    const {
        blocks,
        setBlocks,
        removeBlock,
        addBlock,
        registerRef,
        unregisterRef,
        focus
    } = useContext(BlocksContext);
    const blockData = blocks[blockId];
    const parentBlock = blocks[blockData.parent];
    const isLastChild = parentBlock.content.indexOf(blockId) === parentBlock.content.length - 1;

    useEffect(() => {
        registerRef(blockId, textInputRef);
        return () => unregisterRef(blockId);
    }, [blockId]);

    const handleOnChange = (newValue: string) => {
        setBlocks({
            ...blocks,
            [blockId]: {
                ...blocks[blockId],
                properties: {
                    ...blocks[blockId].properties,
                    title: newValue
                }
            }
        });
    }

    const handleRemoveTextBlockOnBackspacePress = ({ nativeEvent }) => {
        if (nativeEvent.key === "Backspace" && blockData.properties.title === "") {
            const siblings = parentBlock.content;
            const index = siblings.indexOf(blockId);
            const prevBlockId = siblings[index - 1];

            if (prevBlockId) {
                focus(prevBlockId);
            }

            requestAnimationFrame(() => {
                removeBlock(blockData);
            });
        }
    }

    const handleSubmitEditing = () => {
        const siblings = parentBlock.content;
        const index = siblings.indexOf(blockId);
        let newBlock = addBlock(new Block("parapraph", { title: "" }, [], blockData.parent, blockData.parent_table), index + 1);
        const nextBlockId = newBlock.id;
        focus(nextBlockId);
    }

    return (
        <View style={styles.container}>
            <TextInput
                ref={textInputRef}
                style={styles.input}
                onChangeText={handleOnChange}
                onKeyPress={handleRemoveTextBlockOnBackspacePress}
                onSubmitEditing={handleSubmitEditing}
                autoFocus={(Keyboard.isVisible() || blockData.properties.title === "") && isLastChild}
                submitBehavior="submit"
            >
                {blockData.properties.title}
            </TextInput>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingLeft: 8,
        minHeight: 44,
        justifyContent: "center"
    },
    input: {
        height: 44
    }
});