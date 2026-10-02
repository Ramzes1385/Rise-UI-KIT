import { createCryptoProSignEmulation } from '../model/emulation/cryptoProSignEmulation'
import type { CryptoProSignEmulationOptions } from '../types/cryptoProSignEmulation.types'

export const DOCUMENT_TEXT = 'Акт сверки № 15 от 15.05.2025'

export const CHANGED_TEXT = 'Акт сверки № 16 от 15.05.2025'

export const ATTACHED_SIGNATURE =
	'UklTRS1FTVVMQVRFRC1DQURFUy1CRVM7ZGV0YWNoZWQ9ZmFsc2U7dGh1bWJwcmludD1BMUIyQzNENEU1RjYwNzE4MjkzQTRCNUM2RDdFOEY5MDEyMzQ1Njc4O2RpZ2VzdD0yNTY6QzAxMjE3REUxMEQ2QzkwMzZDQjcwMUU4NTBEOTMwNjUxQzlFOUVDQTc0MzNBNEVGMzUxRkM2RDQ4RDdCMTFBMTtzaWduaW5nVGltZT0yMDI1LTA1LTE1VDA3OjMwOjAwLjAwMFo7dGltZVN0YW1wPTtjb250ZW50PTBKRFF1dEdDSU5HQjBMTFF0ZEdBMExyUXVDRGloSllnTVRVZzBMN1JnaUF4TlM0d05TNHlNREkx'
export const DETACHED_SIGNATURE =
	'UklTRS1FTVVMQVRFRC1DQURFUy1CRVM7ZGV0YWNoZWQ9dHJ1ZTt0aHVtYnByaW50PUExQjJDM0Q0RTVGNjA3MTgyOTNBNEI1QzZEN0U4RjkwMTIzNDU2Nzg7ZGlnZXN0PTI1NjpDMDEyMTdERTEwRDZDOTAzNkNCNzAxRTg1MEQ5MzA2NTFDOUU5RUNBNzQzM0E0RUYzNTFGQzZENDhEN0IxMUExO3NpZ25pbmdUaW1lPTIwMjUtMDUtMTVUMDc6MzA6MDAuMDAwWjt0aW1lU3RhbXA9O2NvbnRlbnQ9'

export function emulate(options: CryptoProSignEmulationOptions = {}): () => () => void {
	return () => createCryptoProSignEmulation(options).install()
}

export function textFile(name: string, size: number): File {
	return new File(['А'.repeat(Math.ceil(size / 2))], name, { type: 'text/plain' })
}
