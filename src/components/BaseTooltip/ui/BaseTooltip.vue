<template>
	<!-- Обёртка — span: подсказку можно поставить на кнопку внутри абзаца или строки таблицы -->
	<span
		ref="wrapperRef"
		class="base-tooltip"
		:class="classes.root"
		@mouseenter="handleEnter"
		@mouseleave="handleLeave"
		@focusin="handleEnter"
		@focusout="handleLeave">
		<slot :trigger-props="triggerAttributes" />

		<Teleport defer :to="teleportTarget">
			<Transition name="base-tooltip">
				<!--
					Подсказка в body не наследует стили обёртки: вариант, масштаб и цвет задаются на ней самой.
					На подсказку можно навести указатель (WCAG 1.4.13): она не пропадает, пока указатель над ней.
				-->
				<div
					v-if="isShown"
					:id="tooltipId"
					ref="popupRef"
					class="base-tooltip-popup"
					:class="[`base-tooltip-popup--${placement}`, variantClass, classes.tooltip]"
					:style="[tooltipStyle, sizeScaleStyle, variantStyle, customColorStyle]"
					:data-theme="inheritedTheme"
					role="tooltip"
					@mouseenter="cancelHide"
					@mouseleave="handleLeave">
					<BaseText tag="span" :custom-class="classes.text">{{ text }}</BaseText>
				</div>
			</Transition>
		</Teleport>
	</span>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { BaseText } from '@components/BaseText'
import { kitDefaults } from '@composables/useDefaults'
import { useEscapeKey } from '@composables/useEscapeKey'
import { useTriggerAttributes } from '@composables/useTriggerAttributes'
import { useInheritedTheme, useTeleportTarget } from '@composables/useTeleportTarget'
import { calcTooltipPosition, calcTooltipShift, resolveTooltipPlacement } from '@utils/tooltipUtils'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import '../styles/BaseTooltip.style.scss'
import type { TooltipLayout } from '@utils/tooltipUtils'
import type { BaseTooltipProps, BaseTooltipSlots } from '../model/BaseTooltip.types'

/** Отступ подсказки от элемента, px */
const GAP = 8
/** Задержка показа, мс: подсказка не мелькает, когда курсор проходит мимо */
const SHOW_DELAY_MS = 100
/** Задержка скрытия, мс: курсор успевает перейти на подсказку */
const HIDE_DELAY_MS = 150

/** Куда телепортируются слои: body или контейнер из плагина и BaseApp (teleportTo) */
const teleportTarget = useTeleportTarget()

const props = withDefaults(
	defineProps<BaseTooltipProps>(),
	kitDefaults('BaseTooltip', {
		variant: DEFAULT_VARIANT,
		position: 'top',
		isAlwaysVisible: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
defineSlots<BaseTooltipSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-tooltip-popup', props, [
	'root',
	'tooltip',
	'text',
])

const isVisible = ref(false)
/** Подсказка на экране: видима и есть текст — пустой пузырь не показывается */
const isShown = computed(() => isVisible.value && Boolean(props.text))
const wrapperRef = ref<HTMLElement | null>(null)
const popupRef = ref<HTMLElement | null>(null)
/** Тема блока, в котором стоит триггер: подсказка в body иначе взяла бы тему страницы */
const inheritedTheme = useInheritedTheme(
	() => wrapperRef.value,
	() => isVisible.value,
)
const tooltipId = `rise-tooltip-${useId()}`

/** Триггер описан подсказкой, пока она на экране: скринридер читает её после имени элемента */
const triggerAttributes = computed(() => ({ 'aria-describedby': isShown.value ? tooltipId : undefined }))
useTriggerAttributes(
	() => wrapperRef.value,
	() => triggerAttributes.value,
)
let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let rafId: number | null = null

const coords = ref({ top: 0, left: 0, width: 0, height: 0 })
/** Размер подсказки: нужен, чтобы перевернуть её и сдвинуть от края окна */
const popupSize = ref({ width: 0, height: 0 })

/** Новые координаты — только если триггер сдвинулся: иначе подсказка перерисовывалась бы каждый кадр */
function updateCoords(): void {
	/* istanbul ignore next -- defensive guard: wrapperRef всегда доступен после onMounted */
	if (!wrapperRef.value) return
	const { top, left, width, height } = wrapperRef.value.getBoundingClientRect()
	const current = coords.value
	if (current.top !== top || current.left !== left || current.width !== width || current.height !== height) {
		coords.value = { top, left, width, height }
	}
}

function measurePopup(): void {
	const popup = popupRef.value
	if (!popup) return
	const { offsetWidth: width, offsetHeight: height } = popup
	if (popupSize.value.width !== width || popupSize.value.height !== height) popupSize.value = { width, height }
}

/** Размер окна без полос прокрутки; в среде без раскладки (jsdom) clientWidth равен 0 — берётся innerWidth */
function getViewport(): { width: number; height: number } {
	const root = document.documentElement
	return { width: root.clientWidth || window.innerWidth, height: root.clientHeight || window.innerHeight }
}

function startUpdateLoop(): void {
	function tick(): void {
		updateCoords()
		measurePopup()
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

/** Триггер, подсказка и окно — для выбора стороны и сдвига у края */
function currentLayout(): TooltipLayout {
	return { coords: coords.value, size: popupSize.value, viewport: getViewport() }
}

/** Сторона подсказки: выбранная или противоположная, если у края окна не хватает места */
const placement = computed(() => resolveTooltipPlacement(props.position, currentLayout(), GAP))

/** Координаты со сдвигом от края окна; стрелка сдвигается обратно и смотрит на триггер */
const tooltipStyle = computed((): Record<string, string> => {
	const shift = calcTooltipShift(placement.value, currentLayout())
	return {
		...calcTooltipPosition({ position: placement.value, coords: coords.value, gap: GAP, shift }),
		'--tooltip-arrow-offset': `${-shift}px`,
	}
})

/** Появившуюся подсказку измеряем до отрисовки кадра: переворот и сдвиг — без мигания на старом месте */
watch(isShown, async shown => {
	if (!shown) return
	await nextTick()
	measurePopup()
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
	}, SHOW_DELAY_MS)
}

/** Указатель перешёл с триггера на подсказку: она остаётся на экране */
function cancelHide(): void {
	if (hideTimer) clearTimeout(hideTimer)
	hideTimer = null
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
	}, HIDE_DELAY_MS)
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
