import type { Ref } from 'vue'
import type { UiClassFn } from '@composables/base/useUi'
import type { BaseImageMapEditorPart } from './BaseImageMapEditor.types'

/** Ширина области редактора (в px), ниже которой включается узкая раскладка: сворачиваемые разделы, иконки вместо подписей */
export const EDITOR_NARROW_BELOW = 760

/**
 * Раздел панели свойств: objects — объекты слоя, properties — свойства объекта, layers — этажи,
 * scene3d — 3D (при `has3dFields`), filters — фильтры, styles — стили, groups — группы
 */
export type EditorSectionId = 'objects' | 'properties' | 'layers' | 'scene3d' | 'filters' | 'styles' | 'groups'

/** Состояние разделов панели: на узкой раскладке разделы сворачиваются, на широкой всегда раскрыты */
export interface EditorSectionsApi {
	/** Область редактора уже порога `EDITOR_NARROW_BELOW` */
	isNarrow: Readonly<Ref<boolean>>
	/** Первый замер ширины сделан: раскрытие и сворачивание анимируются, а не ставятся сразу */
	isReady: Readonly<Ref<boolean>>
	/** Раздел раскрыт */
	isOpen: (id: EditorSectionId) => boolean
	/** Раскрыть или свернуть раздел */
	toggle: (id: EditorSectionId) => void
}

/** Контекст выбора раскрытых по умолчанию разделов на узкой раскладке */
export interface EditorSectionsContext {
	/** Показан ли этаж: без него первым становится раздел «Этажи» */
	hasLayer: () => boolean
	/** Выделен ли объект: тогда по умолчанию раскрыты и его свойства */
	hasSelection: () => boolean
}

/** Пропсы раздела панели свойств (внутренний компонент) */
export interface ImageMapEditorSectionProps {
	/** Раздел */
	id: EditorSectionId
	/** Заголовок раздела */
	title: string
	/** Состояние разделов панели */
	sections: EditorSectionsApi
	/** Классы частей редактора (проп `ui`) */
	ui: UiClassFn<BaseImageMapEditorPart>
}

/** Пропсы кнопки файла на панели инструментов (внутренний компонент) */
export interface ImageMapEditorFileButtonProps {
	/** Подпись: текст кнопки, а на узкой раскладке — доступное имя и подсказка */
	label: string
	/** Иконка: на узкой раскладке кнопка показывает только её */
	icon: string
	/** Показывать иконку перед подписью на широкой раскладке; `false` — иконка только на узкой */
	hasWideIcon?: boolean
	/** Узкая раскладка: только иконка с подсказкой */
	isNarrow: boolean
	/** Кнопка отключена */
	isDisabled?: boolean
}
