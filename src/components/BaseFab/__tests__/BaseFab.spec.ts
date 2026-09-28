import '@testing-library/jest-dom/vitest'
import BaseFab from '../ui/BaseFab.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseFab', () => {
	it('круглая кнопка: имя из label (aria-label), type="button", угол по умолчанию — правый нижний', () => {
		render(BaseFab, { props: { label: 'Новая задача' } })

		const fab = screen.getByRole('button', { name: 'Новая задача' })
		expect(fab).toHaveAttribute('type', 'button')
		expect(fab).toHaveClass('base-fab--bottom-right')
		expect(fab).not.toHaveTextContent('Новая задача')
	})

	it('широкая кнопка — подпись видна, без aria-label; угол и контейнер', () => {
		render(BaseFab, { props: { label: 'Написать', isExtended: true, position: 'top-left', isContained: true } })

		const fab = screen.getByRole('button', { name: 'Написать' })
		expect(fab).not.toHaveAttribute('aria-label')
		expect(fab).toHaveTextContent('Написать')
		expect(fab).toHaveClass('base-fab--top-left', 'base-fab--contained', 'base-fab--extended')
	})

	it('клик — click; отключённая кнопка не эмитит', async () => {
		const { emitted, rerender } = render(BaseFab, { props: { label: 'Создать' } })

		screen.getByRole('button', { name: 'Создать' }).click()
		expect(emitted().click).toHaveLength(1)

		await rerender({ isDisabled: true })
		expect(screen.getByRole('button', { name: 'Создать' })).toBeDisabled()
	})

	it('to/href — ссылка; клик по отключённой ссылке не эмитит', async () => {
		const { emitted, rerender } = render(BaseFab, { props: { label: 'Создать', href: 'https://example.com/new' } })

		const link = screen.getByRole('link', { name: 'Создать' })
		expect(link).toHaveAttribute('href', 'https://example.com/new')

		await rerender({ isDisabled: true })
		screen.getByRole('link', { name: 'Создать' }).click()
		expect(emitted().click).toBeUndefined()
	})
})
