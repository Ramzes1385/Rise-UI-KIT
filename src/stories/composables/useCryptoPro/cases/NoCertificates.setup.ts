import { onMounted } from 'vue'
import { createCryptoProEmulation, useCryptoPro } from '@composables/crypto/useCryptoPro'

const formatDate = (date: Date): string => date.toLocaleDateString('ru-RU')

export function setup() {
	const emulation = createCryptoProEmulation({ scenario: 'noCertificates', now: new Date(2026, 9, 2) })
	const { certificates, error, isLoading, check, getCertificates } = useCryptoPro({ checkOnMount: false })

	function checkPlugin(): Promise<boolean> {
		const restore = emulation.install()
		const checking = check()
		restore()
		return checking
	}

	onMounted(checkPlugin)

	function load(): void {
		getCertificates().catch(() => undefined)
	}

	return { formatDate, certificates, error, isLoading, load }
}
