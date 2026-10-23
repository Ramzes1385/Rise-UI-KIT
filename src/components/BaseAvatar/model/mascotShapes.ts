import type { AvatarMascotName, AvatarMood, AvatarMoodShape, AvatarPupilOffset } from '../types/BaseAvatar.types'

const mirror = (brow: readonly number[]): number[] => [-brow[4], brow[5], -brow[2], brow[3], -brow[0], brow[1]]

const symmetric = (brow: number[]): Pick<AvatarMoodShape, 'browLeft' | 'browRight'> => ({ browLeft: brow, browRight: mirror(brow) })

const CALM_BROW = [-10, -8.5, -7, -9.5, -4, -8.5]

export const MASCOT_MOODS: Record<AvatarMood, AvatarMoodShape> = {
	idle: { mouth: [-3.5, 10, -1.17, 12, 1.17, 12, 3.5, 10], ...symmetric(CALM_BROW), browOpacity: 0, eyeOpen: 1 },
	happy: { mouth: [-5, 9, -2.5, 14.5, 2.5, 14.5, 5, 9], ...symmetric([-10, -9, -7, -11, -4, -9]), browOpacity: 0, eyeOpen: 0.8 },
	surprised: {
		mouth: [-2, 10, -2.4, 14.5, 2.4, 14.5, 2, 10],
		...symmetric([-10, -10.5, -7, -13, -4, -10.5]),
		browOpacity: 1,
		eyeOpen: 1.15,
	},
	sad: {
		mouth: [-3.5, 12.5, -1.17, 10, 1.17, 10, 3.5, 12.5],
		...symmetric([-10, -7.5, -7, -8.5, -4, -10]),
		browOpacity: 1,
		eyeOpen: 0.9,
		gaze: { x: 0, y: 1.5 },
	},
	sleepy: {
		mouth: [-2.5, 11, -0.83, 11.5, 0.83, 11.5, 2.5, 11],
		...symmetric(CALM_BROW),
		browOpacity: 0,
		eyeOpen: 0.45,
		gaze: { x: 0, y: 1 },
	},
	thinking: {
		mouth: [-3, 11, -1, 11.2, 1.3, 10.4, 3.5, 9.8],
		browLeft: [-10, -8, -7, -8, -4, -8],
		browRight: [4, -10, 7, -12.5, 10, -10.5],
		browOpacity: 1,
		eyeOpen: 1,
		gaze: { x: 2, y: -2 },
	},
}

export const MASCOT_FACES: Record<Exclude<AvatarMascotName, 'none'>, AvatarPupilOffset> = {
	sprout: { x: 32, y: 37 },
	cloud: { x: 32, y: 38 },
	droplet: { x: 32, y: 42 },
	pebble: { x: 32, y: 40 },
	spark: { x: 32, y: 37 },
}

export const EYE_CLOSED = 0.08

export const toFaceVector = (shape: AvatarMoodShape): number[] => [...shape.mouth, ...shape.browLeft, ...shape.browRight, shape.browOpacity]

export const toMouthPath = (face: readonly number[]): string =>
	`M${face[0]} ${face[1]} C${face[2]} ${face[3]} ${face[4]} ${face[5]} ${face[6]} ${face[7]}`

export const toBrowPath = (face: readonly number[], start: number): string =>
	`M${face[start]} ${face[start + 1]} Q${face[start + 2]} ${face[start + 3]} ${face[start + 4]} ${face[start + 5]}`

export const toLidOpacity = (eyeOpen: number): number => Math.min(1, Math.max(0, (0.5 - eyeOpen) / 0.35))
