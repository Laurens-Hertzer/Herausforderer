import { StyleSheet, Text, View } from "react-native";
import Leaderboard from "./components/LeaderboardList";
import { useRouter } from 'expo-router';
import PrimaryButton from "./components/PrimaryButton";

  const router = useRouter();

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Leaderboard</Text>
      <Leaderboard />
      <PrimaryButton onPress={() => router.push("/gamescreen")} title="Start Game" />
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#090B35',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    marginBottom: 20,
    textShadowColor: '#FF3D9A',
    textShadowRadius: 12,
  },
});
