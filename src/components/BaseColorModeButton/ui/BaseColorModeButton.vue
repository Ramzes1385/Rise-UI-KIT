<template>
	<!-- Кнопка-переключатель тёмной темы: имя постоянное, нажата — тёмная тема (aria-pressed) -->
	<BaseButton
		class="base-color-mode-button"
		:variant="variant"
		:size-scale="sizeScale"
		:color="color"
		:custom-class="classes.root"
		:is-disabled="isDisabled"
		:aria-label="resolvedLabel"
		:aria-pressed="isDark ? 'true' : 'false'"
		:title="resolvedLabel"
		@click="handleClick">
		<BaseIcon :name="isDark ? 'moon' : 'sun'" :size-scale="iconScale" :custom-class="classes.icon" />
	</BaseButton>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/iconUtils'
import { BaseButton } from '@components/BaseButton'
import { kitDefaults } from '@composables/useDefaults'
import { useColorMode } from '@composables/useColorMode'
import { SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import '../styles/BaseColorModeButton.style.scss'
import type { BaseColorModeButtonEmits, BaseColorModeButtonProps } from '../model/BaseColorModeButton.types'

const props = withDefaults(
	defineProps<BaseColorModeButtonProps>(),
	kitDefaults('BaseColorModeButton', {
		variant: 'ghost',
		sizeScale: SIZE_SCALE_DEFAULT,
		isDisabled: false,
	}),
)

const emit = defineEmits<BaseColorModeButtonEmits>()

const { classes } = useStandardBaseComponent('base-color-mode-button', props, ['root', 'icon'])

// Экземпляр выбирается один раз: кнопка управляет одной и той же темой всё время жизни
const { isDark, resolvedMode, toggle } = props.colorMode ?? useColorMode()

/** Подпись: своя или «Тёмная тема» на текущем языке */
const resolvedLabel = computed(() => props.label ?? UI_ARIA.DARK_THEME)

/** Иконка 16px при sizeScale = 100, как в других кнопках-иконках */
const iconScale = computed(() => calcIconScale('sm', props.sizeScale))

function handleClick(): void {
	toggle()
	emit('change', resolvedMode.value)
}
</script>
