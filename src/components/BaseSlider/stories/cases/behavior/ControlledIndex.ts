import { sliderNav } from '../../shared'
import type meta from '../../BaseSlider.stories'
import { expect, waitFor } from 'storybook/test'
import BaseSlider from '../../../ui/BaseSlider.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { current: 'index' }

const template = `
	<div class="story-medium story-stack">
		<div class="story-row">
			<BaseButton variant="outline" @click="current = 2">К третьему слайду</BaseButton>
			<span>Текущий слайд: {{ current + 1 }}</span>
		</div>
		<BaseSlider v-bind="args" v-model:index="current" />
	</div>
`

export const ControlledIndex: StoryObj<typeof meta> = {
	args: { index: 0 },
	parameters: {
		controls: { include: ['animation', 'navigation', 'isLoop', 'slidesPerView', 'slidesPerGroup', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'`v-model:index` — номер текущего слайда в приложении: кнопка «К третьему слайду» переключает слайдер, а стрелки и точки',
					'возвращают новый номер. Номер за краем сжимается до края и тоже возвращается в `update:index`. Без `index` слайдер',
					'ведёт номер сам, начиная с `initialIndex`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseSlider', 'BaseButton'], models }),
		},
	},
	render: args => ({
		components: { BaseSlider, BaseButton },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'К третьему слайду' }))
		await waitFor(() => expect(sliderNav(canvasElement, 3)).toHaveAttribute('aria-current', 'true'))
		await expect(canvas.getByText('Текущий слайд: 3')).toBeInTheDocument()

		await userEvent.click(canvas.getByRole('button', { name: 'Следующий слайд' }))
		await waitFor(() => expect(canvas.getByText('Текущий слайд: 4')).toBeInTheDocument())
		await expect(sliderNav(canvasElement, 4)).toHaveAttribute('aria-current', 'true')
	},
}
