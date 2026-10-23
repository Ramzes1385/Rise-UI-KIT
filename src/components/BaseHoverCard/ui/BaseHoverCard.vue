<template>
	<BaseDropdown
		:is-open="isOpenLocal"
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
		:animation="animation"
		:show-arrow="variant !== 'ghost'"
		:custom-class="{ root: rootClass, panel: classes.panel, arrow: arrowClass }"
		@update:is-open="handleDropdownOpen">
		<div
			ref="triggerRef"
			:class="[ui('trigger'), classes.trigger]"
			@pointerenter="handlePointerenter"
			@pointerleave="handlePointerleave"
			@pointerdown="handlePointerdown"
			@keydown="handleKeydown"
			@click="handleClick"
			@focusin="handleFocusin"
			@focusout="handleFocusout">
			<slot name="trigger" :is-open="isOpenLocal" />
		</div>

		<template #dropdown>
			<div
				:id="cardId"
				ref="innerRef"
				:tabindex="isScrollable ? 0 : undefined"
				:class="[ui('inner'), classes.inner]"
				@pointerenter="hold"
				@pointerleave="release"
				@focusin="hold"
				@focusout="release">
				<slot />
			</div>
		</template>
	</BaseDropdown>
</template>

<script setup lang="ts">
import '../styles/BaseHoverCard.style.scss'
import { BaseDropdown } from '@components/BaseDropdown'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseHoverCard } from '../model/useBaseHoverCard'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseHoverCardEmits, BaseHoverCardProps, BaseHoverCardSlots } from '../types/BaseHoverCard.types'

const props = withDefaults(
	defineProps<BaseHoverCardProps>(),
	kitDefaults('BaseHoverCard', {
		isOpen: false,
		position: 'bottom',
		openDelay: 300,
		closeDelay: 150,
		isDisabled: false,
		maxHeight: '320px',
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
		animation: 'scale',
	}),
)

const emit = defineEmits<BaseHoverCardEmits>()
defineSlots<BaseHoverCardSlots>()

const {
	classes,
	isOpenLocal,
	triggerRef,
	innerRef,
	isScrollable,
	cardId,
	handlePointerenter,
	handlePointerleave,
	handlePointerdown,
	handleKeydown,
	handleClick,
	handleFocusin,
	handleFocusout,
	hold,
	release,
	handleDropdownOpen,
	rootClass,
	panelClasses,
	arrowClass,
	ui,
} = useBaseHoverCard(props, emit)
</script>
