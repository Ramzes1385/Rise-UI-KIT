import { expect } from 'storybook/test'
import type meta from '../BaseMediaPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseMediaPlayer from '../../ui/BaseMediaPlayer.vue'

const PALETTES = [
	{ name: 'Фиалка — по умолчанию', color: undefined },
	{ name: 'Небо', color: '#38bdf8' },
	{ name: 'Изумруд', color: '#34d399' },
	{ name: 'Роза', color: '#f472b6' },
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
					'Своя палитра плеера: графитовые полупрозрачные панели с размытием и акцентный цвет. `accent-color` — «цвет',
					'плеера», как у Kinescope: большая кнопка, шкала, переключатели, счётчики, выбранные пункты меню и серии. Для',
					'кнопок с белым текстом плеер сам берёт затемнённый вариант цвета. Остальное меняется CSS-переменными корня:',
					'`--media-panel`, `--media-overlay`, `--media-hover`, `--media-text`, `--media-muted`, `--media-border`,',
					'`--media-chapter-1…8` (цвета отрезков глав) и `--media-radius` (скругление углов плеера).',
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
		await expect(players.map(player => player.style.getPropertyValue('--media-primary'))).toEqual(['', '#38bdf8', '#34d399', '#f472b6'])
	},
}
