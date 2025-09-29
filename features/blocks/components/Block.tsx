import { useContext, useState } from "react";
import { BlocksContext } from "../../blocks/context/BlocksContext";
import { Text, View, StyleSheet, TextInput } from "react-native";
import { useDetectKeyPress } from "../hooks/useDetectKeyPress";
import { useKeyboardStatus } from "../hooks/useKeyboardStatus";
import { Block } from "../interfaces/Block.interface";

interface Props {
    blockId: string;
}

export default function BlockElement({ blockId } : Props) {
    const {
        blocks,
        setBlocks,
        removeBlock,
        addBlock,
        isKeyboardOpen
    } = useContext(BlocksContext);
    const blockData = blocks[blockId];
    const parentBlock = blocks[blockData.parent];
    const isLastChild = parentBlock.content.indexOf(blockId) === parentBlock.content.length - 1;

    console.log(blockData);

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
            removeBlock(blockData);
            return;
        }
    }

    const handleRemoveTextBlockOnBlur = () => {
        if (blockData.properties.title === "" && isLastChild) {
            removeBlock(blockData);
        }
    }

    const handleSubmitEditing = () => {
        addBlock(new Block("parapraph", { title: "" }, [], blockData.parent, blockData.parent_table));
    }

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                onChangeText={handleOnChange}
                onKeyPress={handleRemoveTextBlockOnBackspacePress}
                onBlur={handleRemoveTextBlockOnBlur}
                onSubmitEditing={handleSubmitEditing}
                autoFocus={isLastChild}
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