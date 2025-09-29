import { useEffect, useState } from "react";

interface Params {
    key: string;
    target?: "keydown" | "keyup";
}

export function useDetectKeyPress({
    key,
    target
} : Params) {
    const [isPressed, setIsPressed] = useState(false);

   const handleKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === key) {
      setIsPressed(true);
      // Perform actions when Delete or Backspace is pressed
      console.log('Delete or Backspace key pressed!');
    } else {
      setIsPressed(false);
    }
  };

  return {
      isPressed,
      handleKeyPress
  }
}