import { Pressable, Text, View, StyleSheet, Dimensions } from "react-native";
import { useBlocksContext } from "../../Blocks/BlocksContext";
import { useFooterContext } from "../Footer";
import { Block } from "../../../interfaces/Block.interface";
import { useTextBlocksContext } from "../../TextBlocksProvider";
import { use } from "react";

const { width } = Dimensions.get("window");

export default function InsertBlockSection() {
    const { inputRefs, setShowSoftInputOnFocus } = useTextBlocksContext();
    const { blocks, focusedBlockId, insertBlock } = useBlocksContext();

    const handleInsertBlock = (blockType: string) => {
        setShowSoftInputOnFocus(true);
        const newBlock = new Block({
            type: blockType,
            properties: {
                title: ""
            },
            content: [],
            parent: blocks[focusedBlockId].parent
        });

        // note: remember that the root block has no value for parent attribute.
        insertBlock(newBlock, {
            prevBlockId: focusedBlockId
        })

        // Focus new block
        requestAnimationFrame(() => {
            inputRefs.current[newBlock.id]?.current.focus();
        });
    }

    return (
        <>
            <View style={styles.blockOptionsRow}>
                <Text>Blocks</Text>
            </View>

            <View style={styles.blockOptionsRow}>
                <Pressable style={({ pressed}) => ([{
                    opacity: pressed ? 0.5 : 1
                }, styles.blockOptions])} onPress={() => handleInsertBlock("text")}>
                    <Text>Text</Text>
                </Pressable>

                <Pressable style={({ pressed}) => ([{
                    opacity: pressed ? 0.5 : 1
                }, styles.blockOptions])} onPress={() => handleInsertBlock("header")}>
                    <Text>Heading 1</Text>
                </Pressable>
            </View>

            <View style={styles.blockOptionsRow}>
                <Pressable style={({ pressed}) => ([{
                    opacity: pressed ? 0.5 : 1
                }, styles.blockOptions])} onPress={() => handleInsertBlock("sub_header")}>
                    <Text>Heading 2</Text>
                </Pressable>

                <Pressable style={({ pressed}) => ([{
                    opacity: pressed ? 0.5 : 1
                }, styles.blockOptions])} onPress={() => handleInsertBlock("sub_sub_header")}>
                    <Text>Heading 3</Text>
                </Pressable>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    blockOptionsRow: {
        flexDirection: "row",
        marginBottom: 8,
        gap: 4
    },
    blockOptions: {
        backgroundColor: "white",
        height: 50,
        width: width / 2 - 20,
        borderRadius: 8,
        justifyContent: "center",
        paddingHorizontal: 16,
        boxSizing: "border-box",
        boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.1)",
    },
    blockOptionsText: {
        fontSize: 16,
        fontWeight: "bold",
    }
});