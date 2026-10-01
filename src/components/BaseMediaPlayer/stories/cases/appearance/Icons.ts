import '../../../styles/MediaControls.style.scss'
import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseMediaPlayer.stories'
import { MediaIcon } from '@components/BaseMediaPlayer'
import { literal, staticStorySource } from '@/stories/helpers'
import { MEDIA_ICONS } from '../../../types/controls/MediaIcon.types'
import { MEDIA_BRAND_ICONS } from '../../../types/controls/MediaBrandIcon.types'

const names = [...Object.keys(MEDIA_ICONS), ...Object.keys(MEDIA_BRAND_ICONS)]

const template = `
	<ul
		aria-label="Значки плеера"
		style="display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 8px; margin: 0;
			padding: 16px; border-radius: 12px; background: #121212; color: #fff; list-style: none; font: 12px/1.3 sans-serif">
		<li
			v-for="name in names"
			:key="name"
			style="display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px 4px;
				border-radius: 10px; background: rgb(255 255 255 / 6%)">
			<MediaIcon :name="name" />
			<span style="color: #d4d4d8">{{ name }}</span>
		</li>
	</ul>
`

export const Icons: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Значки плеера — контуры Font Awesome Free 7 (наборы Solid, Regular и Brands, лицензия CC BY 4.0, текст — в',
					'THIRD_PARTY_NOTICES.md): скруглённые, залитые, одной высоты — все стоят по центру общего поля 640×512.',
					'«Картинка в картинке», мини-плеер, широкий экран и подключённая трансляция нарисованы по мотивам набора.',
					'Пуск и пауза перетекают друг в друга, остальные значки сменяются с поворотом и растворением; при наведении',
					'на кнопку значок чуть двигается: шестерёнка качества поворачивается, стрелки серий и перемотки сдвигаются',
					'в свою сторону, полный экран «раскрывается». Значки встроены в плеер и не загружаются из сети.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/media': ['MediaIcon'] },
				script: `const names = ${literal(names)}`,
			}),
		},
	},
	render: () => ({
		components: { MediaIcon },
		setup: () => ({ names }),
		template,
	}),
	play: async ({ canvas }) => {
		const list = canvas.getByRole('list', { name: 'Значки плеера' })
		await expect(list.querySelectorAll('svg.base-media-player__icon')).toHaveLength(names.length)
		await expect(list.querySelector('[data-icon="telegram"] path')).toHaveAttribute('d', expect.stringMatching(/^M/))
	},
}
