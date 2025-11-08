import { Pressable, Text, View, StyleSheet, Dimensions, FlatList, Keyboard } from "react-native";
import { useBlocksContext } from "../../Blocks/BlocksContext";
import { Block } from "../../../interfaces/Block.interface";
import { useTextBlocksContext } from "../../TextBlocksProvider";
import { useBlockRegistrationContext } from "../../BlockRegistration";
import { useFooterContext } from "../Footer";
const { width } = Dimensions.get("window");

export default function InsertBlockSection() {
    const { inputRefs, setShowSoftInputOnFocus } = useTextBlocksContext();
    const { blocks, focusedBlockId, insertBlock, removeBlock, rootBlockId } = useBlocksContext();
    const { blocks: blockTypes, textBasedBlocks } = useBlockRegistrationContext();
    const { setActiveTab, setHidden } = useFooterContext();

    const handleInsertBlock = (blockType: string) => {
        const parentBlockId = focusedBlockId === rootBlockId ? rootBlockId : blocks[focusedBlockId].parent;
       
        setShowSoftInputOnFocus(true);
        const newBlock = new Block({
            type: blockType,
            properties: {
                title: ""
            },
            content: [],
            parent: parentBlockId
        });

        // note: remember that the root block has no value for parent attribute.
        if (focusedBlockId === rootBlockId) {
            insertBlock(newBlock, {
                nextBlockId: blocks[rootBlockId].content[0]
            });
        } else {
            insertBlock(newBlock, {
                prevBlockId: focusedBlockId
            });
        }

        if (blocks[focusedBlockId].properties.title.length === 0 && focusedBlockId !== rootBlockId) {
            removeBlock(focusedBlockId);
        }

        // Focus new block
        if (textBasedBlocks.includes(blockType)) {
            requestAnimationFrame(() => {
                inputRefs.current[newBlock.id]?.current.focus();
            });
        } else {
            setActiveTab("none");
            setHidden(true);
            Keyboard.dismiss();
        }
    }

    return (
        <>
            <View style={styles.blockOptionsRow}>
                <Text>Blocks</Text>
            </View>

            <FlatList
                data={Object.keys(blockTypes)}
                numColumns={2}
                columnWrapperStyle={{
                    justifyContent: "space-between"
                }}
                contentContainerStyle={{
                    gap: 10
                }}
                renderItem={({ item }) => {
                    return (
                        <Pressable style={({ pressed}) => ([{
                            opacity: pressed ? 0.5 : 1
                        }, styles.blockOptions])} onPress={() => handleInsertBlock(item)}>
                            <Text>{item}</Text>
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