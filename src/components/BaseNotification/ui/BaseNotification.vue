<template>
	<Teleport to="body" :disabled="isContained">
		<div
			class="base-notification"
			:class="[
				`base-notification--${position}`,
				{ 'base-notification--contained': isContained },
				classes.root,
			]"
			:style="sizeScaleStyle">
			<TransitionGroup name="list" tag="div" class="base-notification-list">
				<div
					v-for="notification in notifications"
					:key="notification.id"
					class="base-notification-item"
					:class="[`base-notification-item--${notification.type || 'info'}`, variantClass, classes.notification]"
					:style="[variantStyle, customColorStyle]">
					<BaseIcon
						:name="typeIconMap[notification.type || 'info']"
						:size-scale="calcIconScale('md', sizeScale)"
						class="base-notification-item__icon"
						:custom-class="classes.icon" />
					<div class="base-notification-item__content" :class="classes.content">
						<BaseText
							tag="h4"
							:size-scale="sizeScale"
							:weight="UI_FONT_WEIGHT.SEMIBOLD"
							class="base-notification-item__title"
							:custom-class="classes.title">
							{{ notification.title }}
						</BaseText>
						<BaseText
							v-if="notification.description"
							tag="p"
							:size-scale="sizeScale"
							:color="{ text: { base: 'var(--color-text-muted)' } }"
							class="base-notification-item__description"
							:custom-class="classes.description">
							{{ notification.description }}
						</BaseText>
					</div>
					<BaseButton
						variant="ghost"
						:padding="2"
						class="base-notification-item__close"
						:size-scale="sizeScale"
						:custom-class="classes.close"
						@click="remove(notification.id)">
						<BaseIcon name="close" :size-scale="calcIconScale('sm', sizeScale)" />
					</BaseButton>
					<div
						class="base-notification-item__progress"
						:class="classes.progress"
						:style="{ animationDuration: `${notification.duration || UI_TIMING.NOTIFICATION_AUTO_CLOSE}ms` }"></div>
				</div>
			</TransitionGroup>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { UI_FONT_WEIGHT, UI_TIMING, SIZE_SCALE_DEFAULT} from '@constants'
import { calcIconScale } from '@utils/iconUtils'
import '../styles/BaseNotification.style.scss'
import type { BaseNotificationEmits, BaseNotificationProps, BaseNotificationSlots, NotificationItem } from '../model/BaseNotification.types'

const props = withDefaults(defineProps<BaseNotificationProps>(), {
	title: '',
	type: 'info',
	position: 'top-right',
	duration: UI_TIMING.NOTIFICATION_AUTO_CLOSE,
	sizeScale: SIZE_SCALE_DEFAULT,
	isContained: false,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-notification-item', props, ['root', 'notification', 'icon', 'content', 'title', 'description', 'close', 'progress'])

const typeIconMap: Record<string, string> = {
	success: 'check-circle',
	error: 'x-circle',
	warning: 'alert-triangle',
	info: 'info',
}

const emit = defineEmits<BaseNotificationEmits>()

defineSlots<BaseNotificationSlots>()

const notifications = ref<NotificationItem[]>([])
let nextId = 0

/** Таймеры авто-закрытия по id уведомления — очищаются при размонтировании. */
const autoCloseTimers = new Map<number, ReturnType<typeof setTimeout>>()

function add(notification: BaseNotificationProps) {
	const id = nextId++
	notifications.value.unshift({ ...notification, id })

	const timer = setTimeout(() => remove(id), notification.duration ?? UI_TIMING.NOTIFICATION_AUTO_CLOSE)
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
