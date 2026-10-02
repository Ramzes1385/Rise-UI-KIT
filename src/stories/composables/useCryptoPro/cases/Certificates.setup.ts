import { onMounted } from 'vue'
import { useCryptoPro } from '@composables/crypto/useCryptoPro'
import { createCryptoProEmulation } from '@composables/crypto/useCryptoPro/emulation'

const formatDate = (date: Date): string => date.toLocaleDateString('ru-RU')

export function setup() {
	const emulation = createCryptoProEmulation({ scenario: 'ready', now: new Date(2026, 9, 2) })
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
