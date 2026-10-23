/** Composable: подтверждение исключения и бана участника чата */
import { computed, ref } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_CHAT_TEXT } from '@/locales/messages'
import type { ChatMemberConfirmState, UseChatMemberConfirmOptions, UseChatMemberConfirmReturn } from './types/useChatMemberConfirm.types'

const CLOSED: ChatMemberConfirmState = { isOpen: false, action: 'kick', memberId: '' }

/** Исключение и бан необратимы для участника — действие не уходит событием, пока админ не подтвердил его в диалоге */
function useChatMemberConfirm(options: UseChatMemberConfirmOptions): UseChatMemberConfirmReturn {
	const memberConfirm = ref<ChatMemberConfirmState>({ ...CLOSED })

	const memberName = (): string => options.getMemberName(memberConfirm.value.memberId)

	return {
		memberConfirm,
		memberConfirmTitle: computed(() => (memberConfirm.value.action === 'kick' ? UI_CHAT_TEXT.EXCLUDE : UI_CHAT_TEXT.BAN)),
		memberConfirmText: computed(() =>
			formatMessage(memberConfirm.value.action === 'kick' ? UI_CHAT_TEXT.KICK_CONFIRM : UI_CHAT_TEXT.BAN_CONFIRM, {
				name: memberName(),
			}),
		),
		handleKickMember(memberId: string): void {
			memberConfirm.value = { isOpen: true, action: 'kick', memberId }
		},
		handleBanMember(payload: { memberId: string }): void {
			memberConfirm.value = { isOpen: true, action: 'ban', memberId: payload.memberId }
		},
		handleConfirmMember(): void {
			const { action, memberId } = memberConfirm.value
			if (action === 'kick') options.onKick(memberId)
			else options.onBan({ memberId })
			memberConfirm.value = { ...CLOSED }
		},
		handleCancelMember(): void {
			memberConfirm.value = { ...CLOSED }
		},
	}
}

export { useChatMemberConfirm }
