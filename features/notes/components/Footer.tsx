import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Keyboard, FlatList } from "react-native";
import { MaterialCommunityIcons, MaterialIcons, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useKeyboardStatus } from "../../blocks/hooks/useKeyboardStatus";

import InsertBlockSection from "./tabs/InsertBlockSection";
import ReplaceBlockSection from "./tabs/ReplaceBlockSection";

export default function Footer({
    style,
    actions,
    setShowSoftInputOnFocus,
    focusedBlockRef,
    focusedBlockId,
    handleInsertBlock,
    handleTurnBlockInto
}) {
    const { isKeyboardOpen, keyboardHeight } = useKeyboardStatus();
    const [activeTab, setActiveTab] = useState<string | "keyboard" | "none">("none");
    const [hidden, setHidden] = useState(true);

    useEffect(() => {
        if (isKeyboardOpen) {
            setActiveTab("keyboard");
            setHidden(false);
        }
    }, [isKeyboardOpen]);

    const handleOpenKeyboard = () => {
        setActiveTab("keyboard");
        focusedBlockRef.current.focus();
        setShowSoftInputOnFocus(true);
    };

    const handleKeyboardDismiss = () => {
        Keyboard.dismiss();
        setShowSoftInputOnFocus(true);
        setActiveTab("none");
        setHidden(true);
    };

    return (
        <View style={{
            position: "absolute",
            bottom: hidden ? -keyboardHeight - 100 : 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: "white"
        }}>
            <View style={[styles.container, style, {
                width: "100%",
            }]}>
                <FlatList
                    horizontal
                    contentContainerStyle={{
                        flexGrow: 1
                    }}
                    keyboardShouldPersistTaps="always"
                    data={actions}
                    renderItem={({ item, index }) => (
                        <Pressable
                            key={index}
                            onPress={() => {
                                setActiveTab(item.key);
                                item.onPress();
                            }}
                            style={({ pressed }) => [
                                styles.button,
                                {
                                    backgroundColor: activeTab === item.key ? "#f1f1f1" : "transparent",
                                    opacity: pressed ? 0.5 : 1
                                }
                            ]}
                        >
                            {item.Icon}
                        </Pressable>
                    )}
                    ListFooterComponent={() => (
                        <>
                            <Pressable
                                onPress={() => {
                                    if (activeTab !== "keyboard") {
                                        handleOpenKeyboard();
                                    } else {
                                        handleKeyboardDismiss();
                                    }
                                }}
                                style={({ pressed }) => [
                                    styles.button,
                                    {
                                        opacity: pressed ? 0.5 : 1
                                    }
                                ]}
                            >
                                {activeTab !== "keyboard"
                                ? (
                                    <Ionicons name="close-circle-outline" size={24} color="black" />
                                )
                                : (
                                    <MaterialCommunityIcons name="keyboard-close-outline" size={24} color="black" />
                                )}
                            </Pressable>
                        </>
                    )}
                />
            </View>

            {activeTab && (
                <View style={[styles.tabSectionContainer, { height: keyboardHeight }]}>
                    {activeTab === "add-block" ? <InsertBlockSection
                        focusedBlockId={focusedBlockId}
                        handleInsertBlock={handleInsertBlock}
                    /> : null}
                    {activeTab === "turn-block-into" ? <ReplaceBlockSection
                        focusedBlockId={focusedBlockId}
                        handleTurnBlockInto={handleTurnBlockInto}
                    /> : null}
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 44,
        flexDirection: "row",
        boxShadow: "0px -1px 0px rgba(0, 0, 0, 0.1)"
    },
    button: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "center",
    },
    tabSectionContainer: {
        backgroundColor: "#f5f5f5",
        padding: 16,
    }
});