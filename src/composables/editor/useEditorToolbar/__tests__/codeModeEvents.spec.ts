import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { useEditorToolbar } from '../useEditorToolbar'
import { useToolbarCodeMode } from '../useToolbarCodeMode'

function setup(execResult: boolean) {
	const textarea = document.createElement('textarea')
	textarea.value = 'abc'
	document.body.appendChild(textarea)
	textarea.setSelectionRange(1, 2)
	Object.defineProperty(document, 'execCommand', {
		value: vi.fn(() => execResult),
		configurable: true,
		writable: true,
	})
	const onInput = vi.fn()
	const mode = useToolbarCodeMode({
		editorRef: ref(document.createElement('div')),
		codeTextareaRef: ref(textarea),
		onInput,
	})
	mode.codeContent.value = 'abc'
	return { mode, onInput, textarea }
}

describe('useToolbarCodeMode: число сообщений о вводе', () => {
	afterEach(() => {
		document.body.innerHTML = ''
		vi.restoreAllMocks()
	})

	it('правка через execCommand: о вводе сообщает событие input поля, onInput вручную не вызывается', () => {
		const { mode, onInput } = setup(true)

		mode.wrapCodeSelection('<b>', '</b>')

		expect(document.execCommand).toHaveBeenCalledWith('insertText', false, '<b>b</b>')
		expect(onInput).not.toHaveBeenCalled()
	})

	it('правка присваиванием (команда отказала): onInput вызывается ровно один раз', () => {
		const { mode, onInput } = setup(false)

		mode.wrapCodeSelection('<b>', '</b>')

		expect(mode.codeContent.value).toBe('a<b>b</b>c')
		expect(onInput).toHaveBeenCalledTimes(1)
	})

	it.each([
		[true, 0],
		[false, 1],
	])('сброс форматирования в режиме кода (execCommand: %s): onInput вызывается %i раз', (execResult, calls) => {
		const textarea = document.createElement('textarea')
		textarea.value = '<b>x</b>'
		document.body.appendChild(textarea)
		textarea.setSelectionRange(0, 8)
		Object.defineProperty(document, 'execCommand', { value: vi.fn(() => execResult), configurable: true, writable: true })
		const onInput = vi.fn()
		let toolbar!: ReturnType<typeof useEditorToolbar>
		const host = mount(
			defineComponent({
				setup() {
					toolbar = useEditorToolbar({ editorRef: ref(document.createElement('div')), codeTextareaRef: ref(textarea), onInput })
					return () => null
				},
			}),
		)
		toolbar.isCodeMode.value = true
		toolbar.codeContent.value = '<b>x</b>'

		toolbar.clearAllFormatting()

		expect(onInput).toHaveBeenCalledTimes(calls)
		host.unmount()
	})
})
