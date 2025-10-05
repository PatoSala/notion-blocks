import { useContext, useState, useRef, useEffect, useImperativeHandle, memo } from "react";
import { Text, View, StyleSheet, TextInput, Keyboard } from "react-native";
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
    selectionState?: { start: number, end: number };
}

const BlockElement = memo(({
    blockId,
    block,
    title,
    handleOnBlur,
    handleSubmitEditing,
    handleOnChangeText,
    handleOnKeyPress,
    registerRef,
    unregisterRef,
} : Props) => {
    const ref = useRef<TextInput>(null);
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [isFocused, setIsFocused] = useState(false);

    const api = {
        current: {
            focus: () => {
                ref.current?.focus();
            },
            focusWithSelection: (selection: { start: number; end: number }) => {
                /** 
                 * The following comment was of help:
                 * @link https://github.com/microsoft/react-native-windows/issues/6786#issuecomment-773730912 
                 * Setting selection before focusing prevents the cursor from reseting when value changes.
                 * */
                console.log(selection);
                setSelection(selection);
                setTimeout(() => {
                    ref.current?.focus();
                }, 0);
            }
        }
    };

    useEffect(() => {
        registerRef && registerRef(blockId, api);
        
        return () => {
            unregisterRef && unregisterRef(blockId);
        };
    }, []);

    return (
        <View style={[styles.container, {
            backgroundColor: isFocused ? "rgba(0, 0, 0, 0.1)" : "transparent"
        }]}>
            <TextInput
                ref={ref}
                style={styles[block.type]}
                value={title}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                submitBehavior="submit" // Prevents keyboard from flickering when focusing a new block
                onChangeText={(text) => {
                    handleOnChangeText && handleOnChangeText(blockId, text);
                }}
                onSelectionChange={({ nativeEvent }) => {
                    // The problem is that even if selection is passed on mount, when the text is set on mount, the selection is lost
                    setSelection(nativeEvent.selection);
                }}
                selection={selection}
                onSubmitEditing={(event) => {
                    handleSubmitEditing && handleSubmitEditing(block, selection);
                }}
                onKeyPress={(event) => {
                    handleOnKeyPress && handleOnKeyPress(event, blockId, selection);
                }}
            />
        </View>
    )
})

export default BlockElement;

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