<template>
	<div class="base-file-manager__area" @click="handleBackgroundClick" @contextmenu="handleContextMenu">
		<div v-if="isLoading" :class="[ui('state'), 'base-file-manager__state--loading', classes.state]" aria-busy="true">
			<span class="base-file-manager__sr" role="status">{{ UI_FILE_MANAGER.LOADING }}</span>
			<div v-for="row in 6" :key="row" class="base-file-manager__skeleton-row" aria-hidden="true">
				<BaseSkeleton shape="circle" :width="20" :size-scale="sizeScale" />
				<BaseSkeleton shape="text" width="100%" :size-scale="sizeScale" />
			</div>
		</div>

		<div v-else-if="error" role="alert" :class="[ui('state'), classes.state]">
			<BaseEmpty
				variant="ghost"
				icon="alert-triangle"
				:title="UI_FILE_MANAGER.ERROR_TITLE"
				:description="error"
				:size-scale="sizeScale">
				<template #actions>
					<BaseButton variant="outline" :size-scale="sizeScale" @click="retry">{{ UI_FILE_MANAGER.RETRY }}</BaseButton>
				</template>
			</BaseEmpty>
		</div>

		<div v-else-if="!rows.length && !isCreating" :class="[ui('state'), classes.state]">
			<slot name="empty" :is-search="isSearch" :query="query">
				<BaseEmpty
					variant="ghost"
					:icon="isSearch ? 'search' : 'folder-open'"
					:title="isSearch ? UI_FILE_MANAGER.SEARCH_EMPTY_TITLE : UI_FILE_MANAGER.EMPTY_TITLE"
					:description="emptyText"
					:size-scale="sizeScale" />
			</slot>
		</div>

		<template v-else>
			<div role="group" :aria-label="UI_FILE_MANAGER.SORT_LABEL" :class="[ui('header'), classes.header]">
				<BaseButton
					v-for="button in sortButtons"
					:key="button.key"
					variant="ghost"
					:size-scale="sizeScale"
					:aria-label="button.ariaLabel"
					:aria-pressed="button.isActive"
					:class="[ui('sort'), `base-file-manager__sort--${button.key === 'modifiedAt' ? 'modified-at' : button.key}`]"
					:custom-class="classes.sort"
					:is-disabled="!canNavigate"
					@click="toggleSort(button.key)">
					{{ button.label }}
					<BaseIcon v-if="button.icon" :name="button.icon" :size-scale="sizeScale" />
				</BaseButton>
			</div>

			<div
				ref="listRef"
				:role="rows.length ? 'listbox' : undefined"
				:aria-multiselectable="rows.length ? true : undefined"
				:aria-disabled="canNavigate ? undefined : true"
				:aria-label="rows.length ? listLabel : undefined"
				:class="[ui('list'), `base-file-manager__list--${view}`, classes.list]"
				@keydown="handleListKeydown">
				<FileManagerEditor v-if="isCreating" icon="folder" />
				<template v-for="row in rows" :key="row.item.id">
					<FileManagerEditor v-if="row.isEditing" :icon="row.icon" />
					<div
						v-else
						role="option"
						:data-entry-id="row.item.id"
						:aria-selected="row.isSelected"
						:aria-disabled="canNavigate ? undefined : true"
						:tabindex="row.tabIndex"
						:draggable="canOperate"
						:class="[
							ui('entry'),
							{
								'base-file-manager__entry--selected': row.isSelected,
								'base-file-manager__entry--folder': row.isFolder,
								'base-file-manager__entry--dragging': row.isDragging,
								'base-file-manager__entry--drop': row.isDropTarget,
							},
							classes.entry,
						]"
						@click="handleEntryClick(row.item, $event)"
						@dblclick="open(row.item)"
						@focus="handleEntryFocus(row.item)"
						@dragstart="dragStart(row.item, $event)"
						@dragend="dragEnd"
						@dragover="entryDragOver(row.item, $event)"
						@dragleave="dragLeave(row.item.id)"
						@drop="entryDrop(row.item, $event)">
						<span :class="[ui('icon'), classes.icon]">
							<slot name="icon" :item="row.item">
								<BaseIcon :name="row.icon" :size-scale="sizeScale" />
							</slot>
						</span>
						<span :class="[ui('name'), classes.name]">
							{{ row.item.name }}
							<span v-if="row.isFolder" class="base-file-manager__sr">, {{ UI_FILE_MANAGER.KIND_FOLDER }}</span>
						</span>
						<span :class="[ui('meta'), 'base-file-manager__size', classes.meta]">{{ row.size }}</span>
						<span :class="[ui('meta'), 'base-file-manager__modified', classes.meta]">{{ row.modified }}</span>
					</div>
				</template>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseButton } from '@components/BaseButton'
import { UI_FILE_MANAGER } from '@/locales/messages'
import FileManagerEditor from './FileManagerEditor.vue'
import { BaseSkeleton } from '@components/BaseSkeleton'
import { useFileManagerContext } from '../model/useBaseFileManager'
import type { BaseFileManagerSlots } from '../types/BaseFileManager.types'

defineSlots<Pick<BaseFileManagerSlots, 'icon' | 'empty'>>()

const {
	ui,
	classes,
	sizeScale,
	rows,
	isLoading,
	error,
	core: { canOperate, canNavigate },
	actions: { open },
	dnd: { dragStart, dragEnd, dragLeave, entryDragOver, entryDrop },
	editor: { isCreating },
	toolbar: { listLabel, viewValue: view, sortButtons, toggleSort, queryValue: query, isSearch, emptyText, retry },
	menu: { handleContextMenu },
	list: { listRef, handleListKeydown, handleEntryClick, handleEntryFocus, handleBackgroundClick },
} = useFileManagerContext()
</script>
