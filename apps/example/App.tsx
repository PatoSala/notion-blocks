import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, Image, View } from 'react-native';
/* import Editor from '../../packages/react-native-notion-blocks/src/components/Editor'; */
import Editor from '../../packages/react-native-notion-blocks/src/components/Editor';
import { sampleData } from 'react-native-notion-blocks/src/utils/sampleData';

import { CustomBlock } from 'react-native-notion-blocks/src/components/CustomBlock';
import { BlockProps } from 'react-native-notion-blocks/src/components/Blocks/Block';

const Component = (props: BlockProps) => {
  const {
    blockId,
    block,
    title,
    refs,
    registerRef,
    unregisterRef,
    showSoftInputOnFocus,
  } = props;

  return (
    <Text>Custom Block</Text>
  )
}

const CustomImageBlock = (props: BlockProps) => {
  const {
    blockId,
    title
  } = props;

  return (
    <View style={{ width: "100%", height: 200, backgroundColor: "#f37777ff" }}>
      <Image
        style={{ width: "100%", height: "100%" }}
        source={{ uri: "https://github.com/PatoSala/notion-blocks/raw/main/assets/cover.png?raw=true" }}
      />
    </View>
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
          type="custom"
          component={Component}
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

