import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseImage from '../ui/BaseImage.vue'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'

function zoomImg(): HTMLImageElement {
	return document.querySelector<HTMLImageElement>('.base-image__zoom-img')!
}

function rotationOf(element: HTMLElement): string {
	return /rotate\(([^)]+)\)/.exec(element.style.transform)![1]
}

async function openZoom(props: Record<string, unknown> = {}) {
	const user = userEvent.setup()
	render(BaseImage, { props: { src: 'img1.jpg', alt: 'Горы', zoomConfig: { hasZoom: true }, ...props } })
	await user.click(screen.getByRole('button', { name: 'Горы' }))
	await screen.findByRole('dialog')
	return user
}

async function clickTimes(user: ReturnType<typeof userEvent.setup>, name: string, times: number): Promise<void> {
	for (let i = 0; i < times; i++) await user.click(screen.getByRole('button', { name }))
}

describe('BaseImage: поворот в просмотре', () => {
	it('П1: «Повернуть вправо» ×4 — 360°, «влево» — в минус', async () => {
		const user = await openZoom()
		await clickTimes(user, 'Повернуть вправо', 4)
		expect(rotationOf(zoomImg())).toBe('360deg')
		await clickTimes(user, 'Повернуть влево', 6)
		expect(rotationOf(zoomImg())).toBe('-180deg')
	})

	it('П2: «Сбросить масштаб» после 270° — к 360°', async () => {
		const user = await openZoom()
		await clickTimes(user, 'Повернуть вправо', 3)
		await clickTimes(user, 'Сбросить масштаб', 1)
		expect(rotationOf(zoomImg())).toBe('360deg')
	})

	it('П3: повторное открытие — 0°', async () => {
		const user = await openZoom()
		await clickTimes(user, 'Повернуть вправо', 3)
		await user.keyboard('{Escape}')
		await nextTick()
		expect(document.querySelector('.base-image__zoom')).not.toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: 'Горы' }))
		await screen.findByRole('dialog')
		expect(rotationOf(zoomImg())).toBe('0deg')
	})

	it('П3: смена изображения галереи — 0° и новый элемент img', async () => {
		const user = await openZoom({ gallery: ['img1.jpg', 'img2.jpg'] })
		await clickTimes(user, 'Повернуть вправо', 3)
		const before = zoomImg()
		await clickTimes(user, 'Следующее изображение', 1)
		expect(zoomImg()).not.toBe(before)
		expect(zoomImg().getAttribute('src')).toBe('img2.jpg')
		expect(rotationOf(zoomImg())).toBe('0deg')
	})

	it('П6: просмотр с переходами, перетаскивание рамки миникарты их выключает', async () => {
		const user = await openZoom()
		const dialog = screen.getByRole('dialog')
		expect(dialog).toHaveClass('base-image__zoom--animated')
		await clickTimes(user, 'Увеличить', 1)
		const minimap = document.querySelector<HTMLElement>('.base-image__minimap')!
		expect(minimap.querySelector('.base-image__minimap-img')).toHaveStyle({ transform: 'scale(1) rotate(0deg)' })
		minimap.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
		await nextTick()
		expect(dialog).not.toHaveClass('base-image__zoom--animated')
		document.dispatchEvent(new MouseEvent('mouseup'))
		await nextTick()
		expect(dialog).toHaveClass('base-image__zoom--animated')
	})

	it('просмотр: колесо, загрузка изображений, клик по миникарте и стрелка влево', async () => {
		const user = await openZoom({ gallery: ['img1.jpg', 'img2.jpg'] })
		const dialog = screen.getByRole('dialog')
		await fireEvent.wheel(dialog, { deltaY: -100 })
		expect(dialog).toHaveTextContent('125%')
		await fireEvent.load(zoomImg())
		const minimap = document.querySelector<HTMLElement>('.base-image__minimap')!
		await fireEvent.load(minimap.querySelector('img')!)
		await fireEvent.click(minimap, { clientX: 10, clientY: 10 })
		await clickTimes(user, 'Следующее изображение', 1)
		expect(zoomImg().getAttribute('src')).toBe('img2.jpg')
		await fireEvent.keyDown(dialog, { key: 'ArrowLeft' })
		expect(zoomImg().getAttribute('src')).toBe('img1.jpg')
	})
})
