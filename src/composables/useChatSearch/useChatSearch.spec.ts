import { effectScope } from 'vue'
import { useChatSearch } from './useChatSearch'
import type { ChatMessage } from '@components/BaseChat/model/BaseChat.types'

function message(id: string, overrides: Partial<ChatMessage> = {}): ChatMessage {
	return {
		id,
		text: `Сообщение ${id}`,
		sender: 'other',
		time: '10:00',
		...overrides,
	}
}

function setup(messages: ChatMessage[]): ReturnType<typeof useChatSearch> {
	const scope = effectScope()
	return scope.run(() => useChatSearch({ getMessages: () => messages })) as ReturnType<typeof useChatSearch>
}

describe('useChatSearch unit', () => {
	it('возвращает все сообщения при пустом запросе', () => {
		const search = setup([message('1'), message('2')])

		expect(search.filteredMessages.value).toHaveLength(2)
	})

	it('фильтрует сообщения по подстроке без учёта регистра', () => {
		const search = setup([message('1', { text: 'Привет МИР' }), message('2', { text: 'Другое' })])

		search.searchQuery.value = 'мир'

		expect(search.filteredMessages.value).toHaveLength(1)
		expect(search.filteredMessages.value[0]?.id).toBe('1')
	})

	it('игнорирует сообщения без текста при активном поиске', () => {
		const search = setup([message('1', { text: undefined }), message('2', { text: 'Найдено' })])

		search.searchQuery.value = 'найдено'

		expect(search.filteredMessages.value).toHaveLength(1)
		expect(search.filteredMessages.value[0]?.id).toBe('2')
	})
})
