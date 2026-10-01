import { useState } from "react";
import { FlatList, Text } from "react-native";
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
      renderItem={({ item }) => (
        <Text>
          {item.name}: {item.points}
        </Text>
      )}
    />
  );
}


