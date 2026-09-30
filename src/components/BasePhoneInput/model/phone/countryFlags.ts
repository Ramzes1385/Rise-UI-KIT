import type { FlagShape, FlagCircle } from '../../types/CountryFlag.types'

const WIDTH = 30

const HEIGHT = 20

const round = (value: number): number => Math.round(value * 100) / 100

const box = ([x, y, width, height]: readonly [number, number, number, number], fill: string): FlagShape => ({
	tag: 'rect',
	attrs: { x, y, width, height, fill },
})

const field = (fill: string): FlagShape => box([0, 0, WIDTH, HEIGHT], fill)

const disc = ([cx, cy, r]: FlagCircle, fill: string): FlagShape => ({ tag: 'circle', attrs: { cx, cy, r, fill } })

const shape = (d: string, fill: string): FlagShape => ({ tag: 'path', attrs: { d, fill } })

const line = (d: string, paint: { color: string; width: number; dash?: string }): FlagShape => ({
	tag: 'path',
	attrs: { d, fill: 'none', stroke: paint.color, 'stroke-width': paint.width, 'stroke-dasharray': paint.dash ?? 'none' },
})

const ring = ([cx, cy, r]: FlagCircle, paint: { color: string; width: number; dash?: string }): FlagShape => ({
	tag: 'circle',
	attrs: { cx, cy, r, fill: 'none', stroke: paint.color, 'stroke-width': paint.width, 'stroke-dasharray': paint.dash ?? 'none' },
})

const stripes = (colors: readonly string[]): FlagShape[] =>
	colors.map((color, index) => {
		const y = round((HEIGHT * index) / colors.length)
		return box([0, y, WIDTH, round(HEIGHT - y)], color)
	})

function starPoints([cx, cy, r]: FlagCircle, spec: { points: number; inner: number; rotation: number }): string {
	const count = spec.points * 2
	return Array.from({ length: count }, (_, index) => {
		const radius = index % 2 === 0 ? r : r * spec.inner
		const angle = ((spec.rotation + (index * 360) / count) * Math.PI) / 180
		return `${round(cx + radius * Math.cos(angle))},${round(cy + radius * Math.sin(angle))}`
	}).join(' ')
}

const star = (circle: FlagCircle, spec: { fill: string; points?: number; inner?: number; rotation?: number }): FlagShape => ({
	tag: 'polygon',
	attrs: {
		points: starPoints(circle, { points: spec.points ?? 5, inner: spec.inner ?? 0.382, rotation: spec.rotation ?? -90 }),
		fill: spec.fill,
	},
})

function plus([cx, cy]: readonly [number, number], fill: string): FlagShape {
	const [arm, half] = [1.7, 0.55]
	const side = round(arm - half)
	return shape(
		`M${round(cx - half)} ${round(cy - arm)}h${half * 2}v${side}h${side}v${half * 2}h${-side}v${side}h${-half * 2}v${-side}h${-side}v${-half * 2}h${side}z`,
		fill,
	)
}

const dots = (points: readonly (readonly [number, number])[], spec: { r: number; fill: string }): FlagShape[] =>
	points.map(([x, y]) => disc([x, y, spec.r], spec.fill))

const grid = (rows: readonly (readonly number[])[], ys: readonly number[]): [number, number][] =>
	rows.flatMap((xs, row) => xs.map((x): [number, number] => [x, ys[row]]))

const towards = ([x, y]: readonly [number, number], [tx, ty]: readonly [number, number]): number =>
	round((Math.atan2(ty - y, tx - x) * 180) / Math.PI)

const arc = (count: number, spec: { cx: number; cy: number; r: number; from: number; to: number }): [number, number][] =>
	Array.from({ length: count }, (_, index) => {
		const angle = ((spec.from + ((spec.to - spec.from) * index) / (count - 1)) * Math.PI) / 180
		return [round(spec.cx + spec.r * Math.cos(angle)), round(spec.cy + spec.r * Math.sin(angle))]
	})

const KAZAKH_COLORS = { gold: '#FEC50C', sky: '#00AFCA' }

const KAZAKHSTAN: FlagShape[] = [
	field(KAZAKH_COLORS.sky),
	line('M2.2 1V19', { color: KAZAKH_COLORS.gold, width: 1.4, dash: '1.2 0.8' }),
	ring([15, 8.2, 4.6], { color: KAZAKH_COLORS.gold, width: 1.3, dash: '0.8 0.75' }),
	disc([15, 8.2, 3], KAZAKH_COLORS.gold),
	line('M9.6 13.4Q15 16.8 20.4 13.4', { color: KAZAKH_COLORS.gold, width: 1.1 }),
]

const BELARUS: FlagShape[] = [
	field('#C8313E'),
	box([0, 13.33, WIDTH, 6.67], '#4AA657'),
	box([0, 0, 4.4, HEIGHT], '#FFFFFF'),
	...[2.5, 7.5, 12.5, 17.5].map(y => shape(`M2.2 ${y - 1.7}l1.5 1.7-1.5 1.7-1.5-1.7z`, '#C8313E')),
]

