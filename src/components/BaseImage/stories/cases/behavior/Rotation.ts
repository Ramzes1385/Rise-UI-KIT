import type meta from '../../BaseImage.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, waitFor, expect } from 'storybook/test'

function zoomImage(): HTMLImageElement {
	return document.querySelector<HTMLImageElement>('.base-image__zoom-img')!
}

function isInsideWindow(element: HTMLElement): boolean {
	const rect = element.getBoundingClientRect()
	return rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight + 1 && rect.right <= window.innerWidth + 1
}

export const Rotation: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Поворот в просмотре: кнопки «Повернуть влево» и «Повернуть вправо» поворачивают изображение на 90° плавно и всегда',
					'в сторону нажатия — четвёртое нажатие вправо доводит до полного оборота, а не откатывает назад. На 90° и 270°',
					'изображение уменьшается, чтобы целиком помещаться в окне; процент масштаба при этом не меняется. «Сбросить масштаб»',
					'и клавиша «0» возвращают к ближайшему полному обороту, открытие и листание галереи — ровно к 0°.',
					'При «уменьшить движение» поворот и масштаб меняются сразу, без перехода.',
				].join('\n'),
			},
		},
	},
	args: { zoomConfig: { hasZoom: true } },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Горы на рассвете' }))
		const dialog = await screen.findByRole('dialog', { name: 'Просмотр изображения: Горы на рассвете' })
		const rotateRight = screen.getByRole('button', { name: 'Повернуть вправо' })

		await userEvent.click(rotateRight)
		await expect(zoomImage().style.transform).toContain('rotate(90deg)')
		await expect(dialog).toHaveTextContent('100%')
		await waitFor(() => expect(isInsideWindow(zoomImage())).toBe(true))

		await userEvent.click(rotateRight)
		await userEvent.click(rotateRight)
		await userEvent.click(rotateRight)
		await expect(zoomImage().style.transform).toContain('rotate(360deg)')

		await userEvent.click(screen.getByRole('button', { name: 'Повернуть влево' }))
		await expect(zoomImage().style.transform).toContain('rotate(270deg)')
		await userEvent.click(screen.getByRole('button', { name: 'Сбросить масштаб' }))
		await expect(zoomImage().style.transform).toContain('rotate(360deg)')
	},
}
