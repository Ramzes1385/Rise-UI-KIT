import { expect } from 'storybook/test'
import type meta from '../../BaseAvatar.stories'
import BaseAvatar from '../../../ui/BaseAvatar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { CONTENT_ARGS, WAVE_GIF, ivan } from '../../shared'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const wave = WAVE_GIF

const template = `
	<div class="story-row">
		<div class="story-col">
			<BaseAvatar v-bind="args" :src="ivan.avatar" :alt="ivan.name" :name="ivan.name" />
			<span class="story-label">Картинка</span>
		</div>
		<div class="story-col">
			<BaseAvatar v-bind="args" :src="wave" alt="Машет рукой" name="Гость" />
			<span class="story-label">GIF</span>
		</div>
		<div class="story-col">
			<BaseAvatar v-bind="args" mascot="sprout" alt="Росток" />
			<span class="story-label">SVG-персонаж</span>
		</div>
	</div>
`

export const Media: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'shape', 'ring', 'isOnline'] },
		docs: {
			description: {
				story: [
					'Что можно показать в аватаре: картинку и GIF — через `src`, анимированного SVG-персонажа — через `mascot`.',
					'Росток следит глазами за курсором по всей странице; при `prefers-reduced-motion` смотрит прямо.',
					'Подпись для скринридеров у всех трёх — `alt`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseAvatar'],
				script: [`const ivan = ${literal(ivan)}`, `const wave = ${literal(wave)}`].join('\n'),
				omit: [...CONTENT_ARGS, 'mascot'],
			}),
		},
	},
	args: { sizeScale: 200 },
	render: args => ({
		components: { BaseAvatar },
		setup: useStorySetup(args, { data: { ivan, wave }, slots: [...CONTENT_ARGS, 'mascot'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('img', { name: ivan.name })).toHaveAttribute('src', ivan.avatar)
		await expect(canvas.getByRole('img', { name: 'Машет рукой' })).toHaveAttribute('src', wave)
		await expect(canvas.getByRole('img', { name: 'Росток' }).tagName.toLowerCase()).toBe('svg')
	},
}
