import { ALIGNMENT, LEVEL_BITS, MASKS } from './qrTables'
import type { QrEncodeOptions, QrErrorLevel, QrGrid, QrMatrix } from '../../types/BaseQrCode.types'

const FORMAT_MASK = 0x5412

function createGrid(version: number): QrGrid {
	const size = 17 + version * 4
	const rows = (): boolean[][] => Array.from({ length: size }, () => Array<boolean>(size).fill(false))
	return { size, version, modules: rows(), reserved: rows() }
}

function setFunction(grid: QrGrid, [x, y]: readonly [number, number], isDark: boolean): void {
	grid.modules[y][x] = isDark
	grid.reserved[y][x] = true
}

function drawFinder(grid: QrGrid, [centerX, centerY]: readonly [number, number]): void {
	for (let dy = -4; dy <= 4; dy++) {
		for (let dx = -4; dx <= 4; dx++) {
			const [x, y] = [centerX + dx, centerY + dy]
			const distance = Math.max(Math.abs(dx), Math.abs(dy))
			if (x >= 0 && y >= 0 && x < grid.size && y < grid.size) setFunction(grid, [x, y], distance !== 2 && distance !== 4)
		}
	}
}

function drawAlignment(grid: QrGrid, [centerX, centerY]: readonly [number, number]): void {
	for (let dy = -2; dy <= 2; dy++) {
		for (let dx = -2; dx <= 2; dx++) setFunction(grid, [centerX + dx, centerY + dy], Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
	}
}

function drawAlignments(grid: QrGrid): void {
	const positions = ALIGNMENT[grid.version - 1]
	const last = positions.length - 1
	positions.forEach((x, column) => {
		positions.forEach((y, row) => {
			const isFinderCorner = (column === 0 && row === 0) || (column === 0 && row === last) || (column === last && row === 0)
			if (!isFinderCorner) drawAlignment(grid, [x, y])
		})
	})
}

export function formatBits(level: QrErrorLevel, mask: number): number {
	const data = (LEVEL_BITS[level] << 3) | mask
	let remainder = data
	for (let step = 0; step < 10; step++) remainder = (remainder << 1) ^ ((remainder >>> 9) * 0x537)
	return ((data << 10) | remainder) ^ FORMAT_MASK
}

export function versionBits(version: number): number {
	let remainder = version
	for (let step = 0; step < 12; step++) remainder = (remainder << 1) ^ ((remainder >>> 11) * 0x1f25)
	return (version << 12) | remainder
}

const bitAt = (value: number, index: number): boolean => ((value >>> index) & 1) !== 0

function drawFormat(grid: QrGrid, bits: number): void {
	for (let index = 0; index <= 5; index++) setFunction(grid, [8, index], bitAt(bits, index))
	setFunction(grid, [8, 7], bitAt(bits, 6))
	setFunction(grid, [8, 8], bitAt(bits, 7))
	setFunction(grid, [7, 8], bitAt(bits, 8))
	for (let index = 9; index < 15; index++) setFunction(grid, [14 - index, 8], bitAt(bits, index))
	for (let index = 0; index < 8; index++) setFunction(grid, [grid.size - 1 - index, 8], bitAt(bits, index))
	for (let index = 8; index < 15; index++) setFunction(grid, [8, grid.size - 15 + index], bitAt(bits, index))
	setFunction(grid, [8, grid.size - 8], true)
}

function drawVersion(grid: QrGrid): void {
	if (grid.version < 7) return
	const bits = versionBits(grid.version)
	for (let index = 0; index < 18; index++) {
		const [near, far] = [Math.floor(index / 3), grid.size - 11 + (index % 3)]
		setFunction(grid, [far, near], bitAt(bits, index))
		setFunction(grid, [near, far], bitAt(bits, index))
	}
}

function drawFunctionPatterns(grid: QrGrid, level: QrErrorLevel): void {
	for (let index = 0; index < grid.size; index++) {
		setFunction(grid, [6, index], index % 2 === 0)
		setFunction(grid, [index, 6], index % 2 === 0)
	}
	drawFinder(grid, [3, 3])
	drawFinder(grid, [grid.size - 4, 3])
	drawFinder(grid, [3, grid.size - 4])
	drawAlignments(grid)
	drawFormat(grid, formatBits(level, 0))
	drawVersion(grid)
}

function dataPositions(grid: QrGrid): [number, number][] {
	const positions: [number, number][] = []
	for (let right = grid.size - 1; right >= 1; right -= 2) {
		const column = right === 6 ? 5 : right
		const isUpward = ((column + 1) & 2) === 0
		for (let step = 0; step < grid.size * 2; step++) {
			const x = column - (step % 2)
			const y = isUpward ? grid.size - 1 - Math.floor(step / 2) : Math.floor(step / 2)
			if (!grid.reserved[y][x]) positions.push([x, y])
		}
		right = column
	}
	return positions
}

function placeData(grid: QrGrid, codewords: readonly number[]): void {
	dataPositions(grid)
		.slice(0, codewords.length * 8)
		.forEach(([x, y], bit) => {
			grid.modules[y][x] = bitAt(codewords[bit >>> 3], 7 - (bit & 7))
		})
}

export function codewordPositions(version: number): [number, number][] {
	const grid = createGrid(version)
	drawFunctionPatterns(grid, 'L')
	return dataPositions(grid)
}

function applyMask(grid: QrGrid, mask: number): void {
	for (let y = 0; y < grid.size; y++) {
		for (let x = 0; x < grid.size; x++) if (!grid.reserved[y][x] && MASKS[mask](x, y)) grid.modules[y][x] = !grid.modules[y][x]
	}
}

function runPenalty(line: readonly boolean[]): number {
	let penalty = 0
	let run = 1
	for (let index = 1; index <= line.length; index++) {
		if (index < line.length && line[index] === line[index - 1]) run++
		else {
			if (run >= 5) penalty += run - 2
			run = 1
		}
	}
	return penalty
}

const FINDER_LIKE = ['10111010000', '00001011101']

function finderPenalty(line: readonly boolean[]): number {
	const text = line.map(isDark => (isDark ? '1' : '0')).join('')
	let penalty = 0
	for (let index = 0; index + 11 <= text.length; index++) {
		if (FINDER_LIKE.some(pattern => text.startsWith(pattern, index))) penalty += 40
	}
	return penalty
}

function blockPenalty(modules: readonly boolean[][]): number {
	let penalty = 0
	for (let y = 0; y + 1 < modules.length; y++) {
		for (let x = 0; x + 1 < modules.length; x++) {
			const color = modules[y][x]
			if (modules[y][x + 1] === color && modules[y + 1][x] === color && modules[y + 1][x + 1] === color) penalty += 3
		}
	}
	return penalty
}

export function maskPenalty(modules: readonly boolean[][]): number {
	const columns = modules.map((_, x) => modules.map(row => row[x]))
	const lines = [...modules, ...columns]
	const dark = modules.reduce((sum, row) => sum + row.filter(Boolean).length, 0)
	const total = modules.length ** 2
	const balance = (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10
	return lines.reduce((sum, line) => sum + runPenalty(line) + finderPenalty(line), 0) + blockPenalty(modules) + balance
}

function bestMask(grid: QrGrid, level: QrErrorLevel): number {
	let best = { mask: 0, penalty: Infinity }
	for (let mask = 0; mask < MASKS.length; mask++) {
		applyMask(grid, mask)
		drawFormat(grid, formatBits(level, mask))
		const penalty = maskPenalty(grid.modules)
		if (penalty < best.penalty) best = { mask, penalty }
		applyMask(grid, mask)
	}
	return best.mask
}

export function buildMatrix(codewords: readonly number[], options: QrEncodeOptions): QrMatrix {
	const grid = createGrid(options.version)
	drawFunctionPatterns(grid, options.level)
	placeData(grid, codewords)
	const mask = options.mask ?? bestMask(grid, options.level)
	applyMask(grid, mask)
	drawFormat(grid, formatBits(options.level, mask))
	return { version: grid.version, size: grid.size, modules: grid.modules, mask }
}
