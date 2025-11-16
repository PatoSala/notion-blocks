import React, { useState } from "react";
import { useTextInput, useBlocksContext, useBlock, updateBlockData } from "@react-native-blocks/core";
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Modal, Button, Image, Dimensions, Pressable } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import EmojiSelector from "react-native-emoji-selector";
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get("window");

interface Props {
    blockId: string
}

export function PageBlock({ blockId } : Props) {
    const { getTextInputProps, isFocused } = useTextInput(blockId);
    const { rootBlockId, updateBlock } = useBlocksContext();
    const { block, properties } = useBlock(blockId);
    const isRootBlock = rootBlockId === blockId;
    const [showEmojiSelector, setShowEmojiSelector] = useState(false);
    const [pageIcon, setPageIcon] = useState<string | null>(null);
    const [iconType, setIconType] = useState<"emoji" | "image" | null>(null);
    const [pageCover, setPageCover] = useState<string | null>(null);
    const placeholder = "New page";

    const pickCover = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 1,
        });
    
        if (!result.canceled) {
          setPageCover(result.assets[0].uri);
    
          const updatedBlock = updateBlockData(block, {
            properties: {
              cover: result.assets[0].uri
            }
          });
    
          /* updateBlock(updatedBlock); */
        }
    }

    const pickImage = async () => {
        setIconType("image");
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 1,
          aspect: [4, 3]
        });
    
        if (!result.canceled) {
          setPageIcon(result.assets[0].uri);
          /* setAspectRatio(result.assets[0].width / result.assets[0].height); */
            setShowEmojiSelector(false);

          const updatedBlock = updateBlockData(block, {
            properties: {
              source: result.assets[0].uri
            },
            format: {
              block_width: result.assets[0].width,
              block_aspect_ratio: result.assets[0].width / result.assets[0].height
            }
          });
    
          /* updateBlock(updatedBlock); */
        }
      };

    return (
        <>
            { isRootBlock && pageCover
                ? (
                    <View style={styles.cover}>
                        <View style={{
                            position: "absolute",
                            top: 8,
                            right: 16,
                            display: pageCover === null ? "none" : "flex",
                            flexDirection: "row",
                            gap: 8
                        }}>
                            <Pressable style={[styles.coverBtn, { display: pageIcon === null ? "flex" : "none" }]} onPress={() => setShowEmojiSelector(true)}>
                                <Text style={styles.pageBtnText}>Add icon</Text>
                            </Pressable>
                            
                            <Pressable style={styles.coverBtn} onPress={() => setPageCover(null)}>
                                <Text style={styles.pageBtnText}>Remove cover</Text>
                            </Pressable>
                        </View>

                        <Image
                            source={{ uri: pageCover }}
                            style={{ width: "100%", height: 200 }}
                        />
                    </View>
                )
                : null}
            
            <View style={styles.container}>
                {isRootBlock
                ? (
                    <>
                        <View style={{
                            height: pageIcon ? 136 : 184,
                            display: pageCover === null ? "none" : "flex"
                        }}/>
                        <View style={styles.root}>
                            {pageCover === null
                                ? (
                                    <View
                                        style={[styles.row, {
                                            marginBottom: 8,
                                        }]}
                                    >
                                        {pageIcon === null && (
                                            <TouchableOpacity style={styles.pageBtn} onPress={() => setShowEmojiSelector(true)}>
                                                <Text style={styles.pageBtnText}>Add icon</Text>
                                            </TouchableOpacity>
                                        )}

                                        {pageCover === null && (
                                            <TouchableOpacity style={styles.pageBtn} onPress={pickCover}>
                                                <Text style={styles.pageBtnText}>Add cover</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )
                                : null}

                            {pageIcon !== null ? (
                                <TouchableOpacity
                                    onPress={() => setShowEmojiSelector(true)}
                                    style={{
                                        borderRadius: 8,
                                        overflow: "hidden",
                                        width: 64,
                                        height: 64,
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                >
                                    {iconType === "image"
                                        ? (
                                            <Image
                                                source={{ uri: pageIcon }}
                                                style={{ width: 64, height: 64 }}
                                            />
                                        )
                                        : (
                                            <Text style={{
                                                fontSize: 54
                                            }}>
                                                {pageIcon}
                                            </Text>
                                        )}
                                </TouchableOpacity>
                            ) : null}

                            <TextInput
                                style={styles.page}
                                {...getTextInputProps()}
                                placeholder={placeholder}
                            />
                        </View>
                    </>
                )
                : (
                    <>
                        <View style={styles.row}>
                            <TouchableOpacity
                                onPress={() => setShowEmojiSelector(true)}
                                style={styles.iconContainer}>
                                <Text style={styles.icon}>
                                    {pageIcon === null ? <Ionicons name="document-text-outline" size={24} color="black" /> : pageIcon}
                                </Text>
                            </TouchableOpacity>
                            
                            <Text style={styles.text}>
                                {properties.title}
                            </Text>
                        </View>
                    </>
                )}

                <Modal
                    visible={showEmojiSelector}
                    onRequestClose={() => setShowEmojiSelector(false)}
                    presentationStyle="pageSheet"
                    animationType="slide"

                >
                    <View style={styles.header}>
                        <Button
                            title="Remove"
                            onPress={() => {
                                setPageIcon(null);
                                setShowEmojiSelector(false);
                                setIconType(null);
                            }}
                        />
                        <Text style={styles.headerTitle}>Page Icon</Text>
                        <Button
                            title="Close"
                            onPress={() => setShowEmojiSelector(false)}
                        />
                    </View>

                    <View>
                        <Button
                            title="Upload image"
                            onPress={pickImage}
                        />
                    </View>

                    <EmojiSelector
                        columns={8}
                        showTabs={false}
                        onEmojiSelected={(emoji) => {
                            setIconType("emoji");
                            setShowEmojiSelector(false);
                            setPageIcon(emoji);
                        }}
                    />
                </Modal>
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
    cover: {
        width: width + 32,
        top: 0,
        left: -32,
        height: 100,
        position: "absolute"
    },
    coverBtn: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1,
        padding: 4,
        borderRadius: 4
    },
    page: {
        fontSize: 36,
        fontWeight: "bold",
        lineHeight: 42,
        marginBottom: 4,
        flexWrap: "wrap"
    },
    pageBtn: {
        flexDirection: "row",
        marginRight: 8
    },
    pageBtnText: {
        fontSize: 16,
        fontWeight: "500",
        lineHeight: 22,
        color: "lightgray",
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