import { useContext, useState, useRef, useEffect } from "react";
import { BlocksContext } from "../../blocks/context/BlocksContext";
import { Text, View, StyleSheet, TextInput, Keyboard } from "react-native";
import { useDetectKeyPress } from "../hooks/useDetectKeyPress";
import { useKeyboardStatus } from "../hooks/useKeyboardStatus";
import { Block } from "../interfaces/Block.interface";

interface Props {
    blockId: string;
    block: Block;
    title: string;
    handleOnBlur?: () => void;
    handleSubmitEditing?: () => void;
    handleOnKeyPress?: (event: { nativeEvent: { key: string; }; }) => void;
}

export default function BlockElement({
    blockId,
    block,
    title,
    handleOnBlur,
    handleSubmitEditing
} : Props) {
    const ref = useRef<TextInput>(null);
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [value, setValue] = useState(title);

    useEffect(() => {
        console.log("title changed");
        setValue(title);
    }, [title]);

    return (
        <View style={styles.container}>
            <TextInput
                ref={ref}
                style={styles[block.type]}
                value={value}
                selection={selection}
                onChangeText={(text) => setValue(text)}
                onSelectionChange={({ nativeEvent }) => setSelection(nativeEvent.selection)}
                onSubmitEditing={() => handleSubmitEditing && handleSubmitEditing(block, selection)}
                onBlur={() => handleOnBlur && handleOnBlur(block.id, value)}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingLeft: 8,
        minHeight: 44,
        justifyContent: "center"
    },
    page: {
        fontSize: 24,
        fontWeight: "bold"
    },
    text: {
        fontSize: 17,
        height: 44
    }
});