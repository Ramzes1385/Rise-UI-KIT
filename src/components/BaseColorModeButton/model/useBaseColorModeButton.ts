import { UI_ARIA } from '@/locales/messages'
import { computed, onMounted, ref } from 'vue'
import { useUi } from '@composables/base/useUi'
import { calcIconScale } from '@utils/media/iconUtils'
import { useColorMode } from '@composables/app/useColorMode'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseColorModeButtonEmits, ColorModeButtonProps } from '../types/BaseColorModeButton.types'

export function useBaseColorModeButton(props: ColorModeButtonProps, emit: BaseColorModeButtonEmits) {
	const { isDark: isDarkMode, resolvedMode, toggle } = props.colorMode ?? useColorMode()
	const isMounted = ref(false)
	onMounted(() => {
		isMounted.value = true
	})

	return {
		...useStandardBaseComponent('base-color-mode-button', props, ['root', 'icon']),
		ui: useUi(props, 'base-color-mode-button'),
		isDark: computed(() => isMounted.value && isDarkMode.value),
		resolvedLabel: computed(() => props.label ?? UI_ARIA.DARK_THEME),
		iconScale: computed(() => calcIconScale('sm', props.sizeScale)),
		handleClick(): void {
			toggle()
			emit('change', resolvedMode.value)
		},
	}
}
