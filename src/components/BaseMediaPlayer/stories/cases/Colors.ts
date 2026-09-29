import { expect } from 'storybook/test'
import type meta from '../BaseMediaPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseMediaPlayer from '../../ui/BaseMediaPlayer.vue'

const PALETTES = [
	{ name: 'Оранжевый — по умолчанию', color: undefined },
	{ name: 'Небо', color: '#38bdf8' },
	{ name: 'Изумруд', color: '#34d399' },
	{ name: 'Фиалка', color: '#7c6cff' },
]

const CHAPTERS = [
	{ start: 0, title: 'Пролог' },
	{ start: 3, title: 'Завязка' },
	{ start: 6, title: 'Развязка' },
	{ start: 9, title: 'Финал' },
]

export const Colors: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'По умолчанию плеер оранжево-чёрно-белый: оранжевый акцент, чёрные полупрозрачные панели, белый текст.',
					'`accent-color` меняет «цвет плеера», как у Kinescope: большая кнопка, шкала, переключатели, счётчики,',
					'выбранные пункты меню и серии; для кнопок с белым текстом плеер сам берёт затемнённый вариант цвета. Главы',
					'на шкале — цветом плеера, своя глава может задать `color`. Остальное меняется CSS-переменными корня:',
					'`--media-panel`, `--media-overlay`, `--media-hover`, `--media-text`, `--media-muted`, `--media-border`',
					'и `--media-radius` (скругление углов плеера).',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseMediaPlayer },
		setup() {
			return { props: useArgsWithoutSlots(args), palettes: PALETTES, chapters: CHAPTERS }
		},
		template: `
			<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px">
				<BaseMediaPlayer
					v-for="palette in palettes"
					:key="palette.name"
					v-bind="props"
					:title="palette.name"
					:accent-color="palette.color"
					:chapters="chapters" />
			</div>`,
	}),
	play: async ({ canvasElement }) => {
		const players = [...canvasElement.querySelectorAll<HTMLElement>('.base-media-player')]
		await expect(players.map(player => player.style.getPropertyValue('--media-primary'))).toEqual(['', '#38bdf8', '#34d399', '#7c6cff'])
	},
}
