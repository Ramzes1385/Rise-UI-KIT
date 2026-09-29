import '@testing-library/jest-dom/vitest'
import BaseToolCall from '../ui/BaseToolCall.vue'
import { formatToolValue } from '../model/useBaseToolCall'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BaseToolCall', () => {
	it('заголовок: название, имя инструмента и состояние словом; подробности свёрнуты', () => {
		const { container } = render(BaseToolCall, {
			props: { name: 'search_docs', title: 'Поиск', status: 'success', args: { q: 'тема' }, result: 'Найдено 2' },
		})
		const trigger = screen.getByRole('button', { name: 'Поиск search_docs Готово' })
		const collapse = container.querySelector('.base-tool-call__collapse') as HTMLElement

		expect(trigger).toHaveAttribute('aria-expanded', 'false')
		expect(trigger).toHaveAttribute('aria-controls', collapse.id)
		expect(collapse).toHaveAttribute('inert')
		expect(container.querySelector('.base-tool-call')).toHaveClass('base-tool-call--success')
		expect(container.querySelectorAll('pre')[0]).toHaveTextContent('{ "q": "тема" }')
		expect(container.querySelectorAll('pre')[1]).toHaveTextContent('Найдено 2')
		expect(container.querySelector('.base-tool-call__status .base-icon use')).toHaveAttribute(
			'href',
			expect.stringContaining('check-circle'),
		)
	})

	it('без title — имя в заголовке; pending по умолчанию; без args и result — секций нет', () => {
		const { container } = render(BaseToolCall, { props: { name: 'ping' } })

		expect(screen.getByRole('button', { name: 'ping Ожидает' })).toBeInTheDocument()
		expect(container.querySelector('code')).toBeNull()
		expect(container.querySelector('.base-tool-call__section')).toBeNull()
	})

	it('running — индикатор вместо значка; error — текст ошибки', () => {
		const { container, rerender } = render(BaseToolCall, { props: { name: 'run', status: 'running' } })

		expect(screen.getByRole('button', { name: 'run Выполняется' })).toBeInTheDocument()
		expect(container.querySelector('.base-tool-call__spinner')).toBeInTheDocument()
		return rerender({ status: 'error', error: 'Таймаут' }).then(() => {
			expect(screen.getByRole('button', { name: 'run Ошибка' })).toBeInTheDocument()
			expect(container.querySelector('.base-tool-call__error')).toHaveTextContent('Таймаут')
		})
	})

	it('кнопка раскрывает и сворачивает, v-model:is-open задаёт состояние снаружи', async () => {
		const { container, emitted, rerender } = render(BaseToolCall, { props: { name: 'ping', result: 1 } })
		const trigger = screen.getByRole('button')

		await fireEvent.click(trigger)
		expect(trigger).toHaveAttribute('aria-expanded', 'true')
		expect(container.querySelector('.base-tool-call')).toHaveClass('base-tool-call--open')
		expect(container.querySelector('.base-tool-call__collapse')).not.toHaveAttribute('inert')
		await fireEvent.click(trigger)
		expect(emitted('update:isOpen')).toEqual([[true], [false]])
		await rerender({ isOpen: true })
		expect(trigger).toHaveAttribute('aria-expanded', 'true')
	})

	it('слоты output и default', () => {
		render(BaseToolCall, {
			props: { name: 'list', result: [1, 2] },
			slots: {
				output: '<template #output="{ result }"><b>Всего: {{ result.length }}</b></template>',
				default: '<button type="button">Разрешить</button>',
			},
		})

		expect(screen.getByText('Всего: 2')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Разрешить', hidden: true })).toBeInTheDocument()
	})

	it('вариант, масштаб и customClass', () => {
		const { container } = render(BaseToolCall, {
			props: {
				name: 'ping',
				variant: 'ghost',
				sizeScale: 125,
				customClass: { root: 'my-root', trigger: 'my-trigger', content: 'my-content' },
			},
		})
		const root = container.querySelector('.base-tool-call') as HTMLElement

		expect(root).toHaveClass('base-tool-call--ghost', 'my-root')
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(container.querySelector('.base-tool-call__trigger')).toHaveClass('my-trigger')
		expect(container.querySelector('.base-tool-call__content')).toHaveClass('my-content')
	})

	it('formatToolValue: строка как есть, JSON, недоступное для JSON — строкой', () => {
		const circular: Record<string, unknown> = {}
		circular.self = circular

		expect(formatToolValue(undefined)).toBeNull()
		expect(formatToolValue('текст')).toBe('текст')
		expect(formatToolValue(null)).toBe('null')
		expect(formatToolValue({ a: 1 })).toBe('{\n  "a": 1\n}')
		expect(formatToolValue(() => 1)).toBe('() => 1')
		expect(formatToolValue(circular)).toBe('[object Object]')
	})
})
