import type { ContainerSize } from '@components/BaseContainer'
import type { BaseComponentProps } from '@composables/useBaseComponent'

/**
 * Варианты оформления BaseFooter: `default` — фон страницы и линия сверху, `soft` — приглушённый фон без линии,
 * `ghost` — прозрачный без линии
 */
export const FOOTER_VARIANTS = ['default', 'soft', 'ghost'] as const

/**
 * Пропсы компонента BaseFooter.
 * `sizeScale` масштабирует отступы и кегль; `color` задаёт фон и текст.
 */
export interface BaseFooterProps extends BaseComponentProps<(typeof FOOTER_VARIANTS)[number], 'root' | 'inner'> {
	/** Ширина содержимого подвала — как у BaseContainer: `sm`…`xl` или `full` (во всю ширину) */
	containerSize?: ContainerSize
}

/**
 * Слоты компонента BaseFooter
 */
export interface BaseFooterSlots {
	/** Середина: ссылки */
	default?: () => unknown
	/** Начало: копирайт, логотип */
	start?: () => unknown
	/** Конец: соцсети, переключатель темы */
	end?: () => unknown
}
