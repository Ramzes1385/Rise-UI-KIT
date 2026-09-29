import type meta from '../BaseMediaPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { DEMO_PLAYLISTS, storyVideo } from '../shared'
import { expect, waitFor, within } from 'storybook/test'

export const Episodes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Сезоны и серии (`playlists`, `v-model:episode`): источники, обложка, субтитры, озвучки и главы берутся из серии.',
					'Кнопки «Предыдущая серия» и «Следующая серия» (Shift+P, Shift+N). Кнопка «Серии» открывает панель справа: вкладки',
					'сезонов и карточки с номером, картинкой (`poster`), названием, описанием (`description`) и длительностью (`duration`);',
					'текущая серия выделена, Escape, крестик и щелчок мимо закрывают панель. После конца серии — карточка с отсчётом',
					'«Следующая серия через 5» (`nextCountdown`), выключается переключателем «Автовоспроизведение» в панели.',
					'Главы серии — цветные отрезки на шкале, превью с названием при наведении, текущая глава рядом со временем и список глав;',
					'на опенинге и эндинге появляется «Пропустить». Позиция запоминается для каждой серии: `storageKey:<id серии>`.',
				].join('\n'),
			},
		},
	},
	args: { title: 'Демо-сериал', playlists: DEMO_PLAYLISTS },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const player = within(canvasElement.querySelector('.base-media-player') as HTMLElement)
		await expect(canvas.getByRole('region', { name: 'Демо-сериал. Серия 1. Начало' })).toBeInTheDocument()
		await expect(canvas.getByRole('button', { name: 'Пролог' })).toBeInTheDocument()

		await userEvent.click(canvas.getByRole('button', { name: 'Серии' }))
		const panel = within(await player.findByRole('region', { name: 'Серии' }))
		await expect(panel.getByRole('button', { name: 'Сезон 1' })).toHaveAttribute('aria-pressed', 'true')
		await userEvent.click(panel.getByRole('button', { name: /Серия 2\. Дорога/ }))
		await waitFor(() => expect(canvas.getByRole('region', { name: 'Демо-сериал. Серия 2. Дорога' })).toBeInTheDocument())
		await waitFor(() => expect(storyVideo(canvasElement).getAttribute('src')).toBeTruthy())
		await expect(canvas.getByRole('button', { name: 'Предыдущая серия' })).toBeInTheDocument()
	},
}
