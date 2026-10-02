import '@testing-library/jest-dom/vitest'
import { nextTick, ref } from 'vue'
import BaseCode from '../ui/BaseCode.vue'
import { createUiKitPlugin } from '@/plugin'
import type { BaseCodeExpose } from '../types/BaseCode.types'
import { fireEvent, render, screen } from '@testing-library/vue'

const SAMPLE = "const a = 1\n// comment\nconsole.log('x')"

function root(container: Element): HTMLElement {
	return container.querySelector('.base-code') as HTMLElement
}

function lineTexts(container: Element): string[] {
	return [...container.querySelectorAll('.base-code__text')].map(line => line.textContent ?? '')
}

function numbers(container: Element): string[] {
	return [...container.querySelectorAll('.base-code__number')].map(number => number.textContent ?? '')
}

function stubClipboard(writeText: () => Promise<void>) {
	const spy = vi.fn(writeText)
	vi.stubGlobal('navigator', { clipboard: { writeText: spy } })
	return spy
}

function renderWithRef() {
	const target = ref<BaseCodeExpose | null>(null)
	render({ components: { BaseCode }, setup: () => ({ target }), template: '<BaseCode ref="target" code="a" />' })
	return target
}

afterEach(() => {
	vi.unstubAllGlobals()
	vi.useRealTimers()
})

describe('BaseCode: вывод кода', () => {
	it('показывает код по строкам с номерами и подсветкой по языку', () => {
		const { container } = render(BaseCode, { props: { code: SAMPLE, language: 'ts' } })
		expect(lineTexts(container)).toEqual(['const a = 1', '// comment', "console.log('x')"])
		expect(numbers(container)).toEqual(['1', '2', '3'])
		expect(container.querySelector('.base-code__token--keyword')).toHaveTextContent('const')
		expect(container.querySelector('.base-code__token--comment')).toHaveTextContent('// comment')
		expect(container.querySelector('.base-code__token--function')).toHaveTextContent('log')
	})

	it('номера строк скрыты от скринридера', () => {
		const { container } = render(BaseCode, { props: { code: 'a' } })
		expect(container.querySelector('.base-code__number')).toHaveAttribute('aria-hidden', 'true')
		expect(root(container)).toHaveClass('base-code--numbered')
	})

	it('разметка в коде выводится текстом и не исполняется', () => {
		const code = '<img src=x onerror="alert(1)"><script>1</script>'
		const { container } = render(BaseCode, { props: { code, language: 'html' } })
		expect(container.querySelector('img')).toBeNull()
		expect(container.querySelector('script')).toBeNull()
		expect(lineTexts(container)).toEqual([code])
	})

	it('неизвестный язык — простой текст и название как передано', () => {
		const { container } = render(BaseCode, { props: { code: 'fn main() {}', language: 'rust' } })
		expect(container.querySelector('.base-code__token')).toBeNull()
		expect(container.querySelector('.base-code__title')).toHaveTextContent('rust')
	})

	it('startLine сдвигает номера, highlightLines считаются от него, hasLineNumbers: false — без номеров', async () => {
		const { container, rerender } = render(BaseCode, { props: { code: 'a\nb\nc', startLine: 9, highlightLines: [10] } })
		expect(numbers(container)).toEqual(['9', '10', '11'])
		expect(root(container).style.getPropertyValue('--base-code-number-width')).toBe('2ch')
		const lines = container.querySelectorAll('.base-code__line')
		expect(lines[1]).toHaveClass('base-code__line--highlighted')
		expect(lines[0]).not.toHaveClass('base-code__line--highlighted')
		await rerender({ hasLineNumbers: false })
		expect(container.querySelector('.base-code__number')).toBeNull()
		expect(root(container)).not.toHaveClass('base-code--numbered')
	})

	it('пустой код — сообщение «Кода нет» и без кнопки копирования', () => {
		const { container } = render(BaseCode)
		expect(screen.getByText('Кода нет')).toBeInTheDocument()
		expect(container.querySelector('code')).toBeNull()
		expect(screen.queryByRole('button')).toBeNull()
	})

	it('isWrapped — модификатор переноса строк; maxHeight — наибольшая высота области', () => {
		const { container } = render(BaseCode, { props: { code: 'a', isWrapped: true, maxHeight: 120 } })
		expect(root(container)).toHaveClass('base-code--wrapped')
		expect(container.querySelector('.base-code__pre')).toHaveStyle({ maxHeight: '120px' })
	})
})

describe('BaseCode: заголовок', () => {
	it('название языка по умолчанию, title — вместо него', async () => {
		const { container, rerender } = render(BaseCode, { props: { code: 'a', language: 'py' } })
		const title = () => container.querySelector('.base-code__title')
		expect(title()).toHaveTextContent('Python')
		await rerender({ title: 'main.py' })
		expect(title()).toHaveTextContent('main.py')
	})

	it('слоты title и actions', () => {
		render(BaseCode, {
			props: { code: 'a', title: 'x' },
			slots: { title: '<strong>Из слота</strong>', actions: '<button type="button">Открыть</button>' },
		})
		expect(screen.getByText('Из слота')).toBeInTheDocument()
		expect(screen.queryByText('x')).toBeNull()
		expect(screen.getByRole('button', { name: 'Открыть' })).toBeInTheDocument()
	})

	it('hasCopyButton: false — без кнопки; hasHeader: false — без заголовка', async () => {
		const { container, rerender } = render(BaseCode, { props: { code: 'a', hasCopyButton: false } })
		expect(container.querySelector('.base-code__header')).toBeInTheDocument()
		expect(screen.queryByRole('button')).toBeNull()
		await rerender({ hasHeader: false })
		expect(container.querySelector('.base-code__header')).toBeNull()
	})
})

