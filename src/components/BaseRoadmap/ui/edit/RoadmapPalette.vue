<template>
	<BaseToolbar class="base-roadmap__edit-palette" :class="ui('palette')" :aria-label="UI_ROADMAP_EDIT.PALETTE_LABEL">
		<BaseSegmented
			:model-value="tool"
			:options="toolOptions"
			:aria-label="UI_ROADMAP_EDIT.TOOL_LABEL"
			:is-disabled="isDisabled()"
			@update:model-value="setTool" />
		<span class="base-roadmap__bar-sep" aria-hidden="true" />
		<BaseButton variant="ghost" :is-disabled="isDisabled()" @click="addStage">
			<template #left><BaseIcon name="plus" /></template>
			{{ UI_ROADMAP_EDIT.ADD_STAGE }}
		</BaseButton>
		<BaseButton variant="ghost" :is-disabled="isDisabled()" @click="addTopic">
			<template #left><BaseIcon name="plus" /></template>
			{{ UI_ROADMAP_EDIT.ADD_TOPIC }}
		</BaseButton>
		<span class="base-roadmap__bar-sep" aria-hidden="true" />
		<BaseButton variant="ghost" @click="expandAll">{{ UI_ROADMAP_EDIT.EXPAND_ALL }}</BaseButton>
		<BaseButton variant="ghost" @click="collapseAll">{{ UI_ROADMAP_EDIT.COLLAPSE_ALL }}</BaseButton>
		<BaseDropdownMenu :items="templates" :aria-label="UI_ROADMAP_EDIT.TEMPLATES">
			<BaseButton variant="ghost" :is-disabled="isDisabled()">
				<template #left><BaseIcon name="layers" /></template>
				{{ UI_ROADMAP_EDIT.TEMPLATES }}
			</BaseButton>
		</BaseDropdownMenu>
		<span class="base-roadmap__edit-spacer" />
		<BaseButton variant="ghost" :aria-label="UI_ROADMAP_EDIT.UNDO" :is-disabled="isDisabled() || !canUndo" @click="undo">
			<BaseIcon name="undo" />
		</BaseButton>
		<BaseButton variant="ghost" :aria-label="UI_ROADMAP_EDIT.REDO" :is-disabled="isDisabled() || !canRedo" @click="redo">
			<BaseIcon name="redo" />
		</BaseButton>
		<BaseButton :is-disabled="isDisabled()" @click="publish">
			<template #left><BaseIcon name="upload" /></template>
			{{ UI_ROADMAP_EDIT.PUBLISH }}
		</BaseButton>
	</BaseToolbar>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { BaseToolbar } from '@components/BaseToolbar'
import { BaseSegmented } from '@components/BaseSegmented'
import { BaseDropdownMenu } from '@components/BaseDropdownMenu'
import { useRoadmapPalette } from '../../model/edit/sortable/useRoadmapPalette'
import { useRoadmapEditorContext } from '../../model/edit/view/roadmapEditorContext'

const { ui } = useRoadmapEditorContext()
const {
	isDisabled,
	publish,
	templates,
	tool,
	canUndo,
	canRedo,
	toolOptions,
	setTool,
	addStage,
	addTopic,
	expandAll,
	collapseAll,
	undo,
	redo,
} = useRoadmapPalette()
</script>
