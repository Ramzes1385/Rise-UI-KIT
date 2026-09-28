/** Composable: логика BaseColorModeButton — переключение темы */
import { computed } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { calcIconScale } from '@utils/iconUtils'
import { useColorMode } from '@composables/useColorMode'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseColorModeButtonEmits, ColorModeButtonProps } from '../types/BaseColorModeButton.types'

export function useBaseColorModeButton(props: ColorModeButtonProps, emit: BaseColorModeButtonEmits) {
	// Экземпляр выбирается один раз: кнопка управляет одной и той же темой всё время жизни
	const { isDark, resolvedMode, toggle } = props.colorMode ?? useColorMode()

	return {
		...useStandardBaseComponent('base-color-mode-button', props, ['root', 'icon']),
		isDark,
		resolvedLabel: computed(() => props.label ?? UI_ARIA.DARK_THEME),
		/** Иконка 16px при sizeScale = 100, как в других кнопках-иконках */
		iconScale: computed(() => calcIconScale('sm', props.sizeScale)),
		handleClick(): void {
			toggle()
			emit('change', resolvedMode.value)
		},
	}
}
