import { View, Text, StyleSheet, Pressable, Keyboard } from "react-native";
import { MaterialCommunityIcons, MaterialIcons, FontAwesome6, Ionicons } from "@expo/vector-icons";

export default function Footer({
    hidden,
    style,
    openAddBlockMenu,
    openTurnBlockIntoMenu,
    closeAllMenus
}) {
    return (
        <View style={[styles.container, style, {
             width: "100%",
            position: !hidden ? "relative" : "absolute",
            bottom: !hidden ? 0 : -44
        }]}>
            <Pressable
                onPress={() => openAddBlockMenu()}
                style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1 }, styles.button])}
            >
                <MaterialIcons name="add" size={24} color="black" />
            </Pressable>

            <Pressable
                onPress={() => openTurnBlockIntoMenu()}
                style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1 }, styles.button])}
            >
                <FontAwesome6 name="arrows-rotate" size={24} color="black" />
            </Pressable>

            <Pressable
                onPress={() => Keyboard.dismiss()}
                style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1 }, styles.button])}
            >
                <MaterialCommunityIcons name="keyboard-close-outline" size={24} color="black" />
            </Pressable>

            <Pressable
                onPress={() => closeAllMenus()}
                style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1 }, styles.button])}
            >
                <Ionicons name="close-circle-outline" size={24} color="black" />
            </Pressable>
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
        alignItems: "center"
    }
});