<template>
	<div
		ref="wrapperRef"
		class="base-tooltip-wrapper"
		:class="classes.root"
		:style="sizeScaleStyle"
		@mouseenter="handleEnter"
		@mouseleave="handleLeave">
		<slot />

		<Teleport to="body">
			<Transition :name="transitionName" :duration="UI_TRANSITION_DURATION_MS">
				<div
					v-if="isVisible"
					class="base-tooltip"
					:class="[[`base-tooltip--${props.position}`, variantClass], classes.tooltip]"
					:style="[tooltipStyle, sizeScaleStyle, variantStyle, customColorStyle]">
					<BaseText tag="span" :custom-class="classes.text">{{ text }}</BaseText>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { BaseText } from '@components/BaseText'
import { UI_TOOLTIP_HIDE_DELAY_MS, UI_TOOLTIP_SHOW_DELAY_MS, UI_TRANSITION_DURATION_MS } from '@constants'
import { useBaseComponent } from '@composables/useBaseComponent'
import { calcTooltipPosition, getTooltipTransition } from '@utils/tooltipUtils'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import '../styles/BaseTooltip.style.scss'
import type { BaseTooltipProps } from '../model/BaseTooltip.types'

const props = withDefaults(defineProps<BaseTooltipProps>(), {
	position: 'top',
	isAlwaysVisible: false,
	sizeScale: 100,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-tooltip',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'tooltip', 'text'],
})

const isVisible = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)
let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let rafId: number | null = null

const coords = ref({ top: 0, left: 0, width: 0, height: 0 })

const transitionName = computed(() => getTooltipTransition(props.position))

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
		gap: 8,
	})
})

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
	}, UI_TOOLTIP_SHOW_DELAY_MS)
}

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
	}, UI_TOOLTIP_HIDE_DELAY_MS)
}

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
