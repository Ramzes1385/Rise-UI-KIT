import { setLocale } from '@/locales/state'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { useChatMemberConfirm } from '../useChatMemberConfirm'

function setup() {
	const onKick = vi.fn<(memberId: string) => void>()
	const onBan = vi.fn<(payload: { memberId: string }) => void>()
	const confirm = useChatMemberConfirm({ getMemberName: id => (id === 'u1' ? 'Анна' : id), onKick, onBan })
	return { confirm, onKick, onBan }
}

afterEach(() => {
	setLocale('ru')
})

describe('useChatMemberConfirm', () => {
	it('сначала диалог закрыт', () => {
		const { confirm } = setup()

		expect(confirm.memberConfirm.value).toEqual({ isOpen: false, action: 'kick', memberId: '' })
	})

	it('исключение открывает диалог и не отдаёт событие сразу', () => {
		const { confirm, onKick, onBan } = setup()

		confirm.handleKickMember('u1')

		expect(confirm.memberConfirm.value).toEqual({ isOpen: true, action: 'kick', memberId: 'u1' })
		expect(confirm.memberConfirmTitle.value).toBe(UI_CHAT_TEXT.EXCLUDE)
		expect(confirm.memberConfirmText.value).toContain('Анна')
		expect(onKick).not.toHaveBeenCalled()
		expect(onBan).not.toHaveBeenCalled()
	})

	it('бан открывает диалог со своим заголовком и текстом', () => {
		const { confirm, onBan } = setup()

		confirm.handleBanMember({ memberId: 'u1' })

		expect(confirm.memberConfirm.value).toEqual({ isOpen: true, action: 'ban', memberId: 'u1' })
		expect(confirm.memberConfirmTitle.value).toBe(UI_CHAT_TEXT.BAN)
		expect(confirm.memberConfirmText.value).toContain('Анна')
		expect(confirm.memberConfirmText.value).not.toBe(UI_CHAT_TEXT.KICK_CONFIRM)
		expect(onBan).not.toHaveBeenCalled()
	})

	it('подтверждение исключения отдаёт onKick с id и закрывает диалог', () => {
		const { confirm, onKick, onBan } = setup()
		confirm.handleKickMember('u1')

		confirm.handleConfirmMember()

		expect(onKick).toHaveBeenCalledOnce()
		expect(onKick).toHaveBeenCalledWith('u1')
		expect(onBan).not.toHaveBeenCalled()
		expect(confirm.memberConfirm.value.isOpen).toBe(false)
	})

	it('подтверждение бана отдаёт onBan с memberId и закрывает диалог', () => {
		const { confirm, onKick, onBan } = setup()
		confirm.handleBanMember({ memberId: 'u2' })

		confirm.handleConfirmMember()

		expect(onBan).toHaveBeenCalledWith({ memberId: 'u2' })
		expect(onKick).not.toHaveBeenCalled()
		expect(confirm.memberConfirm.value.isOpen).toBe(false)
	})

	it('отмена закрывает диалог без событий', () => {
		const { confirm, onKick, onBan } = setup()
		confirm.handleBanMember({ memberId: 'u1' })

		confirm.handleCancelMember()

		expect(confirm.memberConfirm.value.isOpen).toBe(false)
		expect(onKick).not.toHaveBeenCalled()
		expect(onBan).not.toHaveBeenCalled()
	})

	it('текст подтверждения следует за языком', () => {
		const { confirm } = setup()
		confirm.handleKickMember('u1')
		const ru = confirm.memberConfirmText.value

		setLocale('en')

		expect(confirm.memberConfirmText.value).not.toBe(ru)
		expect(confirm.memberConfirmText.value).toContain('Анна')
	})
})
