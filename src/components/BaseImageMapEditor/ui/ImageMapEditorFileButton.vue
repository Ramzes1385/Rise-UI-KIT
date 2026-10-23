<template>
	<BaseTooltip v-if="isNarrow" is-wrapperless :text="label">
		<BaseButton variant="ghost" :aria-label="label" :is-disabled="isDisabled">
			<template #left><BaseIcon :name="icon" /></template>
		</BaseButton>
	</BaseTooltip>
	<BaseButton v-else variant="ghost" :is-disabled="isDisabled">
		<template v-if="hasWideIcon" #left><BaseIcon :name="icon" /></template>
		{{ label }}
	</BaseButton>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { BaseTooltip } from '@components/BaseTooltip'
import type { ImageMapEditorFileButtonProps } from '../types/ImageMapEditorLayout.types'

withDefaults(defineProps<ImageMapEditorFileButtonProps>(), { hasWideIcon: true, isDisabled: false })
</script>
