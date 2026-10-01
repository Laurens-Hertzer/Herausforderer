import { Stack, router } from 'expo-router';
import { Pressable, Text } from 'react-native';

export default function RootLayout() {
  return (
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#005380',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Home",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="gamescreen"
          options={{
            title: "Herausforderungen",
          }}
        />
        <Stack.Screen
          name="resultscreen"
          options={{
            title: "Game over",
          }}
        />
      </Stack>
  );
}