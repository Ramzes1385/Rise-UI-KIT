import type { PropsWithDefaults } from '@composables/useDefaults'
import type { BaseComponentProps } from '@composables/useBaseComponent'
import type { BUTTON_VARIANTS } from '@components/BaseButton/types/BaseButton.types'
import type { ColorModeController, ResolvedColorMode } from '@composables/useColorMode'

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
}

export interface BaseColorModeButtonEmits {
	/** Тема переключена: какая действует теперь */
	(event: 'change', mode: ResolvedColorMode): void
}

export type ColorModeButtonProps = PropsWithDefaults<BaseColorModeButtonProps, 'sizeScale'>
