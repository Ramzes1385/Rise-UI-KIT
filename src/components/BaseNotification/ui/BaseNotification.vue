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
								:size-scale="sizeScale * ACTION_SCALE_RATIO"
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { useTeleportTarget } from '@composables/useTeleportTarget'
import { calcIconScale } from '@utils/iconUtils'
import '../styles/BaseNotification.style.scss'
import type {
	BaseNotificationEmits,
	BaseNotificationProps,
	BaseNotificationSlots,
	NotificationAction,
	NotificationId,
	NotificationItem,
} from '../model/BaseNotification.types'

/** Длительность показа по умолчанию, мс */
const DEFAULT_DURATION = 3000

/** Куда телепортируются слои: body или контейнер из плагина и BaseApp (teleportTo) */
const teleportTarget = useTeleportTarget()

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

/** Кнопки действий — размер sm (28px при sizeScale = 100), компактнее кнопок форм */
const ACTION_SCALE_RATIO = 0.875

const { sizeScaleStyle, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-notification-item', props, [
	'root',
	'notification',
	'icon',
	'content',
	'title',
	'description',
	'actions',
	'close',
	'progress',
])

const typeIconMap: Record<string, string> = {
	success: 'check-circle',
	error: 'x-circle',
	warning: 'alert-triangle',
	info: 'info',
}

const emit = defineEmits<BaseNotificationEmits>()

defineSlots<BaseNotificationSlots>()

/** Собственный список: уведомления из `add()` и из props */
const internalItems = ref<NotificationItem[]>([])
/** Показанный список: управляемый (`items`) или собственный */
const list = computed(() => props.items ?? internalItems.value)
let nextId = 0

/** Наибольшая задержка setTimeout (2³¹−1 мс, почти 25 дней): большее значение сработало бы сразу */
const MAX_TIMEOUT = 2_147_483_647

/**
 * Длительность показа (мс): положительное конечное число (не больше MAX_TIMEOUT), иначе значение по умолчанию.
 * Единая точка для таймера и прогресс-бара: 0, NaN, отрицательные и Infinity (переполнение setTimeout)
 * иначе удаляли бы уведомление сразу, пока прогресс-бар показывает 3 секунды.
 */
function resolveDuration(duration: number | undefined): number {
	if (duration !== undefined && Number.isFinite(duration) && duration > 0) return Math.min(duration, MAX_TIMEOUT)
	return DEFAULT_DURATION
}

/** Длительность показа уведомления: своя или длительность компонента */
function getDuration(notification: NotificationItem): number {
	return resolveDuration(notification.duration ?? props.duration)
}

/** Ключ таймера: при смене длительности или режима показа таймер запускается заново */
function getTimerKey(notification: NotificationItem): string {
	return `${notification.id}:${notification.isPersistent ? 'persistent' : getDuration(notification)}`
}

/**
 * Класс варианта уведомления: вариант, переданный в add(), иначе — проп variant компонента.
 * Так в одном контейнере можно показать уведомления разного оформления.
 */
function getVariantClass(notification: NotificationItem): string | undefined {
	const variant = notification.variant ?? props.variant
	if (!variant || variant === DEFAULT_VARIANT) return undefined
	return `base-notification-item--${variant}`
}

// ─── Автозакрытие с паузой ────────────────────────────────────────────────────

interface AutoCloseTimer {
	key: string
	/** Сколько осталось показывать, мс */
	remaining: number
	startedAt: number
	timeout: ReturnType<typeof setTimeout> | null
}

/** Таймеры автозакрытия по id уведомления — очищаются при закрытии и размонтировании */
const timers = new Map<NotificationId, AutoCloseTimer>()
const containerRef = ref<HTMLElement | null>(null)
const isHovered = ref(false)
const isFocusWithin = ref(false)
const isPaused = computed(() => isHovered.value || isFocusWithin.value)

function schedule(id: NotificationId, timer: AutoCloseTimer): void {
	timer.startedAt = Date.now()
	timer.timeout = setTimeout(() => remove(id), timer.remaining)
}

function clearTimer(id: NotificationId): void {
	const timer = timers.get(id)
	if (timer?.timeout) clearTimeout(timer.timeout)
	timers.delete(id)
}

/** Запускает таймеры новых уведомлений, перезапускает изменённые и снимает таймеры закрытых */
function syncTimers(): void {
	const visible = new Set<NotificationId>()
	for (const notification of list.value) {
		visible.add(notification.id)
		const key = getTimerKey(notification)
		if (timers.get(notification.id)?.key === key) continue
		clearTimer(notification.id)
		if (notification.isPersistent) continue
		const timer: AutoCloseTimer = { key, remaining: getDuration(notification), startedAt: 0, timeout: null }
		timers.set(notification.id, timer)
		if (!isPaused.value) schedule(notification.id, timer)
	}
	for (const id of [...timers.keys()]) {
		if (!visible.has(id)) clearTimer(id)
	}
	// Когда список опустел, mouseleave и focusout могут не прийти: новые уведомления не должны стартовать на паузе
	if (list.value.length === 0) {
		isHovered.value = false
		isFocusWithin.value = false
	}
}

watch(() => list.value.map(getTimerKey).join('|'), syncTimers, { immediate: true })

watch(isPaused, paused => {
	const now = Date.now()
	for (const [id, timer] of timers) {
		if (paused && timer.timeout) {
			clearTimeout(timer.timeout)
			timer.timeout = null
			timer.remaining = Math.max(0, timer.remaining - (now - timer.startedAt))
		} else if (!paused && !timer.timeout) {
			schedule(id, timer)
		}
	}
})

/** Фокус ушёл из области уведомлений (а не перешёл между кнопками внутри) — автозакрытие продолжается */
function handleFocusOut(event: FocusEvent): void {
	const container = event.currentTarget as HTMLElement
	if (!container.contains(event.relatedTarget as Node | null)) isFocusWithin.value = false
}

// ─── Добавление и закрытие ────────────────────────────────────────────────────

/** Добавляет уведомление. Без своего `duration` оно показывается столько, сколько задано пропом компонента */
function add(notification: BaseNotificationProps): NotificationId {
	const id = nextId++
	internalItems.value.unshift({ ...notification, items: undefined, id } as NotificationItem)
	syncTimers()
	return id
}

function remove(id: NotificationId): void {
	clearTimer(id)
	emit('remove', id)
	if (!props.items) {
		internalItems.value = internalItems.value.filter(notification => notification.id !== id)
		if (internalItems.value.length === 0) emit('close')
	}
	// Кнопка закрытия исчезает вместе с уведомлением, и focusout может не прийти
	nextTick(() => {
		if (isFocusWithin.value && !containerRef.value?.contains(document.activeElement)) isFocusWithin.value = false
	})
}

function runAction(id: NotificationId, action: NotificationAction): void {
	action.onClick?.()
	remove(id)
}

/** Очистка всех висящих таймеров автозакрытия при размонтировании. */
onBeforeUnmount(() => {
	for (const id of [...timers.keys()]) clearTimer(id)
})

/** Декларативное использование (через v-if) */
onMounted(() => {
	if (props.title && !props.items) {
		// variant не копируется: уведомление из props следует за текущим значением пропа variant
		add({ ...props, variant: undefined, title: props.title, type: props.type, position: props.position, duration: props.duration })
	}
})

defineExpose({ add, remove })
</script>
