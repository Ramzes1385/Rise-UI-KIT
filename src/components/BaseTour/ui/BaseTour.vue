<template>
	<Teleport to="body">
		<div
			v-if="isOpen && currentStep"
			class="base-tour"
			:class="classes.root"
			role="dialog"
			aria-modal="true"
			:aria-label="currentStep.title || 'Тур по интерфейсу'">
			<div class="base-tour__overlay" :class="classes.overlay" @click="handleOverlayClick" />

			<div
				v-if="spotlightStyle"
				class="base-tour__spotlight"
				:class="[{ 'base-tour__spotlight--focusing': isFocusing }, classes.spotlight]"
				:style="spotlightStyle" />

			<Transition name="base-tour-card">
				<div
					v-if="cardStyle && slotContext && geometry && !isFocusing"
					class="base-tour__card"
					:class="[isMobile ? 'base-tour__card--mobile' : `base-tour__card--${geometry.placement}`, classes.card]"
					:style="cardStyle">
					<slot v-bind="slotContext">
					<BaseCard variant="shadow" :padding="8" :custom-class="classes.cardInner">
						<template v-if="hasHeader" #header>
							<slot name="title" :step="currentStep" :index="activeIndex">
								<BaseText v-if="currentStep.title" tag="h3" :weight="600" :custom-class="classes.title">{{
									currentStep.title
								}}</BaseText>
							</slot>
						</template>

						<template v-if="showSkip" #actions>
							<BaseButton
								variant="ghost"
								:padding="4"
								aria-label="Пропустить тур"
								:custom-class="classes.closeButton"
								@click="handleSkip">
								<BaseIcon name="close" :custom-class="classes.closeIcon" />
							</BaseButton>
						</template>

						<slot name="content" :step="currentStep" :index="activeIndex">
							<BaseText v-if="currentStep.content" tag="p" :color="contentColor" :custom-class="classes.content">{{
								currentStep.content
							}}</BaseText>
						</slot>

						<template #footer>
							<div class="base-tour__footer" :class="classes.footer">
								<div
									v-if="showProgress && useDots"
									class="base-tour__progress"
									:class="classes.progress"
									aria-hidden="true">
									<span
										v-for="(_, dotIndex) in total"
										:key="dotIndex"
										class="base-tour__dot"
										:class="[{ 'base-tour__dot--active': dotIndex === activeIndex }, classes.dot]" />
								</div>
								<div
									v-else-if="showProgress"
									class="base-tour__progress-bar"
									:class="classes.progress"
									aria-hidden="true">
									<span class="base-tour__progress-bar-fill" :style="{ width: `${progressPercent}%` }" />
								</div>
								<BaseText tag="span" :color="contentColor" class="base-tour__counter" :custom-class="classes.counter">
									{{ activeIndex + 1 }} / {{ total }}
								</BaseText>

								<div class="base-tour__actions" :class="classes.actions">
									<BaseButton
										v-if="!isFirst"
										:padding="6"
										variant="ghost"
										:custom-class="classes.prevButton"
										@click="goPrev"
										>{{ prevLabel }}</BaseButton
									>
									<BaseButton
										v-if="!isLast"
										:padding="6"
										variant="default"
										:custom-class="classes.nextButton"
										@click="goNext"
										>{{ nextLabel }}</BaseButton
									>
									<BaseButton v-else :padding="6" variant="default" :custom-class="classes.finishButton" @click="handleFinish">{{
										finishLabel
									}}</BaseButton>
								</div>
							</div>
						</template>
					</BaseCard>
				</slot>
				</div>
			</Transition>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { BaseButton } from '@components/BaseButton'
import { BaseCard } from '@components/BaseCard'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useBreakpoint } from '@composables/useBreakpoint'
import { useCustomClass } from '@composables/useCustomClass'
import { useEscapeKey } from '@composables/useEscapeKey'
import { useScrollLock } from '@composables/useScrollLock'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { PropType } from 'vue'

import type { CustomColor } from '@composables/useCustomColor'
import '../styles/BaseTour.style.scss'
import type { BaseTourEmits, BaseTourProps, BaseTourSlotContext, BaseTourSlots } from '../model/BaseTour.types'
import { DEFAULT_RADIUS, useTourLogic } from '../model/useTourLogic'

/* eslint-disable vue/require-default-prop -- intentionally optional props keep Vue runtime behavior unchanged after withDefaults removal */
const props = defineProps({
	isOpen: { type: Boolean, default: false },
	steps: { type: Array as PropType<BaseTourProps['steps']>, required: true },
	step: { type: Number, default: 0 },
	placement: { type: String as PropType<BaseTourProps['placement']>, default: 'auto' },
	gap: Number,
	padding: Number,
	radius: Number,
	closeOnOverlayClick: { type: Boolean, default: true },
	closeOnEscape: { type: Boolean, default: true },
	lockScroll: { type: Boolean, default: true },
	scrollIntoView: { type: Boolean, default: true },
	nextLabel: { type: String, default: 'Далее' },
	prevLabel: { type: String, default: 'Назад' },
	finishLabel: { type: String, default: 'Завершить' },
	skipLabel: { type: String, default: 'Пропустить' },
	showSkip: { type: Boolean, default: true },
	showProgress: { type: Boolean, default: true },
	customClass: [String, Object] as PropType<BaseTourProps['customClass']>,
})
/* eslint-enable vue/require-default-prop */

