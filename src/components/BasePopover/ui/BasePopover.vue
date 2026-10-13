<template>
	<BaseDropdown
		v-model:is-open="isOpenLocal"
		:position="position"
		:anchor="anchor"
		:variant="variant"
		:color="color"
		:gap="10"
		:match-width="false"
		:max-height="maxHeight"
		:prevent-mousedown="false"
		:panel-class="panelClasses"
		:padding="0"
		:size-scale="sizeScale"
		:animation="animation"
		:show-arrow="variant !== 'ghost'"
		:custom-class="{ root: rootClass, panel: classes.panel, arrow: arrowClass }"
		@close="handleClose">
		<div
			v-if="$slots.trigger || !anchor"
			ref="triggerRef"
			:class="[ui('trigger'), classes.trigger]"
			@click="toggle"
			@keydown="handleTriggerKeydown">
			<slot name="trigger" :is-open="isOpenLocal" :trigger-props="triggerAttributes" />
		</div>

		<template #dropdown>
			<div
				:id="panelId"
				:class="[ui('inner'), classes.inner]"
				role="dialog"
				:aria-label="ariaLabel"
				:aria-labelledby="ariaLabel ? undefined : triggerId">
				<slot />
			</div>
		</template>
	</BaseDropdown>
</template>

<script setup lang="ts">
import '../styles/BasePopover.style.scss'
import { BaseDropdown } from '@components/BaseDropdown'
import { useBasePopover } from '../model/useBasePopover'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BasePopoverEmits, BasePopoverProps, BasePopoverSlots } from '../types/BasePopover.types'

const props = withDefaults(
	defineProps<BasePopoverProps>(),
	kitDefaults('BasePopover', {
		isOpen: false,
		position: 'bottom',
		anchor: undefined,
		ariaLabel: undefined,
		maxHeight: '320px',
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
		animation: 'scale',
	}),
)

const emit = defineEmits<BasePopoverEmits>()
defineSlots<BasePopoverSlots>()

const {
	classes,
	isOpenLocal,
	toggle,
	handleTriggerKeydown,
	handleClose,
	triggerRef,
	panelId,
	triggerAttributes,
	triggerId,
	rootClass,
	panelClasses,
	arrowClass,
	ui,
} = useBasePopover(props, emit)
</script>
