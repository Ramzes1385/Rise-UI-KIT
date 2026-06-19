<template>
	<div class="base-chat-slideover" :class="{ 'base-chat-slideover--open': isOpen }">
		<div class="base-chat-slideover__header">
			<BaseText tag="span" :weight="UI_FONT_WEIGHT.SEMIBOLD" :size-scale="sizeScale" class="base-chat-slideover__title">
				{{ titleText }}
			</BaseText>
			<BaseButton
				variant="ghost"
				:padding="1"
				:size-scale="sizeScale"
				:aria-label="UI_CHAT_TEXT.CLOSE_PANEL"
				@click="emit('update:isOpen', false)">
				<template #left>
					<BaseIcon name="close" :size-scale="sizeScale" />
				</template>
			</BaseButton>
		</div>

		<!-- Вкладки в Slideover (если не режим профиля) -->
		<div v-if="activeTab !== 'profile'" class="base-chat-slideover__tabs">
			<button
				v-for="tab in availableTabs"
				:key="tab.id"
				type="button"
				class="base-chat-slideover__tab-btn"
				:class="{ 'base-chat-slideover__tab-btn--active': activeTab === tab.id }"
				:aria-label="tab.label"
				@click="emit('update:activeTab', tab.id)">
				<BaseText :size-scale="sizeScale * UI_SCALE.AUTOCOMPLETE" :weight="UI_FONT_WEIGHT.SEMIBOLD">{{ tab.label }}</BaseText>
			</button>
		</div>

		<div class="base-chat-slideover__content">
			<!-- Вкладка: Информация / Участники -->
			<div v-if="activeTab === 'info'" class="base-chat-slideover__pane">
				<div class="base-chat-slideover__profile-summary">
					<BaseAvatar :src="avatar" :name="title" :size-scale="sizeScale * UI_CHAT_SCALE.AVATAR_LARGE" class="base-chat-slideover__avatar" />
					<BaseText tag="span" :weight="UI_FONT_WEIGHT.SEMIBOLD" :size-scale="sizeScale * UI_CHAT_SCALE.NAME" class="base-chat-slideover__name">
						{{ title }}
					</BaseText>
					<BaseText tag="span" :size-scale="sizeScale * UI_SCALE.AUTOCOMPLETE" class="base-chat-slideover__status">
						{{ isGroup ? `${members.length} ${UI_CHAT_TEXT.PARTICIPANTS_SUFFIX}` : subtitle || UI_CHAT_TEXT.ONLINE }}
					</BaseText>
					<BaseText v-if="isGroup" tag="p" :size-scale="sizeScale * UI_SCALE.AUTOCOMPLETE" class="base-chat-slideover__description">
						{{ UI_CHAT_TEXT.DEMO_GROUP_DESCRIPTION }}
					</BaseText>
					<BaseText v-else tag="p" :size-scale="sizeScale * UI_SCALE.AUTOCOMPLETE" class="base-chat-slideover__description">
						{{ UI_CHAT_TEXT.DEMO_PROFILE_DESCRIPTION }}
					</BaseText>
				</div>

				<!-- Список участников для групп -->
				<div v-if="isGroup && members.length > 0" class="base-chat-slideover__members-list">
					<BaseText tag="span" :weight="UI_FONT_WEIGHT.SEMIBOLD" :size-scale="sizeScale * UI_SCALE.AUTOCOMPLETE" class="base-chat-slideover__section-title">
						{{ UI_CHAT_TEXT.PARTICIPANTS_TITLE }}
					</BaseText>
					<div class="base-chat-slideover__members-scroll">
						<div v-for="member in members" :key="member.id" class="base-chat-slideover__member-item">
							<div class="base-chat-slideover__member-main" @click="handleMemberClick(member.id)">
								<BaseAvatar :src="member.avatar" :name="member.name" :size-scale="sizeScale * UI_SCALE.SMALL" />
								<div class="base-chat-slideover__member-info">
									<BaseText
										tag="span"
										:weight="UI_FONT_WEIGHT.SEMIBOLD"
										:size-scale="sizeScale * UI_CHAT_SCALE.MEMBER"
										class="base-chat-slideover__member-name">
										{{ member.name }}
									</BaseText>
									<BaseText tag="span" :size-scale="sizeScale * UI_CHAT_SCALE.ICON" class="base-chat-slideover__member-role">
										{{ getMemberRoleLabel(member) }}
									</BaseText>
								</div>
							</div>

							<!-- Админ-действия над участником -->
							<div v-if="currentUserRole === 'admin' && member.id !== 'me'" class="base-chat-slideover__member-actions">
								<BaseButton
									variant="ghost"
									:padding="1"
									:size-scale="sizeScale * UI_SCALE.SMALL"
									class="base-chat-slideover__admin-btn"
									:aria-label="`${UI_CHAT_TEXT.MEMBER_ACTIONS} ${member.name}`"
									@click="toggleAdminMenu(member.id)">
									<template #left>
										<BaseIcon name="sort-down" :size-scale="sizeScale * UI_CHAT_SCALE.META" />
									</template>
								</BaseButton>

								<!-- Выпадающее меню админа -->
								<div v-if="activeAdminMenuId === member.id" class="base-chat-slideover__admin-dropdown">
									<button
										type="button"
										class="base-chat-slideover__dropdown-item"
										@click="handleChangeRole(member.id, member.role === 'admin' ? 'member' : 'admin')">
										<BaseIcon name="file-config" :size-scale="sizeScale * UI_CHAT_SCALE.ICON" />
										{{ member.role === 'admin' ? UI_CHAT_TEXT.DEMOTE : UI_CHAT_TEXT.MAKE_ADMIN }}
									</button>
									<button
										type="button"
										class="base-chat-slideover__dropdown-item base-chat-slideover__dropdown-item--danger"
										@click="handleKick(member.id)">
										<BaseIcon name="x-circle" :size-scale="sizeScale * UI_CHAT_SCALE.ICON" />
										{{ UI_CHAT_TEXT.EXCLUDE }}
									</button>
									<button
										type="button"
										class="base-chat-slideover__dropdown-item base-chat-slideover__dropdown-item--danger"
										@click="handleBan(member.id)">
										<BaseIcon name="alert-triangle" :size-scale="sizeScale * UI_CHAT_SCALE.ICON" />
										{{ UI_CHAT_TEXT.BAN }}
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Обычные детали (телефон/email) для личных чатов -->
				<div v-else class="base-chat-slideover__info-details">
					<div class="base-chat-slideover__info-item">
						<BaseIcon name="calendar" :size-scale="sizeScale * UI_CHAT_SCALE.MEMBER" class="base-chat-slideover__info-icon" />
						<div class="base-chat-slideover__info-text-wrapper">
							<BaseText tag="span" :size-scale="sizeScale * UI_SCALE.SMALL" class="base-chat-slideover__info-label"
								>{{ UI_CHAT_TEXT.PHONE }}</BaseText
							>
							<BaseText tag="span" :size-scale="sizeScale * UI_CHAT_SCALE.MEMBER" class="base-chat-slideover__info-value"
								>{{ UI_CHAT_TEXT.DEMO_PHONE }}</BaseText
							>
						</div>
					</div>
					<div class="base-chat-slideover__info-item">
						<BaseIcon name="calendar" :size-scale="sizeScale * UI_CHAT_SCALE.MEMBER" class="base-chat-slideover__info-icon" />
						<div class="base-chat-slideover__info-text-wrapper">
							<BaseText tag="span" :size-scale="sizeScale * UI_SCALE.SMALL" class="base-chat-slideover__info-label"
								>Email</BaseText
							>
							<BaseText tag="span" :size-scale="sizeScale * UI_CHAT_SCALE.MEMBER" class="base-chat-slideover__info-value"
								>{{ UI_CHAT_TEXT.DEMO_EMAIL }}</BaseText
							>
						</div>
					</div>
				</div>
			</div>

			<!-- Вкладка: Профиль пользователя (при клике на участника) -->
			<div v-if="activeTab === 'profile' && selectedMember" class="base-chat-slideover__pane">
				<div class="base-chat-slideover__profile-summary">
					<BaseAvatar
						:src="selectedMember.avatar"
						:name="selectedMember.name"
						:size-scale="sizeScale * UI_CHAT_SCALE.AVATAR_LARGE"
						class="base-chat-slideover__avatar" />
					<BaseText tag="span" :weight="UI_FONT_WEIGHT.SEMIBOLD" :size-scale="sizeScale * UI_CHAT_SCALE.NAME" class="base-chat-slideover__name">
						{{ selectedMember.name }}
					</BaseText>
					<BaseText tag="span" :size-scale="sizeScale * UI_SCALE.AUTOCOMPLETE" class="base-chat-slideover__status">
						{{ selectedMember.status === 'online' ? UI_CHAT_TEXT.ONLINE : UI_CHAT_TEXT.OFFLINE }}
					</BaseText>

					<div class="base-chat-slideover__profile-actions">
						<BaseButton variant="default" :size-scale="sizeScale" @click="handleWriteMessage(selectedMember.id)">
							<template #left>
								<BaseIcon name="reply" :size-scale="sizeScale * UI_CHAT_SCALE.MEMBER" />
							</template>
							{{ UI_CHAT_TEXT.WRITE_MESSAGE }}
						</BaseButton>
					</div>
				</div>

				<div class="base-chat-slideover__info-details">
					<div class="base-chat-slideover__info-item">
						<BaseIcon name="calendar" :size-scale="sizeScale * UI_CHAT_SCALE.MEMBER" class="base-chat-slideover__info-icon" />
						<div class="base-chat-slideover__info-text-wrapper">
							<BaseText tag="span" :size-scale="sizeScale * UI_SCALE.SMALL" class="base-chat-slideover__info-label">{{ UI_CHAT_TEXT.ROLE }}</BaseText>
							<BaseText tag="span" :size-scale="sizeScale * UI_CHAT_SCALE.MEMBER" class="base-chat-slideover__info-value">
								{{ selectedMember.role === 'admin' ? UI_CHAT_TEXT.ADMIN : UI_CHAT_TEXT.MEMBER }}
							</BaseText>
						</div>
					</div>
					<div v-if="selectedMember.warningsCount !== undefined" class="base-chat-slideover__info-item">
						<BaseIcon name="alert-triangle" :size-scale="sizeScale * UI_CHAT_SCALE.MEMBER" class="base-chat-slideover__info-icon" />
						<div class="base-chat-slideover__info-text-wrapper">
							<BaseText tag="span" :size-scale="sizeScale * UI_SCALE.SMALL" class="base-chat-slideover__info-label"
								>{{ UI_CHAT_TEXT.WARNINGS }}</BaseText
							>
							<BaseText tag="span" :size-scale="sizeScale * UI_CHAT_SCALE.MEMBER" class="base-chat-slideover__info-value">
								{{ selectedMember.warningsCount }} / 3
							</BaseText>
						</div>
					</div>
				</div>

				<div class="base-chat-slideover__profile-back">
					<BaseButton variant="ghost" :size-scale="sizeScale" @click="handleBackToInfo">
						<template #left>
							<BaseIcon name="arrow-left" :size-scale="sizeScale * UI_CHAT_SCALE.MEMBER" />
						</template>
						{{ UI_CHAT_TEXT.BACK_TO_LIST }}
					</BaseButton>
				</div>
			</div>

			<!-- Вкладка: Медиа -->
			<div v-if="activeTab === 'media'" class="base-chat-slideover__pane">
				<ChatSlideoverMedia :messages="messages" :size-scale="sizeScale" />
			</div>

			<!-- Вкладка: Файлы -->
			<div v-if="activeTab === 'files'" class="base-chat-slideover__pane">
				<ChatSlideoverFiles
					:messages="messages"
					:size-scale="sizeScale"
					@file-click="emit('file-click', $event)"
					@download-file="emit('download-file', $event)" />
			</div>

			<!-- Вкладка: Ссылки -->
			<div v-if="activeTab === 'links'" class="base-chat-slideover__pane">
				<ChatSlideoverLinks :messages="messages" :size-scale="sizeScale" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import {
	UI_CHAT_SCALE,
	UI_CHAT_TEXT,
	UI_FONT_WEIGHT,
	UI_SCALE,
	SIZE_SCALE_DEFAULT,
} from '@constants'
import ChatSlideoverFiles from './ChatSlideoverFiles.vue'
import ChatSlideoverLinks from './ChatSlideoverLinks.vue'
import ChatSlideoverMedia from './ChatSlideoverMedia.vue'
import type { ChatMember } from '../../model/BaseChat.types'
import type { ChatSlideoverEmits, ChatSlideoverProps } from '../../model/ChatSlideover.types'
import './ChatSlideover.style.scss'

