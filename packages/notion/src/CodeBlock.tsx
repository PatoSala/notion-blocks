import { useTextInput } from "react-native-notion-blocks/src/hooks/useTextInput";
import { View, TextInput, StyleSheet } from "react-native";

interface Props {
    blockId: string
}

export function CodeBlock({ blockId } : Props) {
    const { getTextInputProps } = useTextInput(blockId);
    return (
        <View style={styles.container}>
            <View style={styles.code}>
                <TextInput
                    style={[styles.text]}
                    {...getTextInputProps()}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        marginVertical: 16
    },
    code: {
        backgroundColor: "#f5f5f5",
        padding: 16,
        marginBottom: 8,
        borderRadius: 4
    },
    text: {
        fontSize: 16,
        fontWeight: "normal",
        paddingVertical: 6,
        lineHeight: 24,
        flexWrap: "wrap",
    }
});