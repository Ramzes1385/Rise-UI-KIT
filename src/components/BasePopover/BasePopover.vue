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
		:custom-class="{ root: classes.root, panel: classes.panel }"
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
import { BaseDropdown } from '@components/BaseDropdown'
import { useCustomClass } from '@composables/useCustomClass'
import { computed, ref, watch } from 'vue'
import './BasePopover.style.scss'
import type { BasePopoverEmits, BasePopoverProps } from './BasePopover.types'

const props = defineProps<BasePopoverProps>()

const emit = defineEmits<BasePopoverEmits>()

const isOpen = computed(() => props.isOpen ?? false)
const position = computed(() => props.position ?? 'bottom')
const variant = computed(() => props.variant ?? 'default')
const sizeScale = computed(() => props.sizeScale ?? 100)

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'trigger', 'arrow', 'inner', 'panel'],
})

/** Локальное состояние для немедленного реагирования */
const isOpenLocal = ref(isOpen.value)

/** Синхронизация с prop при внешнем изменении */
watch(
	() => isOpen.value,
	val => {
		isOpenLocal.value = val
	},
)

/** CSS-классы панели */
const panelClasses = computed((): string => {
	return `base-popover__panel base-popover__panel--${variant.value}`
})

/** Переключить видимость */
function toggle(): void {
	isOpenLocal.value = !isOpenLocal.value
	emit('update:isOpen', isOpenLocal.value)
}

/** Закрыть popover */
function handleClose(): void {
	emit('update:isOpen', false)
	emit('close')
}
</script>
