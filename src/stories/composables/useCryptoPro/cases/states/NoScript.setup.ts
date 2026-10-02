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
	const { status, check: checkPlugin } = useCryptoPro()

	return { STEP_LABELS, STATE_LABELS, status, checkPlugin }
}
