import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { findSelectedMedia } from '../helpers/mediaMenu'
import { useToolbarMediaMenu } from '../useToolbarMediaMenu'

function createEditor(html: string): HTMLDivElement {
	const editor = document.createElement('div')
	editor.innerHTML = html
	document.body.append(editor)
	return editor
}

function select(container: Node, [start, end]: [number, number], endContainer: Node = container): void {
	const range = document.createRange()
	range.setStart(container, start)
	range.setEnd(endContainer, end)
	const selection = window.getSelection() as Selection
	selection.removeAllRanges()
	selection.addRange(range)
}

function withMenu(editor: HTMLDivElement | null, isReadonly?: () => boolean) {
	let result!: ReturnType<typeof useToolbarMediaMenu>
	mount({
		setup() {
			result = useToolbarMediaMenu({ editorRef: ref(editor), onInput: vi.fn(), isReadonly })
			return () => null
		},
	})
	return result
}

describe('findSelectedMedia', () => {
	afterEach(() => {
		document.body.innerHTML = ''
		window.getSelection()?.removeAllRanges()
	})

	it('находит изображение и видео, выделенные целиком', () => {
		const editor = createEditor('<p>a<img src="x.png" alt="">b<video src="v.mp4"></video></p>')
		const paragraph = editor.querySelector('p') as HTMLElement

		select(paragraph, [1, 2])
		expect(findSelectedMedia(editor)?.tagName).toBe('IMG')
		select(paragraph, [3, 4])
		expect(findSelectedMedia(editor)?.tagName).toBe('VIDEO')
	})

	it('текст, пустое выделение и несколько узлов — не медиа', () => {
		const editor = createEditor('<p>a<img src="x.png" alt="">b</p>')
		const paragraph = editor.querySelector('p') as HTMLElement

		select(paragraph, [0, 1])
		expect(findSelectedMedia(editor)).toBeNull()
		select(paragraph, [1, 3])
		expect(findSelectedMedia(editor)).toBeNull()
		select(paragraph, [1, 1], paragraph.lastChild as Node)
		expect(findSelectedMedia(editor)).toBeNull()
		window.getSelection()?.removeAllRanges()
		expect(findSelectedMedia(editor)).toBeNull()
	})

	it('выделение вне редактора и отсутствие редактора — не медиа', () => {
		const editor = createEditor('<p>a</p>')
		const outside = createEditor('<p><img src="y.png" alt=""></p>')

		select(outside.querySelector('p') as HTMLElement, [0, 1])

		expect(findSelectedMedia(editor)).toBeNull()
		expect(findSelectedMedia(null)).toBeNull()
	})
})

describe('useToolbarMediaMenu: меню выделенного медиа', () => {
	afterEach(() => {
		document.body.innerHTML = ''
		window.getSelection()?.removeAllRanges()
	})

	it('запоминает выделенное медиа и открывает меню под ним', () => {
		const editor = createEditor('<p><img src="x.png" alt=""></p>')
		const menu = withMenu(editor)
		select(editor.querySelector('p') as HTMLElement, [0, 1])

		menu.refreshMediaSelection()
		menu.openSelectedMediaMenu()

		expect(menu.selectedMedia.value?.tagName).toBe('IMG')
		expect(menu.contextMenu.isVisible).toBe(true)
		expect(menu.contextMenu.element).toBe(menu.selectedMedia.value)
	})

	it('без выделенного, удалённого из документа медиа и в режиме чтения меню не открывается', () => {
		const editor = createEditor('<p><img src="x.png" alt=""></p>')
		const readonly = ref(false)
		const menu = withMenu(editor, () => readonly.value)

		menu.openSelectedMediaMenu()
		expect(menu.contextMenu.isVisible).toBe(false)

		select(editor.querySelector('p') as HTMLElement, [0, 1])
		menu.refreshMediaSelection()
		readonly.value = true
		menu.openSelectedMediaMenu()
		expect(menu.contextMenu.isVisible).toBe(false)

		readonly.value = false
		editor.querySelector('img')?.remove()
		menu.openSelectedMediaMenu()
		expect(menu.contextMenu.isVisible).toBe(false)
	})
})
