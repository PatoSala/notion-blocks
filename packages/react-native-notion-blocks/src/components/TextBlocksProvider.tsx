import React from "react";

const TextBlocksContext = React.createContext({});

const useTextBlocksContext = () => React.useContext(TextBlocksContext);

const TextBlocksProvider = ({ children }) => {
    const inputRefs = React.useRef({});
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
        </TextBlocksContext.Provider>
    );
};

export { TextBlocksProvider, useTextBlocksContext };