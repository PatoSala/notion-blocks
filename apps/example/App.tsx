import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, Image, View, TextInput } from 'react-native';
import Editor from 'react-native-notion-blocks/src/components/Editor';
import { sampleData } from 'react-native-notion-blocks/src/utils/sampleData';
import { largeNoteData } from 'react-native-notion-blocks/src/utils/largeNoteData';
import { blankNote } from 'react-native-notion-blocks/src/utils/blankNote';
import { CustomBlock } from 'react-native-notion-blocks/src/components/CustomBlock';
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
        <CustomBlock
          type="page"
          component={PageBlock}
        />

        <CustomBlock
          type="header"
          component={HeaderBlock}
        />

        <CustomBlock
          type="sub_header"
          component={SubHeaderBlock}
        />

        <CustomBlock
          type="sub_sub_header"
          component={SubSubHeaderBlock}
        />

        <CustomBlock
          type="text"
          component={TextBlock}
        />

        <CustomBlock
          type="image"
          component={ImageBlock}
        />
      </Editor>

      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

