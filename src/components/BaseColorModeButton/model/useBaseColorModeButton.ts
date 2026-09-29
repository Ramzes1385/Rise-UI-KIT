import { computed } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { calcIconScale } from '@utils/media/iconUtils'
import { useColorMode } from '@composables/app/useColorMode'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseColorModeButtonEmits, ColorModeButtonProps } from '../types/BaseColorModeButton.types'

export function useBaseColorModeButton(props: ColorModeButtonProps, emit: BaseColorModeButtonEmits) {
	const { isDark, resolvedMode, toggle } = props.colorMode ?? useColorMode()

	return {
		...useStandardBaseComponent('base-color-mode-button', props, ['root', 'icon']),
		isDark,
		resolvedLabel: computed(() => props.label ?? UI_ARIA.DARK_THEME),
		iconScale: computed(() => calcIconScale('sm', props.sizeScale)),
		handleClick(): void {
			toggle()
			emit('change', resolvedMode.value)
		},
	}
}
