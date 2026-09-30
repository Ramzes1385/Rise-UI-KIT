import { isInLogoArea } from '../encode/qrLogo'
import type { QrFinderShape, QrModulePathOptions } from '../../types/BaseQrCode.types'

const DOT_RADIUS = 0.45

const CELL_RADIUS = 0.5

const round = (value: number): number => Math.round(value * 1000) / 1000

export function isFinderModule(size: number, x: number, y: number): boolean {
	const isNear = (value: number): boolean => value < 7
	const isFar = (value: number): boolean => value >= size - 7
	return (isNear(x) && (isNear(y) || isFar(y))) || (isFar(x) && isNear(y))
}

export function roundedSquare([x, y]: readonly [number, number], side: number, radii: readonly number[]): string {
	const [topLeft, topRight, bottomRight, bottomLeft] = radii
	const arc = (radius: number, dx: number, dy: number): string => (radius ? `a${radius} ${radius} 0 0 1 ${dx} ${dy}` : '')
	return [
		`M${round(x + topLeft)} ${y}h${side - topLeft - topRight}`,
		arc(topRight, topRight, topRight),
		`v${side - topRight - bottomRight}`,
		arc(bottomRight, -bottomRight, bottomRight),
		`h${-(side - bottomRight - bottomLeft)}`,
		arc(bottomLeft, -bottomLeft, -bottomLeft),
		`v${-(side - bottomLeft - topLeft)}`,
		arc(topLeft, topLeft, -topLeft),
		'z',
	].join('')
}

function circle([x, y]: readonly [number, number], radius: number): string {
	return `M${round(x - radius)} ${y}a${radius} ${radius} 0 1 0 ${radius * 2} 0a${radius} ${radius} 0 1 0 ${-radius * 2} 0z`
}

const ring = (corner: readonly [number, number], radii: readonly [number, number, number]): string =>
	[0, 1, 2]
		.map(inset => roundedSquare([corner[0] + inset, corner[1] + inset], 7 - inset * 2, Array<number>(4).fill(radii[inset])))
		.join('')

const FINDERS: Record<QrFinderShape, (corner: readonly [number, number]) => string> = {
	square: corner => ring(corner, [0, 0, 0]),
	rounded: corner => ring(corner, [2, 1, 1]),
	circle: ([x, y]) => [3.5, 2.5, 1.5].map(radius => circle([x + 3.5, y + 3.5], radius)).join(''),
}

export function finderPath(size: number, margin: number, shape: QrFinderShape): string {
	const corners: [number, number][] = [
		[0, 0],
		[size - 7, 0],
		[0, size - 7],
	]
	return corners.map(([x, y]) => FINDERS[shape]([x + margin, y + margin])).join('')
}

function runsPath(size: number, margin: number, isDrawn: (x: number, y: number) => boolean): string {
	const commands: string[] = []
	for (let y = 0; y < size; y++) {
		let x = 0
		while (x < size) {
			const start = x
			while (x < size && isDrawn(x, y)) x++
			if (x > start) commands.push(`M${start + margin} ${y + margin}h${x - start}v1h-${x - start}z`)
			else x++
		}
	}
	return commands.join('')
}

function cellsPath(size: number, isDrawn: (x: number, y: number) => boolean, cell: (x: number, y: number) => string): string {
	const commands: string[] = []
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) if (isDrawn(x, y)) commands.push(cell(x, y))
	}
	return commands.join('')
}

const dotCell =
	(margin: number) =>
	(x: number, y: number): string =>
		circle([x + margin + 0.5, y + margin + 0.5], DOT_RADIUS)

const roundedCell = (margin: number, isDrawn: (x: number, y: number) => boolean) => (x: number, y: number) => {
	const isFree = (dx: number, dy: number): boolean => !isDrawn(x + dx, y + dy)
	const radius = (first: boolean, second: boolean): number => (first && second ? CELL_RADIUS : 0)
	const [top, right, bottom, left] = [isFree(0, -1), isFree(1, 0), isFree(0, 1), isFree(-1, 0)]
	return roundedSquare([x + margin, y + margin], 1, [radius(top, left), radius(top, right), radius(bottom, right), radius(bottom, left)])
}

export function modulePath(modules: readonly (readonly boolean[])[], options: QrModulePathOptions): string {
	const size = modules.length
	const isDrawn = (x: number, y: number): boolean =>
		modules[y]?.[x] === true && !isFinderModule(size, x, y) && !isInLogoArea(options.area, [x, y])
	if (options.shape === 'dots') return cellsPath(size, isDrawn, dotCell(options.margin))
	if (options.shape === 'rounded') return cellsPath(size, isDrawn, roundedCell(options.margin, isDrawn))
	return runsPath(size, options.margin, isDrawn)
}
