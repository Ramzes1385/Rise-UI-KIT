<template>
	<section
		class="base-notification-center"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-labelledby="titleId">
		<div class="base-notification-center__header" :class="classes.header">
			<span :id="titleId" class="base-notification-center__title">{{ title ?? UI_NOTIFICATION_CENTER.TITLE }}</span>
			<span class="base-notification-center__count" role="status">{{ unreadText }}</span>
			<BaseButton
				class="base-notification-center__read-all"
				variant="ghost"
				:size-scale="sizeScale * 0.875"
				:is-disabled="!unread"
				is-focusable-when-disabled
				@click="readAll">
				{{ UI_NOTIFICATION_CENTER.READ_ALL }}
			</BaseButton>
			<slot name="actions" />
		</div>
		<BaseSegmented
			:model-value="filter"
			:options="filterOptions"
			:aria-label="UI_NOTIFICATION_CENTER.FILTER"
			is-block
			:size-scale="sizeScale * 0.875"
			@update:model-value="setFilter" />
		<ul v-if="visible.length" class="base-notification-center__list" :class="classes.list" :style="{ maxHeight: `${maxHeight}px` }">
			<li
				v-for="item in visible"
				:key="item.id"
				class="base-notification-center__item"
				:class="[classes.item, { 'base-notification-center__item--unread': !item.isRead }]">
				<button type="button" class="base-notification-center__main" @click="select(item)">
					<BaseAvatar
						v-if="item.avatar"
						class="base-notification-center__avatar"
						:src="item.avatar"
						alt=""
						:size-scale="sizeScale" />
					<span v-else class="base-notification-center__icon" aria-hidden="true"><BaseIcon :name="item.icon ?? 'bell'" /></span>
					<span class="base-notification-center__body">
						<span class="base-notification-center__item-title">{{ item.title }}</span>
						{{ ' ' }}
						<span v-if="item.text" class="base-notification-center__text">{{ item.text }}</span>
						{{ ' ' }}
						<time class="base-notification-center__time" :datetime="isoOf(item)">{{ timeOf(item) }}</time>
					</span>
					{{ ' ' }}
					<span v-if="!item.isRead" class="base-notification-center__dot">
						<span class="base-notification-center__hidden">{{ UI_NOTIFICATION_CENTER.UNREAD_ITEM }}</span>
					</span>
				</button>
				<BaseButton
					class="base-notification-center__toggle"
					variant="ghost"
					:size-scale="sizeScale * 0.875"
					:aria-label="item.isRead ? UI_NOTIFICATION_CENTER.MARK_UNREAD : UI_NOTIFICATION_CENTER.MARK_READ"
					@click="toggle(item)">
					<template #left><BaseIcon :name="item.isRead ? 'rotate-ccw' : 'check'" /></template>
				</BaseButton>
			</li>
		</ul>
		<p v-else class="base-notification-center__empty">
			{{ filter === 'unread' ? UI_NOTIFICATION_CENTER.EMPTY_UNREAD : UI_NOTIFICATION_CENTER.EMPTY }}
		</p>
	</section>
</template>

<script setup lang="ts">
import '../styles/BaseNotificationCenter.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { BaseSegmented } from '@components/BaseSegmented'
import { UI_NOTIFICATION_CENTER } from '@/locales/messages'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import { useBaseNotificationCenter } from '../model/useBaseNotificationCenter'
import type {
	BaseNotificationCenterEmits,
	BaseNotificationCenterProps,
	BaseNotificationCenterSlots,
} from '../types/BaseNotificationCenter.types'

const props = withDefaults(defineProps<BaseNotificationCenterProps>(), {
	variant: 'default',
	filter: undefined,
	title: undefined,
	now: undefined,
	maxHeight: 360,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseNotificationCenterEmits>()

defineSlots<BaseNotificationCenterSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	titleId,
	filter,
	setFilter,
	unread,
	unreadText,
	visible,
	filterOptions,
	timeOf,
	isoOf,
	select,
	toggle,
	readAll,
} = useBaseNotificationCenter(props, emit)
</script>
