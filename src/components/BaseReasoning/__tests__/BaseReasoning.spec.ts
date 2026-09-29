import '@testing-library/jest-dom/vitest'
import { setLocale } from '@/locales/state'
import BaseReasoning from '../ui/BaseReasoning.vue'
import { formatThinkingTime } from '../model/useBaseReasoning'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BaseReasoning', () => {
	afterEach(() => {
		vi.useRealTimers()
		setLocale('ru')
	})

	it('свёрнут по умолчанию: заголовок с длительностью, содержимое недоступно', () => {
		const { container } = render(BaseReasoning, { props: { content: 'Ход **мысли**', duration: 12 } })
		const trigger = screen.getByRole('button', { name: 'Думал 12 с' })
		const collapse = container.querySelector('.base-reasoning__collapse') as HTMLElement

		expect(trigger).toHaveAttribute('aria-expanded', 'false')
		expect(trigger).toHaveAttribute('aria-controls', collapse.id)
		expect(collapse).toHaveAttribute('aria-hidden', 'true')
		expect(collapse).toHaveAttribute('inert')
		expect(collapse.querySelector('strong')).toHaveTextContent('мысли')
	})

	it('кнопка раскрывает и сворачивает, сообщая update:isOpen', async () => {
		const { container, emitted } = render(BaseReasoning, { props: { content: 'Текст' } })
		const trigger = screen.getByRole('button', { name: 'Размышления' })

		await fireEvent.click(trigger)
		expect(trigger).toHaveAttribute('aria-expanded', 'true')
		expect(container.querySelector('.base-reasoning')).toHaveClass('base-reasoning--open')
		expect(container.querySelector('.base-reasoning__collapse')).not.toHaveAttribute('inert')
		await fireEvent.click(trigger)
		expect(emitted('update:isOpen')).toEqual([[true], [false]])
	})

	it('v-model:is-open задаёт состояние снаружи', async () => {
		const { rerender } = render(BaseReasoning, { props: { content: 'Текст', isOpen: true } })

		expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
		await rerender({ isOpen: false })
		expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
	})

	it('поток: раскрыт с «Думает…», по окончании сворачивается и показывает замеренное время', async () => {
		vi.useFakeTimers()
		const { container, rerender, emitted } = render(BaseReasoning, { props: { content: 'Шаг', isStreaming: true } })
		const trigger = screen.getByRole('button')

		expect(trigger).toHaveAccessibleName('Думает…')
		expect(trigger).toHaveAttribute('aria-expanded', 'true')
		expect(container.querySelector('.base-reasoning')).toHaveClass('base-reasoning--streaming')
		expect(container.querySelector('.base-reasoning__collapse')).toHaveAttribute('aria-busy', 'true')
		vi.advanceTimersByTime(4200)
		await rerender({ isStreaming: false })
		expect(trigger).toHaveAccessibleName('Думал 4 с')
		expect(trigger).toHaveAttribute('aria-expanded', 'false')
		expect(emitted('update:isOpen')).toEqual([[true], [false]])
	})

	it('поток после старта раскрывает блок; если пользователь его трогал — не сворачивает', async () => {
		const { rerender } = render(BaseReasoning, { props: { content: 'Шаг' } })
		const trigger = screen.getByRole('button')

		await rerender({ isStreaming: true })
		expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await fireEvent.click(trigger)
		await fireEvent.click(trigger)
		await rerender({ isStreaming: false })
		expect(trigger).toHaveAttribute('aria-expanded', 'true')
	})

	it('уже раскрытый блок поток не раскрывает повторно', () => {
		const { emitted } = render(BaseReasoning, { props: { content: 'Шаг', isStreaming: true, isOpen: true } })

		expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
		expect(emitted('update:isOpen')).toBeUndefined()
	})

	it('has-auto-toggle=false: поток не меняет состояние', async () => {
		const { rerender } = render(BaseReasoning, { props: { content: 'Шаг', isStreaming: true, hasAutoToggle: false } })
		const trigger = screen.getByRole('button')

		expect(trigger).toHaveAttribute('aria-expanded', 'false')
		await rerender({ isStreaming: false })
		expect(trigger).toHaveAttribute('aria-expanded', 'false')
		expect(trigger).toHaveAccessibleName('Думал 1 с')
	})

	it('свой заголовок и слоты title и default', () => {
		render(BaseReasoning, {
			props: { title: 'План', duration: 3 },
			slots: {
				title: '<template #title="{ title, seconds }">{{ title }} · {{ seconds }}</template>',
				default: '<p>Своё содержимое</p>',
			},
		})

		expect(screen.getByRole('button', { name: 'План · 3' })).toBeInTheDocument()
		expect(screen.getByText('Своё содержимое')).toBeInTheDocument()
	})

	it('вариант, масштаб и customClass', () => {
		const { container } = render(BaseReasoning, {
			props: {
				variant: 'soft',
				sizeScale: 125,
				customClass: { root: 'my-root', trigger: 'my-trigger', content: 'my-content' },
			},
		})
		const root = container.querySelector('.base-reasoning') as HTMLElement

		expect(root).toHaveClass('base-reasoning--soft', 'my-root')
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(screen.getByRole('button')).toHaveClass('my-trigger')
		expect(container.querySelector('.base-reasoning__content')).toHaveClass('my-content')
	})

	it('время: секунды, минуты и язык', () => {
		expect(formatThinkingTime(0.2)).toBe('1 с')
		expect(formatThinkingTime(59.4)).toBe('59 с')
		expect(formatThinkingTime(125)).toBe('2 мин 5 с')
		setLocale('en')
		expect(formatThinkingTime(125)).toBe('2 min 5 s')
	})
})
