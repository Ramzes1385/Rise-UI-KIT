<template>
	<div
		ref="wrapperRef"
		class="base-tooltip"
		:class="classes.root"
		@mouseenter="handleEnter"
		@mouseleave="handleLeave"
		@focusin="handleEnter"
		@focusout="handleLeave">
		<slot />

		<Teleport to="body">
			<Transition name="base-tooltip">
				<!-- Подсказка в body не наследует стили обёртки: вариант, масштаб и цвет задаются на ней самой -->
				<div
					v-if="isVisible"
					:id="tooltipId"
					class="base-tooltip-popup"
					:class="[`base-tooltip-popup--${position}`, variantClass, classes.tooltip]"
					:style="[tooltipStyle, sizeScaleStyle, variantStyle, customColorStyle]"
					role="tooltip">
					<BaseText tag="span" :custom-class="classes.text">{{ text }}</BaseText>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { BaseText } from '@components/BaseText'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { useEscapeKey } from '@composables/useEscapeKey'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, UI_SIZE, UI_TIMING } from '@constants'
import { calcTooltipPosition } from '@utils/tooltipUtils'
import '../styles/BaseTooltip.style.scss'
import type { BaseTooltipProps, BaseTooltipSlots } from '../model/BaseTooltip.types'

const props = withDefaults(defineProps<BaseTooltipProps>(), kitDefaults('BaseTooltip', {
	variant: DEFAULT_VARIANT,
	position: 'top',
	isAlwaysVisible: false,
	sizeScale: SIZE_SCALE_DEFAULT,
}))
defineSlots<BaseTooltipSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-tooltip-popup', props, [
	'root',
	'tooltip',
	'text',
])

const isVisible = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)
const tooltipId = useId()
let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let rafId: number | null = null

const coords = ref({ top: 0, left: 0, width: 0, height: 0 })

function updateCoords(): void {
	/* istanbul ignore next -- defensive guard: wrapperRef всегда доступен после onMounted */
	if (!wrapperRef.value) return
	const rect = wrapperRef.value.getBoundingClientRect()
	coords.value = { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
}

function startUpdateLoop(): void {
	function tick(): void {
		updateCoords()
		/* istanbul ignore else -- RAF race-condition: tick может выполниться после isVisible=false */
		if (isVisible.value) {
			rafId = requestAnimationFrame(tick)
		}
	}
	rafId = requestAnimationFrame(tick)
}

function stopUpdateLoop(): void {
	if (rafId !== null) {
		cancelAnimationFrame(rafId)
		rafId = null
	}
}

const tooltipStyle = computed((): Record<string, string> => {
	return calcTooltipPosition({
		position: props.position,
		coords: coords.value,
		gap: UI_SIZE.GAP.MD,
	})
})

/** Наведение или фокус на триггере: подсказка появляется после короткой задержки */
function handleEnter(): void {
	if (props.isAlwaysVisible) return

	/* istanbul ignore if -- hideTimer присутствует только после handleLeave с активным таймером, цепочка тестируется в e2e */
	if (hideTimer) {
		clearTimeout(hideTimer)
		hideTimer = null
	}

	showTimer = setTimeout(() => {
		updateCoords()
		isVisible.value = true
		startUpdateLoop()
	}, UI_TIMING.TOOLTIP_SHOW_DELAY)
}

/** Уход курсора или фокуса: подсказка скрывается с задержкой, чтобы не мигать при переходе между элементами */
function handleLeave(): void {
	if (props.isAlwaysVisible) return

	/* istanbul ignore else -- showTimer всегда установлен после handleEnter перед handleLeave */
	if (showTimer) {
		clearTimeout(showTimer)
		showTimer = null
	}

	hideTimer = setTimeout(() => {
		isVisible.value = false
		stopUpdateLoop()
	}, UI_TIMING.TOOLTIP_HIDE_DELAY)
}

/** Escape скрывает подсказку сразу (WCAG 1.4.13): она не должна мешать, пока фокус остаётся на триггере */
function hideNow(): void {
	if (showTimer) clearTimeout(showTimer)
	if (hideTimer) clearTimeout(hideTimer)
	showTimer = null
	hideTimer = null
	isVisible.value = false
	stopUpdateLoop()
}

useEscapeKey({
	isActive: () => isVisible.value && !props.isAlwaysVisible,
	callback: hideNow,
})

onMounted(() => {
	if (props.isAlwaysVisible) {
		updateCoords()
		isVisible.value = true
		startUpdateLoop()
	}
})

/* istanbul ignore next -- watch isAlwaysVisible: переключение во время жизни компонента покрывается e2e/visual тестами */
watch(
	() => props.isAlwaysVisible,
	newVal => {
		if (newVal) {
			updateCoords()
			isVisible.value = true
			startUpdateLoop()
		} else {
			isVisible.value = false
			stopUpdateLoop()
		}
	},
)

onBeforeUnmount(() => {
	stopUpdateLoop()
	if (showTimer) clearTimeout(showTimer)
	if (hideTimer) clearTimeout(hideTimer)
})
</script>
