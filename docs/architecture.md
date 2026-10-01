# Architektur-Dokumentation

## Komponenten

* `TimerProgressBar` – Countdown-Anzeige
* `ChallengeCard` – Darstellung der Challenge
* `MapViewTracker` – GPS und Distanzmessung
* `LeaderboardList` – Highscore-Liste
* `PrimaryButton` – Hauptaktionen
* `InputField` – Namenseingabe

## Navigation

**Native Stack Navigator**

```text
RootStack
├── Index
├── GameScreen
└── ResultScreen
```

Challenges wechseln automatisch nach Abschluss oder Ablauf der Zeit.

## Datenmodell

```typescript
Challenge {
  id,
  title,
  task,
  timeLimitSeconds,
  sensorType,
  targetValue
}

LeaderboardEntry {
  id,
  name,
  points
}
```

## Zustand & Side-Effects

* **Lokal:** Spielername, aktuelle Challenge, Timer, Sensor-Fortschritt, Punktestand
* **Global:** Kein globaler Store; Übergabe über Route-Parameter
* **Local Storage:** Highscore mit AsyncStorage
* **Sensoren:** Expo-Sensoren werden pro Challenge aktiviert und danach wieder entfernt.
