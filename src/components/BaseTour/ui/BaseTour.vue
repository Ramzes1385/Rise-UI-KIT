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
					class="base-tour__card"
					:class="[isMobile ? 'base-tour__card--mobile' : `base-tour__card--${geometry.placement}`, classes.card]"
					:style="cardStyle">
					<slot v-bind="slotContext">
					<BaseCard variant="shadow" :padding="8" :custom-class="classes.cardInner">
						<template v-if="hasHeader" #header>
							<slot name="title" :step="currentStep" :index="activeIndex">
								<BaseText v-if="currentStep.title" tag="h3" :weight="UI_FONT_WEIGHT.SEMIBOLD" :custom-class="classes.title">{{
									currentStep.title
								}}</BaseText>
							</slot>
						</template>

						<template v-if="showSkip" #actions>
							<BaseButton
								variant="ghost"
								:padding="4"
								:aria-label="UI_TOUR.SKIP"
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
									>{{ resolvedPrevLabel }}</BaseButton
									>
									<BaseButton
										v-if="!isLast"
										:padding="6"
										variant="default"
										:custom-class="classes.nextButton"
									@click="goNext"
									>{{ resolvedNextLabel }}</BaseButton
									>
								<BaseButton v-else :padding="6" variant="default" :custom-class="classes.finishButton" @click="handleFinish">{{
									resolvedFinishLabel
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
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseCard } from '@components/BaseCard'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useBreakpoint } from '@composables/useBreakpoint'
import { useCustomClass } from '@composables/useCustomClass'
import { useEscapeKey } from '@composables/useEscapeKey'
import { useScrollLock } from '@composables/useScrollLock'
import { useTourCoordination } from '@composables/useTourCoordination'
import { useTourLogic } from '@composables/useTourLogic'
import {
	UI_FONT_WEIGHT,
	UI_TOUR,
} from '@constants'
import '../styles/BaseTour.style.scss'
import type { BaseTourEmits, BaseTourProps, BaseTourSlots } from '../model/BaseTour.types'
import type { CustomColor } from '@composables/useCustomColor'

const props = withDefaults(defineProps<BaseTourProps>(), {
	isOpen: false,
	step: 0,
	placement: 'auto',
	closeOnOverlayClick: true,
	closeOnEscape: true,
	lockScroll: true,
	scrollIntoView: true,
	nextLabel: UI_TOUR.NEXT,
	prevLabel: UI_TOUR.PREV,
	finishLabel: UI_TOUR.FINISH,
	skipLabel: UI_TOUR.SKIP,
	showSkip: true,
	showProgress: true,
})

const emit = defineEmits<BaseTourEmits>()
defineSlots<BaseTourSlots>()

const internalIndex = ref(props.step)
const activeIndex = computed((): number => internalIndex.value)
const contentColor: CustomColor = { text: { base: 'var(--color-text-muted)' } }

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

onBeforeUnmount(() => {
	stopFocus()
})
</script>
