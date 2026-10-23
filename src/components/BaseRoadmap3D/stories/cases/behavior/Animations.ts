import { expect } from 'storybook/test'
import type meta from '../../BaseRoadmap3D.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseRoadmap3D from '../../../ui/BaseRoadmap3D.vue'
import { miniProgress, miniRoadmap } from '@components/BaseRoadmap/stories/demo/mini'

const motion = motionPresetsStory({
	item: '<BaseRoadmap3D :key="replay" v-bind="args" aria-label="Старт во Vue — %preset%" />',
	components: { BaseRoadmap3D, BaseButton },
	imports: ['BaseRoadmap3D'],
	slots: [],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		docs: {
			description: {
				story: [
					'Наезд камеры на этап, вступление машинки и дорога в четырёх пресетах движения: «Повторить» собирает сцену заново.',
					'В `none` и при «уменьшить движение» камера и машинка переходят сразу, облака и пин не дрейфуют.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	args: { data: miniRoadmap, progress: miniProgress, rendererFactory: undefined },
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await expect(await canvas.findAllByRole('region', { name: /^Старт во Vue — / })).toHaveLength(4)
	},
}
