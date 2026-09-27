<template>
	<Teleport to="body">
		<div
			v-if="isOpen && currentStep"
			class="base-tour"
			:class="classes.root"
			role="dialog"
			aria-modal="true"
			:aria-label="currentStep.title || UI_TOUR.TITLE">
			<div class="base-tour__overlay" :class="classes.overlay" @click="handleOverlayClick" />

			<div
				v-if="spotlightStyle"
				class="base-tour__spotlight"
				:class="[{ 'base-tour__spotlight--focusing': isFocusing }, classes.spotlight]"
				:style="spotlightStyle" />

			<Transition name="base-tour-card">
				<div
					v-if="cardStyle && slotContext && geometry && !isFocusing"
					ref="cardRef"
					class="base-tour__card"
					:class="[isMobile ? 'base-tour__card--mobile' : `base-tour__card--${geometry.placement}`, classes.card]"
					:style="cardStyle">
					<slot v-bind="slotContext">
						<div class="base-tour__panel" :class="classes.cardInner">
							<div v-if="hasHeader || showSkip" class="base-tour__header">
								<slot v-if="hasHeader" name="title" :step="currentStep" :index="activeIndex">
									<BaseText
										v-if="currentStep.title"
										tag="h3"
										:weight="UI_FONT_WEIGHT.SEMIBOLD"
										class="base-tour__title"
										:custom-class="classes.title"
										>{{ currentStep.title }}</BaseText
									>
								</slot>
								<BaseButton
									v-if="showSkip"
									variant="ghost"
									class="base-tour__close"
									:aria-label="UI_TOUR.SKIP"
									:custom-class="classes.closeButton"
									@click="handleSkip">
									<BaseIcon name="close" :size-scale="80" :custom-class="classes.closeIcon" />
								</BaseButton>
							</div>

							<slot name="content" :step="currentStep" :index="activeIndex">
								<BaseText v-if="currentStep.content" tag="p" class="base-tour__content" :custom-class="classes.content">{{
									currentStep.content
								}}</BaseText>
							</slot>

							<div class="base-tour__footer" :class="classes.footer">
								<div v-if="showProgress && useDots" class="base-tour__progress" :class="classes.progress" aria-hidden="true">
									<span
										v-for="(_, dotIndex) in total"
										:key="dotIndex"
										class="base-tour__dot"
										:class="[{ 'base-tour__dot--active': dotIndex === activeIndex }, classes.dot]" />
								</div>
								<div v-else-if="showProgress" class="base-tour__progress-bar" :class="classes.progress" aria-hidden="true">
									<span class="base-tour__progress-bar-fill" :style="{ width: `${progressPercent}%` }" />
								</div>
								<BaseText tag="span" class="base-tour__counter" :custom-class="classes.counter">
									{{ activeIndex + 1 }} / {{ total }}
								</BaseText>

								<div class="base-tour__actions" :class="classes.actions">
									<BaseButton v-if="!isFirst" variant="ghost" :custom-class="classes.prevButton" @click="goPrev">{{
										resolvedPrevLabel
									}}</BaseButton>
									<!--
										Одна кнопка для «Далее» и «Завершить»: на последнем шаге меняются подпись и действие,
										а элемент остаётся тем же — фокус с клавиатуры не теряется. autofocus — начальный фокус карточки.
									-->
									<BaseButton
										autofocus
										:custom-class="isLast ? classes.finishButton : classes.nextButton"
										@click="isLast ? handleFinish() : goNext()"
										>{{ isLast ? resolvedFinishLabel : resolvedNextLabel }}</BaseButton
									>
								</div>
							</div>
						</div>
					</slot>
				</div>
			</Transition>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useBreakpoint } from '@composables/useBreakpoint'
import { useCustomClass } from '@composables/useCustomClass'
import { useEscapeKey } from '@composables/useEscapeKey'
import { useFocusTrap } from '@composables/useFocusTrap'
import { useScrollLock } from '@composables/useScrollLock'
import { useTourCoordination } from '@composables/useTourCoordination'
import { useTourLogic } from '@composables/useTourLogic'
import {
	UI_FONT_WEIGHT,
	UI_TOUR,
} from '@constants'
import '../styles/BaseTour.style.scss'
import type { BaseTourEmits, BaseTourProps, BaseTourSlots } from '../model/BaseTour.types'

const props = withDefaults(defineProps<BaseTourProps>(), {
	isOpen: false,
	step: 0,
	placement: 'auto',
	showSkip: true,
	showProgress: true,
})

const emit = defineEmits<BaseTourEmits>()
defineSlots<BaseTourSlots>()

const internalIndex = ref(props.step)
const activeIndex = computed((): number => internalIndex.value)

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

const {
	isFocusing,
	spotlightStyle,
	cardStyle,
	slotContext,
	hasHeader,
	useDots,
	progressPercent,
	resolvedNextLabel,
	resolvedPrevLabel,
	resolvedFinishLabel,
	resolvedCloseOnEscape,
	resolvedLockScroll,
	goNext,
	goPrev,
	handleSkip,
	handleFinish,
	handleOverlayClick,
	startFocus,
	stopFocus,
} = useTourCoordination({
	props,
	emit,
	internalIndex,
	activeIndex,
	currentStep,
	isFirst,
	isLast,
	total,
	geometry,
	isMobile,
	recalculate,
})

useEscapeKey({
	isActive: () => props.isOpen && resolvedCloseOnEscape.value,
	callback: handleSkip,
})

/** Карточка шага (появляется после анимации подсветки) */
const cardRef = ref<HTMLElement | null>(null)

/**
 * Тур — модальный диалог: когда карточка появилась, фокус переходит в неё (на кнопку «Далее» с autofocus),
 * Tab не уходит на страницу под затемнением, после закрытия фокус возвращается на кнопку, которая запустила тур.
 */
useFocusTrap({
	containerRef: cardRef,
	isActive: () => props.isOpen && cardRef.value !== null,
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
			if (resolvedLockScroll.value) lock()
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

/** Размонтирование открытого тура (смена маршрута, v-if) не проходит через watch isOpen — снимаем блокировку явно */
onBeforeUnmount(() => {
	stopFocus()
	unlock()
})
</script>
