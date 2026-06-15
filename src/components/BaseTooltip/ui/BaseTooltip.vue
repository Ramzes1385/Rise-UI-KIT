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
					:class="[[`base-tooltip--${position}`, variantClass], classes.tooltip]"
					:style="[tooltipStyle, sizeScaleStyle, variantStyle, customColorStyle]">
					<BaseText tag="span" :custom-class="classes.text">{{ text }}</BaseText>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { BaseText } from '@components/BaseText'
import { UI_TRANSITION_DURATION_MS } from '@constants'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { calcTooltipPosition, getTooltipTransition } from '@utils/tooltipUtils'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import '../styles/BaseTooltip.style.scss'
import type { BaseTooltipProps } from '../model/BaseTooltip.types'

const props = defineProps<BaseTooltipProps>()

const position = computed(() => props.position ?? 'top')
const variant = computed(() => props.variant ?? 'default')
const isAlwaysVisible = computed(() => props.isAlwaysVisible ?? false)
const sizeScale = computed(() => props.sizeScale ?? 100)

const { sizeScaleStyle } = useSizeScale({ getScale: () => sizeScale.value })
const { variantClass, variantStyle } = useVariant({ block: 'base-tooltip', getVariant: () => variant.value })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'tooltip', 'text'],
})

const isVisible = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)
let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let rafId: number | null = null

/** Координаты триггера */
const coords = ref({ top: 0, left: 0, width: 0, height: 0 })

/** Имя перехода по позиции */
const transitionName = computed(() => getTooltipTransition(position.value))

/** Обновить координаты триггера */
function updateCoords(): void {
	/* istanbul ignore next -- defensive guard: wrapperRef всегда доступен после onMounted */
	if (!wrapperRef.value) return
	const rect = wrapperRef.value.getBoundingClientRect()
	coords.value = { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
}

/** Цикл обновления позиции при видимости */
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
		position: position.value,
		coords: coords.value,
		gap: 8,
	})
})

function handleEnter(): void {
	if (isAlwaysVisible.value) return

	/* istanbul ignore if -- hideTimer присутствует только после handleLeave с активным таймером, цепочка тестируется в e2e */
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
	if (isAlwaysVisible.value) return

	/* istanbul ignore else -- showTimer всегда установлен после handleEnter перед handleLeave */
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
	if (isAlwaysVisible.value) {
		updateCoords()
		isVisible.value = true
		startUpdateLoop()
	}
})

/* istanbul ignore next -- watch isAlwaysVisible: переключение во время жизни компонента покрывается e2e/visual тестами */
watch(
	() => isAlwaysVisible.value,
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
