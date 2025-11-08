import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, Image, View, TextInput } from 'react-native';
import Editor from 'react-native-notion-blocks/src/components/Editor';
import { sampleData } from 'react-native-notion-blocks/src/utils/sampleData';
import { largeNoteData } from 'react-native-notion-blocks/src/utils/largeNoteData';
import { blankNote } from 'react-native-notion-blocks/src/utils/blankNote';
import { Block } from 'react-native-notion-blocks/src/components/Block';
import {
  HeaderBlock,
  PageBlock,
  SubHeaderBlock,
  SubSubHeaderBlock,
  TextBlock,
  ImageBlock
} from 'notion/src';

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
            isTextBased: true
          }}
        />

        <Block
          type="header"
          component={HeaderBlock}
          options={{
            isTextBased: true
          }}
        />

        <Block
          type="sub_header"
          component={SubHeaderBlock}
          options={{
            isTextBased: true
          }}
        />

        <Block
          type="sub_sub_header"
          component={SubSubHeaderBlock}
          options={{
            isTextBased: true
          }}
        />

        <Block
          type="text"
          component={TextBlock}
          options={{
            isTextBased: true
          }}
        />

        <Block
          type="image"
          component={ImageBlock}
        />
      </Editor>

      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

