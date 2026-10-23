import { effectScope, nextTick } from 'vue'
import { useChatSelection } from '../useChatSelection'

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

	describe('selectAll', () => {
		it('добавляет невыбранные и сообщает о каждом', () => {
			const { selection, onMessageSelect } = setup()
			selection.handleMessageSelect('2')
			onMessageSelect.mockClear()

			selection.selectAll(['1', '2', '3'])

			expect(selection.selectedMessageIds.value).toEqual(['2', '1', '3'])
			expect(onMessageSelect.mock.calls).toEqual([['1'], ['3']])
		})

		it('когда выбрано всё, ничего не меняет', () => {
			const { selection, onMessageSelect } = setup()
			selection.selectAll(['1'])
			onMessageSelect.mockClear()

			selection.selectAll(['1'])

			expect(selection.selectedMessageIds.value).toEqual(['1'])
			expect(onMessageSelect).not.toHaveBeenCalled()
		})
	})

	describe('handleSelectionEscape', () => {
		function layout() {
			const root = document.createElement('div')
			root.innerHTML =
				'<div class="base-chat-message-list"><button class="in-list"></button></div>' +
				'<div class="base-chat-selection-toolbar"><button class="in-toolbar"></button></div>' +
				'<div class="outside"></div><textarea class="base-chat-input__field"></textarea>'
			document.body.append(root)
			return root
		}

		function press(root: HTMLElement, selector: string, init: { prevent?: boolean } = {}): KeyboardEvent {
			const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
			if (init.prevent) event.preventDefault()
			root.addEventListener('keydown', handler, { once: true })
			;(root.querySelector(selector) as HTMLElement).dispatchEvent(event)
			return event
		}

		let handler: (event: KeyboardEvent) => void
		let selection: ReturnType<typeof useChatSelection>

		beforeEach(() => {
			;({ selection } = setup())
			handler = event => selection.handleSelectionEscape(event)
		})

		afterEach(() => {
			document.body.innerHTML = ''
		})

		it('из ленты сбрасывает выбор и возвращает фокус в поле ввода', async () => {
			const root = layout()
			selection.handleMessageSelect('1')

			const event = press(root, '.in-list')
			await nextTick()

			expect(event.defaultPrevented).toBe(true)
			expect(selection.selectedMessageIds.value).toEqual([])
			expect(document.activeElement).toBe(root.querySelector('.base-chat-input__field'))
		})

		it('из панели выбора тоже сбрасывает выбор', () => {
			const root = layout()
			selection.handleMessageSelect('1')

			press(root, '.in-toolbar')

			expect(selection.selectedMessageIds.value).toEqual([])
		})

		it('без выбора событие не трогает', () => {
			const root = layout()

			const event = press(root, '.in-list')

			expect(event.defaultPrevented).toBe(false)
		})

		it('уже обработанное событие не трогает', () => {
			const root = layout()
			selection.handleMessageSelect('1')

			press(root, '.in-list', { prevent: true })

			expect(selection.selectedMessageIds.value).toEqual(['1'])
		})

		it('из места вне ленты и панели выбор остаётся', () => {
			const root = layout()
			selection.handleMessageSelect('1')

			const event = press(root, '.outside')

			expect(event.defaultPrevented).toBe(false)
			expect(selection.selectedMessageIds.value).toEqual(['1'])
		})

		it('цель не элемент (document): выбор остаётся', () => {
			selection.handleMessageSelect('1')
			const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
			document.addEventListener('keydown', handler, { once: true })

			document.dispatchEvent(event)

			expect(selection.selectedMessageIds.value).toEqual(['1'])
		})

		it('без корня-получателя сбрасывает выбор и не падает на фокусе', async () => {
			const root = layout()
			selection.handleMessageSelect('1')
			const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
			root.addEventListener(
				'keydown',
				() => {
					selection.handleSelectionEscape({
						defaultPrevented: false,
						target: root.querySelector('.in-list'),
						currentTarget: null,
						preventDefault: () => undefined,
					} as unknown as KeyboardEvent)
				},
				{ once: true },
			)

			root.querySelector('.in-list')?.dispatchEvent(event)
			await nextTick()

			expect(selection.selectedMessageIds.value).toEqual([])
		})
	})
})
