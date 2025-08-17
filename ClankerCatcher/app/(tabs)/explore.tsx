import { Image } from 'expo-image';
import { Platform, StyleSheet, View, Button } from 'react-native';
import React, { useState } from 'react';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabTwoScreen() {
  const [message, setMessage] = useState('');

  const testHello = async () => {
    try {
      const response = await fetch('http://YOUR_FLASK_SERVER:5000/hello');
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Error fetching hello:', error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore Page</ThemedText>
      </ThemedView>

      {/* Add the button and message display here */}
      <View style={styles.buttonContainer}>
        <Button title="Call Flask /hello" onPress={testHello} />
        {message ? (
          <ThemedText style={styles.messageText}>Response: {message}</ThemedText>
        ) : null}
      </View>

      <ThemedText>This app includes example code to help you get started.</ThemedText>

      {/* Existing collapsibles */}
      <Collapsible title="File-based routing">
        <ThemedText>
          This app has two screens:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>

      {/* ... keep all your other Collapsible components as they are ... */}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  buttonContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  messageText: {
    marginTop: 10,
    fontSize: 16,
  },
});
