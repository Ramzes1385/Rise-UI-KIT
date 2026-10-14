import { ref } from 'vue'
import { useEditorState } from '../useEditorState'

function createState(root: HTMLDivElement | null = document.createElement('div')) {
	const editorRef = ref<HTMLDivElement | null>(root)
	const handlers = { applyColor: vi.fn(), applyBackgroundColor: vi.fn(), resetColor: vi.fn(), resetBackgroundColor: vi.fn() }
	return { editorRef, handlers, state: useEditorState({ editorRef, ...handlers }) }
}

describe('useEditorState', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('пустое содержимое: без текста и без медиа; без области текста — тоже пусто', () => {
		const { editorRef, state } = createState()
		state.checkEmpty()
		expect(state.isEmpty.value).toBe(true)

		editorRef.value!.innerHTML = '<p>  </p>'
		state.checkEmpty()
		expect(state.isEmpty.value).toBe(true)

		editorRef.value = null
		state.isEmpty.value = false
		state.checkEmpty()
		expect(state.isEmpty.value).toBe(true)
	})

	it.each(['<p><img src="a.png" alt=""></p>', '<video src="a.mp4"></video>', '<hr>', '<p><span data-editor-upload="1"></span></p>'])(
		'медиа %s делает содержимое непустым',
		html => {
			const { editorRef, state } = createState()
			editorRef.value!.innerHTML = html

			state.checkEmpty()

			expect(state.isEmpty.value).toBe(false)
		},
	)

	it('текст непустой', () => {
		const { editorRef, state } = createState()
		editorRef.value!.textContent = 'Текст'

		state.checkEmpty()

		expect(state.isEmpty.value).toBe(false)
	})

	it('цвет текста берётся из стилей области; без цвета остаётся прежним; выбранный цвет не затирается', () => {
		const { editorRef, state } = createState()
		const style = vi.spyOn(window, 'getComputedStyle')
		style.mockReturnValue({ color: 'rgb(10, 20, 30)' } as CSSStyleDeclaration)

		state.refreshTextColor()
		expect(state.textColor.value).toBe('#0a141e')

		style.mockReturnValue({ color: '' } as CSSStyleDeclaration)
		state.refreshTextColor()
		expect(state.textColor.value).toBe('#0a141e')

		style.mockReturnValue({ color: 'rgb(200, 200, 200)' } as CSSStyleDeclaration)
		state.handleTextColor('#ff0000')
		state.refreshTextColor()
		expect(state.textColor.value).toBe('#0a141e')

		editorRef.value = null
		state.resetTextColor()
		state.refreshTextColor()
		expect(state.textColor.value).toBe('#0a141e')
	})

	it('цвета: применение и сброс делегируются тулбару и включают/выключают признак активности', () => {
		const { handlers, state } = createState()

		state.handleTextColor('#111111')
		state.handleBackgroundColor('#222222')
		expect(handlers.applyColor).toHaveBeenCalledWith('#111111')
		expect(handlers.applyBackgroundColor).toHaveBeenCalledWith('#222222')
		expect(state.isTextColorActive.value).toBe(true)
		expect(state.isBackgroundColorActive.value).toBe(true)

		state.resetTextColor()
		state.resetBackgroundColor()
		expect(handlers.resetColor).toHaveBeenCalled()
		expect(handlers.resetBackgroundColor).toHaveBeenCalled()
		expect(state.isTextColorActive.value).toBe(false)
		expect(state.isBackgroundColorActive.value).toBe(false)
	})
})
