import { Block as IBlock } from "../../blocks/interfaces/Block.interface";

export const sampleData : Record<string, IBlock> = {
    "1": {
        id: "1",
        type: "page",
        properties: {
            title: "React Native                                              Blocks"
        },
        content: ["2", "3"],
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
    }
}