const props = withDefaults(defineProps<ChatSlideoverProps>(), {
	subtitle: '',
	avatar: '',
	isGroup: false,
	members: () => [],
	currentUserRole: 'member',
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<ChatSlideoverEmits>()

const activeAdminMenuId = ref<string | null>(null)

function detectOnlineStatus(text: string): 'online' | 'offline' {
	const lower = text.toLowerCase()
	return lower.includes('сети') || lower.includes('онлайн') || lower.includes('online') ? 'online' : 'offline'
}

const titleText = computed((): string => {
	if (props.activeTab === 'profile') return UI_CHAT_TEXT.PROFILE
	return UI_CHAT_TEXT.INFORMATION
})

const availableTabs = computed(() => [
	{ id: 'info' as const, label: props.isGroup ? UI_CHAT_TEXT.PARTICIPANTS : UI_CHAT_TEXT.INFO_TAB },
	{ id: 'media' as const, label: UI_CHAT_TEXT.MEDIA_TAB },
	{ id: 'files' as const, label: UI_CHAT_TEXT.FILES_TAB },
	{ id: 'links' as const, label: UI_CHAT_TEXT.LINKS_TAB },
])

const selectedMember = computed((): ChatMember | null => {
	if (!props.isGroup) {
		return {
			id: props.selectedMemberId || 'companion',
			name: props.title,
			avatar: props.avatar,
			role: 'member',
			status: detectOnlineStatus(props.subtitle),
		}
	}
	if (!props.selectedMemberId) return null
	return props.members.find(member => member.id === props.selectedMemberId) || null
})

function getMemberRoleLabel(member: ChatMember): string {
	if (member.role === 'admin') return UI_CHAT_TEXT.ADMIN
	return member.status === 'online' ? UI_CHAT_TEXT.ONLINE : UI_CHAT_TEXT.OFFLINE
}

function toggleAdminMenu(memberId: string): void {
	if (activeAdminMenuId.value === memberId) {
		activeAdminMenuId.value = null
	} else {
		activeAdminMenuId.value = memberId
	}
}

function handleMemberClick(memberId: string): void {
	emit('update:selectedMemberId', memberId)
	emit('update:activeTab', 'profile')
}

function handleBackToInfo(): void {
	emit('update:selectedMemberId', null)
	emit('update:activeTab', 'info')
}

function handleWriteMessage(memberId: string): void {
	emit('write-message', memberId)
	emit('update:isOpen', false)
}

function handleChangeRole(memberId: string, role: string): void {
	emit('update-member-role', { memberId, role })
	activeAdminMenuId.value = null
}

function handleKick(memberId: string): void {
	emit('kick-member', memberId)
	activeAdminMenuId.value = null
}

function handleBan(memberId: string): void {
	emit('ban-member', { memberId, reason: UI_CHAT_TEXT.VIOLATION, warningsCount: 1 })
	activeAdminMenuId.value = null
}
</script>
