<template>
	<Teleport v-for="group in groups" :key="group.position" defer :to="teleportTarget" :disabled="isContained">
		<div
			ref="containerRef"
			:class="[
				ui('root'),
				`base-notification--${group.position}`,
				{ 'base-notification--contained': isContained, 'base-notification--paused': isPaused },
				classes.root,
			]"
			:style="sizeScaleStyle"
			v-bind="themeAttrs"
			role="region"
			:aria-label="getAreaLabel(group.position)"
			@mouseenter="setHovered(group.position, true)"
			@mouseleave="setHovered(group.position, false)"
			@focusin="isFocusWithin = true"
			@focusout="handleFocusOut">
			<TransitionGroup name="base-notification" tag="div" :class="ui('list')">
				<div
					v-for="notification in group.items"
					:key="notification.id"
					:class="[
						ui('item'),
						`base-notification-item--${notification.type || 'info'}`,
						animationClass,
						getVariantClass(notification),
						getItemClass(notification),
					]"
					:style="[variantStyle, getItemStyle(notification)]"
					:role="notification.type === 'error' ? 'alert' : 'status'">
					<BaseIcon
						:name="typeIconMap[notification.type || 'info']"
						:size-scale="calcIconScale('md', getScale(notification))"
						:class="ui('icon')"
						:custom-class="getItemClasses(notification).icon" />
					<div :class="[ui('content'), getItemClasses(notification).content]">
						<BaseText
							tag="h4"
							:size-scale="getScale(notification)"
							:class="ui('title')"
							:custom-class="getItemClasses(notification).title">
							{{ notification.title }}
						</BaseText>
						<BaseText
							v-if="notification.description"
							tag="p"
							:size-scale="getScale(notification)"
							:class="ui('description')"
							:custom-class="getItemClasses(notification).description">
							{{ notification.description }}
						</BaseText>
						<div v-if="notification.actions?.length" :class="[ui('actions'), getItemClasses(notification).actions]">
							<BaseButton
								v-for="action in notification.actions"
								:key="action.label"
								variant="outline"
								:size-scale="getActionScale(notification)"
								@click="runAction(notification.id, action)">
								{{ action.label }}
							</BaseButton>
						</div>
					</div>
					<BaseButton
						variant="ghost"
						:class="ui('close')"
						:size-scale="getScale(notification)"
						:custom-class="getItemClasses(notification).close"
						:aria-label="UI_ARIA.CLOSE"
						@click="remove(notification.id)">
						<BaseIcon name="close" :size-scale="calcIconScale('sm', getScale(notification))" />
					</BaseButton>
					<BaseProgress
						v-if="!notification.isPersistent"
						:key="getTimerKey(notification)"
						:class="[ui('progress'), getItemClasses(notification).progress]"
						:value="100"
						:countdown="getDuration(notification)"
						:is-paused="isPaused"
						aria-hidden="true" />
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
import { BaseProgress } from '@components/BaseProgress'
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
		maxVisible: 0,
		animation: 'scale',
	}),
)
const emit = defineEmits<BaseNotificationEmits>()
defineSlots<BaseNotificationSlots>()

const {
	sizeScaleStyle,
	variantStyle,
	classes,
	teleportTarget,
	containerRef,
	groups,
	typeIconMap,
	getScale,
	getActionScale,
	getItemStyle,
	getItemClasses,
	getItemClass,
	getDuration,
	getTimerKey,
	getVariantClass,
	setHovered,
	getAreaLabel,
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
