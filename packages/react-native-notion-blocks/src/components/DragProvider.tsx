import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export default function DragProvider({
    children,
    onDragStart,
    onDragUpdate,
    onDragEnd
}) {

    // scroll, tap
    const nativeGestures = Gesture.Native()

    const start = useSharedValue({ x: 0, y: 0 });
    const blockDrag = Gesture.Pan()
        .activateAfterLongPress(1000)
        .onBegin((e) => {
            start.value = {
                x: 0,
                y: e.absoluteY
            }
        })
        .onStart((e) => {
            scheduleOnRN(onDragStart);
        })
        .onUpdate((e) => {
            scheduleOnRN(onDragUpdate, e, start.value);

            /* NOTE: Maybe the scroll event shouldn't be handled from withing the DragProvider */
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
        .onFinalize(() => {
            start.value = { x: 0, y: 0 };
            scheduleOnRN(onDragEnd);
        });
    
    const composed = Gesture.Exclusive(blockDrag, nativeGestures);

    return (
        <GestureDetector gesture={composed}>
            {children}
        </GestureDetector>
    );
}