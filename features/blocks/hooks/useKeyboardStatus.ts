import { useState, useEffect } from "react";
import { Keyboard } from "react-native";

export function useKeyboardStatus() {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        (e) => {
            setIsKeyboardOpen(true);
            setKeyboardHeight(e.endCoordinates.height);
        }
        );
        const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
            setIsKeyboardOpen(false);
        }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    return { isKeyboardOpen, keyboardHeight };
}