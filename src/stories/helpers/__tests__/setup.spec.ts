import type { Ref } from 'vue'
import { nextTick, reactive } from 'vue'
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

	it('v-model меняется сразу; ответ Storybook на своё изменение пропускается, изменение из Controls — применяется', async () => {
		const args = reactive<Record<string, unknown>>({ modelValue: 'а' })
		const text = useStorySetup(args, { models: { text: 'modelValue' } })().text as Ref
		text.value = 'аб'
		text.value = 'абв'
		expect(text.value).toBe('абв')
		args.modelValue = 'аб'
		await nextTick()
		expect(text.value).toBe('абв')
		args.modelValue = 'абв'
		await nextTick()
		args.modelValue = 'из Controls'
		await nextTick()
		expect(text.value).toBe('из Controls')
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

	it('setup — логика шаблона, своя у каждого показа', () => {
		const setup = useStorySetup({}, { setup: () => ({ count: { value: 0 } }) })
		expect(setup().count).not.toBe(setup().count)
		expect(setup().count).toEqual({ value: 0 })
	})
})
