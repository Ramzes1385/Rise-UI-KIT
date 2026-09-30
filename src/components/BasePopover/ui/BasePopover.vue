<template>
	<BaseDropdown
		v-model:is-open="isOpenLocal"
		:position="position"
		:variant="variant"
		:color="color"
		:gap="10"
		:match-width="false"
		:max-height="maxHeight"
		:prevent-mousedown="false"
		:panel-class="panelClasses"
		:padding="0"
		:size-scale="sizeScale"
		:custom-class="{ root: rootClass, panel: classes.panel }"
		@close="handleClose">
		<div ref="triggerRef" class="base-popover__trigger" :class="classes.trigger" @click="toggle">
			<slot name="trigger" :is-open="isOpenLocal" :trigger-props="triggerAttributes" />
		</div>

		<template #dropdown>
			<div class="base-popover__arrow" :class="[`base-popover__arrow--${position}`, classes.arrow]"></div>
			<div :id="panelId" class="base-popover__inner" :class="classes.inner" role="dialog" :aria-labelledby="triggerId">
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
		maxHeight: '320px',
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BasePopoverEmits>()
defineSlots<BasePopoverSlots>()

const { classes, isOpenLocal, toggle, handleClose, triggerRef, panelId, triggerAttributes, triggerId, rootClass, panelClasses } =
	useBasePopover(props, emit)
</script>
