<template>
	<Teleport to="body" :disabled="props.isContained">
		<div
			class="base-notification-container"
			:class="[
				`base-notification-container--${props.position}`,
				{ 'base-notification-container--contained': props.isContained },
				classes.root,
			]"
			:style="sizeScaleStyle">
			<TransitionGroup name="list" tag="div" class="base-notification-list">
				<div
					v-for="notification in notifications"
					:key="notification.id"
					class="base-notification"
					:class="[`base-notification--${notification.type || 'info'}`, variantClass, classes.notification]"
					:style="[variantStyle, customColorStyle]">
					<BaseIcon
						:name="typeIconMap[notification.type || 'info']"
						:size-scale="calcIconScale('md', props.sizeScale)"
						class="base-notification__icon"
						:custom-class="classes.icon" />
					<div class="base-notification__content" :class="classes.content">
						<BaseText
							tag="h4"
							:size-scale="props.sizeScale"
							:weight="600"
							class="base-notification__title"
							:custom-class="classes.title">
							{{ notification.title }}
						</BaseText>
						<BaseText
							v-if="notification.description"
							tag="p"
							:size-scale="props.sizeScale"
							:color="{ text: { base: 'var(--color-text-muted)' } }"
							class="base-notification__description"
							:custom-class="classes.description">
							{{ notification.description }}
						</BaseText>
					</div>
					<BaseButton
						variant="ghost"
						:padding="2"
						class="base-notification__close"
						:size-scale="props.sizeScale"
						:custom-class="classes.close"
						@click="remove(notification.id)">
						<BaseIcon name="close" :size-scale="calcIconScale('sm', props.sizeScale)" />
					</BaseButton>
					<div
						class="base-notification__progress"
						:class="classes.progress"
						:style="{ animationDuration: `${notification.duration || UI_NOTIFICATION_AUTO_CLOSE_MS}ms` }"></div>
				</div>
			</TransitionGroup>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { BaseButton } from '@components/BaseButton'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { UI_NOTIFICATION_AUTO_CLOSE_MS } from '@constants'
import { useBaseComponent } from '@composables/useBaseComponent'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import '../styles/BaseNotification.style.scss'
import type { BaseNotificationEmits, BaseNotificationProps, NotificationItem } from '../model/BaseNotification.types'

const props = withDefaults(defineProps<BaseNotificationProps>(), {
	title: '',
	type: 'info',
	position: 'top-right',
	duration: UI_NOTIFICATION_AUTO_CLOSE_MS,
	sizeScale: 100,
	isContained: false,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-notification',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'notification', 'icon', 'content', 'title', 'description', 'close', 'progress'],
})

const typeIconMap: Record<string, string> = {
	success: 'check-circle',
	error: 'x-circle',
	warning: 'alert-triangle',
	info: 'info',
}

const emit = defineEmits<BaseNotificationEmits>()

const notifications = ref<NotificationItem[]>([])
let nextId = 0

/** Таймеры авто-закрытия по id уведомления — очищаются при размонтировании. */
const autoCloseTimers = new Map<number, ReturnType<typeof setTimeout>>()

function add(notification: BaseNotificationProps) {
	const id = nextId++
	notifications.value.unshift({ ...notification, id })

	const timer = setTimeout(() => remove(id), notification.duration ?? UI_NOTIFICATION_AUTO_CLOSE_MS)
	autoCloseTimers.set(id, timer)
}

function remove(id: number) {
	const timer = autoCloseTimers.get(id)
	if (timer) {
		clearTimeout(timer)
		autoCloseTimers.delete(id)
	}
	notifications.value = notifications.value.filter(n => n.id !== id)
	if (notifications.value.length === 0) emit('close')
}

/** Очистка всех висящих таймеров авто-закрытия при размонтировании. */
onBeforeUnmount(() => {
	autoCloseTimers.forEach(clearTimeout)
	autoCloseTimers.clear()
})

/** Декларативное использование (через v-if) */
onMounted(() => {
	if (props.title) {
		add({ ...props, title: props.title, type: props.type, position: props.position, duration: props.duration })
	}
})

defineExpose({ add, remove })
</script>
