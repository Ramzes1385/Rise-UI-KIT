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

	it('сохраняет aria-describedby, переданный самому BaseTooltip', async () => {
		vi.useFakeTimers()
		render(BaseTooltip, {
			props: { text: 'Сохранить черновик', isWrapperless: true },
			attrs: { 'aria-describedby': 'outer-hint' },
			slots: { default: '<button type="button">Сохранить</button>' },
		})
		const button = screen.getByRole('button')
		expect(button).toHaveAttribute('aria-describedby', 'outer-hint')

		button.focus()
		await vi.advanceTimersByTimeAsync(200)
		expect(button.getAttribute('aria-describedby')).toBe(`outer-hint ${screen.getByRole('tooltip').id}`)
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

	it('имя содержит текст подсказки целым словом — описание не повторяет его; частичное совпадение и спецсимволы не считаются', async () => {
		vi.useFakeTimers()
		const { rerender } = render(BaseTooltip, {
			props: { text: 'Instagram', isWrapperless: true },
			slots: { default: '<a href="#" aria-label="Instagram: Анна">i</a>' },
		})
		const link = screen.getByRole('link')
		link.focus()
		await vi.advanceTimersByTimeAsync(200)
		expect(link).not.toHaveAttribute('aria-describedby')

		await rerender({ text: 'Insta' })
		expect(link).toHaveAttribute('aria-describedby', screen.getByRole('tooltip').id)

		await rerender({ text: 'C++ (Анна)' })
		expect(link).toHaveAttribute('aria-describedby', screen.getByRole('tooltip').id)
	})
})

describe('BaseTooltip: уже связанное описание', () => {
	it('текст подсказки совпадает с описанием из aria-describedby — id подсказки не добавляется, нет дублей id', async () => {
		vi.useFakeTimers()
		document.body.insertAdjacentHTML('beforeend', '<span id="hint-a">Доступно через 3 с</span>')
		render(BaseTooltip, {
			props: { text: 'Доступно через 3 с', isWrapperless: true },
			slots: { default: '<button type="button" aria-describedby="hint-a">Далее</button>' },
		})
		const button = screen.getByRole('button')
		button.focus()
		await vi.advanceTimersByTimeAsync(200)
		expect(screen.getByRole('tooltip')).toBeInTheDocument()
		expect(button).toHaveAttribute('aria-describedby', 'hint-a')
		document.getElementById('hint-a')?.remove()
	})

	it('описание из attrs отличается от текста подсказки — оба id, без повторов; после скрытия остаётся только своё', async () => {
		vi.useFakeTimers()
		render(BaseTooltip, {
			props: { text: 'Подсказка', isWrapperless: true },
			attrs: { 'aria-describedby': 'hint-b' },
			slots: { default: '<button type="button">Далее</button>' },
		})
		const button = screen.getByRole('button')
		document.body.insertAdjacentHTML('beforeend', '<span id="hint-b">Другой текст</span>')
		button.focus()
		await vi.advanceTimersByTimeAsync(200)
		const ids = button.getAttribute('aria-describedby')!.split(' ')
		expect(ids).toEqual(['hint-b', screen.getByRole('tooltip').id])
		expect(new Set(ids).size).toBe(ids.length)

		button.blur()
		await vi.advanceTimersByTimeAsync(300)
		expect(button).toHaveAttribute('aria-describedby', 'hint-b')
		document.getElementById('hint-b')?.remove()
	})

	it('ссылка на отсутствующий элемент не мешает показать подсказку', async () => {
		vi.useFakeTimers()
		render(BaseTooltip, {
			props: { text: 'Подсказка', isWrapperless: true },
			slots: { default: '<button type="button" aria-describedby="missing">Далее</button>' },
		})
		const button = screen.getByRole('button')
		button.focus()
		await vi.advanceTimersByTimeAsync(200)
		expect(button.getAttribute('aria-describedby')).toBe(`missing ${screen.getByRole('tooltip').id}`)
	})
})
