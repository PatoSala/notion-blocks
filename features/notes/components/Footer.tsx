import { View, Text, StyleSheet, Pressable, Keyboard, FlatList } from "react-native";
import { MaterialCommunityIcons, MaterialIcons, FontAwesome6, Ionicons } from "@expo/vector-icons";

export default function Footer({
    hidden,
    style,
    actions
}) {
    return (
        <View style={[styles.container, style, {
             width: "100%",
            position: !hidden ? "relative" : "absolute",
            bottom: !hidden ? 0 : -44
        }]}>
            <FlatList
                horizontal
                contentContainerStyle={{
                    flexGrow: 1
                }}
                data={actions}
                renderItem={({ item }) => (
                    <Pressable onPress={item.onPress} style={styles.button}>
                        {item.Icon}
                    </Pressable>
                )}
            />
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