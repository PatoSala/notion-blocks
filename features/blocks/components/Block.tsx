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
        textInputRefs,
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
        if (nativeEvent.key === "Backspace") {
            const siblings = parentBlock.content;
            const index = siblings.indexOf(blockId);
            const prevBlockId = siblings[index - 1];

            if (value === "") {
                if (prevBlockId) {
                    focus(prevBlockId);
                }

                requestAnimationFrame(() => {
                    removeBlock(blockData);
                });
            }

            if (value.length > 0 && selection.start === 0 && selection.end === 0) {
                
                textInputRefs.current[prevBlockId].current.setNativeProps({
                    text: blocks[prevBlockId].properties.title + value,
                })

                if (prevBlockId) {
                    focus(prevBlockId);
                }

                requestAnimationFrame(() => {
                    removeBlock(blockData);
                });
                
            }
            
        }

        
    }

    const handleSubmitEditing = () => {
        const siblings = parentBlock.content;
        const index = siblings.indexOf(blockId);
        let newBlockIndex = index + 1;
        let newBlockProps = {
            type: "text",
            properties: {
                title: ""
            },
            parent: blockData.parent,
            parent_table: blockData.parent_table
        }

        // If cursor at the start of the block
        if (selection.start === 0 && selection.end === 0) {
            newBlockIndex = index;
        }

        // If cursor somewhere in between
        if ((selection.start === selection.end) && (selection.start > 0 && selection.end > 0) && (selection.start < value.length && selection.end < value.length)) {
            const textBeforeSelection = value.slice(0, selection.start);
            const textAfterSelection = value.slice(selection.end);
            newBlockProps.properties.title = textAfterSelection;
            setValue(textBeforeSelection);
        };

        // If text is selected
        if (selection.start !== selection.end) {
            const textBeforeSelection = value.slice(0, selection.start);
            const textAfterSelection = value.slice(selection.end);
            newBlockProps.properties.title = textAfterSelection;
            setValue(textBeforeSelection);
        }

        // If cursor at the end of the block
        if (selection.start === value.length && selection.end === value.length) {
            newBlockIndex = index + 1;
        }
        let newBlock = addBlock(new Block(newBlockProps), newBlockIndex);
        
        if (selection.start === 0 && selection.end === 0) return;

        requestAnimationFrame(() => {
            focus(newBlock.id);
        });
    }

    return (
        <View style={styles.container}>
            <TextInput
                ref={textInputRef}
                style={styles.input}
                value={value}
                onBlur={handleOnBlur}
                onChangeText={(text) => setValue(text)}
                onKeyPress={handleRemoveTextBlockOnBackspacePress}
                onSubmitEditing={handleSubmitEditing}
                autoFocus={(Keyboard.isVisible() || value === "") && isLastChild}
                onSelectionChange={({ nativeEvent }) => setSelection(nativeEvent.selection)}
            />
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