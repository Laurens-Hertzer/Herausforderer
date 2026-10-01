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
    alignItems: "center",
    justifyContent: "flex-start",
  },
  text: {
    fontSize: 48,
  }
});
