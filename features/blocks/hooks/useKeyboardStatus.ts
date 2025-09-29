import { useState, useEffect } from "react";
import { Keyboard } from "react-native";

export function useKeyboardStatus() {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        () => {
            setIsKeyboardOpen(true); // Keyboard is open
        }
        );
        const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
            setIsKeyboardOpen(false); // Keyboard is closed
        }
        );

        // Clean up listeners on component unmount
        return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
        };
    }, []);

    return { isKeyboardOpen };
}