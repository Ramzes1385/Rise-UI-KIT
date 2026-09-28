<template>
	<Teleport defer :to="teleportTarget" :disabled="isContained">
		<!-- Пока указатель над уведомлениями или фокус внутри, они не закрываются и прогресс стоит (WCAG 2.2.1) -->
		<div
			ref="containerRef"
			class="base-notification"
			:class="[
				`base-notification--${position}`,
				{ 'base-notification--contained': isContained, 'base-notification--paused': isPaused },
				classes.root,
			]"
			:style="sizeScaleStyle"
			role="region"
			:aria-label="UI_ARIA.NOTIFICATIONS"
			@mouseenter="isHovered = true"
			@mouseleave="isHovered = false"
			@focusin="isFocusWithin = true"
			@focusout="handleFocusOut">
			<TransitionGroup name="base-notification" tag="div" class="base-notification-list">
				<!-- Ошибка объявляется скринридером сразу (alert), остальное — вежливо, без прерывания (status) -->
				<div
					v-for="notification in list"
					:key="notification.id"
					class="base-notification-item"
					:class="[`base-notification-item--${notification.type || 'info'}`, getVariantClass(notification), classes.notification]"
					:style="[variantStyle, customColorStyle]"
					:role="notification.type === 'error' ? 'alert' : 'status'">
					<BaseIcon
						:name="typeIconMap[notification.type || 'info']"
						:size-scale="calcIconScale('md', sizeScale)"
						class="base-notification-item__icon"
						:custom-class="classes.icon" />
					<div class="base-notification-item__content" :class="classes.content">
						<BaseText
							tag="h4"
							:size-scale="sizeScale"
							:weight="TEXT_WEIGHT.SEMIBOLD"
							class="base-notification-item__title"
							:custom-class="classes.title">
							{{ notification.title }}
						</BaseText>
						<BaseText
							v-if="notification.description"
							tag="p"
							:size-scale="sizeScale"
							class="base-notification-item__description"
							:custom-class="classes.description">
							{{ notification.description }}
						</BaseText>
						<div v-if="notification.actions?.length" class="base-notification-item__actions" :class="classes.actions">
							<BaseButton
								v-for="action in notification.actions"
								:key="action.label"
								variant="outline"
								:size-scale="sizeScale * actionScaleRatio"
								@click="runAction(notification.id, action)">
								{{ action.label }}
							</BaseButton>
						</div>
					</div>
					<BaseButton
						variant="ghost"
						class="base-notification-item__close"
						:size-scale="sizeScale"
						:custom-class="classes.close"
						:aria-label="UI_ARIA.CLOSE"
						@click="remove(notification.id)">
						<BaseIcon name="close" :size-scale="calcIconScale('sm', sizeScale)" />
					</BaseButton>
					<!-- Ключ по таймеру: при смене длительности полоса начинается заново -->
					<div
						v-if="!notification.isPersistent"
						:key="getTimerKey(notification)"
						class="base-notification-item__progress"
						:class="classes.progress"
						:style="{ animationDuration: `${getDuration(notification)}ms` }"></div>
				</div>
			</TransitionGroup>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/iconUtils'
import { BaseButton } from '@components/BaseButton'
import { kitDefaults } from '@composables/useDefaults'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { DEFAULT_DURATION, useBaseNotification } from '../model/useBaseNotification'
import '../styles/BaseNotification.style.scss'
import type { BaseNotificationEmits, BaseNotificationProps, BaseNotificationSlots } from '../types/BaseNotification.types'

const props = withDefaults(
	defineProps<BaseNotificationProps>(),
	kitDefaults('BaseNotification', {
		title: '',
		type: 'info',
		position: 'top-right',
		duration: DEFAULT_DURATION,
		sizeScale: SIZE_SCALE_DEFAULT,
		isContained: false,
		isPersistent: false,
	}),
)
const emit = defineEmits<BaseNotificationEmits>()
defineSlots<BaseNotificationSlots>()

const {
	sizeScaleStyle,
	variantStyle,
	customColorStyle,
	classes,
	teleportTarget,
	containerRef,
	list,
	actionScaleRatio,
	typeIconMap,
	getDuration,
	getTimerKey,
	getVariantClass,
	isHovered,
	isFocusWithin,
	isPaused,
	handleFocusOut,
	remove,
	runAction,
	exposed,
} = useBaseNotification(props, emit)

defineExpose(exposed)
</script>
