import type { DeepReadonly } from 'vue'
import type { CryptoProStatus, CryptoProStepId, CryptoProStepState } from '@composables/crypto/useCryptoPro'
import type { CryptoProBatchItem, CryptoProSignResult, CryptoProVerifyResult } from './BaseCryptoProSign.types'

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

/** Внутреннее: пропсы списка очереди подписи нескольких файлов */
export interface BaseCryptoProSignBatchProps {
	items: CryptoProBatchItem[]
	hasDownload: boolean
	isDisabled?: boolean
}

/** Внутреннее: события списка очереди */
export interface BaseCryptoProSignBatchEmits {
	/** «Скачать» подпись файла — номер файла в очереди */
	(event: 'download', id: number): void
}

/** Файл очереди для вывода: имя, размер и состояние словами, значок, ошибка и ход хэша */
export interface CryptoProBatchItemView {
	id: number
	name: string
	status: CryptoProBatchItem['status']
	/** Размер и состояние через « · » */
	meta: string
	icon: string
	/** Ошибка файла: текст и подробности плагина; без ошибки — пусто */
	error: string
	/** Ход расчёта хэша, % — только пока файл подписывается и считается его хэш */
	percent: number | null
	canDownload: boolean
	downloadLabel: string
}

/** Подписант для вывода: строки с ФИО, организацией, временем и сертификатом */
export interface CryptoProSignerView {
	key: string
	name: string
	lines: string[]
	isCertificateValid: boolean
}
