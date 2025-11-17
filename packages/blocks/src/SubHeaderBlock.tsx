import { useTextInput } from "@react-native-blocks/core";
import { View, TextInput, StyleSheet } from "react-native";
interface Props {
    blockId: string
}

export const SubHeaderBlock = ({ blockId } : Props) => {
    const { getTextInputProps, isFocused } = useTextInput(blockId);
    const placeholder = "Header 2";
    return (
        <View style={styles.container}>
            <TextInput
                key={blockId}
                style={styles.sub_header}
                {...getTextInputProps()}
                placeholder={placeholder}
            />
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8
    },
    sub_header: {
        fontWeight: "bold",
        fontSize: 22,
        marginTop: 24,
        marginBottom: 4,
        lineHeight: 30,
        flexWrap: "wrap"
    }
});