const UZBEKISTAN: FlagShape[] = [
	field('#1EB53A'),
	box([0, 0, WIDTH, 13.6], '#CE1126'),
	box([0, 0, WIDTH, 13], '#FFFFFF'),
	box([0, 0, WIDTH, 7], '#CE1126'),
	box([0, 0, WIDTH, 6.4], '#0099B5'),
	disc([4.6, 3.2, 2.2], '#FFFFFF'),
	disc([5.5, 3.2, 1.9], '#0099B5'),
	...dots(
		grid(
			[
				[9.4, 11, 12.6],
				[7.8, 9.4, 11, 12.6],
				[7.8, 9.4, 11, 12.6],
			],
			[1.5, 3.2, 4.9],
		),
		{ r: 0.32, fill: '#FFFFFF' },
	),
]

const KYRGYZSTAN: FlagShape[] = [
	field('#E8112D'),
	ring([15, 10, 5.4], { color: '#FFEF00', width: 2.2, dash: '0.6 0.55' }),
	disc([15, 10, 3.9], '#FFEF00'),
	ring([15, 10, 2.2], { color: '#E8112D', width: 0.7 }),
	line('M12.9 9.2Q15 10.8 17.1 9.2M12.9 10.8Q15 9.2 17.1 10.8', { color: '#E8112D', width: 0.6 }),
]

const TAJIKISTAN: FlagShape[] = [
	field('#006600'),
	box([0, 0, WIDTH, 14.29], '#FFFFFF'),
	box([0, 0, WIDTH, 5.71], '#CC0000'),
	shape('M12.9 12.3h4.2l.4-2.3-1.3.9-1.1-1.6-1.1 1.6-1.3-.9z', '#F8C300'),
	...dots(arc(7, { cx: 15, cy: 11.4, r: 4, from: 200, to: 340 }), { r: 0.34, fill: '#F8C300' }),
]

const AZERBAIJAN: FlagShape[] = [
	...stripes(['#00B5E2', '#EF3340', '#509E2F']),
	disc([14.2, 10, 2.5], '#FFFFFF'),
	disc([14.9, 10, 2.05], '#EF3340'),
	star([17.2, 10, 1.15], { fill: '#FFFFFF', points: 8, inner: 0.45 }),
]

const GEORGIA: FlagShape[] = [
	field('#FFFFFF'),
	box([13, 0, 4, HEIGHT], '#FF0000'),
	box([0, 8, WIDTH, 4], '#FF0000'),
	...(
		[
			[6.5, 4],
			[23.5, 4],
			[6.5, 16],
			[23.5, 16],
		] as const
	).map(center => plus(center, '#FF0000')),
]

const TURKEY: FlagShape[] = [
	field('#E30A17'),
	disc([10.6, 10, 5], '#FFFFFF'),
	disc([11.85, 10, 4], '#E30A17'),
	star([16.4, 10, 2.1], { fill: '#FFFFFF', rotation: 180 }),
]

const CHINA_STARS = [
	[10, 2],
	[12, 4],
	[12, 7],
	[10, 9],
] as const

const CHINA: FlagShape[] = [
	field('#EE1C25'),
	star([5, 5, 3], { fill: '#FFFF00' }),
	...CHINA_STARS.map(center => star([center[0], center[1], 1], { fill: '#FFFF00', rotation: towards(center, [5, 5]) })),
]

const STRIPE = HEIGHT / 13

const USA: FlagShape[] = [
	field('#FFFFFF'),
	...Array.from({ length: 7 }, (_, index) => box([0, round(index * 2 * STRIPE), WIDTH, round(STRIPE)], '#B22234')),
	box([0, 0, 12, round(STRIPE * 7)], '#3C3B6E'),
	...dots(
		grid(
			[0, 1, 2, 3, 4].map(row => Array.from({ length: row % 2 ? 5 : 6 }, (_, index) => round((row % 2 ? 2.16 : 1.2) + index * 1.92))),
			[1.1, 3.24, 5.38, 7.52, 9.66],
		),
		{ r: 0.38, fill: '#FFFFFF' },
	),
]

const BRITAIN: FlagShape[] = [
	field('#012169'),
	line('M0 0L30 20M30 0L0 20', { color: '#FFFFFF', width: 4 }),
	line('M0 0L30 20M30 0L0 20', { color: '#C8102E', width: 1.4 }),
	line('M15 0V20M0 10H30', { color: '#FFFFFF', width: 6 }),
	line('M15 0V20M0 10H30', { color: '#C8102E', width: 3.6 }),
]

const FLAGS: Record<string, readonly FlagShape[]> = {
	RU: stripes(['#FFFFFF', '#0039A6', '#D52B1E']),
	KZ: KAZAKHSTAN,
	BY: BELARUS,
	UZ: UZBEKISTAN,
	KG: KYRGYZSTAN,
	TJ: TAJIKISTAN,
	AM: stripes(['#D90012', '#0033A0', '#F2A800']),
	AZ: AZERBAIJAN,
	GE: GEORGIA,
	TR: TURKEY,
	CN: CHINA,
	US: USA,
	GB: BRITAIN,
}

export function countryFlag(code: string): readonly FlagShape[] {
	const key = code.toUpperCase()
	return (
		FLAGS[key] ?? [
			{ tag: 'rect', attrs: { width: WIDTH, height: HEIGHT, class: 'base-phone-input__flag-empty' } },
			{ tag: 'text', attrs: { x: 15, y: 14, 'text-anchor': 'middle', class: 'base-phone-input__flag-code' }, text: key.slice(0, 2) },
		]
	)
}
