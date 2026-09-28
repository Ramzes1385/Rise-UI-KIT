<template>
	<div
		class="base-alert"
		:class="[`base-alert--${type}`, variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:role="liveRole">
		<div class="base-alert__icon-wrapper" :class="classes.iconWrapper">
			<slot name="icon">
				<BaseIcon :name="alertIcon" :size-scale="calcIconScale('md', sizeScale)" :custom-class="classes.icon" />
			</slot>
		</div>

		<div class="base-alert__content" :class="classes.content">
			<BaseText
				v-if="title"
				tag="h4"
				:weight="TEXT_WEIGHT.MEDIUM"
				:size-scale="sizeScale"
				class="base-alert__title"
				:custom-class="classes.title">
				{{ title }}
			</BaseText>

			<div class="base-alert__description" :class="classes.description">
				<slot>
					<BaseText v-if="description" tag="p" :size-scale="sizeScale" class="base-alert__text" :custom-class="classes.text">
						{{ description }}
					</BaseText>
				</slot>
			</div>
		</div>

		<div v-if="isClosable || $slots.actions" class="base-alert__actions" :class="classes.actions">
			<slot name="actions" />

			<BaseButton
				v-if="isClosable"
				variant="ghost"
				:size-scale="sizeScale"
				:padding="closeButtonPadding"
				class="base-alert__close"
				:custom-class="classes.close"
				:aria-label="UI_ARIA.CLOSE"
				@click="handleClose">
				<BaseIcon name="close" :custom-class="classes.closeIcon" />
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseAlert.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/iconUtils'
import { BaseButton } from '@components/BaseButton'
import { useBaseAlert } from '../model/useBaseAlert'
import { kitDefaults } from '@composables/useDefaults'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { BaseAlertEmits, BaseAlertProps, BaseAlertSlots } from '../types/BaseAlert.types'

const props = withDefaults(
	defineProps<BaseAlertProps>(),
	kitDefaults('BaseAlert', {
		variant: DEFAULT_VARIANT,
		type: 'info',
		isClosable: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseAlertEmits>()
defineSlots<BaseAlertSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, closeButtonPadding, liveRole, alertIcon, handleClose } =
	useBaseAlert(props, emit)
</script>
