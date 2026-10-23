import '@testing-library/jest-dom/vitest'
import BaseImage from '../../ui/BaseImage.vue'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BaseImage: масштаб на пределе', () => {
	it('«Увеличить» на максимуме остаётся в фокусе, aria-disabled, Tab идёт дальше', async () => {
		const user = userEvent.setup()
		const { container } = render(BaseImage, {
			props: { src: 'test.jpg', alt: 'Тест', zoomConfig: { hasZoom: true, maxScale: 1.5, zoomStep: 0.25 } },
		})
		await fireEvent.click(container.querySelector('.base-image__img') as HTMLElement)
		const zoomIn = screen.getByRole('button', { name: 'Увеличить' })

		zoomIn.focus()
		await user.keyboard('{Enter}')
		await user.keyboard('{Enter}')

		expect(screen.getByText('150%')).toBeInTheDocument()
		expect(zoomIn).toHaveAttribute('aria-disabled', 'true')
		expect(zoomIn).not.toHaveAttribute('disabled')
		expect(document.activeElement).toBe(zoomIn)

		await user.keyboard('{Enter}')
		expect(screen.getByText('150%')).toBeInTheDocument()

		await user.tab()
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Сбросить масштаб' }))
	})

	it('«Уменьшить» на минимуме остаётся в фокусе', async () => {
		const user = userEvent.setup()
		const { container } = render(BaseImage, {
			props: { src: 'test.jpg', alt: 'Тест', zoomConfig: { hasZoom: true, minScale: 0.75, zoomStep: 0.25 } },
		})
		await fireEvent.click(container.querySelector('.base-image__img') as HTMLElement)
		const zoomOut = screen.getByRole('button', { name: 'Уменьшить' })

		zoomOut.focus()
		await user.keyboard('{Enter}')

		expect(zoomOut).toHaveAttribute('aria-disabled', 'true')
		expect(document.activeElement).toBe(zoomOut)
	})
})
