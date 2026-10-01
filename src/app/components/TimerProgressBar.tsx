import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

type TimerProgressBarProps = {
	/** Gesamtdauer des Timers in Sekunden. */
	duration: number;
	/** Verbleibende Zeit in Sekunden. */
	remainingTime: number;
	color?: string;
	trackColor?: string;
	height?: number;
	style?: ViewStyle;
};

export default function TimerProgressBar({
	duration,
	remainingTime,
	color = '#4CAF50',
	trackColor = '#E0E0E0',
	height = 8,
	style,
}: TimerProgressBarProps) {
	const progress = duration > 0
		? Math.min(1, Math.max(0, remainingTime / duration))
		: 0;

	return (
		<View
			accessibilityRole="progressbar"
			accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
			style={[styles.track, { backgroundColor: trackColor, height }, style]}
		>
			<View
				style={[
					styles.fill,
					{ backgroundColor: color, width: `${progress * 100}%` },
				]}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	track: {
		width: '100%',
		borderRadius: 999,
		overflow: 'hidden',
	},
	fill: {
		height: '100%',
		borderRadius: 999,
	},
});
