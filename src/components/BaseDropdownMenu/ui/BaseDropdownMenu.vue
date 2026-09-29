<template>
	<BaseDropdown
		:is-open="isOpenState"
		:position="position"
		:variant="variant"
		:color="color"
		:size-scale="sizeScale"
		:prevent-mousedown="false"
		panel-class="base-dropdown-menu__panel"
		:custom-class="{ root: rootClass, panel: classes.panel }"
		@update:is-open="setOpen">
		<span
			ref="triggerRef"
			class="base-dropdown-menu__trigger"
			:class="classes.trigger"
			@click="handleTriggerClick"
			@keydown="handleTriggerKeydown">
			<slot :is-open="isOpenState" :trigger-props="triggerAttributes" />
		</span>

		<template #dropdown>
			<DropdownMenuContent
				:id="menuId"
				ref="contentRef"
				:items="items"
				:labelled-by="ariaLabel ? undefined : triggerId"
				:aria-label="ariaLabel"
				:variant="variant"
				:size-scale="sizeScale"
				:classes="classes"
				@select="handleSelect" />
		</template>
	</BaseDropdown>
</template>

<script setup lang="ts">
import '../styles/BaseDropdownMenu.style.scss'
import { BaseDropdown } from '@components/BaseDropdown'
import DropdownMenuContent from './DropdownMenuContent.vue'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseDropdownMenu } from '../model/useBaseDropdownMenu'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseDropdownMenuEmits, BaseDropdownMenuProps, BaseDropdownMenuSlots } from '../types/BaseDropdownMenu.types'

defineOptions({ name: 'BaseDropdownMenu' })

const props = withDefaults(
	defineProps<BaseDropdownMenuProps>(),
	kitDefaults('BaseDropdownMenu', {
		isOpen: undefined,
		position: 'bottom-start',
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseDropdownMenuEmits>()
defineSlots<BaseDropdownMenuSlots>()

const {
	classes,
	rootClass,
	menuId,
	contentRef,
	isOpenState,
	triggerRef,
	triggerAttributes,
	triggerId,
	setOpen,
	handleTriggerClick,
	handleTriggerKeydown,
	handleSelect,
	exposed,
} = useBaseDropdownMenu(props, emit)

defineExpose(exposed)
</script>
