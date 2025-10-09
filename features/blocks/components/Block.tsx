import { useContext, useState, useRef, useEffect, useImperativeHandle, memo } from "react";
import { Text, View, StyleSheet, TextInput, Keyboard } from "react-native";
import { Block } from "../interfaces/Block.interface";
import { updateBlock } from "../core";

interface Props {
    item: string;
    blockId: string;
    block: Block;
    title: string;
    handleOnBlur?: () => void;
    onFocus?: () => void;
    handleSubmitEditing?: () => void;
    handleOnKeyPress?: (event: { nativeEvent: { key: string; }; }, blockId: string) => void;
    handleOnChangeText?: (blockId: string, text: string) => void;
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

    if (block === undefined) {
        return <Text>Block not found. Id: {blockId}</Text>
    }
    const ref = useRef<TextInput>(null);
    const selectionRef = useRef({ start: block.properties.title.length, end: block.properties.title.length });
    const valueRef = useRef(block.properties.title);

    const api = {
        current: {
            focus: () => {
                ref.current?.focus();
            },
            focusWithSelection: (selection: { start: number; end: number }, text?: string) => {
                /** 
                 * The following comment was of help:
                 * @link https://github.com/microsoft/react-native-windows/issues/6786#issuecomment-773730912 
                 * Setting selection before focusing prevents the cursor from reseting when value changes.
                 * */
                ref.current?.setSelection(selection.start, selection.end); // Sync native input with selection state
                selectionRef.current = selection;
                ref.current?.focus();
            }
        }
    };

    useEffect(() => {
        // Sync native input with state

        // Register ref on block mount. This will allow us to set focus/selection from the parent.
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
                cursorColor={"black"}
                selectionColor={"black"}
                submitBehavior="submit" // Prevents keyboard from flickering when focusing a new block
                onChangeText={(text) => {
                    valueRef.current = text;
                }}
                onSelectionChange={({ nativeEvent }) => {
                    selectionRef.current = nativeEvent.selection;
                }}
                showSoftInputOnFocus={showSoftInputOnFocus}
                smartInsertDelete={false}
                onFocus={onFocus}
                defaultValue={valueRef.current}
                selectTextOnFocus={false}
                onBlur={() => handleOnChangeText && handleOnChangeText(blockId, valueRef.current)}
                onSubmitEditing={() => {
                    // Find way to update block value when pressing submit
                    /* handleOnChangeText && handleOnChangeText(blockId, valueRef.current); */
                    
                    handleSubmitEditing && handleSubmitEditing(
                        updateBlock(block, {
                            properties:
                            { 
                                title: valueRef.current
                            }
                        }),
                        selectionRef.current
                    );
                }}
                onKeyPress={(event) => {
                    /* event.nativeEvent.key === "Enter" ? handleSubmitEditing && handleSubmitEditing(block, selectionRef.current) : null; */
                    event.nativeEvent.key === "Backspace" && selectionRef.current.start === 0 && selectionRef.current.end === 0 ? handleOnKeyPress && handleOnKeyPress(
                        event,
                        updateBlock(block, {
                            properties:
                            { 
                                title: valueRef.current
                            }
                        }),
                        selectionRef.current
                    ) : null;
                }}
            >
            </TextInput>
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