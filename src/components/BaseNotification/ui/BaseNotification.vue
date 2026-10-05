<template>
	<Teleport defer :to="teleportTarget" :disabled="isContained">
		<div
			ref="containerRef"
			:class="[
				ui('root'),
				`base-notification--${position}`,
				{ 'base-notification--contained': isContained, 'base-notification--paused': isPaused },
				classes.root,
			]"
			:style="sizeScaleStyle"
			v-bind="themeAttrs"
			role="region"
			:aria-label="ariaLabel ?? UI_ARIA.NOTIFICATIONS"
			@mouseenter="isHovered = true"
			@mouseleave="isHovered = false"
			@focusin="isFocusWithin = true"
			@focusout="handleFocusOut">
			<TransitionGroup name="base-notification" tag="div" :class="ui('list')">
				<div
					v-for="notification in list"
					:key="notification.id"
					:class="[
						ui('item'),
						`base-notification-item--${notification.type || 'info'}`,
						animationClass,
						getVariantClass(notification),
						classes.notification,
					]"
					:style="[variantStyle, customColorStyle]"
					:role="notification.type === 'error' ? 'alert' : 'status'">
					<BaseIcon
						:name="typeIconMap[notification.type || 'info']"
						:size-scale="calcIconScale('md', sizeScale)"
						:class="ui('icon')"
						:custom-class="classes.icon" />
					<div :class="[ui('content'), classes.content]">
						<BaseText tag="h4" :size-scale="sizeScale" :class="ui('title')" :custom-class="classes.title">
							{{ notification.title }}
						</BaseText>
						<BaseText
							v-if="notification.description"
							tag="p"
							:size-scale="sizeScale"
							:class="ui('description')"
							:custom-class="classes.description">
							{{ notification.description }}
						</BaseText>
						<div v-if="notification.actions?.length" :class="[ui('actions'), classes.actions]">
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
						:class="ui('close')"
						:size-scale="sizeScale"
						:custom-class="classes.close"
						:aria-label="UI_ARIA.CLOSE"
						@click="remove(notification.id)">
						<BaseIcon name="close" :size-scale="calcIconScale('sm', sizeScale)" />
					</BaseButton>
					<div
						v-if="!notification.isPersistent"
						:key="getTimerKey(notification)"
						:class="[ui('progress'), classes.progress]"
						:style="{ animationDuration: `${getDuration(notification)}ms` }"></div>
				</div>
			</TransitionGroup>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import '@components/BaseIcon/styles/BaseIcon.style.scss'
import '../styles/BaseNotification.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { BaseButton } from '@components/BaseButton'
import { calcIconScale } from '@utils/media/iconUtils'
import { kitDefaults } from '@composables/base/useDefaults'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import { DEFAULT_DURATION, useBaseNotification } from '../model/useBaseNotification'
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
		animation: 'scale',
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
	ui,
	animationClass,
	themeAttrs,
} = useBaseNotification(props, emit)

defineExpose(exposed)
</script>
