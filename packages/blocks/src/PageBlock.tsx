import React, { useState } from "react";
import { useTextInput, useBlocksContext, useBlock } from "@react-native-blocks/core";
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Modal, Button } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import EmojiSelector from "react-native-emoji-selector";

interface Props {
    blockId: string
}

export function PageBlock({ blockId } : Props) {
    const { getTextInputProps, isFocused } = useTextInput(blockId);
    const { rootBlockId } = useBlocksContext();
    const { properties } = useBlock(blockId);
    const isRootBlock = rootBlockId === blockId;
    const [showEmojiSelector, setShowEmojiSelector] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState(null);
    const placeholder = "New page";

    return (
        <>
            <View style={styles.container}>
                {isRootBlock
                ? (
                    <View style={styles.root}>
                    {/*  <Ionicons name="document-text-outline" size={42} color="black" /> */}
                        <TextInput
                            style={styles.page}
                            {...getTextInputProps()}
                            placeholder={placeholder}
                        />
                    </View>
                )
                : (
                    <>
                        <View style={styles.row}>
                            <TouchableOpacity
                                onPress={() => setShowEmojiSelector(true)}
                                style={styles.iconContainer}>
                                <Text style={styles.icon}>
                                    {selectedEmoji === null ? <Ionicons name="document-text-outline" size={24} color="black" /> : selectedEmoji}
                                </Text>
                            </TouchableOpacity>
                            
                            <Text style={styles.text}>
                                {properties.title}
                            </Text>
                        </View>

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
                )}
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
    },
    root: {
        marginTop: 32,
        gap: 8,
        marginBottom: 4
    },
    row: {
        flexDirection: "row",
        gap: 4,
        alignItems: "center"
    },
    page: {
        fontSize: 36,
        fontWeight: "bold",
        lineHeight: 42,
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