<template>
	<BaseDropdown
		v-model:is-open="isOpenLocal"
		:position="position"
		:variant="variant"
		:color="color"
		:gap="10"
		:match-width="false"
		:prevent-mousedown="false"
		:panel-class="panelClasses"
		:padding="0"
		:size-scale="sizeScale"
		:custom-class="{ root: rootClass, panel: classes.panel }"
		@close="handleClose">
		<div class="base-popover__trigger" :class="classes.trigger" @click="toggle">
			<slot name="trigger" />
		</div>

		<template #dropdown>
			<div class="base-popover__arrow" :class="[`base-popover__arrow--${position}`, classes.arrow]"></div>
			<div class="base-popover__inner" :class="classes.inner">
				<slot />
			</div>
		</template>
	</BaseDropdown>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BaseDropdown } from '@components/BaseDropdown'
import { useCustomClass } from '@composables/useCustomClass'
import { kitDefaults } from '@composables/useDefaults'
import '../styles/BasePopover.style.scss'
import { SIZE_SCALE_DEFAULT, DEFAULT_VARIANT } from '@constants'
import type { BasePopoverEmits, BasePopoverProps, BasePopoverSlots } from '../model/BasePopover.types'

const props = withDefaults(defineProps<BasePopoverProps>(), kitDefaults('BasePopover', {
	isOpen: false,
	position: 'bottom',
	variant: DEFAULT_VARIANT,
	sizeScale: SIZE_SCALE_DEFAULT,
}))

const emit = defineEmits<BasePopoverEmits>()
defineSlots<BasePopoverSlots>()

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

/**
 * Корень — обёртка BaseDropdown с классом base-popover: строчная, по размеру триггера.
 * Поэтому панель и стрелка центрируются по триггеру, а не по всей строке.
 */
const rootClass = computed((): string => ['base-popover', classes.value.root].filter(Boolean).join(' '))

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
