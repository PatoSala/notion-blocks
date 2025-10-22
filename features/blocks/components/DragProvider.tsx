import { useState } from "react";
import { View, Dimensions } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import BlockElement from "./Block";

const { height } = Dimensions.get("window");
const TOP_THRESHOLD = 200; // Adjust as needed
const BOTTOM_THRESHOLD = 200;

export default function DragProvider({
    children,
    block,
    handleScrollTo,
    scrollPosition,
    scrollViewRef,
    
    setGhostBlockId,
    setIsPressed,
    offset,
    setOffset,
    start,
    setStart,
    functionDetermineIndicatorPosition,
    setIndicatorPosition,
    triggerMoveBlock,
}) {

    // scroll, tap
    const nativeGestures = Gesture.Native()

    /* const start = useSharedValue({ x: 0, y: 0 }); */
    const blockDrag = Gesture.Pan()
        .activateAfterLongPress(1000)
        .onBegin((e) => {
            scheduleOnRN(setStart, {
                x: 0,
                y: e.absoluteY
            })
        })
        .onStart((e) => {
            scheduleOnRN(setIsPressed, true);
            scheduleOnRN(setGhostBlockId, block.id);
        })
        .onUpdate((e) => {
            scheduleOnRN(setOffset, {
                x: e.translationX + start.value.x,
                y: e.translationY + start.value.y,
            })

            scheduleOnRN(functionDetermineIndicatorPosition, e.absoluteY);

            // Handle auto-scrolling
            /* if (e.absoluteY < TOP_THRESHOLD && scrollPosition.value > 0) {
                scheduleOnRN(handleScrollTo, {
                    x: 0,
                    y: scrollPosition.value - 150,
                    animated: true,
                });
            }

            if (e.absoluteY > height - BOTTOM_THRESHOLD) {
                scheduleOnRN(handleScrollTo, {
                    x: 0,
                    y: scrollPosition.value + 200,
                    animated: true,
                });
            } */
        })
        .onEnd(() => {
            /* scheduleOnRN(setStart, {
                x: offset.value.x,
                y: offset.value.y
            }); */
        })
        .onFinalize(() => {
            scheduleOnRN(setIsPressed, false);
            scheduleOnRN(triggerMoveBlock);
            scheduleOnRN(setGhostBlockId, null);
            scheduleOnRN(setStart, { x: 0, y: 0 });
            scheduleOnRN(setOffset, { x: 0, y: 0 });
            scheduleOnRN(setIndicatorPosition, { y: 0 });
        });
    
    const composed = Gesture.Exclusive(blockDrag, nativeGestures);

    return (
        <GestureDetector gesture={composed}>
            <View style={{ position: "relative" }}>
                {children}
            </View>
        </GestureDetector>
    );
}