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
    handleOnKeyPress?: (event: { nativeEvent: { key: string; }; }, blockId: string) => void;
    handleOnChangeText?: (text: string) => void;
    registerRef?: (blockId: string, ref: any) => void;
    unregisterRef?: (blockId: string) => void;
}

export default function BlockElement({
    blockId,
    block,
    title,
    handleOnBlur,
    handleSubmitEditing,
    handleOnChangeText,
    handleOnKeyPress,
    registerRef,
    unregisterRef
} : Props) {
    const ref = useRef<TextInput>(null);
    const [selection, setSelection] = useState({ start: 0, end: 0 });

    useEffect(() => {
        registerRef && registerRef(blockId, ref);
        return () => {
            unregisterRef && unregisterRef(blockId);
        };
    }, []);

    return (
        <View style={styles.container}>
            <TextInput
                ref={ref}
                style={styles[block.type]}
                selection={selection}
                value={title}
                onChangeText={(text) => handleOnChangeText && handleOnChangeText(blockId, text)}
                onSelectionChange={({ nativeEvent }) => setSelection(nativeEvent.selection)}
                onSubmitEditing={() => handleSubmitEditing && handleSubmitEditing(block, selection)}
                onKeyPress={(event) => handleOnKeyPress && handleOnKeyPress(event, blockId)}
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