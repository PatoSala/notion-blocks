import { View } from "react-native";
import Animated,{
    useSharedValue,
    useAnimatedStyle,
    withSpring
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export default function DragProvider({ children }) {
    /** Gestures */
    const isPressed = useSharedValue(false);
    const offset = useSharedValue({ x: 0, y: 0 });

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: offset.value.x },
                { translateY: offset.value.y },
                { scale: withSpring(isPressed.value ? 1.2 : 1) },
            ],
            backgroundColor: isPressed.value ? 'yellow' : 'blue',
            display: isPressed.value === false ? 'none' : 'flex'
        };
    });

    // scroll, tap
    const nativeGestures = Gesture.Native()

    const start = useSharedValue({ x: 0, y: 0 });
    const blockDrag = Gesture.Pan()
        .activateAfterLongPress(1000)
        .onBegin(() => {
            /* isPressed.value = true; */
        })
        .onStart((e) => {
            isPressed.value = true;
        })
        .onUpdate((e) => {
            offset.value = {
                x: e.translationX + start.value.x,
                y: e.translationY + start.value.y,
            };
        })
        .onEnd(() => {
            start.value = {
                x: offset.value.x,
                y: offset.value.y,
            };
        })
        .onFinalize(() => {
            isPressed.value = false;
        });
    
    const GhostBlock = () => (
        <Animated.View style={[{
            opacity: 0.5,
            position: "absolute",
            height: "100%",
            width: "100%",
            backgroundColor: "red"
        }, animatedStyles]}>
            {/* <BlockElement
                key={ghostBlockId}
                blockId={ghostBlockId}
                block={blocks[ghostBlockId]}
                title={blocks[ghostBlockId].properties.title}
            /> */}
        </Animated.View>
    )


    const composed = Gesture.Exclusive(blockDrag, nativeGestures);

    return (
        <GestureDetector gesture={composed}>
            <View style={{ position: "relative" }}>
                {children}
                <GhostBlock />

            </View>
        </GestureDetector>
    );
}