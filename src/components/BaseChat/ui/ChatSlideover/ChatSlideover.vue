<template>
	<BaseSlideover
		:is-open="isOpen"
		:title="titleText"
		:is-contained="true"
		:width="SLIDEOVER_WIDTH"
		:size-scale="sizeScale"
		:custom-class="{ root: 'base-chat-slideover', panel: 'base-chat-slideover__panel', body: 'base-chat-slideover__body' }"
		@update:is-open="emit('update:isOpen', $event)">
		<div ref="contentRef" class="base-chat-slideover__content">
			<!-- Вкладки (кроме режима профиля): стрелки ←/→, Home, End переключают вкладку -->
			<div
				v-if="activeTab !== 'profile'"
				class="base-chat-slideover__tabs"
				role="tablist"
				:aria-label="UI_CHAT_TEXT.INFO_TABS"
				@keydown="handleTabsKeydown">
				<button
					v-for="tab in availableTabs"
					:id="`${idPrefix}-tab-${tab.id}`"
					:key="tab.id"
					type="button"
					role="tab"
					class="base-chat-slideover__tab-btn"
					:class="{ 'base-chat-slideover__tab-btn--active': activeTab === tab.id }"
					:aria-selected="activeTab === tab.id ? 'true' : 'false'"
					:aria-controls="`${idPrefix}-panel`"
					:tabindex="activeTab === tab.id ? 0 : -1"
					@click="emit('update:activeTab', tab.id)">
					{{ tab.label }}
				</button>
			</div>

			<div
				:id="`${idPrefix}-panel`"
				class="base-chat-slideover__pane"
				:role="activeTab !== 'profile' ? 'tabpanel' : undefined"
				:aria-labelledby="activeTab !== 'profile' ? `${idPrefix}-tab-${activeTab}` : undefined">
				<!-- Вкладка: Информация / Участники -->
				<template v-if="activeTab === 'info'">
					<div class="base-chat-slideover__profile-summary">
						<BaseAvatar
							:src="avatar"
							:name="title"
							:size-scale="sizeScale * CHAT_SCALE.AVATAR_LARGE"
							class="base-chat-slideover__avatar" />
						<span class="base-chat-slideover__name">{{ title }}</span>
						<span class="base-chat-slideover__status">
							{{ isGroup ? membersCountLabel : subtitle || UI_CHAT_TEXT.ONLINE }}
						</span>
						<!-- Только данные приложения: демо-тексты библиотеки показывались бы в каждом чате -->
						<p v-if="description" class="base-chat-slideover__description">{{ description }}</p>
					</div>

					<!-- Список участников для групп -->
					<section
						v-if="isGroup && members.length > 0"
						class="base-chat-slideover__members-list"
						:aria-labelledby="`${idPrefix}-members`">
						<h4 :id="`${idPrefix}-members`" class="base-chat-slideover__section-title">
							{{ UI_CHAT_TEXT.PARTICIPANTS_TITLE }}
						</h4>
						<ul class="base-chat-slideover__members-scroll">
							<li v-for="member in members" :key="member.id" class="base-chat-slideover__member-item">
								<button type="button" class="base-chat-slideover__member-main" @click="handleMemberClick(member.id)">
									<BaseAvatar
										:src="member.avatar"
										:name="member.name"
										:size-scale="sizeScale"
										:is-online="member.status === 'online'" />
									<span class="base-chat-slideover__member-info">
										<span class="base-chat-slideover__member-name">{{ member.name }}</span>
										<span class="base-chat-slideover__member-role">{{ getMemberRoleLabel(member) }}</span>
									</span>
								</button>

								<!-- Админ-действия над участником: меню закрывается выбором пункта, повторным нажатием и Escape -->
								<div
									v-if="currentUserRole === 'admin' && member.id !== 'me'"
									class="base-chat-slideover__member-actions"
									@keydown.esc="handleAdminMenuEscape($event, member.id)">
									<BaseButton
										:ref="element => setAdminTriggerRef(member.id, element)"
										variant="ghost"
										:size-scale="sizeScale"
										class="base-chat-slideover__admin-btn"
										:aria-label="`${UI_CHAT_TEXT.MEMBER_ACTIONS} ${member.name}`"
										aria-haspopup="menu"
										:aria-expanded="activeAdminMenuId === member.id ? 'true' : 'false'"
										@click="toggleAdminMenu(member.id)">
										<BaseIcon name="chevron-down" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
									</BaseButton>

									<div
										v-if="activeAdminMenuId === member.id"
										class="base-chat-slideover__admin-dropdown"
										role="menu"
										:aria-label="`${UI_CHAT_TEXT.MEMBER_ACTIONS} ${member.name}`">
										<button
											type="button"
											role="menuitem"
											class="base-chat-slideover__dropdown-item"
											@click="handleChangeRole(member.id, member.role === 'admin' ? 'member' : 'admin')">
											<BaseIcon
												name="file-config"
												:size-scale="sizeScale * CHAT_SCALE.SMALL"
												class="base-chat-slideover__dropdown-icon" />
											{{ member.role === 'admin' ? UI_CHAT_TEXT.DEMOTE : UI_CHAT_TEXT.MAKE_ADMIN }}
										</button>
										<button
											type="button"
											role="menuitem"
											class="base-chat-slideover__dropdown-item base-chat-slideover__dropdown-item--danger"
											@click="handleKick(member.id)">
											<BaseIcon
												name="x-circle"
												:size-scale="sizeScale * CHAT_SCALE.SMALL"
												class="base-chat-slideover__dropdown-icon" />
											{{ UI_CHAT_TEXT.EXCLUDE }}
										</button>
										<button
											type="button"
											role="menuitem"
											class="base-chat-slideover__dropdown-item base-chat-slideover__dropdown-item--danger"
											@click="handleBan(member.id)">
											<BaseIcon
												name="alert-triangle"
												:size-scale="sizeScale * CHAT_SCALE.SMALL"
												class="base-chat-slideover__dropdown-icon" />
											{{ UI_CHAT_TEXT.BAN }}
										</button>
									</div>
								</div>
							</li>
						</ul>
					</section>
				</template>

				<!-- Вкладка: Профиль пользователя (при клике на участника) -->
				<template v-if="activeTab === 'profile' && selectedMember">
					<div class="base-chat-slideover__profile-summary">
						<BaseAvatar
							:src="selectedMember.avatar"
							:name="selectedMember.name"
							:size-scale="sizeScale * CHAT_SCALE.AVATAR_LARGE"
							:is-online="selectedMember.status === 'online'"
							class="base-chat-slideover__avatar" />
						<span class="base-chat-slideover__name">{{ selectedMember.name }}</span>
						<span class="base-chat-slideover__status">
							{{ selectedMember.status === 'online' ? UI_CHAT_TEXT.ONLINE : UI_CHAT_TEXT.OFFLINE }}
						</span>

						<div class="base-chat-slideover__profile-actions">
							<BaseButton :size-scale="sizeScale" @click="handleWriteMessage(selectedMember.id)">
								<template #left>
									<BaseIcon name="reply" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
								</template>
								{{ UI_CHAT_TEXT.WRITE_MESSAGE }}
							</BaseButton>
						</div>
					</div>

					<dl class="base-chat-slideover__info-details">
						<div class="base-chat-slideover__info-item">
							<dt class="base-chat-slideover__info-label">
								<BaseIcon
									name="calendar"
									:size-scale="sizeScale * CHAT_SCALE.SMALL"
									class="base-chat-slideover__info-icon" />
								{{ UI_CHAT_TEXT.ROLE }}
							</dt>
							<dd class="base-chat-slideover__info-value">
								{{ selectedMember.role === 'admin' ? UI_CHAT_TEXT.ADMIN : UI_CHAT_TEXT.MEMBER }}
							</dd>
						</div>
						<div v-if="selectedMember.warningsCount !== undefined" class="base-chat-slideover__info-item">
							<dt class="base-chat-slideover__info-label">
								<BaseIcon
									name="alert-triangle"
									:size-scale="sizeScale * CHAT_SCALE.SMALL"
									class="base-chat-slideover__info-icon" />
								{{ UI_CHAT_TEXT.WARNINGS }}
							</dt>
							<dd class="base-chat-slideover__info-value">{{ selectedMember.warningsCount }} / 3</dd>
						</div>
					</dl>

					<div class="base-chat-slideover__profile-back">
						<BaseButton variant="ghost" :size-scale="sizeScale" @click="handleBackToInfo">
							<template #left>
								<BaseIcon name="arrow-left" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
							</template>
							{{ UI_CHAT_TEXT.BACK_TO_LIST }}
						</BaseButton>
					</div>
				</template>

				<!-- Вкладка: Медиа -->
				<ChatSlideoverMedia v-if="activeTab === 'media'" :messages="messages" :size-scale="sizeScale" />

				<!-- Вкладка: Файлы -->
				<ChatSlideoverFiles
					v-if="activeTab === 'files'"
					:messages="messages"
					:size-scale="sizeScale"
					@file-click="emit('file-click', $event)"
					@download-file="emit('download-file', $event)" />

				<!-- Вкладка: Ссылки -->
				<ChatSlideoverLinks v-if="activeTab === 'links'" :messages="messages" :size-scale="sizeScale" />
			</div>
		</div>
	</BaseSlideover>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { getLocale, pluralize } from '@/locales/state'
