<template>
	<div
		class="base-stepper"
		:class="[`base-stepper--${orientation}`, `base-stepper--${shape}`, variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div v-if="$slots.header" class="base-stepper__header" :class="classes.header">
			<slot name="header" />
		</div>

		<ol ref="itemsRef" class="base-stepper__items" :class="classes.items" :tabindex="isItemsFocusable ? 0 : undefined">
			<li
				v-for="(step, index) in items"
				:key="index"
				class="base-stepper__step"
				:class="[
					{
						'base-stepper__step--active': stepState(index).isActive,
						'base-stepper__step--completed': stepState(index).isCompleted,
						'base-stepper__step--passed': isStepPassed(index),
						'base-stepper__step--error': stepState(index).isError,
						'base-stepper__step--disabled': stepState(index).isDisabled,
					},
					classes.step,
				]">
				<component
					:is="isStepClickable(index) ? 'button' : 'div'"
					class="base-stepper__trigger"
					:class="[{ 'base-stepper__trigger--clickable': isStepClickable(index) }, classes.trigger]"
					:type="isStepClickable(index) ? 'button' : undefined"
					:disabled="isStepClickable(index) && stepState(index).isDisabled ? true : undefined"
					:aria-current="stepState(index).isActive ? 'step' : undefined"
					@click="handleStepClick(index + 1)">
					<slot name="item" :item="step" :index="index" :step-number="index + 1" v-bind="stepState(index)">
						<span class="base-stepper__indicator-wrapper" :class="classes.indicatorWrapper" aria-hidden="true">
							<span v-if="shape !== 'empty'" class="base-stepper__indicator" :class="classes.indicator">
								<span v-if="stepState(index).isError" class="base-stepper__error-mark" aria-hidden="true">!</span>
								<span v-else-if="stepState(index).isCompleted" class="base-stepper__check" :class="classes.check">
									<BaseIcon name="check" :size-scale="calcIconScale('sm', sizeScale)" />
								</span>
								<span v-else-if="step.icon" class="base-stepper__icon">
									<BaseIcon :name="step.icon" :size-scale="calcIconScale('sm', sizeScale)" />
								</span>
								<span v-else>{{ index + 1 }}</span>
							</span>
						</span>
						<span class="base-stepper__content" :class="classes.content">
							<span class="base-stepper__label" :class="classes.label"
								>{{ step.label
								}}<span v-if="statusText(index)" class="base-stepper__status">, {{ statusText(index) }}</span></span
							>
							<span v-if="step.isOptional" class="base-stepper__optional">{{ optionalLabel }}</span>
							<span v-if="step.description" class="base-stepper__description" :class="classes.description">
								{{ step.description }}
							</span>
						</span>
					</slot>
				</component>
			</li>
		</ol>

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
		clickable: 'all',
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
	itemsRef,
	isItemsFocusable,
	optionalLabel,
	stepState,
	isStepPassed,
	statusText,
	isStepClickable,
	handleStepClick,
} = useBaseStepper(props, emit)
</script>
