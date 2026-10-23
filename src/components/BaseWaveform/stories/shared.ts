export const DEMO_DURATION = 65

export const DEMO_PEAKS = Array.from({ length: 64 }, (_, index) => {
	const wave = Math.abs(Math.sin(index / 3.1)) * 0.6 + Math.abs(Math.sin(index / 7.7)) * 0.4
	return Math.round((0.15 + wave * 0.85) * 100) / 100
})
