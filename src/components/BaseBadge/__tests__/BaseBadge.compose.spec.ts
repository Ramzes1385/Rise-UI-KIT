import '@testing-library/jest-dom/vitest'
import BaseBadge from '../ui/BaseBadge.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BaseBadge: палитра, точка, счётчик', () => {
	it('status добавляет модификатор, primary — нет', async () => {
		const { container, rerender } = render(BaseBadge, { props: { label: 'Инфо', status: 'info' } })
		expect(container.firstElementChild).toHaveClass('base-badge--status-info')
		await rerender({ status: 'primary' })
		expect(container.firstElementChild?.className).not.toContain('status')
	})

	it('точка: без текста, скрыта от скринридеров; с label — img с именем', async () => {
		const { container, rerender } = render(BaseBadge, { props: { isDot: true } })
		const dot = container.firstElementChild as HTMLElement
		expect(dot).toHaveClass('base-badge--dot')
		expect(dot).toHaveAttribute('aria-hidden', 'true')
		expect(dot.querySelector('.base-badge__text')).toBeNull()

		await rerender({ label: 'Есть новые' })
		expect(screen.getByRole('img', { name: 'Есть новые' })).toBe(dot)
		expect(dot).not.toHaveAttribute('aria-hidden')
	})

	it('круглый счётчик получает модификатор --round', () => {
		const { container } = render(BaseBadge, { props: { isRound: true, label: '12' } })
		expect(container.firstElementChild).toHaveClass('base-badge--round')
	})
})

describe('BaseBadge: удаление', () => {
	it('без isRemovable кнопки нет', () => {
		const { container } = render(BaseBadge, { props: { label: 'Тег' } })
		expect(container.querySelector('.base-badge__remove')).toBeNull()
	})

	it('кнопка с именем по label, клик вызывает remove и не вызывает click', async () => {
		const onClick = vi.fn()
		const { emitted } = render(BaseBadge, { props: { label: 'Тег', isRemovable: true }, attrs: { onClick } })
		const button = screen.getByRole('button', { name: 'Удалить Тег' })

		await fireEvent.click(button)
		expect(emitted('remove')).toHaveLength(1)
		expect(onClick).not.toHaveBeenCalled()
	})

	it('removeLabel задаёт имя; без label и removeLabel — «Удалить»', async () => {
		const { rerender } = render(BaseBadge, { props: { isRemovable: true, removeLabel: 'Убрать фильтр' } })
		expect(screen.getByRole('button', { name: 'Убрать фильтр' })).toBeInTheDocument()
		await rerender({ removeLabel: undefined })
		expect(screen.getByRole('button', { name: 'Удалить' })).toBeInTheDocument()
	})

	it('isRemoveFocusable=false — tabindex -1; mousedown не уводит фокус', async () => {
		render(BaseBadge, { props: { label: 'Тег', isRemovable: true, isRemoveFocusable: false } })
		const button = screen.getByRole('button')
		expect(button).toHaveAttribute('tabindex', '-1')
		const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
		button.dispatchEvent(event)
		expect(event.defaultPrevented).toBe(true)
	})

	it('в выключенном бейдже кнопка выключена и remove не приходит', async () => {
		const { emitted } = render(BaseBadge, { props: { label: 'Тег', isRemovable: true, isDisabled: true } })
		const button = screen.getByRole('button')
		expect(button).toBeDisabled()
		button.removeAttribute('disabled')
		await fireEvent.click(button)
		expect(emitted('remove')).toBeUndefined()
	})
})
