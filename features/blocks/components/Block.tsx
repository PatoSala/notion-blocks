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
    const [selection, setSelection] = useState({ start: 0, end: 0 });


    const {
        blocks,
        setBlocks,
        updateBlock,
        removeBlock,
        addBlock,
        registerRef,
        unregisterRef,
        focus
    } = useContext(BlocksContext);
    const blockData = blocks[blockId];
    const parentBlock = blocks[blockData.parent];
    const isLastChild = parentBlock.content.indexOf(blockId) === parentBlock.content.length - 1;
    const [value, setValue] = useState(blockData.properties.title);

    useEffect(() => {
        registerRef(blockId, textInputRef);
        return () => unregisterRef(blockId);
    }, [blockId]);

    const handleOnBlur = () => {
        updateBlock({
            ...blockData,
            properties: {
                ...blockData.properties,
                title: value
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
        let newBlockIndex = index + 1;
        // If cursor at the start of the block
        if (selection.start === 0 && selection.end === 0) {
            newBlockIndex = index;
            console.log("Cursor at the start of the block");
        }

        // If cursor somewhere in between
        if ((selection.start === selection.end) && (selection.start > 0 && selection.end > 0) && (selection.start < blockData.properties.title.length && selection.end < blockData.properties.title.length)) {
            console.log("Cursor somewhere in between");
        };

        // If text is selected
        if (selection.start !== selection.end) {
            console.log("Text is selected");
            const textBeforeSelection = blockData.properties.title.slice(0, selection.start);
            console.log(textBeforeSelection);
            const textAfterSelection = blockData.properties.title.slice(selection.end);
            console.log(textAfterSelection);

           setValue(textBeforeSelection);
        }

        // If cursor at the end of the block
        if (selection.start === blockData.properties.title.length && selection.end === blockData.properties.title.length) {
            newBlockIndex = index + 1;
            console.log("Cursor at the end of the block");
        }
        let newBlock = addBlock(new Block({
            type: "text",
            properties: {
                title: ""
            },
            content: [],
            parent: blockData.parent,
            parent_table: blockData.parent_table
        }), newBlockIndex);
        
        if (selection.start === 0 && selection.end === 0) return;

        requestAnimationFrame(() => {
            focus(newBlock.id);
        });
    }

    return (
        <View style={styles.container}>
            <TextInput
                ref={textInputRef}
                value={value}
                style={styles.input}
                onChangeText={setValue}
                onBlur={handleOnBlur}
                onKeyPress={handleRemoveTextBlockOnBackspacePress}
                onSubmitEditing={handleSubmitEditing}
                autoFocus={(Keyboard.isVisible() || blockData.properties.title === "") && isLastChild}
                submitBehavior="submit"
                onSelectionChange={({ nativeEvent }) => setSelection(nativeEvent.selection)}
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