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
                style={styles[block.type]}
                value={title}
                submitBehavior="submit" // Prevents keyboard from flickering when focusing a new block
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
        fontSize: 30,
        fontWeight: "bold"
    },
    text: {
        fontSize: 16,
        fontWeight: "normal"
    },
    header: {
        fontWeight: "bold",
        fontSize: 28,
        paddingTop: 32,
        paddingBottom: 8
    },
    sub_header: {
        fontWeight: "bold",
        fontSize: 22,
        paddingTop: 24,
        paddingBottom: 4
    },
    sub_sub_header: {
        fontWeight: "bold",
        fontSize: 18,
        paddingTop: 20,
        paddingBottom: 4
    }
});