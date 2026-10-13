import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseMarkdown from '../ui/BaseMarkdown.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const SOURCE = [
	'## Итоги',
	'',
	'Текст с [ссылкой](https://example.com) и [внутренней](/docs), `кодом` и ~~старым~~.',
	'',
	'1. Первый',
	'2. **Второй**',
	'',
	'- [x] сделано',
	'- [ ] план',
	'',
	'> Цитата',
	'',
	'```ts',
	'const a = 1',
	'```',
	'',
	'| Имя | Счёт |',
	'| :-- | --: |',
	'| Анна | 10 |',
	'',
	'![Кот](/cat.png)',
	'',
	'***',
	'',
	'5. пять',
].join('\n')

describe('BaseMarkdown', () => {
	it('значения по умолчанию из плагина (defaults.BaseMarkdown) действуют', () => {
		const { container } = render(BaseMarkdown, {
			global: { plugins: [createUiKitPlugin({ defaults: { BaseMarkdown: { source: 'Из плагина', isStreaming: true } } })] },
		})

		expect(screen.getByText('Из плагина')).toBeInTheDocument()
		expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true')
	})

	it('props перекрывают defaults плагина', () => {
		render(BaseMarkdown, {
			props: { source: 'Свой' },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseMarkdown: { source: 'Из плагина' } } })] },
		})

		expect(screen.getByText('Свой')).toBeInTheDocument()
		expect(screen.queryByText('Из плагина')).not.toBeInTheDocument()
	})

	afterEach(() => {
		Reflect.deleteProperty(navigator, 'clipboard')
		vi.useRealTimers()
	})

	it('рендерит разметку элементами, без HTML-строк', () => {
		const { container } = render(BaseMarkdown, { props: { source: SOURCE } })

		expect(screen.getByRole('heading', { level: 2, name: 'Итоги' })).toBeInTheDocument()
		expect(screen.getByRole('link', { name: /^ссылкой\s*\(откроется в новой вкладке\)$/ })).toHaveAttribute('target', '_blank')
		expect(screen.getByRole('link', { name: /^ссылкой\s*\(откроется в новой вкладке\)$/ })).toHaveAttribute(
			'rel',
			'noopener noreferrer',
		)
		expect(screen.getByRole('link', { name: 'внутренней' })).not.toHaveAttribute('target')
		expect(container.querySelector('code.base-markdown__code')).toHaveTextContent('кодом')
		expect(container.querySelector('del')).toHaveTextContent('старым')
		expect(container.querySelector('ol strong')).toHaveTextContent('Второй')
		expect(screen.getByRole('checkbox', { name: 'Выполнено' })).toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'Выполнено' })).toHaveAttribute('aria-readonly', 'true')
		expect(screen.getByRole('checkbox', { name: 'Выполнено' })).toHaveAttribute('tabindex', '-1')
		expect(screen.getByRole('checkbox', { name: 'Не выполнено' })).not.toBeChecked()
		expect(container.querySelector('blockquote')).toHaveTextContent('Цитата')
		expect(container.querySelector('pre')).toHaveTextContent('const a = 1')
		expect(container.querySelector('.base-markdown__code-lang')).toHaveTextContent('ts')
		expect(screen.getByRole('columnheader', { name: 'Счёт' })).toHaveStyle({ textAlign: 'right' })
		expect(screen.getByRole('cell', { name: 'Анна' })).toHaveStyle({ textAlign: 'left' })
		expect(screen.getByRole('img', { name: 'Кот' })).toHaveAttribute('src', '/cat.png')
		expect(container.querySelector('hr')).toBeInTheDocument()
		expect(container.querySelectorAll('ol')[1]).toHaveAttribute('start', '5')
		expect(container.querySelectorAll('ol')[0]).not.toHaveAttribute('start')
	})

	it('потоковый ответ: курсор в конце и aria-busy; после ответа курсора нет', async () => {
		const { container, rerender } = render(BaseMarkdown, { props: { source: 'Думаю', isStreaming: true } })
		const root = container.querySelector('.base-markdown') as HTMLElement

		expect(root).toHaveAttribute('aria-busy', 'true')
		expect(root).toHaveClass('base-markdown--streaming')
		expect(container.querySelector('p .base-markdown__caret')).toHaveAttribute('aria-hidden', 'true')
		await rerender({ source: '```js\nlet x', isStreaming: true })
		expect(container.querySelector('pre .base-markdown__caret')).toBeInTheDocument()
		await rerender({ source: 'Готово', isStreaming: false })
		expect(root).not.toHaveAttribute('aria-busy')
		expect(container.querySelector('.base-markdown__caret')).toBeNull()
	})

	it('одиночный перевод строки — перенос; без has-line-breaks — пробел', async () => {
		const { container, rerender } = render(BaseMarkdown, { props: { source: 'раз\nдва' } })
		expect(container.querySelector('br')).toBeInTheDocument()
		await rerender({ hasLineBreaks: false })
		expect(container.querySelector('br')).toBeNull()
		expect(container.querySelector('p')).toHaveTextContent('раз два')
	})

	it('блок кода подсвечивается по языку; неизвестный язык и разметка в коде — простой текст', () => {
		const source = '```ts\nconst a = 1 // c\n```\n\n```txt\n<b>x</b>\n```'
		const { container } = render(BaseMarkdown, { props: { source } })
		const [ts, plain] = container.querySelectorAll('pre')
		expect(ts!.querySelector('.base-markdown__token--keyword')).toHaveTextContent('const')
		expect(ts!.querySelector('.base-markdown__token--number')).toHaveTextContent('1')
		expect(ts!.querySelector('.base-markdown__token--comment')).toHaveTextContent('// c')
		expect(ts).toHaveTextContent('const a = 1 // c')
		expect(plain!.querySelector('.base-markdown__token')).toBeNull()
		expect(plain!.querySelector('b')).toBeNull()
		expect(plain).toHaveTextContent('<b>x</b>')
	})

	it('«Копировать» у блока кода: «Скопировано» на 2 с; без буфера обмена надпись не меняется', async () => {
		vi.useFakeTimers()
		const writeText = vi.fn(async (_text: string) => undefined)
		Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
		const { container, unmount } = render(BaseMarkdown, { props: { source: '```\nx = 1\n```' } })
		const button = screen.getByRole('button', { name: 'Копировать код' })

		expect(container.querySelector('.base-markdown__code-lang')).toHaveTextContent('Код')
		await fireEvent.click(button)
		await Promise.resolve()
		await nextTick()
		expect(writeText).toHaveBeenCalledWith('x = 1')
		expect(button).toHaveTextContent('Скопировано')
		expect(button).toHaveAccessibleName('Скопировано')
		await fireEvent.click(button)
		await Promise.resolve()
		vi.advanceTimersByTime(2000)
		await nextTick()
		expect(button).toHaveTextContent('Копировать')

		writeText.mockRejectedValueOnce(new Error('denied'))
		await fireEvent.click(button)
		await Promise.resolve()
		await nextTick()
		expect(button).toHaveTextContent('Копировать')
		Reflect.deleteProperty(navigator, 'clipboard')
		await fireEvent.click(button)
		await nextTick()
		expect(button).toHaveTextContent('Копировать')
		unmount()
	})

	it('«Копировать» у блока кода объявляет результат в role="status" после монтирования', async () => {
		const writeText = vi.fn(async (_text: string) => undefined)
		Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
		render(BaseMarkdown, { props: { source: '```js\nx = 1\n```' } })
		const status = screen.getByRole('status')
		const button = screen.getByRole('button', { name: 'Копировать код: js' })

		expect(status).toHaveTextContent('')
		await fireEvent.click(button)
		await vi.waitFor(() => expect(status).toHaveTextContent('Код скопирован в буфер обмена'))

		writeText.mockRejectedValueOnce(new Error('denied'))
		await fireEvent.click(button)
		await vi.waitFor(() => expect(status).toHaveTextContent('Не удалось скопировать код'))
		Reflect.deleteProperty(navigator, 'clipboard')
	})

	it('вариант, масштаб и customClass', () => {
		const { container } = render(BaseMarkdown, { props: { variant: 'soft', sizeScale: 125, customClass: { root: 'my-root' } } })
		const root = container.querySelector('.base-markdown') as HTMLElement

		expect(root).toHaveClass('base-markdown--soft', 'my-root')
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(root.children).toHaveLength(0)
		expect(root).toHaveTextContent('')
	})
})
