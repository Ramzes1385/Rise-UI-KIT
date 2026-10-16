<template>
	<div
		:class="[ui('root'), `base-stepper--${orientation}`, `base-stepper--${shape}`, variantClass, motionClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:data-summary="orientation === 'horizontal' && summary ? summary : undefined">
		<div v-if="$slots.header" :class="[ui('header'), classes.header]">
			<slot name="header" />
		</div>

		<ol ref="itemsRef" :class="[ui('items'), classes.items]" :tabindex="isItemsFocusable ? 0 : undefined">
			<li
				v-for="(step, index) in items"
				:key="index"
				:class="[
					ui('step'),
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
					:class="[ui('trigger'), { 'base-stepper__trigger--clickable': isStepClickable(index) }, classes.trigger]"
					:type="isStepClickable(index) ? 'button' : undefined"
					:disabled="isStepClickable(index) && stepState(index).isDisabled ? true : undefined"
					:aria-current="stepState(index).isActive ? 'step' : undefined"
					@click="handleStepClick(index + 1)">
					<slot name="item" :item="step" :index="index" :step-number="index + 1" v-bind="stepState(index)">
						<span :class="[ui('indicator-wrapper'), classes.indicatorWrapper]" aria-hidden="true">
							<span v-if="shape !== 'empty'" :class="[ui('indicator'), classes.indicator]">
								<span v-if="stepState(index).isError" class="base-stepper__error-mark" aria-hidden="true">!</span>
								<span v-else-if="stepState(index).isCompleted" :class="[ui('check'), classes.check]">
									<BaseIcon name="check" :size-scale="calcIconScale('sm', sizeScale)" />
								</span>
								<span v-else-if="step.icon" class="base-stepper__icon">
									<BaseIcon :name="step.icon" :size-scale="calcIconScale('sm', sizeScale)" />
								</span>
								<span v-else>{{ index + 1 }}</span>
							</span>
						</span>
						<span :class="[ui('content'), classes.content]">
							<span :class="[ui('label'), classes.label]"
								>{{ step.label
								}}<span v-if="statusText(index)" class="base-stepper__status">, {{ statusText(index) }}</span></span
							>
							<span v-if="step.isOptional" class="base-stepper__optional">{{ optionalLabel }}</span>
							<span v-if="step.description" :class="[ui('description'), classes.description]">
								{{ step.description }}
							</span>
						</span>
					</slot>
				</component>
				<span
					v-if="index > 0 && orientation === 'horizontal'"
					:class="[ui('line-fill'), 'base-stepper__line-fill--start']"
					aria-hidden="true" />
				<span v-if="index < items.length - 1" :class="[ui('line-fill'), 'base-stepper__line-fill--end']" aria-hidden="true" />
			</li>
		</ol>

		<div v-if="$slots.footer" :class="[ui('footer'), classes.footer]">
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
		summary: 'titled',
		isLinear: false,
		clickable: 'all',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseStepperEmits>()
defineSlots<BaseStepperSlots>()

const {
	ui,
	motionClass,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	itemsRef,
	isItemsFocusable,
	optionalLabel,
	summary,
	stepState,
	isStepPassed,
	statusText,
	isStepClickable,
	handleStepClick,
} = useBaseStepper(props, emit)
</script>
