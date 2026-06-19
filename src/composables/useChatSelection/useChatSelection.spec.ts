import { effectScope } from 'vue'
import { useChatSelection } from './useChatSelection'

function setup(): { selection: ReturnType<typeof useChatSelection>; onMessageSelect: ReturnType<typeof vi.fn> } {
	const onMessageSelect = vi.fn()
	const scope = effectScope()
	const selection = scope.run(() => useChatSelection({ onMessageSelect })) as ReturnType<typeof useChatSelection>
	return { selection, onMessageSelect }
}

describe('useChatSelection unit', () => {
	it('добавляет сообщение в выделение и вызывает callback', () => {
		const { selection, onMessageSelect } = setup()

		selection.handleMessageSelect('1')

		expect(selection.selectedMessageIds.value).toContain('1')
		expect(onMessageSelect).toHaveBeenCalledWith('1')
	})

	it('снимает выделение при повторном выборе', () => {
		const { selection } = setup()

		selection.handleMessageSelect('1')
		selection.handleMessageSelect('1')

		expect(selection.selectedMessageIds.value).not.toContain('1')
	})

	it('сохраняет остальные выбранные сообщения при снятии одного', () => {
		const { selection } = setup()

		selection.handleMessageSelect('1')
		selection.handleMessageSelect('2')
		selection.handleMessageSelect('1')

		expect(selection.selectedMessageIds.value).toEqual(['2'])
	})
})
