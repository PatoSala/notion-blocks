import { View, Text, StyleSheet, Pressable, Keyboard } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Footer() {
    return (
        <View style={styles.container}>
            <Pressable
                onPress={() => Keyboard.dismiss()}
                style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1 }, styles.button])}
            >
                <MaterialCommunityIcons name="keyboard-close-outline" size={24} color="black" />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 44,
        boxShadow: "0px -1px 0px rgba(0, 0, 0, 0.1)"
    },
    button: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "center"
    }
});