import { useChatEdit } from '../useChatEdit'
import type { ChatMessage } from '@components/BaseChat/types/BaseChat.types'

const own: ChatMessage = { id: 'm1', text: 'Моё', sender: 'me', time: '10:00' }
const foreign: ChatMessage = { id: 'm2', text: 'Чужое', sender: 'other', time: '10:01' }

describe('useChatEdit', () => {
	it('сначала правки нет', () => {
		expect(useChatEdit().editingMessage.value).toBeNull()
	})

	it('начинает правку своего сообщения', () => {
		const edit = useChatEdit()

		edit.handleMessageEdit(own)

		expect(edit.editingMessage.value?.id).toBe('m1')
	})

	it('чужое сообщение править нельзя', () => {
		const edit = useChatEdit()

		edit.handleMessageEdit(foreign)

		expect(edit.editingMessage.value).toBeNull()
	})

	it('чужое сообщение не сбрасывает уже начатую правку', () => {
		const edit = useChatEdit()
		edit.handleMessageEdit(own)

		edit.handleMessageEdit(foreign)

		expect(edit.editingMessage.value?.id).toBe('m1')
	})

	it('отмена выходит из правки', () => {
		const edit = useChatEdit()
		edit.handleMessageEdit(own)

		edit.handleCancelEdit()

		expect(edit.editingMessage.value).toBeNull()
	})
})
