import { useState } from "react";
import { useTextInput, useBlocksContext } from "@react-native-blocks/core";
import {
    View,
    TextInput,
    StyleSheet,
    Text,
    Dimensions,
    TouchableOpacity,
    Modal,
    Button,
} from "react-native";
import { Pressable, GestureDetector, Gesture } from "react-native-gesture-handler";
import EmojiSelector from "react-native-emoji-selector";

interface Props {
    blockId: string
}

const { width } = Dimensions.get("window");

export function CalloutBlock({ blockId } : Props) {
    const { getTextInputProps } = useTextInput(blockId);
    const { selectedBlockId, setSelectedBlockId, removeBlock } = useBlocksContext();
    const [showEmojiSelector, setShowEmojiSelector] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState("💡");

    const handleRemoveBlock = () => {
        setSelectedBlockId(null);
        setTimeout(() => {
            removeBlock(blockId);
        }, 100);
    };

    return (
        <>
            <View
                style={styles.container}
            >
                <View style={styles.callout}>
                    <TouchableOpacity
                        onPress={() => setShowEmojiSelector(true)}
                        style={styles.iconContainer}>
                        <Text style={styles.icon}>
                            {selectedEmoji}
                        </Text>
                    </TouchableOpacity>
                    <TextInput
                        key={blockId}
                        style={styles.text}
                        {...getTextInputProps()}
                    />
                </View>
            </View>

            <Modal
                visible={selectedBlockId === blockId}
                presentationStyle="pageSheet"
                animationType="slide"
            >
                <Button
                    title="Close"
                    onPress={() => setSelectedBlockId(null)}
                />

                <Button
                    title="Remove"
                    onPress={handleRemoveBlock}
                />
            </Modal>

            <Modal
                visible={showEmojiSelector}
                onRequestClose={() => setShowEmojiSelector(false)}
                presentationStyle="pageSheet"
                animationType="slide"

            >
                <View style={styles.header}>
                    <View style={{ width: 64 }}/>
                    <Text style={styles.headerTitle}>Pick emoji</Text>
                    <Button
                        title="Close"
                        onPress={() => setShowEmojiSelector(false)}
                    />
                </View>

                <EmojiSelector
                    columns={8}
                    showTabs={false}
                    onEmojiSelected={(emoji) => {
                        setShowEmojiSelector(false);
                        setSelectedEmoji(emoji);
                    }}
                />
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8
    },
    callout: {
        backgroundColor: "#efefef",
        paddingVertical: 16,
        marginBottom: 8,
        borderRadius: 12,
        flexDirection: "row",
        overflow: "hidden",
        boxSizing: "border-box"
    },
    text: {
        fontSize: 16,
        fontWeight: "normal",
        lineHeight: 22,
        width: width - 92,
        marginRight: 16,
    },
    iconContainer: {
        marginLeft: 8,
        justifyContent: "center",
        alignItems: "center",
        height: 32,
        width: 32
    },
    icon: {
        fontSize: 16,
    },
    header: {
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "500"
    }
});