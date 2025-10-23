import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';
/* import Editor from '../../packages/react-native-notion-blocks/src/components/Editor'; */
import Editor from '../../packages/react-native-notion-blocks/src/components/Editor';

export default function App() {
  return (
    <SafeAreaProvider>
      <Editor />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

