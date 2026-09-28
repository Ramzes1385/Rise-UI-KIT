<template>
	<!--
		Область прокрутки с тонкими полосами поверх содержимого: одинаковый вид во всех системах. Прокручивает родной
		элемент (колесо, касание, клавиатура работают как обычно), полосы — только для мыши (aria-hidden). Область
		с прокруткой получает tabindex="0", чтобы её можно было прокрутить стрелками
	-->
	<div
		class="base-scroll-area"
		:class="[
			variantClass,
			`base-scroll-area--${orientation}`,
			`base-scroll-area--scrollbar-${scrollbar}`,
			{ 'base-scroll-area--active': isScrolling || dragAxis !== null },
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle]">
		<div
			ref="viewportRef"
			class="base-scroll-area__viewport"
			:class="classes.viewport"
			:style="viewportStyle"
			:tabindex="isScrollable ? 0 : undefined"
			:role="ariaLabel ? 'region' : undefined"
			:aria-label="ariaLabel"
			@scroll="handleScroll">
			<div ref="contentRef" class="base-scroll-area__content">
				<slot />
			</div>
		</div>
		<template v-for="axis in AXES" :key="axis">
			<div
				v-if="bars[axis].isVisible"
				class="base-scroll-area__bar"
				:class="[`base-scroll-area__bar--${axis}`, classes.bar]"
				aria-hidden="true"
				@pointerdown="handleTrackPointerdown(axis, $event)">
				<div
					class="base-scroll-area__thumb"
					:class="classes.thumb"
					:style="thumbStyle(axis)"
					@pointerdown.stop="handleThumbPointerdown(axis, $event)"
					@pointermove="handleThumbPointermove"
					@pointerup="handleThumbPointerup"
					@pointercancel="handleThumbPointerup" />
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import '../styles/BaseScrollArea.style.scss'
import type {
	Axis,
	BaseScrollAreaEmits,
	BaseScrollAreaExpose,
	BaseScrollAreaProps,
	BaseScrollAreaSlots,
} from '../types/BaseScrollArea.types'

const AXES: Axis[] = ['y', 'x']

/** Наименьшая длина ползунка, px: за короткий ползунок трудно ухватиться */
const MIN_THUMB = 20

/** Сколько полосы остаются видны после прокрутки в режиме hover, мс */
const SCROLL_IDLE_DELAY = 800

const props = withDefaults(
	defineProps<BaseScrollAreaProps>(),
	kitDefaults('BaseScrollArea', {
		variant: DEFAULT_VARIANT,
		orientation: 'vertical',
		scrollbar: 'hover',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseScrollAreaEmits>()
defineSlots<BaseScrollAreaSlots>()

const { sizeScaleStyle, variantClass, variantStyle, classes } = useStandardBaseComponent('base-scroll-area', props, [
	'root',
	'viewport',
	'bar',
	'thumb',
])

const viewportRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)

const viewportStyle = computed(() => {
	if (props.maxHeight === undefined) return undefined
	return { maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight }
})

/** Полосы: видна ли, длина ползунка и его смещение — в процентах длины полосы */
const bars = reactive({
	x: { isVisible: false, size: 0, offset: 0 },
	y: { isVisible: false, size: 0, offset: 0 },
})

const isScrollable = computed(() => bars.x.isVisible || bars.y.isVisible)

/** Размеры области по оси: видимая длина, полная длина содержимого, прокрутка */
function measure(viewport: HTMLElement, axis: Axis): { client: number; total: number; position: number } {
	return axis === 'y'
		? { client: viewport.clientHeight, total: viewport.scrollHeight, position: viewport.scrollTop }
		: { client: viewport.clientWidth, total: viewport.scrollWidth, position: viewport.scrollLeft }
}

function isAxisEnabled(axis: Axis): boolean {
	return props.orientation === 'both' || (axis === 'y') === (props.orientation === 'vertical')
}

function update(): void {
	const viewport = viewportRef.value as HTMLElement
	for (const axis of AXES) {
		const { client, total, position } = measure(viewport, axis)
		const bar = bars[axis]
		bar.isVisible = isAxisEnabled(axis) && total > client + 1
		if (!bar.isVisible) continue
		bar.size = Math.min(100, Math.max((client / total) * 100, (MIN_THUMB / client) * 100))
		bar.offset = (position / (total - client)) * (100 - bar.size)
	}
}

function thumbStyle(axis: Axis): Record<string, string> {
	const { size, offset } = bars[axis]
	return axis === 'y' ? { height: `${size}%`, top: `${offset}%` } : { width: `${size}%`, left: `${offset}%` }
}

const isScrolling = ref(false)
let idleTimer: ReturnType<typeof setTimeout> | undefined

function handleScroll(event: Event): void {
	update()
	isScrolling.value = true
	clearTimeout(idleTimer)
	idleTimer = setTimeout(() => (isScrolling.value = false), SCROLL_IDLE_DELAY)
	emit('scroll', event)
}

function setScroll(axis: Axis, position: number): void {
	const viewport = viewportRef.value as HTMLElement
	if (axis === 'y') viewport.scrollTop = position
	else viewport.scrollLeft = position
}

/** Клик по полосе мимо ползунка: ползунок встаёт серединой под указатель */
function handleTrackPointerdown(axis: Axis, event: PointerEvent): void {
	const viewport = viewportRef.value as HTMLElement
	const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
	const length = axis === 'y' ? rect.height : rect.width
	if (length <= 0) return
	const fraction = (axis === 'y' ? event.clientY - rect.top : event.clientX - rect.left) / length
	const { client, total } = measure(viewport, axis)
	setScroll(axis, fraction * total - client / 2)
}

/** Перетаскивание ползунка: смещение указателя переводится в прокрутку пропорционально свободному ходу ползунка */
const dragAxis = ref<Axis | null>(null)
let dragStartPointer = 0
let dragStartScroll = 0

function handleThumbPointerdown(axis: Axis, event: PointerEvent): void {
	if (event.button !== 0) return
	event.preventDefault()
	const thumb = event.currentTarget as HTMLElement
	thumb.setPointerCapture?.(event.pointerId)
	const { position } = measure(viewportRef.value as HTMLElement, axis)
	dragAxis.value = axis
	dragStartPointer = axis === 'y' ? event.clientY : event.clientX
	dragStartScroll = position
}

function handleThumbPointermove(event: PointerEvent): void {
	const axis = dragAxis.value
	if (!axis) return
	const { client, total } = measure(viewportRef.value as HTMLElement, axis)
	const freeTrack = client - (bars[axis].size / 100) * client
	if (freeTrack <= 0) return
	const delta = (axis === 'y' ? event.clientY : event.clientX) - dragStartPointer
	setScroll(axis, dragStartScroll + (delta * (total - client)) / freeTrack)
}

function handleThumbPointerup(): void {
	dragAxis.value = null
}

let observer: ResizeObserver | null = null

onMounted(() => {
	update()
	observer = new ResizeObserver(update)
	observer.observe(viewportRef.value as HTMLElement)
	observer.observe(contentRef.value as HTMLElement)
})

onBeforeUnmount(() => {
	observer?.disconnect()
	clearTimeout(idleTimer)
})

defineExpose<BaseScrollAreaExpose>({
	scrollTo: options => viewportRef.value?.scrollTo(options),
	scrollToTop: () => viewportRef.value?.scrollTo({ top: 0 }),
	scrollToBottom: () => viewportRef.value?.scrollTo({ top: viewportRef.value.scrollHeight }),
	update,
	getViewport: () => viewportRef.value,
})
</script>
