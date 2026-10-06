import type { ImageMap3DData } from '../../types/imageMap3dData.types'

const PLAN_WIDTH = 1200
const PLAN_HEIGHT = 760
const COLUMN_COUNT = 6
const COLUMN_RADIUS = 9
const COLUMN_HEIGHT = 40
const ROOF_THICKNESS = 6
const DEMO_NOTE = 'Демо-данные: условная геометрия для проверки 3D, не реальный объект'

const GALLERY_OUTER = [
	[480, 600],
	[560, 500],
	[760, 500],
	[840, 600],
]
const GALLERY_INNER = [
	[520, 640],
	[580, 570],
	[740, 570],
	[800, 640],
]

function bezierPoint(curve: number[][], t: number): number[] {
	const weights = [(1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t ** 2, t ** 3]
	return [0, 1].map(axis => curve.reduce((sum, point, index) => sum + point[axis] * weights[index], 0))
}

function galleryColumnId(index: number): string {
	return `gallery-column-${index + 1}`
}

function galleryColumns(): string {
	return Array.from({ length: COLUMN_COUNT }, (_, index) => {
		const t = (index + 0.5) / COLUMN_COUNT
		const [outerX, outerY] = bezierPoint(GALLERY_OUTER, t)
		const [innerX, innerY] = bezierPoint(GALLERY_INNER, t)
		const center = `cx="${((outerX + innerX) / 2).toFixed(1)}" cy="${((outerY + innerY) / 2).toFixed(1)}"`
		return `<circle id="${galleryColumnId(index)}" ${center} r="${COLUMN_RADIUS}" fill="#bbf7d0" stroke="#16a34a" stroke-width="2"/>`
	}).join('')
}

function planSvg(): string {
	const body = 'fill="#e8edf5" stroke="#94a3b8" stroke-width="2"'
	return [
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PLAN_WIDTH} ${PLAN_HEIGHT}">`,
		`<rect width="${PLAN_WIDTH}" height="${PLAN_HEIGHT}" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4"/>`,
		`<path id="hall" d="M60 60 H460 V260 H360 A70 70 0 0 0 290 330 V420 H60 Z" ${body}/>`,
		`<path id="atrium" fill-rule="evenodd" d="M540 60 H1140 V420 H540 Z M740 240 a100 100 0 1 0 200 0 a100 100 0 1 0 -200 0 Z" ${body}/>`,
		`<g id="pavilion">`,
		`<path id="pavilion-podium" d="M90 520 H330 Q360 520 360 550 V680 Q360 710 330 710 H90 Q60 710 60 680 V550 Q60 520 90 520 Z" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>`,
		`<rect id="pavilion-tower" x="130" y="570" width="100" height="90" rx="6" fill="#fde68a" stroke="#d97706" stroke-width="2"/>`,
		`<ellipse id="pavilion-roof" cx="180" cy="615" rx="95" ry="75" fill="#fcd34d" stroke="#b45309" stroke-width="2"/>`,
		`</g>`,
		`<g id="gallery">`,
		`<path id="gallery-roof" d="M480 600 C560 500 760 500 840 600 L800 640 C740 570 580 570 520 640 Z" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>`,
		galleryColumns(),
		`</g>`,
		`<path id="wall" d="M880 700 V520 H1140 V526 H886 V700 Z" fill="#cbd5e1" stroke="#64748b" stroke-width="1"/>`,
		`<ellipse id="oval" cx="1020" cy="620" rx="70" ry="55" ${body}/>`,
		`</svg>`,
	].join('')
}

const galleryParts = [
	...Array.from({ length: COLUMN_COUNT }, (_, index) => ({ elementId: galleryColumnId(index), height3d: COLUMN_HEIGHT })),
	{ elementId: 'gallery-roof', height3d: ROOF_THICKNESS, base3d: COLUMN_HEIGHT },
]

export const DEMO_DETAILED_PLAN: ImageMap3DData = {
	version: 1,
	layers: [{ id: 'demo-floor', title: 'Демо-план: условная геометрия', svg: planSvg(), width: PLAN_WIDTH, height: PLAN_HEIGHT }],
	groups: [
		{ id: 'halls', title: 'Залы', color: 'var(--rise-primary)' },
		{ id: 'towers', title: 'Павильоны', color: 'var(--rise-warning)' },
		{ id: 'open', title: 'Навесы', color: 'var(--rise-success)' },
		{ id: 'walls', title: 'Стены', color: 'var(--rise-text-muted)' },
	],
	objects: [
		{
			id: 'demo-hall',
			type: 'svg',
			elementId: 'hall',
			title: 'Демо: зал с круглым углом',
			group: 'halls',
			height3d: 48,
			description: DEMO_NOTE,
		},
		{
			id: 'demo-atrium',
			type: 'svg',
			elementId: 'atrium',
			title: 'Демо: атриум с двором',
			group: 'halls',
			height3d: 36,
			description: DEMO_NOTE,
		},
		{
			id: 'demo-pavilion',
			type: 'svg',
			elementId: 'pavilion',
			title: 'Демо: павильон из трёх частей',
			group: 'towers',
			description: DEMO_NOTE,
			parts: [
				{ elementId: 'pavilion-podium', height3d: 24 },
				{ elementId: 'pavilion-tower', height3d: 70, base3d: 24 },
				{ elementId: 'pavilion-roof', height3d: 6, base3d: 94 },
			],
		},
		{
			id: 'demo-gallery',
			type: 'svg',
			elementId: 'gallery',
			title: 'Демо: галерея на колоннах',
			group: 'open',
			description: DEMO_NOTE,
			parts: galleryParts,
		},
		{
			id: 'demo-wall',
			type: 'svg',
			elementId: 'wall',
			title: 'Демо: тонкая стена',
			group: 'walls',
			height3d: 36,
			description: DEMO_NOTE,
		},
		{
			id: 'demo-oval',
			type: 'svg',
			elementId: 'oval',
			title: 'Демо: овальный корпус',
			group: 'halls',
			height3d: 60,
			description: DEMO_NOTE,
		},
	],
}
