import type { Ref } from 'vue'
import { useStorySetup } from '../controls/model'

const updateArgs = vi.fn()

vi.mock('storybook/preview-api', () => ({ useArgs: () => [{}, updateArgs] }))

describe('setup истории со своим шаблоном', () => {
	it('args без слотов и v-model, тексты слотов, v-model связан с Controls', () => {
		const setup = useStorySetup({ title: 'Отчёт', default: 'Текст', modelValue: 'а' }, { models: { text: 'modelValue' } })()
		expect((setup.args as Ref).value).toEqual({ title: 'Отчёт' })
		expect((setup.slots as Ref).value).toEqual({ default: 'Текст' })
		expect((setup.text as Ref).value).toBe('а')
		;(setup.text as Ref).value = 'б'
		expect(updateArgs).toHaveBeenCalledWith({ modelValue: 'б' })
	})

	it('state — свой ref с копией начального значения у каждого показа истории', () => {
		const state = { isVisible: true, items: ['а'] }
		const setup = useStorySetup({}, { state, data: { names: ['x'] } })
		const first = setup()
		const second = setup()
		;(first.items as Ref<string[]>).value.push('б')
		;(first.isVisible as Ref<boolean>).value = false
		expect((second.items as Ref<string[]>).value).toEqual(['а'])
		expect((second.isVisible as Ref<boolean>).value).toBe(true)
		expect(state.items).toEqual(['а'])
		expect(second.names).toEqual(['x'])
	})
})