import { BaseSlideover } from '@components/BaseSlideover'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { CHAT_SCALE } from '../../model/chatScale'
import ChatSlideoverFiles from './ChatSlideoverFiles.vue'
import ChatSlideoverLinks from './ChatSlideoverLinks.vue'
import ChatSlideoverMedia from './ChatSlideoverMedia.vue'
import type { ChatInfoTab, ChatMember } from '../../model/BaseChat.types'
import type { ChatSlideoverEmits, ChatSlideoverProps } from '../../model/ChatSlideover.types'
import './ChatSlideover.style.scss'

/**
 * Панель «Информация» — BaseSlideover внутри окна чата (isContained): перекрывает ленту, закрывается крестиком,
 * Escape и кликом по подложке. Ширина — в процентах от 420px: 80 → 336px; в узком окне чата — на всю ширину.
 */
const SLIDEOVER_WIDTH = 80

const props = withDefaults(defineProps<ChatSlideoverProps>(), {
	subtitle: '',
	avatar: '',
	description: '',
	isGroup: false,
	members: () => [],
	currentUserRole: 'member',
	sizeScale: SIZE_SCALE_DEFAULT,
})

/** «12 участников» по правилам языка: 1 участник, 3 участника, 5 участников */
const membersCountLabel = computed(() => pluralize(getLocale().plural.PARTICIPANTS, props.members.length))

