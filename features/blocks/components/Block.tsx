import { useContext, useState, useRef, useEffect, useImperativeHandle, memo } from "react";
import { Text, View, StyleSheet, TextInput, Keyboard } from "react-native";
import { Block } from "../interfaces/Block.interface";

interface Props {
    blockId: string;
    block: Block;
    title: string;
    handleOnBlur?: () => void;
    onFocus?: () => void;
    handleSubmitEditing?: () => void;
    handleOnKeyPress?: (event: { nativeEvent: { key: string; }; }, blockId: string) => void;
    handleOnChangeText?: (text: string) => void;
    registerRef?: (blockId: string, ref: any) => void;
    unregisterRef?: (blockId: string) => void;
    selectionState?: { start: number, end: number };
    showSoftInputOnFocus?: boolean;
}

const BlockElement = memo(({
    blockId,
    block,
    title,
    handleOnBlur,
    onFocus,
    handleSubmitEditing,
    handleOnChangeText,
    handleOnKeyPress,
    registerRef,
    unregisterRef,
    showSoftInputOnFocus
} : Props) => {
    const ref = useRef<TextInput>(null);
    const [selection, setSelection] = useState({ start: 0, end: 0 });

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
                setSelection(selection);
                setTimeout(() => {
                    ref.current?.focus();
                    ref.current?.setSelection(selection.start, selection.end); // Sync native input with selection state
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
        <View style={[styles.container]}>
            <TextInput
                ref={ref}
                scrollEnabled={false}
                style={styles[block.type]}
                multiline
                value={title}
                cursorColor={"black"}
                selectionColor={"black"}
                submitBehavior="newline" // Prevents keyboard from flickering when focusing a new block
                onChangeText={(text) => {
                    handleOnChangeText && handleOnChangeText(blockId, text);
                }}
                onSelectionChange={({ nativeEvent }) => {
                    // The problem is that even if selection is passed on mount, when the text is set on mount, the selection is lost
                    setSelection(nativeEvent.selection);
                }}
                showSoftInputOnFocus={showSoftInputOnFocus}
                smartInsertDelete={false}
                onFocus={onFocus}
                selection={selection}
                selectTextOnFocus={false}
                onSubmitEditing={(event) => {
                    handleSubmitEditing && handleSubmitEditing(block, selection);
                }}
                onKeyPress={(event) => {
                    event.nativeEvent.key === "Enter" ? handleSubmitEditing && handleSubmitEditing(block, selection) : null;
                    handleOnKeyPress && handleOnKeyPress(event, blockId, selection);
                }}
            />
        </View>
    )
})

export default BlockElement;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        justifyContent: "center"
    },
    page: {
        fontSize: 30,
        fontWeight: "bold",
        lineHeight: 36,
        minHeight: 36,
        paddingTop: 36,
        paddingBottom: 4,
        flexWrap: "wrap"
    },
    text: {
        fontSize: 16,
        fontWeight: "normal",
        paddingVertical: 6,
        lineHeight: 24,
        minHeight: 24
    },
    header: {
        fontWeight: "bold",
        fontSize: 28,
        paddingTop: 32,
        paddingBottom: 8,
        lineHeight: 34,
        minHeight: 34,
        flexWrap: "wrap"
    },
    sub_header: {
        fontWeight: "bold",
        fontSize: 22,
        paddingTop: 24,
        paddingBottom: 4,
        lineHeight: 30,
        minHeight: 30,
        flexWrap: "wrap"
    },
    sub_sub_header: {
        fontWeight: "bold",
        fontSize: 18,
        paddingTop: 20,
        paddingBottom: 4,
        lineHeight: 26,
        minHeight: 26,
        flexWrap: "wrap"
    }
});