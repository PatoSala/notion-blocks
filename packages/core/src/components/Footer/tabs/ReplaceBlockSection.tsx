import { Pressable, Text, View, StyleSheet, Dimensions, FlatList } from "react-native";
import { useTextBlocksContext } from "../../TextBlocksProvider";
import { useBlocksContext } from "../../BlocksContext";
import { useBlockRegistrationContext } from "../../BlockRegistration";

const { width } = Dimensions.get("window");

export default function ReplaceBlockSection() {
    const { inputRefs, setShowSoftInputOnFocus } = useTextBlocksContext();
    const { blocks, focusedBlockId, setFocusedBlockId, turnBlockInto } = useBlocksContext();
    const { textBasedBlocks, blockTypes } = useBlockRegistrationContext();

    const handleTurnBlockInto = (blockType: string) => {
        const updatedBlock = turnBlockInto(focusedBlockId, blockType);
        // Focus new block
        requestAnimationFrame(() => {
            inputRefs.current[updatedBlock.id]?.current.focus();
        });
    }

    return (
        <>
            <FlatList
                data={textBasedBlocks}
                numColumns={2}
                ListHeaderComponent={(
                    <View style={styles.blockOptionsRow}>
                        <Text style={styles.sectionHeader}>Turn into</Text>
                    </View>
                )}
                columnWrapperStyle={{
                    justifyContent: "space-between"
                }}
                contentContainerStyle={{
                    gap: 10,
                    padding: 16
                }}
                renderItem={({ item }) => {
                    return (
                        <Pressable style={({ pressed}) => ([{
                            opacity: pressed ? 0.5 : 1
                        }, styles.blockOptions])} onPress={() => handleTurnBlockInto(item)}>
                            <Text style={styles.blockOptionsText}>{blockTypes[item].options.name}</Text>
                        </Pressable>
                    )
                }}
            />
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
        borderRadius: 4,
        justifyContent: "center",
        paddingHorizontal: 16,
        boxSizing: "border-box",
        boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.1)",
    },
    blockOptionsText: {
        fontSize: 16,
        fontWeight: "500",
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: "500",
        color: "#b3b3b3"
    }
});