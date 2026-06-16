<template>
	<div class="base-chat-slideover" :class="{ 'base-chat-slideover--open': isOpen }">
		<div class="base-chat-slideover__header">
			<BaseText tag="span" :weight="UI_FONT_WEIGHT_SEMIBOLD" :size-scale="sizeScale" class="base-chat-slideover__title">
				{{ titleText }}
			</BaseText>
			<BaseButton
				variant="ghost"
				:padding="1"
				:size-scale="sizeScale"
				aria-label="Закрыть панель информации"
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
				@click="emit('update:activeTab', tab.id)">
				<BaseText :size-scale="sizeScale * UI_SCALE_AUTOCOMPLETE" :weight="UI_FONT_WEIGHT_SEMIBOLD">{{ tab.label }}</BaseText>
			</button>
		</div>

		<div class="base-chat-slideover__content">
			<!-- Вкладка: Информация / Участники -->
			<div v-if="activeTab === 'info'" class="base-chat-slideover__pane">
				<div class="base-chat-slideover__profile-summary">
					<BaseAvatar :src="avatar" :name="title" :size-scale="sizeScale * UI_CHAT_SCALE_AVATAR_LARGE" class="base-chat-slideover__avatar" />
					<BaseText tag="span" :weight="UI_FONT_WEIGHT_SEMIBOLD" :size-scale="sizeScale * UI_CHAT_SCALE_NAME" class="base-chat-slideover__name">
						{{ title }}
					</BaseText>
					<BaseText tag="span" :size-scale="sizeScale * UI_SCALE_AUTOCOMPLETE" class="base-chat-slideover__status">
						{{ isGroup ? `${members.length} участников` : subtitle || 'в сети' }}
					</BaseText>
					<BaseText v-if="isGroup" tag="p" :size-scale="sizeScale * UI_SCALE_AUTOCOMPLETE" class="base-chat-slideover__description">
						Официальная группа мастерской Металл-Арт. Здесь мы обсуждаем текущие проекты, делимся эскизами, координируем
						работу кузнецов, скульпторов и дизайнеров. Пожалуйста, соблюдайте правила вежливого общения.
					</BaseText>
					<BaseText v-else tag="p" :size-scale="sizeScale * UI_SCALE_AUTOCOMPLETE" class="base-chat-slideover__description">
						Анна — ведущий скульптор нашей мастерской с опытом работы более 10 лет. Специализируется на художественной
						бронзе и монументальной металлической пластике. Выпускница Академии Художеств.
					</BaseText>
				</div>

				<!-- Список участников для групп -->
				<div v-if="isGroup && members.length > 0" class="base-chat-slideover__members-list">
					<BaseText tag="span" :weight="UI_FONT_WEIGHT_SEMIBOLD" :size-scale="sizeScale * UI_SCALE_AUTOCOMPLETE" class="base-chat-slideover__section-title">
						Участники группы
					</BaseText>
					<div class="base-chat-slideover__members-scroll">
						<div v-for="member in members" :key="member.id" class="base-chat-slideover__member-item">
							<div class="base-chat-slideover__member-main" @click="handleMemberClick(member.id)">
								<BaseAvatar :src="member.avatar" :name="member.name" :size-scale="sizeScale * UI_SCALE_SMALL" />
								<div class="base-chat-slideover__member-info">
									<BaseText
										tag="span"
										:weight="UI_FONT_WEIGHT_SEMIBOLD"
										:size-scale="sizeScale * UI_CHAT_SCALE_MEMBER"
										class="base-chat-slideover__member-name">
										{{ member.name }}
									</BaseText>
									<BaseText tag="span" :size-scale="sizeScale * UI_CHAT_SCALE_ICON" class="base-chat-slideover__member-role">
										{{ getMemberRoleLabel(member) }}
									</BaseText>
								</div>
							</div>

							<!-- Админ-действия над участником -->
							<div v-if="currentUserRole === 'admin' && member.id !== 'me'" class="base-chat-slideover__member-actions">
								<BaseButton
									variant="ghost"
									:padding="1"
									:size-scale="sizeScale * UI_SCALE_SMALL"
									class="base-chat-slideover__admin-btn"
									:aria-label="`Действия с участником ${member.name}`"
									@click="toggleAdminMenu(member.id)">
									<template #left>
										<BaseIcon name="sort-down" :size-scale="sizeScale * UI_CHAT_SCALE_META" />
									</template>
								</BaseButton>

								<!-- Выпадающее меню админа -->
								<div v-if="activeAdminMenuId === member.id" class="base-chat-slideover__admin-dropdown">
									<button
										type="button"
										class="base-chat-slideover__dropdown-item"
										@click="handleChangeRole(member.id, member.role === 'admin' ? 'member' : 'admin')">
										<BaseIcon name="file-config" :size-scale="sizeScale * UI_CHAT_SCALE_ICON" />
										{{ member.role === 'admin' ? 'Разжаловать' : 'Сделать админом' }}
									</button>
									<button
										type="button"
										class="base-chat-slideover__dropdown-item base-chat-slideover__dropdown-item--danger"
										@click="handleKick(member.id)">
										<BaseIcon name="x-circle" :size-scale="sizeScale * UI_CHAT_SCALE_ICON" />
										Исключить
									</button>
									<button
										type="button"
										class="base-chat-slideover__dropdown-item base-chat-slideover__dropdown-item--danger"
										@click="handleBan(member.id)">
										<BaseIcon name="alert-triangle" :size-scale="sizeScale * UI_CHAT_SCALE_ICON" />
										Забанить
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Обычные детали (телефон/email) для личных чатов -->
				<div v-else class="base-chat-slideover__info-details">
					<div class="base-chat-slideover__info-item">
						<BaseIcon name="calendar" :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER" class="base-chat-slideover__info-icon" />
						<div class="base-chat-slideover__info-text-wrapper">
							<BaseText tag="span" :size-scale="sizeScale * UI_SCALE_SMALL" class="base-chat-slideover__info-label"
								>Телефон</BaseText
							>
							<BaseText tag="span" :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER" class="base-chat-slideover__info-value"
								>+7 (999) 123-45-67</BaseText
							>
						</div>
					</div>
					<div class="base-chat-slideover__info-item">
						<BaseIcon name="calendar" :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER" class="base-chat-slideover__info-icon" />
						<div class="base-chat-slideover__info-text-wrapper">
							<BaseText tag="span" :size-scale="sizeScale * UI_SCALE_SMALL" class="base-chat-slideover__info-label"
								>Email</BaseText
							>
							<BaseText tag="span" :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER" class="base-chat-slideover__info-value"
								>info@metal-art.ru</BaseText
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
						:size-scale="sizeScale * UI_CHAT_SCALE_AVATAR_LARGE"
						class="base-chat-slideover__avatar" />
					<BaseText tag="span" :weight="UI_FONT_WEIGHT_SEMIBOLD" :size-scale="sizeScale * UI_CHAT_SCALE_NAME" class="base-chat-slideover__name">
						{{ selectedMember.name }}
					</BaseText>
					<BaseText tag="span" :size-scale="sizeScale * UI_SCALE_AUTOCOMPLETE" class="base-chat-slideover__status">
						{{ selectedMember.status === 'online' ? 'в сети' : 'не в сети' }}
					</BaseText>

					<div class="base-chat-slideover__profile-actions">
						<BaseButton variant="default" :size-scale="sizeScale" @click="handleWriteMessage(selectedMember.id)">
							<template #left>
								<BaseIcon name="reply" :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER" />
							</template>
							Написать сообщение
						</BaseButton>
					</div>
				</div>

				<div class="base-chat-slideover__info-details">
					<div class="base-chat-slideover__info-item">
						<BaseIcon name="calendar" :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER" class="base-chat-slideover__info-icon" />
						<div class="base-chat-slideover__info-text-wrapper">
							<BaseText tag="span" :size-scale="sizeScale * UI_SCALE_SMALL" class="base-chat-slideover__info-label">Роль</BaseText>
							<BaseText tag="span" :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER" class="base-chat-slideover__info-value">
								{{ selectedMember.role === 'admin' ? 'Администратор' : 'Участник' }}
							</BaseText>
						</div>
					</div>
					<div v-if="selectedMember.warningsCount !== undefined" class="base-chat-slideover__info-item">
						<BaseIcon name="alert-triangle" :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER" class="base-chat-slideover__info-icon" />
						<div class="base-chat-slideover__info-text-wrapper">
							<BaseText tag="span" :size-scale="sizeScale * UI_SCALE_SMALL" class="base-chat-slideover__info-label"
								>Предупреждения</BaseText
							>
							<BaseText tag="span" :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER" class="base-chat-slideover__info-value">
								{{ selectedMember.warningsCount }} / 3
							</BaseText>
						</div>
					</div>
				</div>

				<div class="base-chat-slideover__profile-back">
					<BaseButton variant="ghost" :size-scale="sizeScale" @click="handleBackToInfo">
						<template #left>
							<BaseIcon name="arrow-left" :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER" />
						</template>
						Назад к списку
					</BaseButton>
				</div>
			</div>

			<!-- Вкладка: Медиа -->
			<div v-if="activeTab === 'media'" class="base-chat-slideover__pane">
				<div v-if="sharedMedia.length === 0" class="base-chat-slideover__empty">
					<BaseIcon name="image" :size-scale="sizeScale * UI_CHAT_SCALE_AVATAR_LARGE" class="base-chat-slideover__empty-icon" />
					<BaseText :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER" class="base-chat-slideover__empty-text">Нет медиафайлов</BaseText>
				</div>
				<div v-else class="base-chat-slideover__media-grid">
					<div v-for="media in sharedMedia" :key="media.id" class="base-chat-slideover__media-item">
						<BaseImage
							:src="media.url"
							:alt="media.name"
							:gallery="allImagesUrls"
							:has-zoom="true"
							class="base-chat-slideover__media-thumbnail" />
						<BaseText tag="span" :size-scale="sizeScale * UI_CHAT_SCALE_META" class="base-chat-slideover__media-date">
							{{ media.publishedAt }}
						</BaseText>
					</div>
				</div>
			</div>

			<!-- Вкладка: Файлы -->
			<div v-if="activeTab === 'files'" class="base-chat-slideover__pane">
				<div v-if="sharedFiles.length === 0" class="base-chat-slideover__empty">
					<BaseIcon name="file" :size-scale="sizeScale * UI_CHAT_SCALE_AVATAR_LARGE" class="base-chat-slideover__empty-icon" />
					<BaseText :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER" class="base-chat-slideover__empty-text">Нет файлов</BaseText>
				</div>
				<div v-else class="base-chat-slideover__files-list">
					<div
						v-for="file in sharedFiles"
						:key="file.id"
						class="base-chat-slideover__file-item"
						@click="emit('file-click', file)">
						<BaseIcon
							:name="getFileIconName(file.name)"
							:size-scale="sizeScale * UI_CHAT_SCALE_FILE_ICON"
							class="base-chat-slideover__file-icon" />
						<div class="base-chat-slideover__file-info">
							<BaseText tag="span" :weight="UI_FONT_WEIGHT_SEMIBOLD" :size-scale="sizeScale * UI_SCALE_AUTOCOMPLETE" class="base-chat-slideover__file-name">
								{{ file.name }}
							</BaseText>
							<BaseText tag="span" :size-scale="sizeScale * UI_CHAT_SCALE_ICON" class="base-chat-slideover__file-meta">
								<template v-if="file.size">{{ file.size }} · </template>{{ file.publishedAt }}
							</BaseText>
						</div>
						<BaseIcon
							name="download"
							:size-scale="sizeScale * UI_SCALE_SMALL"
							class="base-chat-slideover__file-download"
							@click.stop="emit('download-file', file)" />
					</div>
				</div>
			</div>

			<!-- Вкладка: Ссылки -->
			<div v-if="activeTab === 'links'" class="base-chat-slideover__pane">
				<div v-if="sharedLinks.length === 0" class="base-chat-slideover__empty">
					<BaseIcon name="link" :size-scale="sizeScale * UI_CHAT_SCALE_AVATAR_LARGE" class="base-chat-slideover__empty-icon" />
					<BaseText :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER" class="base-chat-slideover__empty-text">Нет ссылок</BaseText>
				</div>
				<div v-else class="base-chat-slideover__links-list">
					<div
						v-for="(link, index) in sharedLinks"
						:key="index"
						class="base-chat-slideover__link-item"
						@click="openLink(link.url)">
						<BaseIcon name="link" :size-scale="sizeScale * UI_SCALE_SMALL" class="base-chat-slideover__link-icon" />
						<div class="base-chat-slideover__link-info">
							<BaseText tag="span" :size-scale="sizeScale * UI_SCALE_AUTOCOMPLETE" class="base-chat-slideover__link-url">
								{{ link.url }}
							</BaseText>
							<BaseText tag="span" :size-scale="sizeScale * UI_CHAT_SCALE_META" class="base-chat-slideover__link-date">
								{{ link.publishedAt }}
							</BaseText>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseImage } from '@components/BaseImage'
