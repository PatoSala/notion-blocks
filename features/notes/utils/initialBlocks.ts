import { Block as IBlock } from "../../blocks/interfaces/Block.interface";

export const blocksData : Record<string, IBlock> = {
    "1": {
        id: "1",
        type: "page",
        properties: {
            title: "Hello World"
        },
        content: ["2", "3"],
        parent: "",
        parent_table: "lists"
    },
    "2": {
        id: "2",
        type: "parapraph",
        properties: {
            title: "This is paragraph 2"
        },
        content: [],
        parent: "1",
        parent_table: "blocks"
    },
    "3": {
        id: "3",
        type: "parapraph",
        properties: {
            title: "This is paragraph 3"
        },
        content: [],
        parent: "1",
        parent_table: "blocks"
    }
}