/** Эмуляция КриптоПро ЭЦП Browser plug-in — только для тестов и историй кита; в публичный вход пакета не входит */
export { emulatedCertificates } from './emulatedCertificates'
export { createCryptoProEmulation } from './cryptoProEmulation'
export { CRYPTO_PRO_EMULATION_SCENARIOS } from '../types/cryptoProEmulation.types'
export type {
	CryptoProEmulation,
	CryptoProEmulationCall,
	CryptoProEmulationOptions,
	CryptoProEmulationScenario,
	CryptoProEmulatedCertificate,
} from '../types/cryptoProEmulation.types'
