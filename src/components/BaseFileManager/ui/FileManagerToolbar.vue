<template>
	<div :class="[ui('toolbar'), classes.toolbar]">
		<div class="base-file-manager__nav">
			<BaseButton
				variant="ghost"
				:size-scale="sizeScale"
				:is-disabled="!canGoUp"
				:is-focusable-when-disabled="canNavigate"
				@click="goUp">
				<BaseIcon name="chevron-up" :size-scale="sizeScale" />
				{{ UI_FILE_MANAGER.UP }}
			</BaseButton>
			<BaseBreadcrumbs
				:items="breadcrumbs"
				:max-items="4"
				variant="ghost"
				:size-scale="sizeScale"
				:class="ui('path')"
				:custom-class="classes.path"
				@item-click="selectCrumb" />
		</div>

		<BaseInput
			:model-value="queryValue"
			:placeholder="UI_FILE_MANAGER.SEARCH_PLACEHOLDER"
			:aria-label="UI_FILE_MANAGER.SEARCH_LABEL"
			:is-disabled="!canNavigate"
			:size-scale="sizeScale"
			:class="ui('search')"
			:custom-class="classes.search"
			@update:model-value="setQuery">
			<template #prefix>
				<BaseIcon name="search" :size-scale="sizeScale" />
			</template>
		</BaseInput>

		<div role="group" :aria-label="UI_FILE_MANAGER.ACTIONS_LABEL" :class="[ui('actions'), classes.actions]">
			<BaseButton v-if="isSingleSelected" variant="outline" :size-scale="sizeScale" :is-disabled="!canNavigate" @click="open">
				<BaseIcon name="folder-open" :size-scale="sizeScale" />
				{{ UI_FILE_MANAGER.OPEN }}
			</BaseButton>
			<template v-if="canOperate">
				<BaseButton variant="outline" :size-scale="sizeScale" @click="createFolder">
					<BaseIcon name="plus" :size-scale="sizeScale" />
					{{ UI_FILE_MANAGER.NEW_FOLDER }}
				</BaseButton>
				<BaseButton variant="outline" :size-scale="sizeScale" @click="upload">
					<BaseIcon name="upload" :size-scale="sizeScale" />
					{{ UI_FILE_MANAGER.UPLOAD }}
				</BaseButton>
				<BaseButton v-if="isSingleSelected" variant="outline" :size-scale="sizeScale" @click="rename">
					{{ UI_FILE_MANAGER.RENAME }}
				</BaseButton>
				<BaseButton v-if="hasSelection" variant="outline" :size-scale="sizeScale" @click="move">
					{{ UI_FILE_MANAGER.MOVE }}
				</BaseButton>
				<BaseButton v-if="hasSelection" variant="outline" :size-scale="sizeScale" @click="remove">
					<BaseIcon name="trash" :size-scale="sizeScale" />
					{{ UI_FILE_MANAGER.DELETE }}
				</BaseButton>
			</template>
			<BaseSegmented
				:model-value="viewValue"
				:options="viewOptions"
				:aria-label="UI_FILE_MANAGER.VIEW_LABEL"
				:is-disabled="!canNavigate"
				:size-scale="sizeScale"
				class="base-file-manager__view"
				@update:model-value="setView" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { UI_FILE_MANAGER } from '@/locales/messages'
import { BaseSegmented } from '@components/BaseSegmented'
import { BaseBreadcrumbs } from '@components/BaseBreadcrumbs'
import { useFileManagerContext } from '../model/useBaseFileManager'

const {
	ui,
	classes,
	sizeScale,
	core: { canOperate, canNavigate },
	commands: { open, rename, remove, move, goUp, createFolder, upload },
	toolbar: { breadcrumbs, queryValue, viewValue, viewOptions, canGoUp, hasSelection, isSingleSelected, selectCrumb, setQuery, setView },
} = useFileManagerContext()
</script>
