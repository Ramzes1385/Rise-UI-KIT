import { CryptoProError } from '@composables/crypto/useCryptoPro'
import type { CadesSignPlugin, CadesSignPluginHandle } from '../../types/cadesSign.types'
import type { CadesWindow } from '@composables/crypto/useCryptoPro/types/cadesplugin.types'

export function readyPlugin(): CadesSignPluginHandle {
	const plugin = (window as CadesWindow).cadesplugin as CadesSignPlugin | undefined
	if (!plugin) throw new CryptoProError('noPlugin')
	return { plugin }
}

export function bytesToBase64(bytes: Uint8Array): string {
	let binary = ''
	for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
	return btoa(binary)
}

export async function toBytes(data: string | Blob): Promise<Uint8Array> {
	if (typeof data === 'string') return new TextEncoder().encode(data)
	return new Uint8Array(await data.arrayBuffer())
}
