import type { DeepReadonly } from 'vue'
import type { CryptoProSignResult, CryptoProVerifyResult } from './BaseCryptoProSign.types'
import type { CryptoProStatus, CryptoProStepId, CryptoProStepState } from '@composables/crypto/useCryptoPro'

/** Шаг диагностики для вывода: подпись, значок и состояние словами */
interface CryptoProSignStepView {
	id: CryptoProStepId
	state: CryptoProStepState
	label: string
	/** Значок состояния; пустой — точка (ожидает) или индикатор (проверяется) */
	icon: string
	/** Состояние для скринридера */
	stateText: string
}

/** Подсказка при ошибке диагностики: что сделать и ссылки на установку */
interface CryptoProSignHelp {
	text: string
	links: Array<{ href: string; label: string }>
}

/** Внутреннее: пропсы блока диагностики BaseCryptoProSign */
export interface BaseCryptoProSignStatusProps {
	status: DeepReadonly<CryptoProStatus>
	steps: CryptoProSignStepView[]
	help: CryptoProSignHelp
	versionsText: string
	isDisabled?: boolean
}

/** Внутреннее: события блока диагностики */
export interface BaseCryptoProSignStatusEmits {
	/** «Проверить снова» */
	(event: 'retry'): void
}

/** Внутреннее: пропсы блока результата — подписи или проверки */
export interface BaseCryptoProSignResultProps {
	signResult: CryptoProSignResult | null
	verifyResult: CryptoProVerifyResult | null
}

/** Подписант для вывода: строки с ФИО, организацией, временем и сертификатом */
export interface CryptoProSignerView {
	key: string
	name: string
	lines: string[]
	isCertificateValid: boolean
}
