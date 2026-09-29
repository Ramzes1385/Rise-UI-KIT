import type { Ref } from 'vue'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { getLocale, pluralize } from '@/locales/state'
import { computed, nextTick, ref, useId, watch } from 'vue'
import type { ChatInfoTab, ChatMember } from '../../types/BaseChat.types'
import type { ChatSlideoverEmits, ChatSlideoverPanelProps } from '../../types/ChatSlideover.types'

const SLIDEOVER_WIDTH = 80

function detectOnlineStatus(text: string): 'online' | 'offline' {
	const lower = text.toLowerCase()
	return lower.includes('сети') || lower.includes('онлайн') || lower.includes('online') ? 'online' : 'offline'
}

function getMemberRoleLabel(member: ChatMember): string {
	if (member.role === 'admin') return UI_CHAT_TEXT.ADMIN
	return member.status === 'online' ? UI_CHAT_TEXT.ONLINE : UI_CHAT_TEXT.OFFLINE
}

function usePanelFocus(props: ChatSlideoverPanelProps, contentRef: Ref<HTMLElement | null>, onClose: () => void): void {
	let returnFocusTarget: HTMLElement | null = null
	watch(
		() => props.isOpen,
		isOpen => {
			if (isOpen) {
				returnFocusTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null
				nextTick(() => contentRef.value?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"], button')?.focus())
				return
			}
			onClose()
			const target = returnFocusTarget
			returnFocusTarget = null
			nextTick(() => {
				const active = document.activeElement
				if (target?.isConnected && (!active || active === document.body)) target.focus()
			})
		},
	)
}

function useAdminMenu(emit: ChatSlideoverEmits) {
	const activeAdminMenuId = ref<string | null>(null)
	const adminTriggerRefs = new Map<string, { focus: () => void }>()
	const closeAdminMenu = (): void => {
		activeAdminMenuId.value = null
	}
	return {
		activeAdminMenuId,
		closeAdminMenu,
		setAdminTriggerRef(memberId: string, element: unknown): void {
			if (element) adminTriggerRefs.set(memberId, element as { focus: () => void })
			else adminTriggerRefs.delete(memberId)
		},
		toggleAdminMenu(memberId: string): void {
			activeAdminMenuId.value = activeAdminMenuId.value === memberId ? null : memberId
		},
		handleAdminMenuEscape(event: KeyboardEvent, memberId: string): void {
			if (activeAdminMenuId.value !== memberId) return
			event.stopPropagation()
			closeAdminMenu()
			adminTriggerRefs.get(memberId)?.focus()
		},
		handleChangeRole(memberId: string, role: string): void {
			emit('update-member-role', { memberId, role })
			closeAdminMenu()
		},
		handleKick(memberId: string): void {
			emit('kick-member', memberId)
			closeAdminMenu()
		},
		handleBan(memberId: string): void {
			emit('ban-member', { memberId, reason: UI_CHAT_TEXT.VIOLATION, warningsCount: 1 })
			closeAdminMenu()
		},
	}
}

function usePanelTabs(props: ChatSlideoverPanelProps, emit: ChatSlideoverEmits, idPrefix: string) {
	const availableTabs = computed(() => [
		{ id: 'info' as const, label: props.isGroup ? UI_CHAT_TEXT.PARTICIPANTS : UI_CHAT_TEXT.INFO_TAB },
		{ id: 'media' as const, label: UI_CHAT_TEXT.MEDIA_TAB },
		{ id: 'files' as const, label: UI_CHAT_TEXT.FILES_TAB },
		{ id: 'links' as const, label: UI_CHAT_TEXT.LINKS_TAB },
	])
	return {
		availableTabs,
		handleTabsKeydown(event: KeyboardEvent): void {
			const tabs = availableTabs.value
			const index = tabs.findIndex(tab => tab.id === props.activeTab)
			const moves: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }
			if (!(event.key in moves)) return
			event.preventDefault()
			const next: ChatInfoTab = tabs[(moves[event.key] + tabs.length) % tabs.length].id
			emit('update:activeTab', next)
			nextTick(() => document.getElementById(`${idPrefix}-tab-${next}`)?.focus())
		},
	}
}

function usePanelMember(props: ChatSlideoverPanelProps) {
	return {
		titleText: computed((): string => (props.activeTab === 'profile' ? UI_CHAT_TEXT.PROFILE : UI_CHAT_TEXT.INFORMATION)),
		membersCountLabel: computed(() => pluralize(getLocale().plural.PARTICIPANTS, props.members.length)),
		selectedMember: computed((): ChatMember | null => {
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
		}),
	}
}

export function useChatSlideover(props: ChatSlideoverPanelProps, emit: ChatSlideoverEmits) {
	const idPrefix = useId()
	const contentRef = ref<HTMLElement | null>(null)
	const admin = useAdminMenu(emit)
	usePanelFocus(props, contentRef, admin.closeAdminMenu)

	return {
		slideoverWidth: SLIDEOVER_WIDTH,
		idPrefix,
		contentRef,
		...usePanelMember(props),
		...usePanelTabs(props, emit, idPrefix),
		getMemberRoleLabel,
		...admin,
		handleMemberClick(memberId: string): void {
			emit('update:selectedMemberId', memberId)
			emit('update:activeTab', 'profile')
		},
		handleBackToInfo(): void {
			emit('update:selectedMemberId', null)
			emit('update:activeTab', 'info')
		},
		handleWriteMessage(memberId: string): void {
			emit('write-message', memberId)
			emit('update:isOpen', false)
		},
	}
}
