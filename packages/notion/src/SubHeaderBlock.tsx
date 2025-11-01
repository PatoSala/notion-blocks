import { memo } from "react";
import { useTextInput } from "react-native-notion-blocks/src/hooks/useTextInput";
import { View, TextInput, StyleSheet } from "react-native";
interface Props {
    blockId: string
}

export const SubHeaderBlock = ({ blockId } : Props) => {
    const { getTextInputProps } = useTextInput(blockId);
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.sub_header}
                {...getTextInputProps()}
            />
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8
    },
    page: {
        fontSize: 30,
        fontWeight: "bold",
        lineHeight: 36,
        marginTop: 36,
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