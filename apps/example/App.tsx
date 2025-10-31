import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, Image, View, TextInput } from 'react-native';
/* import Editor from '../../packages/react-native-notion-blocks/src/components/Editor'; */
import Editor from '../../packages/react-native-notion-blocks/src/components/Editor';
import { sampleData } from 'react-native-notion-blocks/src/utils/sampleData';

import { CustomBlock } from 'react-native-notion-blocks/src/components/CustomBlock';
import { BlockProps } from 'react-native-notion-blocks/src/components/Blocks/Block';
import { useTextInput } from 'react-native-notion-blocks/src/hooks/useTextInput';
import { useBlock, useBlocksContext } from 'react-native-notion-blocks/src/components/Blocks/BlocksContext';
import { HeaderBlock, PageBlock, SubHeaderBlock, SubSubHeaderBlock, TextBlock } from 'notion/src';

const CustomImageBlock = (props: BlockProps) => {
  const {
    blockId,
  } = props;

  return (
    <View style={{ width: "100%", height: 200, backgroundColor: "#f37777ff" }}>
      <Image
        style={{ width: "100%", height: "100%" }}
        source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
      />
    </View>
  )
}

const Component = (props: BlockProps) => {
  const {
    blockId
  } = props;

  const { getTextInputProps } = useTextInput(blockId);

  return (
    <TextInput
      {...getTextInputProps()}
      placeholder='This is a custom Text Input component'
    />
  )
}



export default function App() {
  return (
    <SafeAreaProvider>
      <Editor
        defaultBlocks={sampleData}
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
          component={CustomImageBlock}
        />
      </Editor>

      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

