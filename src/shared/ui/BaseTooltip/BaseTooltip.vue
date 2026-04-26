<template>
	<div
		ref="wrapperRef"
		class="base-tooltip-wrapper"
		:style="sizeScaleStyle"
		@mouseenter="handleEnter"
		@mouseleave="handleLeave">
		<slot />

		<Teleport to="body">
			<Transition :name="transitionName" :duration="200">
				<div
					v-if="isVisible"
					class="base-tooltip"
					:class="[`base-tooltip--${position}`, variantClass]"
					:style="[tooltipStyle, sizeScaleStyle, variantStyle, customColorStyle]">
					<BaseText tag="span">{{ text }}</BaseText>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseText } from '@/shared/ui/BaseText'
import { calcTooltipPosition, getTooltipTransition } from '@/shared/utils/tooltipUtils'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import './BaseTooltip.style.scss'
import type { BaseTooltipProps } from './BaseTooltip.types'

const props = withDefaults(defineProps<BaseTooltipProps>(), {
	position: 'top',
	variant: 'default',
	isAlwaysVisible: false,
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-tooltip', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const isVisible = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)
let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let rafId: number | null = null

/** Координаты триггера */
const coords = ref({ top: 0, left: 0, width: 0, height: 0 })

/** Имя перехода по позиции */
const transitionName = computed(() => getTooltipTransition(props.position))

/** Обновить координаты триггера */
function updateCoords(): void {
	if (!wrapperRef.value) return
	const rect = wrapperRef.value.getBoundingClientRect()
	coords.value = { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
}

/** Цикл обновления позиции при видимости */
function startUpdateLoop(): void {
	function tick(): void {
		updateCoords()
		if (isVisible.value) {
			rafId = requestAnimationFrame(tick)
		}
	}
	rafId = requestAnimationFrame(tick)
}

/** Остановить цикл обновления */
function stopUpdateLoop(): void {
	if (rafId !== null) {
		cancelAnimationFrame(rafId)
		rafId = null
	}
}

/** Динамические координаты тултипа */
const tooltipStyle = computed((): Record<string, string> => {
	return calcTooltipPosition({
		position: props.position,
		coords: coords.value,
		gap: 8,
	})
})

function handleEnter(): void {
	if (props.isAlwaysVisible) return

	if (hideTimer) {
		clearTimeout(hideTimer)
		hideTimer = null
	}

	showTimer = setTimeout(() => {
		updateCoords()
		isVisible.value = true
		startUpdateLoop()
	}, 100)
}

function handleLeave(): void {
	if (props.isAlwaysVisible) return

	if (showTimer) {
		clearTimeout(showTimer)
		showTimer = null
	}

	hideTimer = setTimeout(() => {
		isVisible.value = false
		stopUpdateLoop()
	}, 150)
}

onMounted(() => {
	if (props.isAlwaysVisible) {
		updateCoords()
		isVisible.value = true
		startUpdateLoop()
	}
})

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
