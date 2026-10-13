import type { ComputedRef, Ref } from 'vue'

export interface ChatMemberConfirmState {
	isOpen: boolean
	action: 'kick' | 'ban'
	memberId: string
}

export interface UseChatMemberConfirmOptions {
	/** Имя участника для текста подтверждения */
	getMemberName: (memberId: string) => string
	onKick: (memberId: string) => void
	onBan: (payload: { memberId: string }) => void
}

export interface UseChatMemberConfirmReturn {
	memberConfirm: Ref<ChatMemberConfirmState>
	memberConfirmTitle: ComputedRef<string>
	memberConfirmText: ComputedRef<string>
	handleKickMember: (memberId: string) => void
	handleBanMember: (payload: { memberId: string }) => void
	handleConfirmMember: () => void
	handleCancelMember: () => void
}
