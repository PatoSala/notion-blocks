import { useState } from "react";
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

    const [activeTab, setActiveTab] = useState(null);
    const shouldBeHidden = isKeyboardOpen === false && activeTab === null;

    return (
        <>
            <View style={[styles.container, style, {
                width: "100%",
                position: shouldBeHidden ? "absolute" : "relative",
                bottom: shouldBeHidden ? -44 : 0
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
                                    if (activeTab) {
                                        focusedBlockRef.current.focus();
                                        requestAnimationFrame(() => {
                                            setActiveTab(null);
                                            setShowSoftInputOnFocus(true);
                                        });
                                    } else {
                                        Keyboard.dismiss();
                                        setShowSoftInputOnFocus(true);
                                    }
                                }}
                                style={({ pressed }) => [
                                    styles.button,
                                    {
                                        opacity: pressed ? 0.5 : 1
                                    }
                                ]}
                            >
                                {activeTab
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
        </>
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
        padding: 16
    }
});