import { expect } from 'storybook/test'
import type meta from '../BaseMediaPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { DEMO_COVER, DEMO_COVER_ANIMATED, DEMO_COVER_VIDEO } from '../shared'

const coverOf = (canvasElement: HTMLElement): HTMLElement | null => canvasElement.querySelector('.base-media-player__cover')

export const Cover: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Обложка (`poster`) лежит поверх кадра до первого запуска и заполняет его целиком. Анимированные GIF, WebP, APNG',
					'и AVIF проигрываются — здесь анимированный WebP. Щелчок по обложке запускает запись, обложка плавно гаснет.',
				].join('\n'),
			},
		},
	},
	args: { poster: DEMO_COVER_ANIMATED },
	play: async ({ canvasElement }) => {
		await expect(coverOf(canvasElement)?.querySelector('img')).toHaveAttribute('src', DEMO_COVER_ANIMATED)
	},
}

export const VideoCover: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Видео-обложка (`posterVideo`) — короткий ролик без звука по кругу до первого запуска: тизер или «живая» обложка.',
					'Пока он загружается, виден `poster`. У серии плейлиста — свои `poster` и `posterVideo`.',
				].join('\n'),
			},
		},
	},
	args: { poster: DEMO_COVER, posterVideo: DEMO_COVER_VIDEO },
	play: async ({ canvasElement }) => {
		const teaser = coverOf(canvasElement)?.querySelector('video') as HTMLVideoElement
		await expect(teaser).toHaveAttribute('src', DEMO_COVER_VIDEO)
		await expect(teaser.muted && teaser.loop).toBe(true)
	},
}
