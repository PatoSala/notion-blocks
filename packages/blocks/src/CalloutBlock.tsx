import { useTextInput } from "@react-native-blocks/core";
import { View, TextInput, StyleSheet, Text, Dimensions, TouchableOpacity } from "react-native";

interface Props {
    blockId: string
}

const { width } = Dimensions.get("window");

export function CalloutBlock({ blockId } : Props) {
    const { getTextInputProps } = useTextInput(blockId);

    return (
        <View style={styles.container}>
            <View style={styles.callout}>
                <TouchableOpacity style={styles.iconContainer}>
                    <Text style={styles.icon}>
                    💡
                    </Text>
                </TouchableOpacity>
                <TextInput
                    style={styles.text}
                    {...getTextInputProps()}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8
    },
    callout: {
        backgroundColor: "#efefef",
        paddingVertical: 16,
        marginBottom: 8,
        borderRadius: 12,
        flexDirection: "row",
        overflow: "hidden",
        boxSizing: "border-box"
    },
    text: {
        fontSize: 16,
        fontWeight: "normal",
        lineHeight: 22,
        width: width - 92,
        marginRight: 16,
    },
    iconContainer: {
        marginLeft: 8,
        justifyContent: "center",
        alignItems: "center",
        height: 32,
        width: 32
    },
    icon: {
        fontSize: 16,
    }
});