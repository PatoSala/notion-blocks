import React from "react";
import { TextInput } from "react-native";

const TextBlocksContext = React.createContext({});

const useTextBlocksContext = () => React.useContext(TextBlocksContext);

const TextBlocksProvider = ({ children }) => {
    const inputRefs = React.useRef({});
    const ghostInputRef = React.useRef<TextInput>(null);
    const [showSoftInputOnFocus, setShowSoftInputOnFocus] = React.useState(true);

    const registerRef = (blockId, ref) => {
        inputRefs.current[blockId] = ref;
    };

    const unregisterRef = (blockId) => {
        delete inputRefs.current[blockId];
    };

    const value = {
        inputRefs,
        showSoftInputOnFocus,
        setShowSoftInputOnFocus,
        registerRef,
        unregisterRef
    }

    return (
        <TextBlocksContext.Provider value={value}>
            {children}
            <TextInput
                ref={ghostInputRef}
                onLayout={() => registerRef("ghostInput", ghostInputRef)}
                style={{
                    position: "absolute",
                    opacity: 0
                }}
            />
        </TextBlocksContext.Provider>
    );
};

export { TextBlocksProvider, useTextBlocksContext };