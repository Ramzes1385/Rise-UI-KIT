<template>
	<!-- Кнопка-переключатель тёмной темы: имя постоянное, нажата — тёмная тема (aria-pressed) -->
	<BaseButton
		class="base-color-mode-button"
		:variant="variant"
		:size-scale="sizeScale"
		:color="color"
		:custom-class="classes.root"
		:is-disabled="isDisabled"
		:aria-label="label"
		:aria-pressed="isDark ? 'true' : 'false'"
		:title="label"
		@click="handleClick">
		<BaseIcon :name="isDark ? 'moon' : 'sun'" :size-scale="iconScale" :custom-class="classes.icon" />
	</BaseButton>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useColorMode } from '@composables/useColorMode'
import { kitDefaults } from '@composables/useDefaults'
import { SIZE_SCALE_DEFAULT, UI_ARIA } from '@constants'
import { calcIconScale } from '@utils/iconUtils'
import '../styles/BaseColorModeButton.style.scss'
import type { BaseColorModeButtonEmits, BaseColorModeButtonProps } from '../model/BaseColorModeButton.types'

const props = withDefaults(defineProps<BaseColorModeButtonProps>(), kitDefaults('BaseColorModeButton', {
	variant: 'ghost',
	sizeScale: SIZE_SCALE_DEFAULT,
	label: UI_ARIA.DARK_THEME,
	isDisabled: false,
}))

const emit = defineEmits<BaseColorModeButtonEmits>()

const { classes } = useStandardBaseComponent('base-color-mode-button', props, ['root', 'icon'])

// Экземпляр выбирается один раз: кнопка управляет одной и той же темой всё время жизни
const { isDark, resolvedMode, toggle } = props.colorMode ?? useColorMode()

/** Иконка 16px при sizeScale = 100, как в других кнопках-иконках */
const iconScale = computed(() => calcIconScale('sm', props.sizeScale))

function handleClick(): void {
	toggle()
	emit('change', resolvedMode.value)
}
</script>
