import '@testing-library/jest-dom/vitest'
import { defineComponent, h, ref } from 'vue'
import userEvent from '@testing-library/user-event'
import BasePagination from '../ui/BasePagination.vue'
import { render, screen } from '@testing-library/vue'

const renderControlled = (initial: number) => {
	const onChange = vi.fn()
	const Host = defineComponent({
		setup() {
			const page = ref(initial)
			return () =>
				h(BasePagination, {
					modelValue: page.value,
					total: 50,
					pageSize: 10,
					'onUpdate:modelValue': (value: number) => {
						page.value = value
						onChange(value)
					},
				})
		},
	})
	render(Host)
	return onChange
}

describe('BasePagination: фокус на пределе', () => {
	it('«Вперёд» на последней странице: aria-disabled, фокус остаётся на кнопке, повторный Enter ничего не делает', async () => {
		const user = userEvent.setup()
		const onChange = renderControlled(4)
		const next = screen.getByRole('button', { name: 'Следующая страница' })

		next.focus()
		await user.keyboard('{Enter}')

		expect(onChange).toHaveBeenCalledWith(5)
		expect(next).toHaveAttribute('aria-disabled', 'true')
		expect(next).not.toHaveAttribute('disabled')
		expect(document.activeElement).toBe(next)

		await user.keyboard('{Enter}')
		await user.keyboard(' ')
		expect(onChange).toHaveBeenCalledTimes(1)

		await user.tab({ shift: true })
		expect(document.activeElement).toBe(screen.getByRole('button', { current: 'page' }))
	})

	it('«Назад» на первой странице: aria-disabled, фокус остаётся на кнопке, Tab идёт к страницам', async () => {
		const user = userEvent.setup()
		const onChange = renderControlled(2)
		const prev = screen.getByRole('button', { name: 'Предыдущая страница' })

		prev.focus()
		await user.keyboard('{Enter}')

		expect(onChange).toHaveBeenCalledWith(1)
		expect(prev).toHaveAttribute('aria-disabled', 'true')
		expect(document.activeElement).toBe(prev)

		await user.tab()
		expect(document.activeElement).toBe(screen.getByRole('button', { current: 'page' }))
	})
})
