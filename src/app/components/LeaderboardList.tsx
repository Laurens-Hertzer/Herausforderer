import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import LeaderboardEntry from "../models/leaderboardentry";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { id: 1, name: "Alice", points: 100 },
    { id: 2, name: "Bob", points: 80 },
    { id: 3, name: "Charlie", points: 60 },
  ]);

  return (
    <FlatList
      data={leaderboard}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item, index }) => (
        <View style={styles.row}>
          <Text style={styles.rank}>#{index + 1}</Text>

          <Text style={styles.name}>{item.name}</Text>

          <Text style={styles.points}>{item.points}</Text>
        </View>
      )}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#243B8F',
    backgroundColor: '#111743',
    shadowColor: '#00E5FF',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  rank: {
    width: 45,
    color: '#FFD54A',
    fontSize: 18,
    fontWeight: '900',
  },
  name: {
    flex: 1,
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  points: {
    color: '#00E5FF',
    fontSize: 18,
    fontWeight: '900',
  },
});


