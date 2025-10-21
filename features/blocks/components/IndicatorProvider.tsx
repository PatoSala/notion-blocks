import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

interface Props {
    children: React.ReactNode;
    position: {
        y: number;
    };
}

export default function IndicatorProvider({
    children,
    position
} : Props) {

    const animatedStyles = useAnimatedStyle(() => {
        return {
            top: position.y,
        };
    });

    return (
        <>
            {children}
            <Animated.View style={[styles.indicator, animatedStyles]} />
        </>
    );
}

const styles = StyleSheet.create({
    indicator: {
        height: 3,
        width: "100%",
        opacity: 0.5,
        backgroundColor: "#0277e4ff",
        position: "absolute"
    },
});