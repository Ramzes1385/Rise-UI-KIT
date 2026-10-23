<template>
	<div ref="rootRef" :class="[ui('root'), classes.root]" @contextmenu="handleContextMenu" @keydown="handleKeydown">
		<slot />

		<BaseDropdown
			:is-open="isOpen"
			position="bottom-start"
			:gap="0"
			:variant="variant"
			:color="color"
			:size-scale="sizeScale"
			:animation="animation"
			:prevent-mousedown="false"
			:panel-class="menuUi('panel')"
			:custom-class="{ root: 'base-context-menu__layer', panel: classes.panel }"
			@update:is-open="setOpen">
			<span class="base-context-menu__anchor" :style="anchorStyle" aria-hidden="true" />
			<template #dropdown>
				<DropdownMenuContent
					ref="contentRef"
					:items="items"
					:aria-label="ariaLabel ?? UI_ARIA.CONTEXT_MENU"
					:variant="variant"
					:size-scale="sizeScale"
					:classes="classes"
					:ui="menuUi"
					:animation="animation"
					@select="handleSelect" />
			</template>
		</BaseDropdown>
	</div>
</template>

<script setup lang="ts">
import '@components/BaseDropdownMenu/styles/BaseDropdownMenu.style.scss'
import '../styles/BaseContextMenu.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { BaseDropdown } from '@components/BaseDropdown'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseContextMenu } from '../model/useBaseContextMenu'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import DropdownMenuContent from '@components/BaseDropdownMenu/ui/DropdownMenuContent.vue'
import type { BaseContextMenuEmits, BaseContextMenuProps, BaseContextMenuSlots } from '../types/BaseContextMenu.types'

defineOptions({ name: 'BaseContextMenu' })

const props = withDefaults(
	defineProps<BaseContextMenuProps>(),
	kitDefaults('BaseContextMenu', {
		isDisabled: false,
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
		animation: 'scale',
	}),
)

const emit = defineEmits<BaseContextMenuEmits>()
defineSlots<BaseContextMenuSlots>()

const { classes, ui, menuUi, rootRef, contentRef, isOpen, setOpen, anchorStyle, handleContextMenu, handleKeydown, handleSelect, exposed } =
	useBaseContextMenu(props, emit)

defineExpose(exposed)
</script>
