/**
 * Integration-тесты для BaseEditor.
 */

import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { fireEvent, render } from '@testing-library/vue'
import BaseEditor from '../ui/BaseEditor.vue'

/** Получить contenteditable-область редактора */
function getContent(container: Element): HTMLElement {
	const content = container.querySelector('.base-editor__content')
	if (!(content instanceof HTMLElement)) throw new Error('Editor content not found')
	return content
}

/**
 * Имитирует ввод символа в конец текстового узла: браузер сначала меняет текст,
 * ставит каретку после введённого символа, затем генерирует событие input.
 */
async function typeAtEnd(content: HTMLElement, textNode: Text, char: string): Promise<void> {
	textNode.textContent = `${textNode.textContent ?? ''}${char}`
	const range = document.createRange()
	range.setStart(textNode, textNode.length)
	range.collapse(true)
	const selection = window.getSelection()
	if (!selection) throw new Error('Selection API unavailable')
	selection.removeAllRanges()
	selection.addRange(range)
	await fireEvent.input(content)
}

/** Элементы редактора с inline-обработчиками событий (onerror, onclick и т.п.) */
function findElementsWithHandlers(root: HTMLElement): Element[] {
	return Array.from(root.querySelectorAll('*')).filter(element =>
		Array.from(element.attributes).some(attribute => attribute.name.toLowerCase().startsWith('on')),
	)
}

