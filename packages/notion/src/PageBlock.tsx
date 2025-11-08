import { useTextInput } from "react-native-notion-blocks/src/hooks/useTextInput";
import { useBlocksContext, useBlock } from "react-native-notion-blocks/src/components/Blocks/BlocksContext";
import { View, TextInput, Text, StyleSheet } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';

interface Props {
    blockId: string
}

export function PageBlock({ blockId } : Props) {
    const { getTextInputProps, isFocused } = useTextInput(blockId);
    const { rootBlockId } = useBlocksContext();
    const { properties } = useBlock(blockId);
    const isRootBlock = rootBlockId === blockId;

    const placeholder = "New page";

    return (
        <View style={styles.container}>
            {isRootBlock
            ? (
                <View style={styles.root}>
                   {/*  <Ionicons name="document-text-outline" size={42} color="black" /> */}
                    <TextInput
                        style={styles.page}
                        {...getTextInputProps()}
                        placeholder={placeholder}
                    />
                </View>
            )
            : (
                <View style={styles.row}>
                    <Ionicons name="document-text-outline" size={24} color="black" />
                    <Text style={styles.text}>
                        {properties.title}
                    </Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
    },
    root: {
        marginTop: 32,
        gap: 8,
        marginBottom: 4
    },
    row: {
        flexDirection: "row",
        gap: 4,
        alignItems: "center"
    },
    page: {
        fontSize: 36,
        fontWeight: "bold",
        lineHeight: 42,
        marginBottom: 4,
        flexWrap: "wrap"
    },
    text: {
        fontSize: 16,
        fontWeight: "normal",
        paddingVertical: 6,
        lineHeight: 24,
        flexWrap: "wrap"
    },
    header: {
        fontWeight: "bold",
        fontSize: 28,
        marginTop: 32,
        marginBottom: 8,
        lineHeight: 34,
        flexWrap: "wrap"
    },
    sub_header: {
        fontWeight: "bold",
        fontSize: 22,
        marginTop: 24,
        marginBottom: 4,
        lineHeight: 30,
        flexWrap: "wrap"
    },
    sub_sub_header: {
        fontWeight: "bold",
        fontSize: 18,
        marginTop: 20,
        marginBottom: 4,
        lineHeight: 26,
        flexWrap: "wrap"
    }
});