import { reedSolomon } from './galois'
import { BLOCKS, MAX_VERSION } from './qrTables'
import type { QrErrorLevel } from '../../types/BaseQrCode.types'

const BYTE_MODE = 0b0100

const countBits = (version: number): number => (version < 10 ? 8 : 16)

export function dataCapacity(version: number, level: QrErrorLevel): number {
	const [, firstBlocks, firstSize, secondBlocks, secondSize] = BLOCKS[level][version - 1]
	return firstBlocks * firstSize + secondBlocks * secondSize
}

export function chooseVersion(length: number, level: QrErrorLevel): number | null {
	for (let version = 1; version <= MAX_VERSION; version++) {
		if (4 + countBits(version) + length * 8 <= dataCapacity(version, level) * 8) return version
	}
	return null
}

function appendBits(bits: number[], value: number, length: number): void {
	for (let index = length - 1; index >= 0; index--) bits.push((value >>> index) & 1)
}

export function dataCodewords(bytes: readonly number[], version: number, level: QrErrorLevel): number[] {
	const capacity = dataCapacity(version, level)
	const bits: number[] = []
	appendBits(bits, BYTE_MODE, 4)
	appendBits(bits, bytes.length, countBits(version))
	bytes.forEach(byte => appendBits(bits, byte, 8))
	appendBits(bits, 0, Math.min(4, capacity * 8 - bits.length))
	appendBits(bits, 0, (8 - (bits.length % 8)) % 8)
	const codewords: number[] = []
	for (let index = 0; index < bits.length; index += 8)
		codewords.push(bits.slice(index, index + 8).reduce((byte, bit) => (byte << 1) | bit, 0))
	for (let pad = 0xec; codewords.length < capacity; pad ^= 0xec ^ 0x11) codewords.push(pad)
	return codewords
}

function interleave(blocks: readonly (readonly number[])[]): number[] {
	const result: number[] = []
	const longest = Math.max(...blocks.map(block => block.length))
	for (let index = 0; index < longest; index++) {
		for (const block of blocks) if (index < block.length) result.push(block[index])
	}
	return result
}

export function finalCodewords(data: readonly number[], version: number, level: QrErrorLevel): number[] {
	const [ecSize, firstBlocks, firstSize, secondBlocks, secondSize] = BLOCKS[level][version - 1]
	const sizes = [...Array<number>(firstBlocks).fill(firstSize), ...Array<number>(secondBlocks).fill(secondSize)]
	let offset = 0
	const blocks = sizes.map(size => {
		offset += size
		return data.slice(offset - size, offset)
	})
	return [...interleave(blocks), ...interleave(blocks.map(block => reedSolomon(block, ecSize)))]
}
