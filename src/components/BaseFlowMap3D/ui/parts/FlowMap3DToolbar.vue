<template>
	<BaseToolbar :class="className" :aria-label="UI_FLOW_MAP_3D.EDIT_TOOLBAR" variant="default">
		<span class="base-flow-map-3d__edit-name"> <span class="base-flow-map-3d__edit-dot" aria-hidden="true" />{{ name }} </span>
		<BaseSeparator orientation="vertical" />
		<BaseButton variant="ghost" :is-disabled="!hasSelection" @click="$emit('rotate')">
			<template #left><BaseIcon name="rotate-right" /></template>
			{{ UI_FLOW_MAP_3D.EDIT_ROTATE }}
		</BaseButton>
		<BaseButton variant="ghost" :is-disabled="!hasSelection" aria-haspopup="dialog" :aria-expanded="isSwapOpen" @click="$emit('swap')">
			<template #left><BaseIcon name="shuffle" /></template>
			{{ UI_FLOW_MAP_3D.EDIT_SWAP }}
		</BaseButton>
		<BaseButton variant="ghost" :is-disabled="!hasSelection" :aria-pressed="isLinking" @click="$emit('link')">
			<template #left><BaseIcon name="link" /></template>
			{{ UI_FLOW_MAP_3D.EDIT_LINK }}
		</BaseButton>
		<BaseButton variant="ghost" class="base-flow-map-3d__edit-danger" :is-disabled="!hasSelection" @click="$emit('remove')">
			<template #left><BaseIcon name="trash" /></template>
			{{ UI_FLOW_MAP_3D.EDIT_REMOVE }}
		</BaseButton>
	</BaseToolbar>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseToolbar } from '@components/BaseToolbar'
import { BaseSeparator } from '@components/BaseSeparator'

defineProps<{ className: string; name: string; hasSelection: boolean; isLinking: boolean; isSwapOpen: boolean }>()

defineEmits<(event: 'rotate' | 'swap' | 'link' | 'remove') => void>()
</script>
