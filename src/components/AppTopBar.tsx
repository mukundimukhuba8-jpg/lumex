import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompactAppHeader } from './NativeMobileUI';

/** Compact native top chrome for the main app. */
export function AppTopBar() {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.inner}>
        <CompactAppHeader />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: 'transparent',
  },
  inner: {
    width: '100%',
  },
});
