import {
    useTextInput,
    useBlocksContext,
    findPrevTextBlockInContent,
    useTextBlocksContext,
    createBlock,

} from "@react-native-blocks/core";
import { View, TextInput, StyleSheet } from "react-native";
interface Props {
    blockId: string
}

export function TextBlock({ blockId } : Props) {
    const { getTextInputProps, getValue, getSelection } = useTextInput(blockId);
    const { inputRefs, textBasedBlocks } = useTextBlocksContext();
    const {
        blocks,
        insertBlock,
        updateBlock,
        updateBlockV2,
        removeBlock
    } = useBlocksContext();

    const handleSubmitEditing = () => {
        const value = getValue();
        const selection = getSelection();

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

        const newBlock = createBlock({
            type: "text",
            properties: {
                title: textAfterSelection
            },
            parent: blocks[blockId].parent,
            content: []
        });

       updateBlockV2(blockId, {
            properties: {
                title: textBeforeSelection
            }
         });

       insertBlock(newBlock, {
           prevBlockId: blockId
       });

       requestAnimationFrame(() => {
           inputRefs.current[blockId]?.current.setText(textBeforeSelection);
           inputRefs.current[newBlock.id]?.current.setSelection({
               start: 0,
               end: 0
           });
           inputRefs.current[newBlock.id]?.current.focus();
       });
    }

   const handleOnKeyPress = (event: { nativeEvent: { key: string; }; }) => {
        const value = getValue();
        const selection = getSelection();

        if (event.nativeEvent.key === "Backspace" && selection.start === 0 && selection.end === 0) {
            // findPrevTextBlock
            const previousTextBlock = findPrevTextBlockInContent(blockId, blocks, textBasedBlocks);
            
            updateBlockV2(previousTextBlock.id, {
                properties: {
                    title: previousTextBlock.properties.title + value
                }
            });
            removeBlock(blockId);

            requestAnimationFrame(() => {
                inputRefs.current[previousTextBlock.id]?.current.setText(previousTextBlock.properties.title + value);
                inputRefs.current[previousTextBlock.id]?.current.setSelection({
                    start: previousTextBlock.properties.title.length,
                    end: previousTextBlock.properties.title.length
                })
                inputRefs.current[previousTextBlock.id]?.current.focus();
            });
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                // ref={inputRef} ??? 
                key={`input-${blockId}`}   // Really important to pass the key prop
                style={styles.text}
                {...getTextInputProps()}
                onKeyPress={handleOnKeyPress}
                onSubmitEditing={handleSubmitEditing}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8
    },
    text: {
        fontSize: 16,
        fontWeight: "normal",
        paddingVertical: 6,
        lineHeight: 24,
        flexWrap: "wrap"
    }
});