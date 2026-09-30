<template>
	<ul v-if="isLabeled" class="base-chat-badges base-chat-badges--labeled">
		<li v-for="badge in badges" :key="badge.id" class="base-chat-badges__chip">
			<span v-if="!badge.icon && badge.emoji" class="base-chat-badges__emoji" aria-hidden="true">{{ badge.emoji }}</span>
			<BaseIcon
				v-else
				:name="badge.icon || 'star'"
				:color="badge.color"
				:size-scale="sizeScale * CHAT_SCALE.BADGE"
				class="base-chat-badges__icon" />
			<span class="base-chat-badges__label">{{ badge.label }}</span>
		</li>
	</ul>

	<span v-else class="base-chat-badges">
		<BaseTooltip v-for="badge in visibleBadges" :key="badge.id" :text="badge.label" :size-scale="sizeScale">
			<span class="base-chat-badges__badge" role="img" :aria-label="badge.label">
				<span v-if="!badge.icon && badge.emoji" class="base-chat-badges__emoji" aria-hidden="true">{{ badge.emoji }}</span>
				<BaseIcon
					v-else
					:name="badge.icon || 'star'"
					:color="badge.color"
					:size-scale="sizeScale * CHAT_SCALE.BADGE"
					class="base-chat-badges__icon" />
			</span>
		</BaseTooltip>
		<BaseTooltip v-if="hiddenCount > 0" :text="hiddenLabel" :size-scale="sizeScale">
			<span class="base-chat-badges__more" role="img" :aria-label="hiddenLabel">+{{ hiddenCount }}</span>
		</BaseTooltip>
	</span>
</template>

<script setup lang="ts">
import './ChatBadges.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { CHAT_SCALE } from '../../model/chatScale'
import { BaseTooltip } from '@components/BaseTooltip'
import type { ChatBadgesProps } from './types/ChatBadges.types'
import { CHAT_MAX_BADGES, useChatBadges } from './model/useChatBadges'

const props = withDefaults(defineProps<ChatBadgesProps>(), {
	max: CHAT_MAX_BADGES,
	isLabeled: false,
})

const { visibleBadges, hiddenCount, hiddenLabel } = useChatBadges(props)
</script>
