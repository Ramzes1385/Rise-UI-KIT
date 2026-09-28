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

			<!-- Квадратная ghost-кнопка 24px: иконка 16px + отступы 3px + рамка 1px -->
			<BaseButton
				v-if="isClosable"
				variant="ghost"
				:size-scale="sizeScale"
				:padding="CLOSE_BUTTON_PADDING"
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
import { computed } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { calcIconScale } from '@utils/iconUtils'
import '../styles/BaseAlert.style.scss'
import type { BaseAlertEmits, BaseAlertProps, BaseAlertSlots } from '../model/BaseAlert.types'

/** Отступы кнопки закрытия: квадрат 24px при sizeScale = 100 */
const CLOSE_BUTTON_PADDING = { x: 3, y: 3 } as const

const props = withDefaults(defineProps<BaseAlertProps>(), kitDefaults('BaseAlert', {
	variant: DEFAULT_VARIANT,
	type: 'info',
	isClosable: false,
	sizeScale: SIZE_SCALE_DEFAULT,
}))

const emit = defineEmits<BaseAlertEmits>()
defineSlots<BaseAlertSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-alert', props, ['root', 'iconWrapper', 'icon', 'content', 'title', 'description', 'text', 'actions', 'close', 'closeIcon'])

/**
 * Роль live-региона по срочности: error/warning прерывают озвучивание (alert = assertive),
 * info/success объявляются вежливо (status = polite). Явный aria-live не ставится,
 * чтобы не переопределять неявную вежливость роли.
 */
const liveRole = computed((): 'alert' | 'status' => (props.type === 'error' || props.type === 'warning' ? 'alert' : 'status'))

/** Иконка оповещения по умолчанию на основе типа */
const alertIcon = computed((): string => {
	if (props.icon) return props.icon

	const icons: Record<string, string> = {
		info: 'info',
		success: 'check-circle',
		warning: 'alert-triangle',
		error: 'x-circle',
	}
	return icons[props.type] || 'info'
})

/** Обработка клика по кнопке закрытия */
function handleClose(): void {
	emit('close')
}
</script>
