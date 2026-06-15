<template>
	<Teleport to="body" :disabled="isContained">
		<div
			class="base-notification-container"
			:class="[
				`base-notification-container--${position}`,
				{ 'base-notification-container--contained': isContained },
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
						:size-scale="calcIconScale('md', sizeScale)"
						class="base-notification__icon"
						:custom-class="classes.icon" />
					<div class="base-notification__content" :class="classes.content">
						<BaseText
							tag="h4"
							:size-scale="sizeScale"
							:weight="600"
							class="base-notification__title"
							:custom-class="classes.title">
							{{ notification.title }}
						</BaseText>
						<BaseText
							v-if="notification.description"
							tag="p"
							:size-scale="sizeScale"
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
						:size-scale="sizeScale"
						:custom-class="classes.close"
						@click="remove(notification.id)">
						<BaseIcon name="close" :size-scale="calcIconScale('sm', sizeScale)" />
					</BaseButton>
					<div
						class="base-notification__progress"
						:class="classes.progress"
						:style="{ animationDuration: `${notification.duration || 3000}ms` }"></div>
				</div>
			</TransitionGroup>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { BaseButton } from '@components/BaseButton'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import '../styles/BaseNotification.style.scss'
import type { BaseNotificationEmits, BaseNotificationProps, NotificationItem } from '../model/BaseNotification.types'

const props = defineProps<BaseNotificationProps>()

const title = computed(() => props.title ?? '')
const type = computed(() => props.type ?? 'info')
const variant = computed(() => props.variant ?? 'default')
const position = computed(() => props.position ?? 'top-right')
const duration = computed(() => props.duration ?? 3000)
const sizeScale = computed(() => props.sizeScale ?? 100)
const isContained = computed(() => props.isContained ?? false)

const { sizeScaleStyle } = useSizeScale({ getScale: () => sizeScale.value })
const { variantClass, variantStyle } = useVariant({ block: 'base-notification', getVariant: () => variant.value })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'notification', 'icon', 'content', 'title', 'description', 'close', 'progress'],
})

/** Маппинг типа уведомления на имя иконки */
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

	const timer = setTimeout(() => remove(id), notification.duration ?? 3000)
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
	if (title.value) {
		add({ ...props, title: title.value, type: type.value, position: position.value, duration: duration.value })
	}
})

defineExpose({ add, remove })
</script>
