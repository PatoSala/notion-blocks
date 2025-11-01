import { Pressable, Text, View, StyleSheet, Dimensions } from "react-native";
import { useFooterContext } from "../Footer";
import { useTextBlocksContext } from "../../TextBlocksProvider";
import { useBlocksContext } from "../../Blocks/BlocksContext";

const { width } = Dimensions.get("window");

export default function ReplaceBlockSection() {
    const { inputRefs, setShowSoftInputOnFocus } = useTextBlocksContext();
    const { blocks, focusedBlockId, setFocusedBlockId, turnBlockInto } = useBlocksContext();
    const handleTurnBlockInto = (blockId: string, blockType: string) => {
        const updatedBlock = turnBlockInto(blockId, blockType);
        /* setFocusedBlockId(updatedBlock.id); */
        // Focus new block
        requestAnimationFrame(() => {
            inputRefs.current[updatedBlock.id]?.current.focus();
        });
    }

    return (
        <>
            <View style={styles.blockOptionsRow}>
                <Text>Turn into</Text>
            </View>

            <View style={styles.blockOptionsRow}>
                <Pressable style={({ pressed}) => ([{
                    opacity: pressed ? 0.5 : 1
                }, styles.blockOptions])} onPress={() => handleTurnBlockInto(focusedBlockId, "text")}>
                    <Text>Text</Text>
                </Pressable>

                <Pressable style={({ pressed}) => ([{
                    opacity: pressed ? 0.5 : 1
                }, styles.blockOptions])} onPress={() => handleTurnBlockInto(focusedBlockId, "header")}>
                    <Text>Heading 1</Text>
                </Pressable>
            </View>

            <View style={styles.blockOptionsRow}>
                <Pressable style={({ pressed}) => ([{
                    opacity: pressed ? 0.5 : 1
                }, styles.blockOptions])} onPress={() => handleTurnBlockInto(focusedBlockId, "sub_header")}>
                    <Text>Heading 2</Text>
                </Pressable>

                <Pressable style={({ pressed}) => ([{
                    opacity: pressed ? 0.5 : 1
                }, styles.blockOptions])} onPress={() => handleTurnBlockInto(focusedBlockId, "sub_sub_header")}>
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