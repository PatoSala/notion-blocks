import { useTextInput } from "@react-native-blocks/core";
import { View, TextInput, StyleSheet } from "react-native";
interface Props {
    blockId: string
}

export function SubSubHeaderBlock({ blockId } : Props) {
    const { getTextInputProps } = useTextInput(blockId);
    const placeholder = "Header 3";
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.sub_sub_header}
                {...getTextInputProps()}
                placeholder={placeholder}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8
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