import { BaseText } from '@components/BaseText'
import {
	UI_CHAT_SCALE_AVATAR_LARGE,
	UI_CHAT_SCALE_FILE_ICON,
	UI_CHAT_SCALE_ICON,
	UI_CHAT_SCALE_MEMBER,
	UI_CHAT_SCALE_META,
	UI_CHAT_SCALE_NAME,
	UI_FONT_WEIGHT_SEMIBOLD,
	UI_SCALE_AUTOCOMPLETE,
	UI_SCALE_SMALL,
} from '@constants'
import { getFileIconName } from '@utils/fileUtils'
import { computed, ref } from 'vue'
import type { ChatInfoTab, ChatMember, ChatMessage, ChatMessageAttachment } from '../../BaseChat.types'
import './ChatSlideover.style.scss'

interface ChatSlideoverProps {
	isOpen: boolean
	activeTab: ChatInfoTab
	selectedMemberId: string | null
	title: string
	subtitle?: string
	avatar?: string
	isGroup?: boolean
	members?: ChatMember[]
	messages: ChatMessage[]
	currentUserRole?: 'admin' | 'member'
	sizeScale?: number
}

const props = withDefaults(defineProps<ChatSlideoverProps>(), {
	subtitle: '',
	avatar: '',
	isGroup: false,
	members: () => [],
	currentUserRole: 'member',
	sizeScale: 100,
})

