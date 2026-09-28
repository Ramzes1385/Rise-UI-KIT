<template>
	<!-- Основное действие и меню остальных: две кнопки в группе; кнопка меню — APG Menu Button (BaseDropdownMenu) -->
	<div class="base-split-button" :class="[`base-split-button--${variant}`, classes.root]" role="group" :aria-label="label">
		<BaseButton
			class="base-split-button__main"
			:custom-class="{ root: classes.main }"
			:variant="variant"
			:size-scale="sizeScale"
			:color="color"
			:is-disabled="isDisabled"
			:is-loading="isLoading"
			@click="emit('click', $event)">
			<slot>{{ label }}</slot>
		</BaseButton>
		<BaseDropdownMenu
			class="base-split-button__menu"
			:items="items"
			position="bottom-end"
			:aria-label="menuLabel ?? UI_ARIA.MORE_ACTIONS"
			@select="(item, event) => emit('select', item, event)">
			<BaseButton
				class="base-split-button__toggle"
				:custom-class="{ root: classes.toggle }"
				:variant="variant"
				:size-scale="sizeScale"
				:color="color"
				:is-disabled="isDisabled"
				:padding="{ x: 8, y: 5 }"
				:aria-label="menuLabel ?? UI_ARIA.MORE_ACTIONS">
				<BaseIcon name="chevron-down" :size-scale="calcIconScale('sm', sizeScale)" />
			</BaseButton>
		</BaseDropdownMenu>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseSplitButton.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/iconUtils'
import { BaseButton } from '@components/BaseButton'
import { kitDefaults } from '@composables/useDefaults'
import { BaseDropdownMenu } from '@components/BaseDropdownMenu'
import { useBaseSplitButton } from '../model/useBaseSplitButton'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { BaseSplitButtonEmits, BaseSplitButtonProps, BaseSplitButtonSlots } from '../types/BaseSplitButton.types'

const props = withDefaults(
	defineProps<BaseSplitButtonProps>(),
	kitDefaults('BaseSplitButton', {
		variant: DEFAULT_VARIANT,
		isDisabled: false,
		isLoading: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseSplitButtonEmits>()
defineSlots<BaseSplitButtonSlots>()

const { classes } = useBaseSplitButton(props)
</script>
