import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { SubtitleCue, SubtitleFormat } from '@utils/media/subtitleUtils'

/** Варианты BaseSubtitleEditor: default — панель с рамкой, soft — приподнятый фон без рамки */
export const SUBTITLE_EDITOR_VARIANTS = ['default', 'soft'] as const

/**
 * Части BaseSubtitleEditor для пропа `ui` (БЭМ-элементы `.base-subtitle-editor__<часть>`, `root` — весь редактор):
 * toolbar — кнопки сверху; timeline — шкала, block — реплика на шкале, playhead — позиция записи; empty — текст пустого
 * списка; list — список реплик, row — строка реплики, number, time — поле времени с ошибкой, input, error, text — текст
 * реплики, actions — кнопки строки.
 */
export const SUBTITLE_EDITOR_PARTS = [
	'toolbar',
	'timeline',
	'block',
	'playhead',
	'empty',
	'list',
	'row',
	'number',
	'time',
	'input',
	'error',
	'text',
	'actions',
] as const

export type BaseSubtitleEditorPart = (typeof SUBTITLE_EDITOR_PARTS)[number]

/**
 * Пропсы компонента BaseSubtitleEditor
 */
export interface BaseSubtitleEditorProps extends BaseComponentProps<
	(typeof SUBTITLE_EDITOR_VARIANTS)[number],
	'root' | 'timeline' | 'cue' | 'list'
> {
	/** Реплики (`v-model:cues`): начало и конец в секундах, текст; редактор держит их по порядку начала */
	cues: SubtitleCue[]
	/** Позиция записи, секунды (`v-model:current-time`): связывает редактор с плеером */
	currentTime?: number
	/** Длительность записи для шкалы; без неё шкала идёт до конца последней реплики */
	duration?: number
	/** Длительность новой реплики, секунды */
	cueLength?: number
	/** Имя скачиваемого файла без расширения */
	fileName?: string
	/** Только просмотр: поля и кнопки изменения недоступны */
	isDisabled?: boolean
	/**
	 * Классы частей (`root`, `toolbar`, `timeline`, `row`, `text`… — см. `SUBTITLE_EDITOR_PARTS`) — добавляются к классам кита.
	 * Глобально — `defaults.BaseSubtitleEditor.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseSubtitleEditor v-model:cues="cues" :ui="{ root: 'shadow-sm', row: 'gap-3' }" />
	 */
	ui?: UiProp<BaseSubtitleEditorPart>
}

/**
 * События компонента BaseSubtitleEditor
 */
export interface BaseSubtitleEditorEmits {
	/** Новые реплики: изменение, добавление, удаление или загрузка файла */
	(event: 'update:cues', cues: SubtitleCue[]): void
	/** Переход к реплике или щелчок по шкале */
	(event: 'update:currentTime', time: number): void
	/** Реплики скачаны файлом: текст файла, например для сохранения на сервере */
	(event: 'export', payload: { format: SubtitleFormat; text: string }): void
}

/** Реплика и постоянный ключ её строки: строка списка живёт, пока живёт реплика, — переходы и черновики полей идут за ней */
export interface CueEntry {
	cue: SubtitleCue
	key: string
}
