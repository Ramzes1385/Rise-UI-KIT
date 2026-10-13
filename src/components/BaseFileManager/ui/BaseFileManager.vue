<template>
	<div
		:class="[ui('root'), variantClass, `base-file-manager--${viewValue}`, { 'base-file-manager--disabled': isDisabled }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, rootStyle]"
		role="group"
		:aria-label="ariaLabel || UI_FILE_MANAGER.LABEL"
		:aria-busy="isLoading || undefined">
		<div v-if="hasTree" :class="[ui('sidebar'), classes.sidebar]" @dragover="treeDragOver" @dragleave="treeDragLeave" @drop="treeDrop">
			<BaseTree
				:items="treeNodes"
				selection-mode="single"
				variant="ghost"
				:selected-ids="treeSelectedIds"
				:expanded-ids="expandedIds"
				:aria-label="UI_FILE_MANAGER.TREE_LABEL"
				:size-scale="sizeScale"
				@update:expanded-ids="expandedIds = $event"
				@update:selected-ids="selectTreeNode">
				<template #label="{ node }">
					<span
						:data-file-manager-drop="node.id"
						class="base-file-manager__drop"
						:class="{ 'base-file-manager__drop--active': isTreeDropTarget(node.id) }">
						{{ node.label }}
					</span>
				</template>
			</BaseTree>
		</div>

		<div ref="mainRef" :class="[ui('main'), classes.main]">
			<FileManagerToolbar />
			<BaseContextMenu :items="menuItems" :is-disabled="isMenuDisabled" :size-scale="sizeScale" class="base-file-manager__menu">
				<FileManagerList>
					<template v-if="$slots.icon" #icon="slotProps">
						<slot name="icon" v-bind="slotProps" />
					</template>
					<template v-if="$slots.empty" #empty="slotProps">
						<slot name="empty" v-bind="slotProps" />
					</template>
				</FileManagerList>
			</BaseContextMenu>
			<p :class="[ui('status'), classes.status]" role="status">{{ isLoading ? '' : statusText }}</p>
		</div>

		<FileManagerDialogs />
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseFileManager.style.scss'
import { BaseTree } from '@components/BaseTree'
import FileManagerList from './FileManagerList.vue'
import { UI_FILE_MANAGER } from '@/locales/messages'
import FileManagerDialogs from './FileManagerDialogs.vue'
import FileManagerToolbar from './FileManagerToolbar.vue'
import { kitDefaults } from '@composables/base/useDefaults'
import { BaseContextMenu } from '@components/BaseContextMenu'
import { useBaseFileManager } from '../model/useBaseFileManager'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseFileManagerEmits, BaseFileManagerProps, BaseFileManagerSlots } from '../types/BaseFileManager.types'

const props = withDefaults(
	defineProps<BaseFileManagerProps>(),
	kitDefaults('BaseFileManager', {
		variant: DEFAULT_VARIANT,
		isLoading: false,
		isDisabled: false,
		isReadonly: false,
		hasTree: true,
		maxSize: 0,
		height: 480,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseFileManagerEmits>()
defineSlots<BaseFileManagerSlots>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	rootStyle,
	list: { mainRef },
	menu: { menuItems, isMenuDisabled },
	tree: { treeNodes, treeSelectedIds, expandedIds, selectTreeNode },
	dnd: { treeDragOver, treeDragLeave, treeDrop, isTreeDropTarget },
	toolbar: { statusText, viewValue },
} = useBaseFileManager(props, emit)
</script>
