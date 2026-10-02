import { onMounted } from 'vue'
import { createCryptoProEmulation } from '@composables/crypto/useCryptoPro/emulation'
import { useCryptoPro, type CryptoProStepId, type CryptoProStepState } from '@composables/crypto/useCryptoPro'

const STEP_LABELS: Record<CryptoProStepId, string> = {
	extension: 'Расширение',
	plugin: 'Плагин',
	csp: 'КриптоПро CSP',
	objects: 'Объекты подписи',
}

const STATE_LABELS: Record<CryptoProStepState, string> = {
	pending: 'Ожидает',
	checking: 'Проверка…',
	ok: 'Готово',
	error: 'Ошибка',
}

export function setup() {
	const emulation = createCryptoProEmulation({ scenario: 'noExtension' })
	const { status, check } = useCryptoPro({ checkOnMount: false })

	function checkPlugin(): Promise<boolean> {
		const restore = emulation.install()
		const checking = check()
		restore()
		return checking
	}

	onMounted(checkPlugin)

	return { STEP_LABELS, STATE_LABELS, status, checkPlugin }
}
