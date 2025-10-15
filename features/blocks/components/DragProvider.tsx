import { View, Dimensions } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import BlockElement from "./Block";

const { height } = Dimensions.get("window");
const TOP_THRESHOLD = 200; // Adjust as needed
const BOTTOM_THRESHOLD = 200;

export default function DragProvider({ children, block, scrollviewRef }) {
    /** Gestures */
    const isPressed = useSharedValue(false);
    const offset = useSharedValue({ x: 0, y: 0 });

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: offset.value.x },
                { translateY: offset.value.y },
            ],
            display: isPressed.value === false ? 'none' : 'flex',
            borderWidth: isPressed.value === true ? 1 : 0,
            borderRadius: 5
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

            if (e.absoluteY < TOP_THRESHOLD) {
                console.log(scrollviewRef);
                console.log("top");
            }

            if (e.absoluteY > height - BOTTOM_THRESHOLD) {
                console.log("bottom");
            }
        })
        .onEnd(() => {
            /* start.value = {
                x: offset.value.x,
                y: offset.value.y,
            }; */
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
        }, animatedStyles]}>
            <BlockElement
                key={block.id}
                blockId={block.id}
                block={block}
                title={block.properties.title}
            />
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