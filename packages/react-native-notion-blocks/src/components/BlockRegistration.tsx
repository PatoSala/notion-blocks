import React, { useContext, createContext, useRef, RefObject } from "react";
import { CustomBlock, CustomBlockProps } from "./CustomBlock";
import BlockElement from "./Blocks/Block";

const blockTypes = {
    "text": {
        type: "text",
        component: (props: any) => <BlockElement {...props} />,
        /* properties: ["title"] */
    },
    "page": {
        type: "page",
        component: (props: any) => <BlockElement {...props} />,
        /* properties: ["title"] */
    },
    "header": {
        type: "header",
        component: (props: any) => <BlockElement {...props} />,
        /* properties: ["title"] */
    },
    "sub_header": {
        type: "sub_header",
        component: (props: any) => <BlockElement {...props} />,
        /* properties: ["title"] */
    },
    "sub_sub_header": {
        type: "sub_sub_header",
        component: (props: any) => <BlockElement {...props} />,
        /* properties: ["title"] */
    },
}

const BlockRegistrationContext = createContext({});

export function useBlockRegistrationContext() {
    const context = useContext(BlockRegistrationContext);
    if (!context) {
        throw new Error("useBlockRegistrationContext must be used within a BlockRegistrationProvider");
    }
    return context;
}

export function BlockRegistration(props: any) {
    const {
        customBlocks,
        children
    } = props;

    const blocksMapRef = useRef(blockTypes);

    const register = ({ type, component } : { type: string; component: React.ReactElement; }) => {
        console.log("COMPONENT PROP: ", component);
        blocksMapRef.current[type] = {
            type,
            component: (props: any) => component(props),
        };
        console.log("registered block", type);
    }

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

    const value = {
        blocks: blocksMapRef.current
    }

    console.log("value: ", value);

    return (
        <BlockRegistrationContext.Provider value={value}>
            {children}
        </BlockRegistrationContext.Provider>
    );
}