<template>
	<BaseDropdown
		v-model:is-open="isOpenLocal"
		:position="props.position"
		:variant="props.variant"
		:color="color"
		:gap="10"
		:match-width="false"
		:prevent-mousedown="false"
		:panel-class="panelClasses"
		:padding="0"
		:size-scale="props.sizeScale"
		:custom-class="{ root: classes.root, panel: classes.panel }"
		@close="handleClose">
		<div class="base-popover__trigger" :class="classes.trigger" @click="toggle">
			<slot name="trigger" />
		</div>

		<template #dropdown>
			<div class="base-popover__arrow" :class="[`base-popover__arrow--${props.position}`, classes.arrow]"></div>
			<div class="base-popover__inner" :class="classes.inner">
				<slot />
			</div>
		</template>
	</BaseDropdown>
</template>

<script setup lang="ts">
import { BaseDropdown } from '@components/BaseDropdown'
import { useCustomClass } from '@composables/useCustomClass'
import { computed, ref, watch } from 'vue'
import '../styles/BasePopover.style.scss'
import type { BasePopoverEmits, BasePopoverProps } from '../model/BasePopover.types'
import { SIZE_SCALE_DEFAULT, DEFAULT_VARIANT } from '@constants'

const props = withDefaults(defineProps<BasePopoverProps>(), {
	isOpen: false,
	position: 'bottom',
	variant: DEFAULT_VARIANT,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BasePopoverEmits>()

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'trigger', 'arrow', 'inner', 'panel'],
})

const isOpenLocal = ref(props.isOpen)

watch(
	() => props.isOpen,
	isOpen => {
		isOpenLocal.value = isOpen
	},
)

const panelClasses = computed((): string => {
	return `base-popover__panel base-popover__panel--${props.variant}`
})

function toggle(): void {
	isOpenLocal.value = !isOpenLocal.value
	emit('update:isOpen', isOpenLocal.value)
}

function handleClose(): void {
	emit('update:isOpen', false)
	emit('close')
}
</script>
