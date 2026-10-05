<template>
	<Teleport defer :to="teleportTarget">
		<Transition name="base-tour">
			<div
				v-if="isOpen && currentStep"
				:class="[ui('root'), animationClass, classes.root]"
				:style="layerStyle"
				role="dialog"
				:aria-modal="isModal ? 'true' : 'false'"
				v-bind="{ ...themeAttrs, ...getDialogAria() }">
				<div
					:class="[ui('overlay'), { 'base-tour__overlay--dim': !spotlightStyle }, classes.overlay]"
					:style="overlayStyle"
					@click="handleOverlayClick" />
				<span class="base-tour__status" role="status">{{ announcement }}</span>

				<div
					v-if="spotlightStyle"
					:class="[ui('spotlight'), { 'base-tour__spotlight--focusing': isFocusing }, classes.spotlight]"
					:style="spotlightStyle" />

				<Transition name="base-tour-card">
					<div
						v-if="isCardShown && slotContext"
						ref="cardRef"
						:class="[
							ui('card'),
							cardAnimationClass,
							`base-tour__card--${cardPlacement}`,
							arrowSide && `base-tour__card--arrow-${arrowSide}`,
							classes.card,
						]"
						:style="[cardStyle, arrowStyle]">
						<span v-if="arrowSide" :class="[ui('arrow'), classes.arrow]" aria-hidden="true" />
						<slot v-bind="slotContext">
							<div :class="[ui('panel'), classes.cardInner]">
								<div v-if="hasHeader || showSkip" :class="ui('header')">
									<slot v-if="hasHeader" name="title" :step="currentStep" :index="activeIndex">
										<BaseText
											v-if="currentStep.title"
											:id="titleId"
											tag="h3"
											:weight="TEXT_WEIGHT.SEMIBOLD"
											:class="ui('title')"
											:custom-class="classes.title"
											>{{ currentStep.title }}</BaseText
										>
									</slot>
									<BaseButton
										v-if="showSkip"
										variant="ghost"
										:class="ui('close')"
										:aria-label="UI_TOUR.SKIP"
										:custom-class="classes.closeButton"
										@click="handleSkip">
										<BaseIcon name="close" :size-scale="80" :custom-class="classes.closeIcon" />
									</BaseButton>
								</div>

								<slot name="content" :step="currentStep" :index="activeIndex">
									<BaseText
										v-if="currentStep.content"
										:id="contentId"
										tag="p"
										:class="ui('content')"
										:custom-class="classes.content"
										>{{ currentStep.content }}</BaseText
									>
								</slot>

								<div :class="[ui('footer'), classes.footer]">
									<div v-if="showProgress && useDots" :class="[ui('progress'), classes.progress]" aria-hidden="true">
										<span
											v-for="(_, dotIndex) in total"
											:key="dotIndex"
											:class="[ui('dot'), { 'base-tour__dot--active': dotIndex === activeIndex }, classes.dot]" />
									</div>
									<div
										v-else-if="showProgress"
										:class="[ui('progress-bar'), classes.progress]"
										:style="progressStyle"
										aria-hidden="true">
										<span :class="ui('progress-bar-fill')" />
									</div>
									<BaseText tag="span" :class="ui('counter')" :custom-class="classes.counter">
										{{ activeIndex + 1 }} / {{ total }}
									</BaseText>

									<div :class="[ui('actions'), classes.actions]">
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
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import '../styles/BaseTour.style.scss'
import { UI_TOUR } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { useBaseTour } from '../model/useBaseTour'
import { BaseButton } from '@components/BaseButton'
import { kitDefaults } from '@composables/base/useDefaults'
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
		showArrow: true,
		animation: 'scale',
	}),
)
const emit = defineEmits<BaseTourEmits>()
defineSlots<BaseTourSlots>()

const {
	teleportTarget,
	layerStyle,
	classes,
	activeIndex,
	currentStep,
	isFirst,
	isLast,
	total,
	cardRef,
	arrowSide,
	arrowStyle,
	isFocusing,
	spotlightStyle,
	cardStyle,
	cardPlacement,
	isCardShown,
	isModal,
	overlayStyle,
	titleId,
	contentId,
	getDialogAria,
	announcement,
	slotContext,
	hasHeader,
	useDots,
	progressStyle,
	ui,
	themeAttrs,
	animationClass,
	cardAnimationClass,
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
