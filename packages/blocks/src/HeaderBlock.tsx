import { useTextInput, useBlocksContext, useTextBlocksContext, createBlock, updateBlockData } from "@react-native-blocks/core";
import { View, TextInput, StyleSheet } from "react-native";
import { useEffect } from "react";
interface Props {
    blockId: string
}

export function HeaderBlock({ blockId } : Props) {
    const { getTextInputProps, isFocused, getValue, getSelection } = useTextInput(blockId); // Maybe in the future we can pass a ref to use useImperativeHandle
    const {
        blocks,
        turnBlockInto,
        insertBlock,
        updateBlock,
    } = useBlocksContext();
    /* const block = getBlockSnapshot(blockId); */
    const { inputRefs } = useTextBlocksContext();
    const placeholder = "Header 1";

    const handleSubmitEditing = () => {
        const value = getValue();
        const selection = getSelection();

        if (value.length === 0) {
            turnBlockInto(blockId, "text");
            requestAnimationFrame(() => {
                inputRefs.current[blockId]?.current.focus(); // Maybe the "ghostTextInput" hack should be done inside this function.
            });
            return;
        }

        if (selection.start === 0 && selection.end === 0) {
            const newBlock = createBlock({
                type: "text",
                properties: {
                    title: ""
                },
                parent: blocks[blockId].parent,
                content: []
            });

            insertBlock(newBlock, {
                nextBlockId: blockId
            });
            return;
        }

        if (selection.start === value.length && selection.end === value.length) {
            const newBlock = createBlock({
                type: "text",
                properties: {
                    title: ""
                },
                parent: blocks[blockId].parent,
                content: []
            });

            insertBlock(newBlock, {
                prevBlockId: blockId
            });

            requestAnimationFrame(() => {
                inputRefs.current[newBlock.id]?.current.focus();
            });
            return;
        }

        const textBeforeSelection = value.substring(0, selection.start);
        const textAfterSelection = value.substring(selection.end);

         const updatedBlock = updateBlockData(blocks[blockId], {
            properties: {
                title: textBeforeSelection
            }
         })
        const newBlock = createBlock({
            type: "text",
            properties: {
                title: textAfterSelection
            },
            parent: blocks[blockId].parent,
            content: []
        });

       updateBlock(updatedBlock);
       insertBlock(newBlock, {
           prevBlockId: blockId
       });

       requestAnimationFrame(() => {
           inputRefs.current[updatedBlock.id]?.current.setText(updatedBlock.properties.title);
           inputRefs.current[newBlock.id]?.current.setSelection({
               start: 0,
               end: 0
           });
           inputRefs.current[newBlock.id]?.current.focus();
       });
    }

    return (
        <View style={styles.container}>
            <TextInput
                // ref={inputRef}
                key={blockId}
                style={styles.header}
                {...getTextInputProps()}
                placeholder={placeholder}
                onSubmitEditing={handleSubmitEditing}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8
    },
    header: {
        fontWeight: "bold",
        fontSize: 28,
        marginTop: 32,
        marginBottom: 8,
        lineHeight: 34,
        flexWrap: "wrap"
    }
});