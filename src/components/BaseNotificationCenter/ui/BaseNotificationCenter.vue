<template>
	<section
		:class="[ui('root'), variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-labelledby="titleId">
		<div :class="[ui('header'), classes.header]">
			<span :id="titleId" :class="ui('title')">{{ title ?? UI_NOTIFICATION_CENTER.TITLE }}</span>
			<span :class="ui('count')" role="status">{{ unreadText }}</span>
			<BaseButton
				:class="ui('read-all')"
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
		<TransitionGroup
			v-if="visible.length"
			name="base-notification-center-item"
			tag="ul"
			:class="[ui('list'), classes.list]"
			:style="{ maxHeight: `${maxHeight}px` }">
			<li
				v-for="item in visible"
				:key="item.id"
				:class="[ui('item'), classes.item, { 'base-notification-center__item--unread': !item.isRead }]">
				<button type="button" :class="ui('main')" @click="select(item)">
					<BaseAvatar v-if="item.avatar" :class="ui('avatar')" :src="item.avatar" alt="" :size-scale="sizeScale" />
					<span v-else :class="ui('icon')" aria-hidden="true"><BaseIcon :name="item.icon ?? 'bell'" /></span>
					<span :class="ui('body')">
						<span :class="ui('item-title')">{{ item.title }}</span>
						{{ ' ' }}
						<span v-if="item.text" :class="ui('text')">{{ item.text }}</span>
						{{ ' ' }}
						<time :class="ui('time')" :datetime="isoOf(item)">{{ timeOf(item) }}</time>
					</span>
					{{ ' ' }}
					<Transition name="base-notification-center-dot">
						<span v-if="!item.isRead" :class="ui('dot')">
							<span class="base-notification-center__hidden">{{ UI_NOTIFICATION_CENTER.UNREAD_ITEM }}</span>
						</span>
					</Transition>
				</button>
				<BaseButton
					:class="ui('toggle')"
					variant="ghost"
					:size-scale="sizeScale * 0.875"
					:aria-label="item.isRead ? UI_NOTIFICATION_CENTER.MARK_UNREAD : UI_NOTIFICATION_CENTER.MARK_READ"
					@click="toggle(item)">
					<template #left><BaseIcon :name="item.isRead ? 'rotate-ccw' : 'check'" /></template>
				</BaseButton>
			</li>
		</TransitionGroup>
		<BaseEmpty
			v-else
			is-compact
			variant="ghost"
			:class="ui('empty')"
			:description="filter === 'unread' ? UI_NOTIFICATION_CENTER.EMPTY_UNREAD : UI_NOTIFICATION_CENTER.EMPTY"
			:size-scale="sizeScale" />
	</section>
</template>

<script setup lang="ts">
import '../styles/BaseNotificationCenter.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { BaseSegmented } from '@components/BaseSegmented'
import { UI_NOTIFICATION_CENTER } from '@/locales/messages'
import { kitDefaults } from '@composables/base/useDefaults'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import { useBaseNotificationCenter } from '../model/useBaseNotificationCenter'
import type {
	BaseNotificationCenterEmits,
	BaseNotificationCenterProps,
	BaseNotificationCenterSlots,
} from '../types/BaseNotificationCenter.types'

const props = withDefaults(
	defineProps<BaseNotificationCenterProps>(),
	kitDefaults('BaseNotificationCenter', {
		variant: 'default',
		filter: undefined,
		title: undefined,
		now: undefined,
		maxHeight: 360,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseNotificationCenterEmits>()

defineSlots<BaseNotificationCenterSlots>()

const {
	ui,
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
