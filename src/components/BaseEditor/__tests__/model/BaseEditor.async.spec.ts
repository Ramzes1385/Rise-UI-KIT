import '@testing-library/jest-dom/vitest'
import { mount } from '@vue/test-utils'
import BaseEditor from '../../ui/BaseEditor.vue'
import { consumeEcho, rememberEmitted } from '../../model/editorDraft'

const global = { stubs: { BaseTooltip: { template: '<div><slot /></div>' } } }

function content(wrapper: ReturnType<typeof mount>): HTMLElement {
	return wrapper.find('.base-editor__content').element as HTMLElement
}

async function type(wrapper: ReturnType<typeof mount>, html: string): Promise<void> {
	content(wrapper).innerHTML = html
	await wrapper.find('.base-editor__content').trigger('input')
}

describe('BaseEditor: асинхронный родитель v-model', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('запоздалый ответ родителя не откатывает набранное и не пересоздаёт DOM', async () => {
		const wrapper = mount(BaseEditor, { props: { modelValue: '' }, global, attachTo: document.body })
		await type(wrapper, '<p>a</p>')
		await type(wrapper, '<p>ab</p>')
		const paragraph = content(wrapper).querySelector('p')

		await wrapper.setProps({ modelValue: '<p>a</p>' })
		expect(content(wrapper).innerHTML).toBe('<p>ab</p>')
		await wrapper.setProps({ modelValue: '<p>ab</p>' })

		expect(content(wrapper).innerHTML).toBe('<p>ab</p>')
		expect(content(wrapper).querySelector('p')).toBe(paragraph)
	})

	it('внешнее значение, которого редактор не отправлял, применяется и сбрасывает очередь', async () => {
		const wrapper = mount(BaseEditor, { props: { modelValue: '' }, global })
		await type(wrapper, '<p>a</p>')

		await wrapper.setProps({ modelValue: '<p>сброс формы</p>' })
		expect(content(wrapper).innerHTML).toBe('<p>сброс формы</p>')

		await wrapper.setProps({ modelValue: '<p>a</p>' })
		expect(content(wrapper).innerHTML).toBe('<p>a</p>')
	})

	it('очередь отправленных значений ограничена и разбирается по порядку', () => {
		const pending: string[] = []
		for (let i = 0; i < 40; i++) rememberEmitted(pending, String(i))

		expect(pending).toHaveLength(32)
		expect(consumeEcho(pending, '38')).toBe(true)
		expect(pending).toEqual(['39'])
		expect(consumeEcho(pending, 'чужое')).toBe(false)
		expect(pending).toEqual([])
	})
})
