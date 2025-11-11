![Frame 14.png](assets/cover.png?raw=true)

# React Native Blocks

A block based text editor fully built with react-native. Inspired by [the data model behind Notion’s flexibility.](https://www.notion.com/blog/data-model-behind-notion)

![Screenshot 2025-10-07 at 6.02.31 PM.png](assets/screenshot.png?raw=true)

## Installation
First install the base library. This one will provide us with the core functionalities.
```
npm install @react-native-blocks/core
```
Then install the library which contains the actual block components.
```
npm install @react-native-blocks/blocks
```

## Usage
```js
import { StatusBar } from 'expo-status-bar';
import { Editor, Block } from '@react-native-blocks/core';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';
import {
  HeaderBlock,
  PageBlock,
  SubHeaderBlock,
  SubSubHeaderBlock,
  TextBlock,
  ImageBlock
} from '@react-native-blocks/blocks';

const blankNote = {
    "1": {
        id: "1",
        type: "page",
        properties: {
            title: ""
        },
        content: [],
        parent: ""
    }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Editor
        defaultBlocks={blankNote}
        rootBlockId="1"
        defaultBlockType={"text"}
        contentContainerStyle={{
          paddingTop: 70
        }}
      >
        <Block
          type="page"
          component={PageBlock}
          options={{
            isTextBased: true,
            name: "Page"
          }}
        />

        <Block
          type="header"
          component={HeaderBlock}
          options={{
            isTextBased: true,
            name: "Header 1"
          }}
        />

        <Block
          type="sub_header"
          component={SubHeaderBlock}
          options={{
            isTextBased: true,
            name: "Header 2"
          }}
        />

        <Block
          type="sub_sub_header"
          component={SubSubHeaderBlock}
          options={{
            isTextBased: true,
            name: "Header 3"
          }}
        />

        <Block
          type="text"
          component={TextBlock}
          options={{
            isTextBased: true,
            name: "Text"
          }}
        />

        <Block
          type="image"
          component={ImageBlock}
          options={{
            name: "Image"
          }}
        />
      </Editor>

      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
```

Feel free to contribute!

## Contributing

Feel free to contribute!

## Discord

Join me on Discord [https://discord.gg/utxtAafD8n](https://discord.gg/utxtAafD8n)

## Disclaimer

This project is an independent open-source initiative and is **not affiliated with, endorsed by, or connected to Notion Labs, Inc.** in any way.

All trademarks, logos, and brand names used in this project are the property of their respective owners. Any references to “Notion” are for **descriptive or comparative purposes only** and do not imply any association or partnership.