describe('BaseCode: копирование', () => {
	it('копирует код, меняет надпись, объявляет результат и шлёт copy; через 2 с надпись возвращается', async () => {
		vi.useFakeTimers()
		const writeText = stubClipboard(() => Promise.resolve())
		const { emitted } = render(BaseCode, { props: { code: SAMPLE } })
		await fireEvent.click(screen.getByRole('button', { name: 'Копировать' }))
		await vi.waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Код скопирован в буфер обмена'))
		expect(writeText).toHaveBeenCalledWith(SAMPLE)
		expect(emitted('copy')).toEqual([[{ code: SAMPLE, success: true }]])
		expect(screen.getByRole('button', { name: 'Скопировано' })).toBeInTheDocument()
		vi.advanceTimersByTime(2000)
		await nextTick()
		expect(screen.getByRole('button', { name: 'Копировать' })).toBeInTheDocument()
	})

	it('повторное копирование объявляется заново: статус сначала очищается', async () => {
		stubClipboard(() => Promise.resolve())
		render(BaseCode, { props: { code: 'a' } })
		const status = screen.getByRole('status')
		const button = screen.getByRole('button')
		await fireEvent.click(button)
		await vi.waitFor(() => expect(status).toHaveTextContent('Код скопирован'))
		const texts: string[] = []
		const observer = new MutationObserver(() => texts.push(status.textContent ?? ''))
		observer.observe(status, { childList: true, characterData: true, subtree: true })
		await fireEvent.click(button)
		await vi.waitFor(() => expect(texts.at(-1)).toBe('Код скопирован в буфер обмена'))
		observer.disconnect()
		expect(texts).toContain('')
	})

	it('буфер обмена отказал — «Не удалось скопировать код», надпись не меняется', async () => {
		stubClipboard(() => Promise.reject(new Error('denied')))
		const { emitted } = render(BaseCode, { props: { code: 'a' } })
		await fireEvent.click(screen.getByRole('button', { name: 'Копировать' }))
		await vi.waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Не удалось скопировать код'))
		expect(emitted('copy')).toEqual([[{ code: 'a', success: false }]])
		expect(screen.getByRole('button', { name: 'Копировать' })).toBeInTheDocument()
	})

	it('без Clipboard API — неудача без исключения', async () => {
		vi.stubGlobal('navigator', {})
		const target = renderWithRef()
		await expect(target.value!.copy()).resolves.toBe(false)
	})

	it('метод copy() через ref возвращает результат', async () => {
		stubClipboard(() => Promise.resolve())
		const target = renderWithRef()
		await expect(target.value!.copy()).resolves.toBe(true)
	})

	it('размонтирование сбрасывает таймер надписи', async () => {
		stubClipboard(() => Promise.resolve())
		const { unmount } = render(BaseCode, { props: { code: 'a' } })
		await fireEvent.click(screen.getByRole('button'))
		await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Скопировано' })).toBeInTheDocument())
		const clear = vi.spyOn(globalThis, 'clearTimeout')
		unmount()
		expect(clear).toHaveBeenCalled()
	})
})

describe('BaseCode: прокрутка и доступность', () => {
	it('область без прокрутки — без tabindex и роли', async () => {
		const { container } = render(BaseCode, { props: { code: 'a' } })
		await nextTick()
		const pre = container.querySelector('.base-code__pre')
		expect(pre).not.toHaveAttribute('tabindex')
		expect(pre).not.toHaveAttribute('role')
	})

	it('длинные строки — область получает фокус с клавиатуры, роль region и имя «Код, <язык>»', async () => {
		vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(800)
		vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300)
		const { container } = render(BaseCode, { props: { code: 'const veryLongLine = 1', language: 'js' } })
		await nextTick()
		const pre = container.querySelector('.base-code__pre')
		expect(pre).toHaveAttribute('tabindex', '0')
		expect(pre).toHaveAttribute('role', 'region')
		expect(pre).toHaveAttribute('aria-label', 'Код, JavaScript')
	})

	it('имя области: без языка — «Код», label — своё', async () => {
		vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(800)
		vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(300)
		const { container, rerender } = render(BaseCode, { props: { code: 'a' } })
		await nextTick()
		const pre = container.querySelector('.base-code__pre')
		expect(pre).toHaveAttribute('aria-label', 'Код')
		await rerender({ label: 'Пример установки' })
		expect(pre).toHaveAttribute('aria-label', 'Пример установки')
	})
})

describe('BaseCode: оформление и настройки', () => {
	it('модификатор варианта, --size-scale и customClass', () => {
		const customClass = { root: 'my-root', header: 'my-header', pre: 'my-pre', line: 'my-line' }
		const { container } = render(BaseCode, { props: { code: 'a', variant: 'soft', sizeScale: 125, customClass } })
		expect(root(container)).toHaveClass('base-code--soft', 'my-root')
		expect(root(container).style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(container.querySelector('.base-code__header')).toHaveClass('my-header')
		expect(container.querySelector('.base-code__pre')).toHaveClass('my-pre')
		expect(container.querySelector('.base-code__line')).toHaveClass('my-line')
	})

	it('значения по умолчанию переопределяются настройками плагина', () => {
		const { container } = render(BaseCode, {
			props: { code: 'a' },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseCode: { hasLineNumbers: false, hasCopyButton: false } } })] },
		})
		expect(container.querySelector('.base-code__number')).toBeNull()
		expect(screen.queryByRole('button')).toBeNull()
	})
})
