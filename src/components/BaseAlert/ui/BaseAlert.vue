<template>
	<div
		class="base-alert"
		:class="[`base-alert--${type}`, variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="alert"
		aria-live="polite">
		<div class="base-alert__icon-wrapper" :class="classes.iconWrapper">
			<slot name="icon">
				<BaseIcon :name="alertIcon" :size-scale="calcIconScale('md', sizeScale)" :custom-class="classes.icon" />
			</slot>
		</div>

		<div class="base-alert__content" :class="classes.content">
			<BaseText
				v-if="title"
				tag="h4"
				:weight="600"
				:size-scale="sizeScale"
				class="base-alert__title"
				:custom-class="classes.title">
				{{ title }}
			</BaseText>

			<div class="base-alert__description" :class="classes.description">
				<slot>
					<BaseText v-if="description" tag="p" :size-scale="sizeScale - 10" :custom-class="classes.text">
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
				:size-scale="sizeScale - 10"
				class="base-alert__close"
				:custom-class="classes.close"
				@click="handleClose">
				<BaseIcon name="close" :size-scale="calcIconScale('xs', sizeScale)" :custom-class="classes.closeIcon" />
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseButton } from '@components/BaseButton'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { computed } from 'vue'

import '../styles/BaseAlert.style.scss'
import type { BaseAlertEmits, BaseAlertProps } from '../model/BaseAlert.types'

const props = defineProps<BaseAlertProps>()

const emit = defineEmits<BaseAlertEmits>()

const type = computed(() => props.type ?? 'info')
const variant = computed(() => props.variant ?? 'default')
const isClosable = computed(() => props.isClosable ?? false)
const sizeScale = computed(() => props.sizeScale ?? 100)

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'iconWrapper', 'icon', 'content', 'title', 'description', 'text', 'actions', 'close', 'closeIcon'],
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => sizeScale.value })
const { variantClass, variantStyle } = useVariant({ block: 'base-alert', getVariant: () => variant.value })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

/** Иконка оповещения по умолчанию на основе типа */
const alertIcon = computed((): string => {
	if (props.icon) return props.icon

	const icons: Record<string, string> = {
		info: 'info',
		success: 'check-circle',
		warning: 'alert-triangle',
		error: 'x-circle',
	}
	return icons[type.value] || 'info'
})

/** Обработка клика по кнопке закрытия */
function handleClose(): void {
	emit('close')
}
</script>
