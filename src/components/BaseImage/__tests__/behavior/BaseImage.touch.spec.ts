import '@testing-library/jest-dom/vitest'
import BaseImage from '../../ui/BaseImage.vue'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'

function area(): HTMLElement {
	return document.querySelector<HTMLElement>('.base-image__zoom-container')!
}

function touch(type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel', pointerId: number, clientX: number): Promise<void> {
	return fireEvent(area(), new PointerEvent(type, { bubbles: true, pointerType: 'touch', pointerId, clientX, clientY: 0, button: 0 }))
}

async function openZoom(props: Record<string, unknown> = {}) {
	const user = userEvent.setup()
	render(BaseImage, { props: { src: 'img1.jpg', alt: 'Горы', zoomConfig: { hasZoom: true }, ...props } })
	await user.click(screen.getByRole('button', { name: 'Горы' }))
	await screen.findByRole('dialog')
	return user
}

describe('BaseImage: касания в просмотре (IMG-6)', () => {
	it('П1: область изображения перехватывает касания: с масштабом больше 100% курсор «рука», во время жеста — «сжатая рука»', async () => {
		const user = await openZoom()
		expect(area()).not.toHaveClass('base-image__zoom-container--pannable')

		await user.click(screen.getByRole('button', { name: 'Увеличить' }))
		expect(area()).toHaveClass('base-image__zoom-container--pannable')
		expect(area()).not.toHaveClass('base-image__zoom-container--panning')

		await touch('pointerdown', 1, 0)
		expect(area()).toHaveClass('base-image__zoom-container--panning')
		await touch('pointerup', 1, 0)
		expect(area()).not.toHaveClass('base-image__zoom-container--panning')

		await touch('pointerdown', 2, 0)
		await touch('pointercancel', 2, 0)
		expect(area()).not.toHaveClass('base-image__zoom-container--panning')
	})

	it('П2: щипок двумя пальцами увеличивает масштаб', async () => {
		await openZoom()

		await touch('pointerdown', 1, 100)
		await touch('pointerdown', 2, 140)
		await touch('pointermove', 2, 180)

		expect(screen.getByRole('dialog')).toHaveTextContent('200%')
		expect(area()).toHaveClass('base-image__zoom-container--panning')
	})

	it('П3: клик после перетаскивания не закрывает окно, обычный клик по фону закрывает', async () => {
		const user = await openZoom()
		await user.click(screen.getByRole('button', { name: 'Увеличить' }))

		await touch('pointerdown', 1, 0)
		await touch('pointermove', 1, 60)
		await touch('pointerup', 1, 60)
		await fireEvent.click(area())
		expect(screen.getByRole('dialog')).toBeInTheDocument()

		await fireEvent.click(area())
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	})

	it('П4: без увеличения стрелка листает галерею (при увеличении сначала двигает изображение — тесты useImageZoom)', async () => {
		const user = await openZoom({ gallery: ['img1.jpg', 'img2.jpg'] })

		await user.keyboard('{ArrowRight}')

		expect(screen.getByRole('dialog')).toHaveTextContent('2 / 2')
	})
})
