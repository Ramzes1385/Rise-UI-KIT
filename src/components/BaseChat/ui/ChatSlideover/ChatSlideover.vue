<template>
	<BaseSlideover
		:is-open="isOpen"
		:title="titleText"
		:is-contained="true"
		:width="slideoverWidth"
		:size-scale="sizeScale"
		:custom-class="{ root: 'base-chat-slideover', panel: 'base-chat-slideover__panel', body: 'base-chat-slideover__body' }"
		@update:is-open="emit('update:isOpen', $event)">
		<div ref="contentRef" class="base-chat-slideover__content">
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
						<p v-if="description" class="base-chat-slideover__description">{{ description }}</p>
					</div>

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
										<span class="base-chat-slideover__member-title">
											<span class="base-chat-slideover__member-name">{{ member.name }}</span>
											<ChatBadges
												v-if="member.badges?.length"
												:badges="member.badges"
												:max="maxBadges"
												:size-scale="sizeScale" />
										</span>
										<span class="base-chat-slideover__member-role">{{ getMemberRoleLabel(member) }}</span>
									</span>
								</button>

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

					<section
						v-if="selectedMember.badges?.length"
						class="base-chat-slideover__badges"
						:aria-labelledby="`${idPrefix}-badges`">
						<h4 :id="`${idPrefix}-badges`" class="base-chat-slideover__section-title">
							{{ UI_CHAT_TEXT.BADGES }}
						</h4>
						<ChatBadges :badges="selectedMember.badges" is-labeled :size-scale="sizeScale" />
					</section>

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

				<ChatSlideoverMedia v-if="activeTab === 'media'" :messages="messages" :size-scale="sizeScale" />

				<ChatSlideoverFiles
					v-if="activeTab === 'files'"
					:messages="messages"
					:size-scale="sizeScale"
					@file-click="emit('file-click', $event)"
					@download-file="emit('download-file', $event)" />

				<ChatSlideoverLinks v-if="activeTab === 'links'" :messages="messages" :size-scale="sizeScale" />
			</div>
		</div>
	</BaseSlideover>
</template>

<script setup lang="ts">
import './ChatSlideover.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { CHAT_SCALE } from '../../model/chatScale'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import ChatSlideoverFiles from './ChatSlideoverFiles.vue'
import ChatSlideoverLinks from './ChatSlideoverLinks.vue'
import ChatSlideoverMedia from './ChatSlideoverMedia.vue'
import { BaseSlideover } from '@components/BaseSlideover'
import { ChatBadges, CHAT_MAX_BADGES } from '../ChatBadges'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import { useChatSlideover } from '../../model/slideover/useChatSlideover'
import type { ChatSlideoverEmits, ChatSlideoverProps } from '../../types/ChatSlideover.types'

const props = withDefaults(defineProps<ChatSlideoverProps>(), {
	subtitle: '',
	avatar: '',
	description: '',
	isGroup: false,
	members: () => [],
	currentUserRole: 'member',
	maxBadges: CHAT_MAX_BADGES,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<ChatSlideoverEmits>()

const {
	slideoverWidth,
	idPrefix,
	contentRef,
	titleText,
	membersCountLabel,
	selectedMember,
	availableTabs,
	handleTabsKeydown,
	getMemberRoleLabel,
	activeAdminMenuId,
	setAdminTriggerRef,
	toggleAdminMenu,
	handleAdminMenuEscape,
	handleChangeRole,
	handleKick,
	handleBan,
	handleMemberClick,
	handleBackToInfo,
	handleWriteMessage,
} = useChatSlideover(props, emit)
</script>
