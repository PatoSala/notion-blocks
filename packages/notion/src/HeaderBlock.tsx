import { useTextInput } from "react-native-notion-blocks/src/hooks/useTextInput";
import { View, TextInput, StyleSheet } from "react-native";

interface Props {
    blockId: string
}

export function HeaderBlock({ blockId } : Props) {
    const { getTextInputProps } = useTextInput(blockId);
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.header}
                {...getTextInputProps()}
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