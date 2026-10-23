<template>
	<BaseToolbar class="base-roadmap__edit-item-toolbar" :class="ui('item-toolbar')" :aria-label="UI_ROADMAP_EDIT.ITEM_TOOLBAR">
		<BaseButton variant="ghost" aria-keyshortcuts="Alt+ArrowUp" :is-disabled="!canUp" @click="up">
			<template #left><BaseIcon name="chevron-up" /></template>
			{{ UI_ROADMAP_EDIT.ITEM_UP }}
		</BaseButton>
		<BaseButton variant="ghost" aria-keyshortcuts="Alt+ArrowDown" :is-disabled="!canDown" @click="down">
			<template #left><BaseIcon name="chevron-down" /></template>
			{{ UI_ROADMAP_EDIT.ITEM_DOWN }}
		</BaseButton>
		<BaseButton variant="ghost" aria-keyshortcuts="Control+D" :is-disabled="isDisabled()" @click="duplicate">
			<template #left><BaseIcon name="copy" /></template>
			{{ UI_ROADMAP_EDIT.ITEM_DUPLICATE }}
		</BaseButton>
		<BaseButton variant="ghost" aria-keyshortcuts="Delete" :is-disabled="isDisabled()" @click="remove">
			<template #left><BaseIcon name="trash" /></template>
			{{ UI_ROADMAP_EDIT.ITEM_REMOVE }}
		</BaseButton>
	</BaseToolbar>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { BaseToolbar } from '@components/BaseToolbar'
import { useRoadmapEditorContext } from '../../model/edit/view/roadmapEditorContext'
import { useRoadmapItemToolbar } from '../../model/edit/sortable/useRoadmapItemToolbar'

const { ui } = useRoadmapEditorContext()
const { isDisabled, canUp, canDown, up, down, duplicate, remove } = useRoadmapItemToolbar()
</script>
