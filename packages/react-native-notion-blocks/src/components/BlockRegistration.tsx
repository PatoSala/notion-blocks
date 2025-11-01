import React, { useContext, createContext, useRef, RefObject } from "react";
import { CustomBlock, CustomBlockProps } from "./CustomBlock";
import BlockElement from "./Blocks/Block";

const defaultBlockTypes = {
    /* "text": (props: any) => <BlockElement {...props} />,
    "page": (props: any) => <BlockElement {...props} />,
    "header": (props: any) => <BlockElement {...props} />,
    "sub_header": (props: any) => <BlockElement {...props} />,
    "sub_sub_header": (props: any) => <BlockElement {...props} />, */
}

const BlockRegistrationContext = createContext({});

export function useBlockRegistrationContext() {
    const context = useContext(BlockRegistrationContext);
    if (context === null) {
        throw new Error("useBlockRegistrationContext must be used within a BlockRegistrationProvider");
    }
    return context;
}

export function BlockRegistration(props: any) {
    const {
        customBlocks,
        children
    } = props;

    const blocksMapRef = useRef({});

    const register = React.useCallback(({ type, component } : { type: string; component: Function; }) => {
        blocksMapRef.current[type] = component;
    }, []);

    const unregister = ({ type }) => {
        delete blocksMapRef.current[type];
    }

    React.Children.forEach(customBlocks, (child: CustomBlockProps) => {
        if (React.isValidElement(child)) {
            // Here it should be compared against a BlockConstructor component or sth like that
            if (child.type === CustomBlock) {
                // Register block type
                register(child.props);

            } else {
                console.warn("Invalid");
            }
        }
    })

    const value = React.useMemo(() => ({
        blocks: blocksMapRef.current
    }), []);

    return (
        <BlockRegistrationContext.Provider value={value}>
            {children}
        </BlockRegistrationContext.Provider>
    );
}