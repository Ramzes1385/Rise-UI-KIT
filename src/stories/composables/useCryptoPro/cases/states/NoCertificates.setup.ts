import { useCryptoPro } from '@composables/crypto/useCryptoPro'

const formatDate = (date: Date): string => date.toLocaleDateString('ru-RU')

export function setup() {
	const { certificates, error, isLoading, getCertificates } = useCryptoPro()

	function load(): void {
		getCertificates().catch(() => undefined)
	}

	return { formatDate, certificates, error, isLoading, load }
}
