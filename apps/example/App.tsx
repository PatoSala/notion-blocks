import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Editor, Block } from '@react-native-blocks/core';
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

