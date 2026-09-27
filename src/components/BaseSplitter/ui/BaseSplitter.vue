<template>
	<!--
		Две панели с разделителем по образцу APG Window Splitter: разделитель — role="separator" с aria-valuenow
		(размер первой панели, %), стрелки двигают его на шаг, Home/End — к границам, Enter сворачивает первую панель
		до минимума и возвращает обратно. Мышью и пальцем разделитель перетаскивается
	-->
	<div
		ref="rootRef"
		class="base-splitter"
		:class="[
			variantClass,
			`base-splitter--${orientation}`,
			{ 'base-splitter--dragging': isDragging, 'base-splitter--disabled': isDisabled },
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, { '--base-splitter-ratio': String(size / 100) }]">
		<div
			:id="startId"
			ref="startRef"
			class="base-splitter__pane base-splitter__pane--start"
			:class="classes.pane"
			:tabindex="isStartScrollable ? 0 : undefined">
			<slot name="start" />
		</div>
		<div
			class="base-splitter__separator"
			:class="classes.separator"
			role="separator"
			:tabindex="isDisabled ? undefined : 0"
			:aria-label="label ?? UI_ARIA.SPLITTER"
			:aria-orientation="orientation === 'horizontal' ? 'vertical' : 'horizontal'"
			:aria-valuenow="Math.round(size)"
			:aria-valuemin="min"
			:aria-valuemax="max"
			:aria-controls="startId"
			:aria-disabled="isDisabled ? 'true' : undefined"
			@keydown="handleKeydown"
			@pointerdown="handlePointerdown"
			@pointermove="handlePointermove"
			@pointerup="handlePointerup"
			@pointercancel="handlePointerup">
			<span class="base-splitter__handle" aria-hidden="true" />
		</div>
		<div ref="endRef" class="base-splitter__pane base-splitter__pane--end" :class="classes.pane" :tabindex="isEndScrollable ? 0 : undefined">
			<slot name="end" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { useScrollableRegion } from '@composables/useScrollableRegion'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, UI_ARIA } from '@constants'
import '../styles/BaseSplitter.style.scss'
import type { BaseSplitterEmits, BaseSplitterProps, BaseSplitterSlots } from '../model/BaseSplitter.types'

const props = withDefaults(defineProps<BaseSplitterProps>(), kitDefaults('BaseSplitter', {
	variant: DEFAULT_VARIANT,
	modelValue: 50,
	orientation: 'horizontal',
	min: 10,
	max: 90,
	step: 5,
	isDisabled: false,
	sizeScale: SIZE_SCALE_DEFAULT,
}))

const emit = defineEmits<BaseSplitterEmits>()
defineSlots<BaseSplitterSlots>()

const { sizeScaleStyle, variantClass, variantStyle, classes } = useStandardBaseComponent('base-splitter', props, ['root', 'pane', 'separator'])

const startId = useId()
const rootRef = ref<HTMLElement | null>(null)
const startRef = ref<HTMLElement | null>(null)
const endRef = ref<HTMLElement | null>(null)

/** Панели с прокруткой получают tabindex, чтобы их можно было прокрутить с клавиатуры */
const { isScrollable: isStartScrollable } = useScrollableRegion({ elementRef: startRef })
const { isScrollable: isEndScrollable } = useScrollableRegion({ elementRef: endRef })

/** Размер первой панели: работает и без v-model */
const size = ref(props.modelValue)
watch(
	() => props.modelValue,
	value => {
		size.value = value
	},
)

/** Размер до сворачивания по Enter: к нему разделитель вернётся */
let restoreSize = props.modelValue

function clamp(value: number): number {
	return Math.min(props.max, Math.max(props.min, value))
}

function setSize(value: number, isFinal: boolean): void {
	const next = clamp(value)
	if (next !== size.value) {
		size.value = next
		emit('update:modelValue', next)
	}
	if (isFinal) emit('change', next)
}

function handleKeydown(event: KeyboardEvent): void {
	const isHorizontal = props.orientation === 'horizontal'
	let next: number
	switch (event.key) {
		case isHorizontal ? 'ArrowLeft' : 'ArrowUp':
			next = size.value - props.step
			break
		case isHorizontal ? 'ArrowRight' : 'ArrowDown':
			next = size.value + props.step
			break
		case 'Home':
			next = props.min
			break
		case 'End':
			next = props.max
			break
		case 'Enter':
			// Свёрнута — вернуть прежний размер, иначе запомнить его и свернуть до минимума
			if (size.value > props.min) {
				restoreSize = size.value
				next = props.min
			} else {
				next = restoreSize
			}
			break
		default:
			return
	}
	event.preventDefault()
	setSize(next, true)
}

// ─── Перетаскивание ────────────────────────────────────────────────────────────

const isDragging = ref(false)

function handlePointerdown(event: PointerEvent): void {
	if (props.isDisabled || event.button !== 0) return
	event.preventDefault()
	const separator = event.currentTarget as HTMLElement
	separator.setPointerCapture?.(event.pointerId)
	separator.focus()
	isDragging.value = true
}

/** Размер из положения указателя внутри компонента, с точностью до десятой процента */
function handlePointermove(event: PointerEvent): void {
	if (!isDragging.value) return
	const rect = (rootRef.value as HTMLElement).getBoundingClientRect()
	const isHorizontal = props.orientation === 'horizontal'
	const length = isHorizontal ? rect.width : rect.height
	if (length <= 0) return
	const offset = isHorizontal ? event.clientX - rect.left : event.clientY - rect.top
	setSize(Math.round((offset / length) * 1000) / 10, false)
}

function handlePointerup(): void {
	if (!isDragging.value) return
	isDragging.value = false
	emit('change', size.value)
}
</script>
