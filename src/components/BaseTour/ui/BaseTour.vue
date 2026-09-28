<template>
	<Teleport defer :to="teleportTarget">
		<div
			v-if="isOpen && currentStep"
			class="base-tour"
			:class="classes.root"
			:style="layerStyle"
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
										:weight="TEXT_WEIGHT.SEMIBOLD"
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
import '../styles/BaseTour.style.scss'
import { UI_TOUR } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { useBaseTour } from '../model/useBaseTour'
import { BaseButton } from '@components/BaseButton'
import { kitDefaults } from '@composables/useDefaults'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import type { BaseTourEmits, BaseTourProps, BaseTourSlots } from '../types/BaseTour.types'

const props = withDefaults(
	defineProps<BaseTourProps>(),
	kitDefaults('BaseTour', {
		isOpen: false,
		step: 0,
		placement: 'auto',
		showSkip: true,
		showProgress: true,
	}),
)
const emit = defineEmits<BaseTourEmits>()
defineSlots<BaseTourSlots>()

const {
	teleportTarget,
	layerStyle,
	classes,
	activeIndex,
	isMobile,
	geometry,
	currentStep,
	isFirst,
	isLast,
	total,
	cardRef,
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
	goNext,
	goPrev,
	handleSkip,
	handleFinish,
	handleOverlayClick,
} = useBaseTour(props, emit)
</script>