describe('BaseEditor integration', () => {
	it('должен эмитить update:modelValue при вводе в contenteditable', async () => {
		const { container, emitted } = render(BaseEditor, {
			props: { modelValue: '' },
		})

		const editor = container.querySelector('.base-editor__content')
		if (!editor) throw new Error('Editor not found')

		editor.innerHTML = 'Hello'
		await fireEvent.input(editor)

		expect(emitted()).toHaveProperty('update:modelValue')
		expect(emitted()['update:modelValue'][0]).toEqual(['Hello'])
	})

	describe('безопасность конвертации набранного inline-HTML', () => {
		it('экранированный в modelValue HTML остаётся текстом после ввода символа, литерал </div> сохраняется', async () => {
			const { container, emitted } = render(BaseEditor, {
				props: {
					modelValue:
						'<p>Исправьте: &lt;img src=x onerror=alert(1)&gt;&lt;/b&gt;</p>' +
						'<p>&lt;img src=x onerror=alert(1)&gt;</p>' +
						'<p>Закройте блок тегом &lt;/div&gt; в конце</p>',
				},
			})
			const content = getContent(container)
			const paragraphs = Array.from(content.querySelectorAll('p'))

			for (const paragraph of paragraphs) {
				const textNode = paragraph.firstChild
				if (!(textNode instanceof Text)) throw new Error('Paragraph text node not found')
				await typeAtEnd(content, textNode, '!')
			}

			expect(content.querySelector('img')).toBeNull()
			expect(findElementsWithHandlers(content)).toHaveLength(0)
			expect(paragraphs.map(paragraph => paragraph.textContent)).toEqual([
				'Исправьте: <img src=x onerror=alert(1)></b>!',
				'<img src=x onerror=alert(1)>!',
				'Закройте блок тегом </div> в конце!',
			])
			const updates = emitted()['update:modelValue'] as string[][]
			const lastValue = updates[updates.length - 1][0]
			expect(lastValue).not.toMatch(/<img|onerror="/)
			expect(lastValue).toContain('&lt;/div&gt;')
		})

		it('не переносит атрибуты из набранного тега в живую разметку', async () => {
			const { container } = render(BaseEditor, { props: { modelValue: '<p>Текст</p>' } })
			const content = getContent(container)
			const textNode = content.querySelector('p')?.firstChild
			if (!(textNode instanceof Text)) throw new Error('Paragraph text node not found')

			await typeAtEnd(content, textNode, ' <b onclick="alert(1)">жирный</b>')

			expect(content.querySelector('b')).toBeNull()
			expect(findElementsWithHandlers(content)).toHaveLength(0)
			expect(content.textContent).toBe('Текст <b onclick="alert(1)">жирный</b>')
		})

		it('набранная пара разрешённого тега форматирования превращается в элемент без исполнения разметки', async () => {
			const { container } = render(BaseEditor, { props: { modelValue: '<p>Текст</p>' } })
			const content = getContent(container)
			const textNode = content.querySelector('p')?.firstChild
			if (!(textNode instanceof Text)) throw new Error('Paragraph text node not found')

			await typeAtEnd(content, textNode, ' <b>&lt;img src=x onerror=1&gt;</b>')

			const bold = content.querySelector('b')
			expect(bold).not.toBeNull()
			expect(bold?.attributes).toHaveLength(0)
			expect(bold?.textContent).toBe('&lt;img src=x onerror=1&gt;')
			expect(content.querySelector('img')).toBeNull()
		})
	})

	describe('очистка HTML', () => {
		/** Событие вставки с содержимым буфера обмена: в jsdom нет DataTransfer и ClipboardEvent с данными */
		function createPasteEvent(data: Record<string, string>): Event {
			const event = new Event('paste', { bubbles: true, cancelable: true })
			Object.defineProperty(event, 'clipboardData', { value: { getData: (type: string) => data[type] ?? '' } })
			return event
		}

		/** Событие drop с HTML из другой страницы */
		function createDropEvent(html: string): Event {
			const event = new Event('drop', { bubbles: true, cancelable: true })
			Object.defineProperty(event, 'dataTransfer', { value: { getData: (type: string) => (type === 'text/html' ? html : '') } })
			return event
		}

		function mockExecCommand() {
			const execCommand = vi.fn(() => true)
			Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand })
			return execCommand
		}

		it('показывает modelValue без скриптов и обработчиков событий', () => {
			const { container } = render(BaseEditor, {
				props: {
					modelValue: '<p>Фото<img src="https://example.com/a.png" onerror="alert(1)" alt="фото"><script>alert(2)</script></p>',
				},
			})
			const content = getContent(container)

			expect(content.innerHTML).toBe('<p>Фото<img src="https://example.com/a.png" alt="фото"></p>')
		})

		it('очищает новое значение modelValue', async () => {
			const { container, rerender } = render(BaseEditor, { props: { modelValue: '<p>Текст</p>' } })

			await rerender({ modelValue: '<p><a href="javascript:alert(1)">ссылка</a></p>' })

			expect(getContent(container).innerHTML).toBe('<p><a>ссылка</a></p>')
		})

		it('отправляет в update:modelValue очищенный HTML', async () => {
			const { container, emitted } = render(BaseEditor, { props: { modelValue: '' } })
			const content = getContent(container)

			content.innerHTML = '<p onclick="alert(1)">Текст</p>'
			await fireEvent.input(content)

			expect(emitted()['update:modelValue'][0]).toEqual(['<p>Текст</p>'])
		})

		it('вставляет HTML из буфера обмена очищенным', () => {
			const execCommand = mockExecCommand()
			const { container } = render(BaseEditor, { props: { modelValue: '' } })
			const event = createPasteEvent({
				'text/html': '<!--StartFragment--><b onmouseover="alert(1)">жирный</b><style>p{}</style>',
				'text/plain': 'жирный',
			})

			getContent(container).dispatchEvent(event)

			expect(event.defaultPrevented).toBe(true)
			expect(execCommand).toHaveBeenCalledWith('insertHTML', false, '<b>жирный</b>')
		})

		it('вставляет простой текст как текст с переносами строк', () => {
			const execCommand = mockExecCommand()
			const { container } = render(BaseEditor, { props: { modelValue: '' } })

			getContent(container).dispatchEvent(createPasteEvent({ 'text/plain': 'Строка <b>1</b>\nСтрока 2' }))

			expect(execCommand).toHaveBeenCalledWith('insertHTML', false, 'Строка &lt;b&gt;1&lt;/b&gt;<br>Строка 2')
		})

		it('не перехватывает вставку без текста и HTML (например, файлы)', () => {
			const execCommand = mockExecCommand()
			const { container } = render(BaseEditor, { props: { modelValue: '' } })
			const event = createPasteEvent({})

			getContent(container).dispatchEvent(event)

			expect(event.defaultPrevented).toBe(false)
			expect(execCommand).not.toHaveBeenCalled()
		})

		it('вставляет перетащенный HTML очищенным', () => {
			const execCommand = mockExecCommand()
			const { container } = render(BaseEditor, { props: { modelValue: '' } })
			const event = createDropEvent('<img src="x" onerror="alert(1)">')

			getContent(container).dispatchEvent(event)

			expect(event.defaultPrevented).toBe(true)
			expect(execCommand).toHaveBeenCalledWith('insertHTML', false, '<img src="x">')
		})

		it('не перехватывает перетаскивание внутри редактора', async () => {
			const execCommand = mockExecCommand()
			const { container } = render(BaseEditor, { props: { modelValue: '<p>Текст</p>' } })
			const content = getContent(container)
			await fireEvent.dragStart(content)
			const event = createDropEvent('<p>Текст</p>')

			content.dispatchEvent(event)

			expect(event.defaultPrevented).toBe(false)
			expect(execCommand).not.toHaveBeenCalled()
		})

		it('использует свою функцию sanitize', async () => {
			const sanitize = vi.fn(() => '<p>очищено</p>')
			const { container, emitted } = render(BaseEditor, { props: { modelValue: '<p>исходный</p>', sanitize } })
			const content = getContent(container)

			expect(content.innerHTML).toBe('<p>очищено</p>')
			content.innerHTML = '<p>новый</p>'
			await fireEvent.input(content)
			expect(sanitize).toHaveBeenLastCalledWith('<p>новый</p>')
			expect(emitted()['update:modelValue'][0]).toEqual(['<p>очищено</p>'])
		})

		it('функция html => html отключает очистку для доверенного HTML', () => {
			const { container } = render(BaseEditor, {
				props: { modelValue: '<p class="lead" data-id="1">Текст</p>', sanitize: (html: string) => html },
			})

			expect(getContent(container).innerHTML).toBe('<p class="lead" data-id="1">Текст</p>')
		})
	})

	describe('горячие клавиши', () => {
		it('Ctrl+B в области текста делает текст жирным вместо действия браузера и отправляет v-model', async () => {
			// execCommand в jsdom нет: проверяем, что редактор вызывает нужную команду
			const execCommand = vi.fn(() => true)
			Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand })
			const { container, emitted } = render(BaseEditor, { props: { modelValue: '<p>Текст</p>' } })
			const event = new KeyboardEvent('keydown', { key: 'b', code: 'KeyB', ctrlKey: true, bubbles: true, cancelable: true })

			getContent(container).dispatchEvent(event)
			await nextTick()

			expect(event.defaultPrevented).toBe(true)
			expect(execCommand).toHaveBeenCalledWith('bold', false)
			expect(emitted()['update:modelValue']).toBeTruthy()
		})
	})

	describe('режим только для чтения', () => {
		it('не открывает контекстное меню медиа и не меняет v-model по правому клику на изображении', async () => {
			const { container, emitted } = render(BaseEditor, {
				props: {
					isReadonly: true,
					modelValue: '<p><img src="https://example.com/photo.png" alt="Фото"></p>',
				},
			})
			const image = getContent(container).querySelector('img')
			if (!image) throw new Error('Image not found')

			const isDefaultAllowed = image.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
			await nextTick()

			// Нативное меню браузера («Сохранить изображение») остаётся доступным
			expect(isDefaultAllowed).toBe(true)
			expect(document.body.querySelector('.base-editor__context-menu')).toBeNull()
			expect(getContent(container).querySelector('img')).not.toBeNull()
			expect(emitted()['update:modelValue']).toBeUndefined()
		})
	})
})
