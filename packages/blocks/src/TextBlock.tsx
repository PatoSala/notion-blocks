import { useTextInput } from "@react-native-blocks/core/src/hooks/useTextInput";
import { View, TextInput, StyleSheet } from "react-native";
interface Props {
    blockId: string
}

export function TextBlock({ blockId } : Props) {
    const { getTextInputProps } = useTextInput(blockId);
    return (
        <View style={styles.container}>
            <TextInput
                lineBreakStrategyIOS="hangul-word"
                style={[styles.text]}
                {...getTextInputProps()}
                onContentSizeChange={({ nativeEvent: {contentSize: {width, height} }}) => {
                    console.log(width, height);
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: "normal",
        paddingVertical: 6,
        lineHeight: 24
    }
});