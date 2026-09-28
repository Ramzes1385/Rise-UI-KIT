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
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { kitDefaults } from '@composables/useDefaults'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useBaseColorModeButton } from '../model/useBaseColorModeButton'
import '../styles/BaseColorModeButton.style.scss'
import type { BaseColorModeButtonEmits, BaseColorModeButtonProps } from '../types/BaseColorModeButton.types'

const props = withDefaults(
	defineProps<BaseColorModeButtonProps>(),
	kitDefaults('BaseColorModeButton', {
		variant: 'ghost',
		sizeScale: SIZE_SCALE_DEFAULT,
		isDisabled: false,
	}),
)

const emit = defineEmits<BaseColorModeButtonEmits>()

const { classes, isDark, resolvedLabel, iconScale, handleClick } = useBaseColorModeButton(props, emit)
</script>
