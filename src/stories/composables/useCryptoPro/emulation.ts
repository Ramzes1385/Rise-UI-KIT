import { createCryptoProEmulation, type CryptoProEmulationOptions } from '@composables/crypto/useCryptoPro/emulation'

export const STORY_DATE = new Date(2026, 9, 2)

export function emulate(options: CryptoProEmulationOptions): () => () => void {
	return () => createCryptoProEmulation(options).install()
}
