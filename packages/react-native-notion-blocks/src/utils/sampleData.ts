import { Block as IBlock } from "../interfaces/Block.interface";

export const sampleData : Record<string, IBlock> = {
    "1": {
        id: "1",
        type: "page",
        properties: {
            title: "React Native Blocks"
        },
        content: ["2", "5", "3", "8", "4"],
        parent: ""
    },
    "2": {
        id: "2",
        type: "sub_header",
        properties: {
            title: "Inspired by the data model behind Notion’s flexibility."
        },
        content: [],
        parent: "1"
    },
    "3": {
        id: "3",
        type: "text",
        properties: {
            title: "React Native Blocks is a block-based text editor component. It brings to your app the power of Notion blocks architecture plus the possibility to customize or even extend the editor’s functionalities with your own block components."
        },
        content: [],
        parent: "1"
    },
    "8": {
        id: "8",
        type: "header",
        properties: {
            title: "Header from Notion"
        },
        content: [],
        parent: "1"
    },
    "4": {
        id: "4",
        type: "page",
        properties: {
            title: "Page"
        },
        content: [],
        parent: "1"
    },
    "5": {
        id: "5",
        type: "image",
        properties: {
            title: "Custom Image Block"
        },
        content: [],
        parent: "1"
    }/* ,
    "6": {
        id: "6",
        type: "custom-text-input",
        properties: {
            title: "Custom Text Input Block"
        },
        content: [],
        parent: "1"
    },
    "7": {
        id: "7",
        type: "custom-text-input",
        properties: {
            title: "Custom Text Input Block"
        },
        content: [],
        parent: "1"
    }, */
    /* ,
    "8": {
        id: "8",
        type: "sub_header",
        properties: {
            title: "What is Lorem Ipsum?"
        },
        content: [],
        parent: "1"
    },
    "9": {
        id: "9",
        type: "text",
        properties: {
            title: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
        },
        content: [],
        parent: "1"
    } */
}