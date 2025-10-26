import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';
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

  console.log("RENDERING CUSTOM BLOCK ID", blockId)

  return (
    <Text>Custom Block</Text>
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
      </Editor>

      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

