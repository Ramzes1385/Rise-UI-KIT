<template>
	<div
		:class="[ui('root'), `base-alert--${type}`, variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:role="liveRole">
		<div :class="[ui('icon-wrapper'), classes.iconWrapper]">
			<slot name="icon">
				<BaseIcon :name="alertIcon" :size-scale="calcIconScale('md', sizeScale)" :custom-class="classes.icon" />
			</slot>
		</div>

		<div :class="[ui('content'), classes.content]">
			<BaseText
				v-if="title"
				tag="h4"
				:weight="TEXT_WEIGHT.MEDIUM"
				:size-scale="sizeScale"
				:class="ui('title')"
				:custom-class="classes.title">
				{{ title }}
			</BaseText>

			<div :class="[ui('description'), classes.description]">
				<slot>
					<BaseText v-if="description" tag="p" :size-scale="sizeScale" :class="ui('text')" :custom-class="classes.text">
						{{ description }}
					</BaseText>
				</slot>
			</div>
		</div>

		<div v-if="isClosable || $slots.actions" :class="[ui('actions'), classes.actions]">
			<slot name="actions" />

			<BaseButton
				v-if="isClosable"
				variant="ghost"
				:size-scale="sizeScale"
				:padding="closeButtonPadding"
				:class="ui('close')"
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
import { BaseButton } from '@components/BaseButton'
import { useBaseAlert } from '../model/useBaseAlert'
import { calcIconScale } from '@utils/media/iconUtils'
import { kitDefaults } from '@composables/base/useDefaults'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
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

const { ui, sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, closeButtonPadding, liveRole, alertIcon, handleClose } =
	useBaseAlert(props, emit)
</script>