const emit = defineEmits<ChatSlideoverEmits>()

const idPrefix = useId()
const contentRef = ref<HTMLElement | null>(null)
const activeAdminMenuId = ref<string | null>(null)
const adminTriggerRefs = new Map<string, { focus: () => void }>()

/**
 * Фокус: панель немодальная (внутри окна чата), поэтому ловушки фокуса нет. При открытии фокус переходит
 * на выбранную вкладку (или первую кнопку профиля), при закрытии — возвращается туда, откуда панель открыли.
 */
let returnFocusTarget: HTMLElement | null = null

watch(
	() => props.isOpen,
	isOpen => {
		if (isOpen) {
			returnFocusTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null
			nextTick(() => contentRef.value?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"], button')?.focus())
			return
		}
		activeAdminMenuId.value = null
		const target = returnFocusTarget
		returnFocusTarget = null
		nextTick(() => {
			const active = document.activeElement
			if (target?.isConnected && (!active || active === document.body)) target.focus()
		})
	},
)

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

/** Клавиатура вкладок (APG Tabs, автоматическая активация): стрелки — соседняя вкладка по кругу, Home/End — крайние */
function handleTabsKeydown(event: KeyboardEvent): void {
	const tabs = availableTabs.value
	const index = tabs.findIndex(tab => tab.id === props.activeTab)
	const moves: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }
	if (!(event.key in moves)) return
	event.preventDefault()
	const next: ChatInfoTab = tabs[(moves[event.key] + tabs.length) % tabs.length].id
	emit('update:activeTab', next)
	nextTick(() => document.getElementById(`${idPrefix}-tab-${next}`)?.focus())
}

function setAdminTriggerRef(memberId: string, element: unknown): void {
	if (element) adminTriggerRefs.set(memberId, element as { focus: () => void })
	else adminTriggerRefs.delete(memberId)
}

function toggleAdminMenu(memberId: string): void {
	if (activeAdminMenuId.value === memberId) {
		activeAdminMenuId.value = null
	} else {
		activeAdminMenuId.value = memberId
	}
}

/** Escape в открытом меню участника закрывает только меню и возвращает фокус на его кнопку; панель остаётся открытой */
function handleAdminMenuEscape(event: KeyboardEvent, memberId: string): void {
	if (activeAdminMenuId.value !== memberId) return
	event.stopPropagation()
	activeAdminMenuId.value = null
	adminTriggerRefs.get(memberId)?.focus()
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
