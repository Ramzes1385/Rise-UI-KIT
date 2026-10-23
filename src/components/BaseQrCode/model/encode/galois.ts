function buildTables() {
	const exp = new Uint8Array(512)
	const log = new Uint8Array(256)
	let value = 1
	for (let power = 0; power < 255; power++) {
		exp[power] = value
		log[value] = power
		value = (value << 1) ^ (value & 0x80 ? 0x11d : 0)
	}
	for (let power = 255; power < 512; power++) exp[power] = exp[power - 255]
	return { exp, log }
}

export const GF = buildTables()

export const multiply = (left: number, right: number): number => (left && right ? GF.exp[GF.log[left] + GF.log[right]] : 0)

const generators = new Map<number, number[]>()

export function generatorPolynomial(degree: number): number[] {
	const cached = generators.get(degree)
	if (cached) return cached
	let polynomial = [1]
	for (let root = 0; root < degree; root++) {
		const next = Array<number>(polynomial.length + 1).fill(0)
		polynomial.forEach((coefficient, index) => {
			next[index] ^= coefficient
			next[index + 1] ^= multiply(coefficient, GF.exp[root])
		})
		polynomial = next
	}
	generators.set(degree, polynomial)
	return polynomial
}

export function reedSolomon(data: readonly number[], degree: number): number[] {
	const divisor = generatorPolynomial(degree).slice(1)
	const remainder = Array<number>(degree).fill(0)
	for (const byte of data) {
		const factor = byte ^ (remainder.shift() as number)
		remainder.push(0)
		divisor.forEach((coefficient, index) => {
			remainder[index] ^= multiply(coefficient, factor)
		})
	}
	return remainder
}
