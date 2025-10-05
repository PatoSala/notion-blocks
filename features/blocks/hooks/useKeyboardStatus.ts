import { useState, useEffect } from "react";
import { Keyboard } from "react-native";

export function useKeyboardStatus() {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

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
        const getKeyboardHeightListener = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        

        // Clean up listeners on component unmount
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
            getKeyboardHeightListener.remove();
        };
    }, []);

    return { isKeyboardOpen, keyboardHeight };
}