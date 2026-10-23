import type { FlowNodeOf } from '../../data/flowData.types'

/** Стиль DFD; выбор — `FlowLayoutSettings.options.style` */
export type DfdStyle = 'gane-sarson' | 'yourdon-demarco'

/** Поля процесса и хранилища DFD */
export interface DfdCodedProps {
	/** Номер: процесс — 1.0, P1; хранилище — D1 */
	code?: string
}

/** Процесс DFD */
export type DfdProcessNode = FlowNodeOf<'process', DfdCodedProps>

/** Хранилище данных DFD */
export type DfdStoreNode = FlowNodeOf<'store', DfdCodedProps>
