import { useTextInput, useBlocksContext } from "@react-native-blocks/core";
import { View, TextInput, StyleSheet } from "react-native";
interface Props {
    blockId: string
}

export function TextBlock({ blockId } : Props) {
    const { getTextInputProps } = useTextInput(blockId);
    const { blocks } = useBlocksContext();

    const handleOnKeyPress = (event: { nativeEvent: { key: string; }; }) => {
        console.log("CUSTOM HANDLE ON KEY PRESS");
    };

    return (
        <View style={styles.container}>
            <TextInput
                // ref={inputRef} ??? 
                key={`input-${blockId}`}   // Really important to pass the key prop
                style={styles.text}
                {...getTextInputProps()}
                onKeyPress={handleOnKeyPress}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8
    },
    text: {
        fontSize: 16,
        fontWeight: "normal",
        paddingVertical: 6,
        lineHeight: 24,
        flexWrap: "wrap"
    }
});