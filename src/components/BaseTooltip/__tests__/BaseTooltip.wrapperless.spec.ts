import '@testing-library/jest-dom/vitest'
import { defineComponent, h } from 'vue'
import BaseTooltip from '../ui/BaseTooltip.vue'
import { BaseButton } from '@components/BaseButton'
import { render, screen } from '@testing-library/vue'

afterEach(() => {
	vi.useRealTimers()
})

describe('BaseTooltip без обёртки', () => {
	it('не создаёт span: корень — элемент слота, class и атрибуты тултипа идут на него', () => {
		const { container } = render(BaseTooltip, {
			props: { text: 'Подсказка', isWrapperless: true },
			attrs: { class: 'app-class', 'data-x': '1' },
			slots: { default: '<button type="button" class="own">Цель</button>' },
		})

		const button = screen.getByRole('button', { name: 'Цель' })
		expect(container.querySelector('.base-tooltip')).toBeNull()
		expect(container.firstElementChild).toBe(button)
		expect(button).toHaveClass('own', 'app-class')
		expect(button).toHaveAttribute('data-x', '1')
	})

	it('показывает подсказку по наведению и фокусу, описывает триггер и сохраняет чужой aria-describedby', async () => {
		vi.useFakeTimers()
		render(BaseTooltip, {
			props: { text: 'Сохранить черновик', isWrapperless: true },
			slots: { default: '<button type="button" aria-describedby="own-hint">Сохранить</button>' },
		})
		const button = screen.getByRole('button')
		expect(button).toHaveAttribute('aria-describedby', 'own-hint')

		button.focus()
		await vi.advanceTimersByTimeAsync(200)
		const tooltip = screen.getByRole('tooltip')
		expect(button.getAttribute('aria-describedby')).toBe(`own-hint ${tooltip.id}`)

		button.blur()
		await vi.advanceTimersByTimeAsync(300)
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
		expect(button).toHaveAttribute('aria-describedby', 'own-hint')
	})

	it('работает с компонентом в слоте: события и aria на его корневом элементе', async () => {
		vi.useFakeTimers()
		render(BaseTooltip, {
			props: { text: 'Подсказка', isWrapperless: true },
			slots: { default: () => h(BaseButton, null, () => 'Кнопка') },
		})
		const button = screen.getByRole('button', { name: 'Кнопка' })

		button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
		button.dispatchEvent(new MouseEvent('mouseenter'))
		await vi.advanceTimersByTimeAsync(200)
		expect(screen.getByRole('tooltip')).toBeInTheDocument()
		expect(button).toHaveAttribute('aria-describedby', screen.getByRole('tooltip').id)
	})

	it('берёт первый элемент слота, комментарии и текст пропускает; пустой слот — только подсказка без ошибок', async () => {
		vi.useFakeTimers()
		const Target = defineComponent({ setup: () => () => [h('button', { type: 'button' }, 'А'), h('button', { type: 'button' }, 'Б')] })
		render(BaseTooltip, {
			props: { text: 'Подсказка', isWrapperless: true, isAlwaysVisible: true },
			slots: { default: () => ['  ', h('span', 'Первый'), h(Target)] },
		})
		expect(screen.getByText('Первый')).toBeInTheDocument()
		await vi.advanceTimersByTimeAsync(50)
		expect(screen.getByText('Первый')).toHaveAttribute('aria-describedby', screen.getByRole('tooltip').id)
	})

	it('корень слота не элемент (текст) — предупреждение один раз, без падения', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const TextRoot = defineComponent({ setup: () => () => 'просто текст' })
		const { rerender } = render(BaseTooltip, {
			props: { text: 'Подсказка', isWrapperless: true },
			slots: { default: () => h(TextRoot) },
		})
		await rerender({ text: 'Другая' })
		expect(warn.mock.calls.map(call => String(call[0])).filter(text => text.includes('isWrapperless'))).toHaveLength(1)
		warn.mockRestore()
	})

	it('пустой слот: подсказки нет, ошибки нет', () => {
		const { container } = render(BaseTooltip, { props: { text: 'Подсказка', isWrapperless: true }, slots: { default: () => [] } })
		expect(container.querySelector('.base-tooltip')).toBeNull()
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
	})
})

describe('BaseTooltip: доступное имя совпадает с текстом подсказки', () => {
	it('aria-label равен тексту — aria-describedby не ставится (с обёрткой и без)', async () => {
		vi.useFakeTimers()
		for (const isWrapperless of [false, true]) {
			const { unmount } = render(BaseTooltip, {
				props: { text: 'Тёмная тема', isWrapperless },
				slots: { default: '<button type="button" aria-label=" Тёмная  тема ">☾</button>' },
			})
			const button = screen.getByRole('button')
			button.focus()
			await vi.advanceTimersByTimeAsync(200)
			expect(screen.getByRole('tooltip')).toBeInTheDocument()
			expect(button).not.toHaveAttribute('aria-describedby')
			unmount()
		}
	})

	it('видимый текст равен подсказке — описание не дублируется; другой текст — описание ставится', async () => {
		vi.useFakeTimers()
		const { rerender } = render(BaseTooltip, {
			props: { text: 'Сохранить' },
			slots: { default: '<button type="button">Сохранить</button>' },
		})
		const button = screen.getByRole('button')
		button.focus()
		await vi.advanceTimersByTimeAsync(200)
		expect(button).not.toHaveAttribute('aria-describedby')

		await rerender({ text: 'Сохранить черновик' })
		expect(button).toHaveAttribute('aria-describedby', screen.getByRole('tooltip').id)
	})
})