const emit = defineEmits<{
	(e: 'update:isOpen', value: boolean): void
	(e: 'update:activeTab', tab: ChatInfoTab): void
	(e: 'update:selectedMemberId', id: string | null): void
	(e: 'file-click', file: ChatMessageAttachment): void
	(e: 'download-file', file: ChatMessageAttachment): void
	(e: 'write-message', memberId: string): void
	(e: 'kick-member', memberId: string): void
	(e: 'ban-member', payload: { memberId: string; reason?: string; warningsCount?: number }): void
	(e: 'update-member-role', payload: { memberId: string; role: string }): void
}>()

/** Вложение с датой публикации из родительского сообщения */
interface SharedAttachment extends ChatMessageAttachment {
	publishedAt: string
}

/** Ссылка с датой публикации из родительского сообщения */
interface SharedLink {
	url: string
	publishedAt: string
}

const activeAdminMenuId = ref<string | null>(null)

function detectOnlineStatus(text: string): 'online' | 'offline' {
	const lower = text.toLowerCase()
	return lower.includes('сети') || lower.includes('онлайн') || lower.includes('online') ? 'online' : 'offline'
}

const titleText = computed((): string => {
	if (props.activeTab === 'profile') return 'Профиль'
	return 'Информация'
})

const availableTabs = computed(() => [
	{ id: 'info' as const, label: props.isGroup ? 'Участники' : 'Инфо' },
	{ id: 'media' as const, label: 'Медиа' },
	{ id: 'files' as const, label: 'Файлы' },
	{ id: 'links' as const, label: 'Ссылки' },
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

/** Человекочитаемая дата публикации вложения/ссылки из родительского сообщения */
function getPublishedLabel(message: ChatMessage): string {
	return message.date || message.time
}

// Извлечение общих медиафайлов (изображений) из сообщений
const sharedMedia = computed((): SharedAttachment[] => {
	const media: SharedAttachment[] = []
	for (const message of props.messages) {
		for (const attachment of message.attachments ?? []) {
			if (attachment.type === 'image') {
				media.push({ ...attachment, publishedAt: getPublishedLabel(message) })
			}
		}
	}
	return media
})

const allImagesUrls = computed((): string[] => {
	return sharedMedia.value.map(mediaItem => mediaItem.url)
})

// Извлечение общих файлов из сообщений
const sharedFiles = computed((): SharedAttachment[] => {
	const files: SharedAttachment[] = []
	for (const message of props.messages) {
		for (const attachment of message.attachments ?? []) {
			if (attachment.type === 'file') {
				files.push({ ...attachment, publishedAt: getPublishedLabel(message) })
			}
		}
	}
	return files
})

// Извлечение ссылок из сообщений
const sharedLinks = computed((): SharedLink[] => {
	const links: SharedLink[] = []
	const seen = new Set<string>()
	const urlRegex = /(https?:\/\/[^\s]+)/gi
	for (const message of props.messages) {
		if (!message.text) continue
		for (const url of message.text.match(urlRegex) ?? []) {
			if (seen.has(url)) continue
			seen.add(url)
			links.push({ url, publishedAt: getPublishedLabel(message) })
		}
	}
	return links
})

function getMemberRoleLabel(member: ChatMember): string {
	if (member.role === 'admin') return 'Администратор'
	return member.status === 'online' ? 'в сети' : 'не в сети'
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
	emit('ban-member', { memberId, reason: 'Нарушение правил общения', warningsCount: 1 })
	activeAdminMenuId.value = null
}

function openLink(url: string): void {
	window.open(url, '_blank', 'noopener,noreferrer')
}
</script>
