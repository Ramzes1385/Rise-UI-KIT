import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { BUTTON_VARIANTS } from '@components/BaseButton/types/BaseButton.types'
import type { ColorModeController, ResolvedColorMode } from '@composables/app/useColorMode'

/**
 * Части кнопки темы для пропа `ui` (БЭМ-элементы `.base-color-mode-button__<часть>`, `root` — сама кнопка):
 * icons — обёртка иконок (солнце и луна сменяют друг друга в ней перекрёстно), icon — иконка.
 */
export const COLOR_MODE_BUTTON_PARTS = ['icons', 'icon'] as const

export type BaseColorModeButtonPart = (typeof COLOR_MODE_BUTTON_PARTS)[number]

/** Варианты — как у BaseButton, по умолчанию `ghost`: кнопка темы обычно стоит в шапке рядом с другими кнопками-иконками. */
export interface BaseColorModeButtonProps extends BaseComponentProps<(typeof BUTTON_VARIANTS)[number], 'root' | 'icon'> {
	/** Доступное имя и подсказка. Кнопка-переключатель: имя постоянное, состояние — `aria-pressed`. По умолчанию «Тёмная тема» */
	label?: string
	/** Отключает кнопку */
	isDisabled?: boolean
	/**
	 * Какой темой управлять. По умолчанию — темой приложения (`useColorMode()`); свой экземпляр
	 * из `createColorMode({ target })` переключает тему части интерфейса
	 */
	colorMode?: ColorModeController
	/**
	 * Классы частей (`root`, `icons`, `icon`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseColorModeButton: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseColorModeButton :ui="{ root: 'rounded-full', icon: 'opacity-80' }" />
	 */
	ui?: UiProp<BaseColorModeButtonPart>
}

export interface BaseColorModeButtonEmits {
	/** Тема переключена: какая действует теперь */
	(event: 'change', mode: ResolvedColorMode): void
}

export type ColorModeButtonProps = PropsWithDefaults<BaseColorModeButtonProps, 'sizeScale'>
