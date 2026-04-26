<template>
	<Teleport to="body">
		<div class="base-notification-container" :style="sizeScaleStyle">
			<BaseAnimation name="list" is-group tag="div" :size-scale="sizeScale">
				<div
					v-for="notification in notifications"
					:key="notification.id"
					class="base-notification"
					:class="[`base-notification--${notification.type || 'info'}`]">
					<div class="base-notification__content">
						<BaseText tag="h4" :size-scale="sizeScale" :weight="600" class="base-notification__title">{{
							notification.title
						}}</BaseText>
						<BaseText
							v-if="notification.description"
							tag="p"
							:size-scale="sizeScale"
							:color="{ text: { base: 'var(--color-text-muted)' } }"
							class="base-notification__description">
							{{ notification.description }}
						</BaseText>
					</div>
					<BaseButton
						variant="ghost"
						class="base-notification__close"
						:size-scale="sizeScale"
						@click="remove(notification.id)">
						<BaseIcon name="close" size="sm" :size-scale="sizeScale" />
					</BaseButton>
					<div
						v-if="notification.duration !== 0"
						class="base-notification__progress"
						:style="{ animationDuration: `${notification.duration || 3000}ms` }"></div>
				</div>
			</BaseAnimation>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseAnimation } from '@/shared/ui/BaseAnimation'
import { BaseButton } from '@/shared/ui/BaseButton'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import { BaseText } from '@/shared/ui/BaseText'
import { onMounted, ref, watch } from 'vue'
import './BaseNotification.style.scss'
import type { BaseNotificationEmits, BaseNotificationProps, NotificationItem } from './BaseNotification.types'

const props = withDefaults(defineProps<BaseNotificationProps>(), {
	title: '',
	type: 'info',
	variant: 'default',
	duration: 3000,
	sizeScale: 100,
	notificationKey: '',
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantStyle } = useVariant({ block: 'base-notification', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BaseNotificationEmits>()

const notifications = ref<NotificationItem[]>([])
let nextId = 0

function add(notification: BaseNotificationProps) {
	const id = nextId++
	notifications.value.push({ ...notification, id })

	if (notification.duration !== 0) {
		setTimeout(() => remove(id), notification.duration || 3000)
	}
}

function remove(id: number) {
	notifications.value = notifications.value.filter(n => n.id !== id)
	if (notifications.value.length === 0) {
		emit('close')
	}
}

/** Декларативное использование (через v-if) */
onMounted(() => {
	if (props.title) {
		add({ ...props })
	}
})

/** Следим за notificationKey для добавления новых уведомлений */
watch(
	() => props.notificationKey,
	() => {
		if (props.title) {
			add({ ...props })
		}
	},
)

defineExpose({ add, remove })
</script>
