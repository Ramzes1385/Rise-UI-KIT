<template>
	<div
		class="base-stepper"
		:class="[`base-stepper--${orientation}`, `base-stepper--${shape}`, variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, progressStyle]">
		<div v-if="$slots.header" class="base-stepper__header" :class="classes.header">
			<slot name="header" />
		</div>

		<div class="base-stepper__items" :class="classes.items">
			<div
				v-for="(step, index) in items"
				:key="index"
				class="base-stepper__step"
				:class="[
					{
						'base-stepper__step--active': stepState(index).isActive,
						'base-stepper__step--completed': stepState(index).isCompleted,
						'base-stepper__step--error': stepState(index).isError,
						'base-stepper__step--disabled': stepState(index).isDisabled,
					},
					classes.step,
				]"
				role="button"
				:tabindex="stepState(index).isDisabled ? -1 : 0"
				:aria-disabled="stepState(index).isDisabled || undefined"
				:aria-current="stepState(index).isActive ? 'step' : undefined"
				@click="handleStepClick(index + 1)"
				@keydown.enter.prevent="handleStepClick(index + 1)"
				@keydown.space.prevent="handleStepClick(index + 1)">
				<slot name="item" :item="step" :index="index" :step-number="index + 1" v-bind="stepState(index)">
					<div class="base-stepper__indicator-wrapper" :class="classes.indicatorWrapper">
						<div v-if="shape !== 'empty'" class="base-stepper__indicator" :class="classes.indicator">
							<span v-if="stepState(index).isError" class="base-stepper__error-mark" aria-hidden="true">!</span>
							<span v-else-if="stepState(index).isCompleted" class="base-stepper__check" :class="classes.check">
								<BaseIcon name="check" :size-scale="calcIconScale('sm', sizeScale)" />
							</span>
							<span v-else-if="step.icon" class="base-stepper__icon">
								<BaseIcon :name="step.icon" :size-scale="calcIconScale('sm', sizeScale)" />
							</span>
							<span v-else>{{ index + 1 }}</span>
						</div>
					</div>
					<div class="base-stepper__content" :class="classes.content">
						<span class="base-stepper__label" :class="classes.label"
							>{{ step.label
							}}<span v-if="statusText(index)" class="base-stepper__status">, {{ statusText(index) }}</span></span
						>
						<span v-if="step.isOptional" class="base-stepper__optional">{{ optionalLabel }}</span>
						<p v-if="step.description" class="base-stepper__description" :class="classes.description">
							{{ step.description }}
						</p>
					</div>
				</slot>
			</div>
		</div>

		<div v-if="$slots.footer" class="base-stepper__footer" :class="classes.footer">
			<slot name="footer" />
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseStepper.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/media/iconUtils'
import { useBaseStepper } from '../model/useBaseStepper'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseStepperEmits, BaseStepperProps, BaseStepperSlots } from '../types/BaseStepper.types'

const props = withDefaults(
	defineProps<BaseStepperProps>(),
	kitDefaults('BaseStepper', {
		variant: DEFAULT_VARIANT,
		orientation: 'horizontal',
		shape: 'circle',
		isLinear: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseStepperEmits>()
defineSlots<BaseStepperSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	progressStyle,
	optionalLabel,
	stepState,
	statusText,
	handleStepClick,
} = useBaseStepper(props, emit)
</script>
