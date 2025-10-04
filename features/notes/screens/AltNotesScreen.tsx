import { useState } from "react";
import { blocksData } from "../utils/initialBlocks";
import { TextInput, Text, View, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Block } from "../../blocks/interfaces/Block.interface";
import {
    updateBlock,
    insertBlockIdIntoContent,
} from "../../blocks/core/updateBlock";
import Footer from "../components/Footer";
import { useKeyboardStatus } from "../../blocks/hooks/useKeyboardStatus";

// POC: Blocks within one single TextInput

export default function AltNotesScreen() {
    const insets = useSafeAreaInsets();
    const { isKeyboardOpen } = useKeyboardStatus();
    const pageId : string = "1";
    const [blocks, setBlocks] = useState(blocksData);
    const page = blocks["1"];

    console.log(blocks);

    const value = page.content
        .map((id) => blocks[id].properties.title)
        .join("\n");


    function getBlockRanges() {
        let ranges = [];
        let cursor = 0;

        page.content.forEach(id => {
            const title = blocks[id].properties.title;
            ranges.push({ id, start: cursor, end: cursor + title.length });
            cursor += title.length + 1; // +1 for newline
        });

        return ranges;
    }

    const handleSelectionChange = ({ nativeEvent }) => {
        const cursorPos = nativeEvent.selection.start;
        const ranges = getBlockRanges();
        const activeBlock = ranges.find(r => cursorPos >= r.start && cursorPos <= r.end);
        if (activeBlock) {
            console.log("Cursor is inside block:", activeBlock.id);
        }
    };


    const handleChangeText = (newValue: string) => {
        const lines = newValue.split("\n");

        // Update each text block with its corresponding line
        const updated: any = { ...blocks };
        page.content.forEach((id, idx) => {
        updated[id] = {
            ...blocks[id],
            properties: {
            ...blocks[id].properties,
            title: lines[idx] ?? "", // empty if fewer lines
            },
        };
        });

        setBlocks(updated);
    };

    return (
        
        <KeyboardAvoidingView
            style={{ marginTop: insets.top, paddingHorizontal: 16, flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>Notion Blocks</Text>

            <TextInput
                multiline
                style={[styles.textInput]}
                onChangeText={handleChangeText}
                submitBehavior="submit"
            >
                {value}
            </TextInput>

            {isKeyboardOpen && <Footer />}
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    textInput: {
        flex: 1
    },
    text: {
        fontSize: 17,
        lineHeight: 24,
    },
    heading: {
        lineHeight: 28,
        fontSize: 24,
        fontWeight: "bold"
    },
    subheading: {
        lineHeight: 20,
        fontSize: 17,
        fontWeight: "bold"
    }
});