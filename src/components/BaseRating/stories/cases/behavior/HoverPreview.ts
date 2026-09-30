import type meta from '../../BaseRating.stories'
import { expect, waitFor } from 'storybook/test'
import BaseRating from '../../../ui/BaseRating.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { starOf, pointOn, fillOf } from '../../shared'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { smooth: 0, stepped: 0 }

const template = `
	<div class="story-col">
		<div class="story-row">
			<span class="story-label">Плавно</span>
			<BaseRating v-bind="args" v-model="smooth" />
		</div>
		<div class="story-row">
			<span class="story-label">По шагу</span>
			<BaseRating v-bind="args" v-model="stepped" :is-hover-smooth="false" />
		</div>
	</div>
`

export const HoverPreview: StoryObj<typeof meta> = {
	args: { modelValue: 0 },
	parameters: {
		controls: { include: ['step', 'variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Предпросмотр при наведении. По умолчанию (`isHoverSmooth`) заливка плавно следует за курсором, с `false` —',
					'идёт по шагу `step`. Клик в обоих случаях записывает оценку с шагом `step`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseRating'],
				state,
				omit: ['default', 'modelValue', 'isHoverSmooth', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseRating },
		setup: useStorySetup(args, { state, slots: ['default', 'modelValue', 'isHoverSmooth', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const [smooth, stepped] = canvas.getAllByRole('slider') as [HTMLElement, HTMLElement]

		const smoothStar = starOf(smooth, 2)
		await userEvent.pointer({ target: smoothStar, coords: pointOn(smoothStar) })
		const smoothFill = Number.parseFloat(fillOf(smoothStar))
		await expect(smoothFill).toBeGreaterThan(0)
		await expect(smoothFill).toBeLessThan(100)

		const steppedStar = starOf(stepped, 2)
		await userEvent.pointer({ target: steppedStar, coords: pointOn(steppedStar) })
		await expect(fillOf(steppedStar)).toBe('100%')
		await expect(fillOf(smoothStar)).toBe('0%')

		await userEvent.unhover(steppedStar)
		await waitFor(() => expect(fillOf(steppedStar)).toBe('0%'))
	},
}
