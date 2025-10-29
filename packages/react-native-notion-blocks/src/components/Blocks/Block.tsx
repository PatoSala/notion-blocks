import { useContext, useState, useRef, useEffect, useImperativeHandle, memo, RefObject, useLayoutEffect } from "react";
import { Text, View, StyleSheet, TextInput, Dimensions, ScrollView, findNodeHandle } from "react-native";
import { useBlocksContext, useBlock } from "./BlocksContext";
import { useTextInput } from "../../hooks/useTextInput";

export interface BlockProps {
    blockId: string;
}

// In theory since memo() does a shallow check, even if some data inside the block changes the component should not render.
const BlockElement = memo(({
    blockId,
} : BlockProps) => {

    const { blocks } = useBlocksContext();
    const block = blocks[blockId];
    if (block === undefined) {
        return <Text>Block not found. Id: {blockId}</Text>
    }

    const viewRef = useRef<View>(null);

    const { getTextInputProps } = useTextInput(blockId);
    
    return (
        <>
            <View style={[styles.container]} ref={viewRef}>
                <TextInput
                    style={[styles[block.type], {
                        textAlignVertical: "top",
                        flexShrink: 0,
                        flexGrow: 1,
                    }]}
                    {...getTextInputProps()}
                />
            </View>
        </>
    )
});

export default BlockElement;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8
    },
    page: {
        fontSize: 30,
        fontWeight: "bold",
        lineHeight: 36,
        marginTop: 36,
        marginBottom: 4,
        flexWrap: "wrap"
    },
    text: {
        fontSize: 16,
        fontWeight: "normal",
        paddingVertical: 6,
        lineHeight: 24,
        flexWrap: "wrap"
    },
    header: {
        fontWeight: "bold",
        fontSize: 28,
        marginTop: 32,
        marginBottom: 8,
        lineHeight: 34,
        flexWrap: "wrap"
    },
    sub_header: {
        fontWeight: "bold",
        fontSize: 22,
        marginTop: 24,
        marginBottom: 4,
        lineHeight: 30,
        flexWrap: "wrap"
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