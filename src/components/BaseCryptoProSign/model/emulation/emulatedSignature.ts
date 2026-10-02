import type { EmulatedSignature } from '../../types/cryptoProSignEmulation.types'

const PREFIX = 'RISE-EMULATED-CADES-'

export const EMULATED_SIGN_ERRORS = {
	noTsa: 'Не задан адрес службы штампов времени. (0x80070057)',
	badFormat: 'Неверный формат подписи. (0x8009310B)',
	badHash: 'Хэш данных не совпадает с хэшем в подписи. (0x80091007)',
	noContent: 'Нет данных для проверки отсоединённой подписи. (0x8009100E)',
} as const

export class EmulatedDigest {
	private state = 0x811c9dc5
	private length = 0
	private readonly bits: 256 | 512

	constructor(bits: 256 | 512) {
		this.bits = bits
	}

	update(bytes: Uint8Array): void {
		for (const byte of bytes) this.state = Math.imul(this.state ^ byte, 0x01000193) >>> 0
		this.length += bytes.length
	}

	value(): string {
		const lanes = this.bits / 32
		let hex = ''
		for (let lane = 0; lane < lanes; lane++) {
			const mixed = Math.imul(this.state ^ Math.imul(lane + 1, 0x9e3779b1) ^ this.length, 0x85ebca6b) >>> 0
			hex += mixed.toString(16).padStart(8, '0')
		}
		return `${this.bits}:${hex.toUpperCase()}`
	}
}

export function base64ToBytes(value: string): Uint8Array {
	return Uint8Array.from(atob(value), char => char.charCodeAt(0))
}

export function digestOf(content: string, bits: 256 | 512 = 256): string {
	const digest = new EmulatedDigest(bits)
	digest.update(base64ToBytes(content))
	return digest.value()
}

export function encodeSignature(signature: EmulatedSignature): string {
	const fields = Object.entries(signature).filter(([key]) => key !== 'level')
	return btoa(`${PREFIX}${signature.level};${fields.map(([key, value]) => `${key}=${String(value)}`).join(';')}`)
}

function decodeText(value: string): string {
	try {
		return atob(value.replace(/\s+/g, ''))
	} catch {
		return ''
	}
}

export function decodeSignature(value: string): EmulatedSignature {
	const text = decodeText(value)
	if (!text.startsWith(PREFIX)) throw new Error(EMULATED_SIGN_ERRORS.badFormat)
	const [level, ...pairs] = text.slice(PREFIX.length).split(';')
	const fields = Object.fromEntries(pairs.map(pair => [pair.slice(0, pair.indexOf('=')), pair.slice(pair.indexOf('=') + 1)]))
	return {
		level,
		detached: fields.detached === 'true',
		thumbprint: fields.thumbprint ?? '',
		digest: fields.digest ?? '',
		signingTime: fields.signingTime ?? '',
		timeStamp: fields.timeStamp ?? '',
		content: fields.content ?? '',
	}
}
