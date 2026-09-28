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
		<!-- Кнопка — из слота: кит ставит ей aria-haspopup, aria-expanded и aria-controls сам -->
		<div ref="triggerRef" class="base-popover__trigger" :class="classes.trigger" @click="toggle">
			<slot name="trigger" :is-open="isOpenLocal" :trigger-props="triggerAttributes" />
		</div>

		<template #dropdown>
			<div class="base-popover__arrow" :class="[`base-popover__arrow--${position}`, classes.arrow]"></div>
			<!-- Немодальный диалог с именем кнопки: фокус остаётся на кнопке, Tab идёт в поля поповера -->
			<div :id="panelId" class="base-popover__inner" :class="classes.inner" role="dialog" :aria-labelledby="triggerId">
				<slot />
			</div>
		</template>
	</BaseDropdown>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { kitDefaults } from '@composables/useDefaults'
import { BaseDropdown } from '@components/BaseDropdown'
import { useCustomClass } from '@composables/useCustomClass'
import { useTriggerAttributes } from '@composables/useTriggerAttributes'
import '../styles/BasePopover.style.scss'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { BasePopoverEmits, BasePopoverProps, BasePopoverSlots } from '../model/BasePopover.types'

const props = withDefaults(
	defineProps<BasePopoverProps>(),
	kitDefaults('BasePopover', {
		isOpen: false,
		position: 'bottom',
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BasePopoverEmits>()
defineSlots<BasePopoverSlots>()

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'trigger', 'arrow', 'inner', 'panel'],
})

const isOpenLocal = ref(props.isOpen)
const triggerRef = ref<HTMLElement | null>(null)
const panelId = `rise-popover-${useId()}`

const triggerAttributes = computed(() => ({
	'aria-haspopup': 'dialog',
	'aria-expanded': isOpenLocal.value ? 'true' : 'false',
	'aria-controls': isOpenLocal.value ? panelId : undefined,
}))

const { triggerId } = useTriggerAttributes(
	() => triggerRef.value,
	() => triggerAttributes.value,
	{ withId: true },
)

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

/** Клик по кнопке открывает и закрывает поповер; закрытие кнопкой — такое же закрытие, как Escape: с `close` */
function toggle(): void {
	isOpenLocal.value = !isOpenLocal.value
	emit('update:isOpen', isOpenLocal.value)
	if (!isOpenLocal.value) emit('close')
}

function handleClose(): void {
	emit('update:isOpen', false)
	emit('close')
}
</script>
