import type { BaseComponentProps } from '@composables/useBaseComponent'
import type { SubtitleCue, SubtitleFormat } from '@utils/subtitleUtils'

/** Варианты BaseSubtitleEditor: default — панель с рамкой, soft — приподнятый фон без рамки */
export const SUBTITLE_EDITOR_VARIANTS = ['default', 'soft'] as const

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