const emit = defineEmits<BaseTourEmits>()
defineSlots<BaseTourSlots>()

const FOCUS_DURATION = 450
const MAX_DOTS = 8

const internalIndex = ref(props.step)
const activeIndex = computed((): number => internalIndex.value)
const contentColor: CustomColor = { text: { base: 'var(--color-text-muted)' } }

const isFocusing = ref(false)
const focusFromViewport = ref(false)
let focusTimer: ReturnType<typeof setTimeout> | null = null
let focusRaf = 0

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: [
		'root',
		'overlay',
		'spotlight',
		'card',
		'cardInner',
		'title',
		'closeButton',
		'closeIcon',
		'content',
		'footer',
		'progress',
		'dot',
		'counter',
		'actions',
		'prevButton',
		'nextButton',
		'finishButton',
	],
})

const { lock, unlock } = useScrollLock()
const { isMobile } = useBreakpoint()

const { geometry, currentStep, isFirst, isLast, total, recalculate, attachListeners, detachListeners } = useTourLogic({
	props,
	getIndex: () => internalIndex.value,
})

const hasHeader = computed((): boolean => Boolean(currentStep.value?.title))

/** Показывать точки прогресса (для небольшого числа шагов) либо компактную полосу */
const useDots = computed((): boolean => total.value <= MAX_DOTS)

/** Заполнение полосы прогресса в процентах (для большого числа шагов, total > MAX_DOTS) */
const progressPercent = computed((): number => {
	return Math.round((activeIndex.value / (total.value - 1)) * 100)
})

const spotlightStyle = computed((): Record<string, string> | null => {
	const value = geometry.value
	if (!value) return null

	if (focusFromViewport.value) {
		const margin = 48
		return {
			top: `${-margin}px`,
			left: `${-margin}px`,
			width: `calc(100vw + ${margin * 2}px)`,
			height: `calc(100vh + ${margin * 2}px)`,
			borderRadius: '0px',
		}
	}

	const { top, left, width, height } = value.spotlight
	return {
		top: `${top}px`,
		left: `${left}px`,
		width: `${width}px`,
		height: `${height}px`,
		borderRadius: `${props.radius ?? DEFAULT_RADIUS}px`,
	}
})

const cardStyle = computed((): Record<string, string> | null => {
	const value = geometry.value
	if (!value) return null
	if (isMobile.value) return {}
	return { top: `${value.card.top}px`, left: `${value.card.left}px` }
})

const slotContext = computed((): BaseTourSlotContext | null => {
	const step = currentStep.value
	/* istanbul ignore next -- defensive: карточка рендерится только при истинном currentStep (v-if на корне) */
	if (!step) return null
	return {
		step,
		index: activeIndex.value,
		total: total.value,
		isFirst: isFirst.value,
		isLast: isLast.value,
		next: goNext,
		prev: goPrev,
		skip: handleSkip,
		finish: handleFinish,
	}
})

function setIndex(value: number): void {
	internalIndex.value = value
	emit('update:step', value)
	emit('change', value)
}

function goNext(): void {
	if (isLast.value) return
	const next = internalIndex.value + 1
	setIndex(next)
	emit('next', next)
}

function goPrev(): void {
	if (isFirst.value) return
	const prev = internalIndex.value - 1
	setIndex(prev)
	emit('prev', prev)
}

function close(): void {
	emit('update:isOpen', false)
	emit('close')
}

function handleSkip(): void {
	emit('skip')
	close()
}

function handleFinish(): void {
	emit('finish')
	close()
}

function handleOverlayClick(): void {
	if (props.closeOnOverlayClick) handleSkip()
}

/** Останавливает анимацию фокусировки и сбрасывает её состояние */
function stopFocus(): void {
	if (focusTimer !== null) {
		clearTimeout(focusTimer)
		focusTimer = null
	}
	if (focusRaf !== 0) {
		cancelAnimationFrame(focusRaf)
		focusRaf = 0
	}
	isFocusing.value = false
	focusFromViewport.value = false
}

/**
 * Запускает анимацию фокусировки при старте тура: подсветка начинается
 * с полного вьюпорта и плавно «съезжает» на целевой элемент.
 */
async function startFocus(): Promise<void> {
	stopFocus()
	isFocusing.value = true
	focusFromViewport.value = true

	await recalculate()
	await nextTick()

	focusRaf = requestAnimationFrame(() => {
		focusFromViewport.value = false
		focusTimer = setTimeout(() => {
			isFocusing.value = false
			focusTimer = null
		}, FOCUS_DURATION)
	})
}

useEscapeKey({
	isActive: () => props.isOpen && props.closeOnEscape,
	callback: handleSkip,
})

watch(
	() => props.step,
	value => {
		internalIndex.value = value
	},
)

watch(
	() => props.isOpen,
	value => {
		if (value) {
			internalIndex.value = props.step
			if (props.lockScroll) lock()
			attachListeners()
			void startFocus()
		} else {
			stopFocus()
			unlock()
			detachListeners()
		}
	},
	{ immediate: true },
)

onBeforeUnmount(() => {
	stopFocus()
})
</script>
