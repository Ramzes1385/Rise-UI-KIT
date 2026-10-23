import { encodeBytes } from './qrCode'
import { chooseVersion } from './qrData'
import { codewordPositions } from './qrMatrix'
import { BLOCKS, MAX_VERSION } from './qrTables'
import { QR_ERROR_LEVELS } from '../../types/BaseQrCode.types'
import type { QrErrorLevel, QrLogoArea, QrLogoCode, QrLogoFit } from '../../types/BaseQrCode.types'

const LOGO_SHARE = { min: 0.1, max: 0.3, initial: 0.22, step: 0.02 }

const LOGO_BUDGET = 0.6

const FORMAT_ZONE = 9

const positionsCache = new Map<number, [number, number][]>()

export function clampLogoShare(share: number | undefined): number {
	const value = share !== undefined && Number.isFinite(share) ? share : LOGO_SHARE.initial
	return Math.min(LOGO_SHARE.max, Math.max(LOGO_SHARE.min, value))
}

export function logoArea(size: number, share: number): QrLogoArea {
	const image = Math.round(size * share * 1000) / 1000
	const minimal = Math.ceil(image + 1)
	const side = minimal + ((minimal + 1) % 2)
	return { start: (size - side) / 2, side, image }
}

export function isInLogoArea(area: QrLogoArea | null, [x, y]: readonly [number, number]): boolean {
	if (!area) return false
	const end = area.start + area.side
	return x >= area.start && y >= area.start && x < end && y < end
}

function blockOwners(version: number, level: QrErrorLevel): number[] {
	const [ecSize, firstBlocks, firstSize, secondBlocks, secondSize] = BLOCKS[level][version - 1]
	const sizes = [...Array<number>(firstBlocks).fill(firstSize), ...Array<number>(secondBlocks).fill(secondSize)]
	const owners: number[] = []
	for (let index = 0; index < Math.max(...sizes); index++) {
		sizes.forEach((size, block) => {
			if (index < size) owners.push(block)
		})
	}
	for (let index = 0; index < ecSize; index++) sizes.forEach((_, block) => owners.push(block))
	return owners
}

function positionsOf(version: number): [number, number][] {
	const cached = positionsCache.get(version)
	if (cached) return cached
	const positions = codewordPositions(version)
	positionsCache.set(version, positions)
	return positions
}

export function logoFits(version: number, level: QrErrorLevel, area: QrLogoArea): boolean {
	if (area.start < FORMAT_ZONE) return false
	const owners = blockOwners(version, level)
	const touched = new Set<number>()
	positionsOf(version).forEach((position, bit) => {
		if (bit < owners.length * 8 && isInLogoArea(area, position)) touched.add(bit >>> 3)
	})
	const perBlock = new Map<number, number>()
	touched.forEach(codeword => perBlock.set(owners[codeword], (perBlock.get(owners[codeword]) ?? 0) + 1))
	const budget = Math.floor((BLOCKS[level][version - 1][0] >> 1) * LOGO_BUDGET)
	return [...perBlock.values()].every(count => count <= budget)
}

function logoShares(share: number): number[] {
	const steps = Math.floor((share - LOGO_SHARE.min) / LOGO_SHARE.step + 1e-9)
	return Array.from({ length: steps + 1 }, (_, index) => Math.round((share - index * LOGO_SHARE.step) * 1000) / 1000)
}

function fittingVersion(first: number, level: QrErrorLevel, share: number): QrLogoFit | null {
	for (let version = first; version <= MAX_VERSION; version++) {
		const area = logoArea(17 + version * 4, share)
		if (logoFits(version, level, area)) return { version, area }
	}
	return null
}

function encodeLevel(bytes: readonly number[], level: QrErrorLevel, share: number): QrLogoCode | null {
	const first = chooseVersion(bytes.length, level)
	if (first === null) return null
	const fit = logoShares(share).reduce<QrLogoFit | null>((found, candidate) => found ?? fittingVersion(first, level, candidate), null)
	return { matrix: encodeBytes(bytes, { version: fit?.version ?? first, level }), area: fit?.area ?? null }
}

const score = (code: QrLogoCode): number => (code.area ? 0 : MAX_VERSION) + code.matrix.version

export function encodeWithLogo(text: string, level: QrErrorLevel, share: number): QrLogoCode | null {
	const bytes = [...new TextEncoder().encode(text)]
	return QR_ERROR_LEVELS.slice(QR_ERROR_LEVELS.indexOf(level))
		.map(candidate => encodeLevel(bytes, candidate, share))
		.reduce<QrLogoCode | null>((best, code) => (code && (!best || score(code) <= score(best)) ? code : best), null)
}
