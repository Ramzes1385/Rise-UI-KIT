import { ref } from 'vue'
import type meta from '../../BaseRating.stories'
import { expect, waitFor } from 'storybook/test'
import BaseRating from '../../../ui/BaseRating.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { starOf, pointOn, fillOf } from '../../shared'
import { useArgsWithoutSlots } from '@/stories/helpers'

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
			source: { code: ['<BaseRating v-model="rating" />', '<BaseRating v-model="rating" :is-hover-smooth="false" />'].join('\n') },
		},
	},
	render: args => ({
		components: { BaseRating },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'isHoverSmooth', 'onUpdate:modelValue']),
			smooth: ref(0),
			stepped: ref(0),
		}),
		template: `
			<div class="story-col">
				<div class="story-row">
					<span class="story-label">Плавно</span>
					<BaseRating v-bind="props" v-model="smooth" />
				</div>
				<div class="story-row">
					<span class="story-label">По шагу</span>
					<BaseRating v-bind="props" v-model="stepped" :is-hover-smooth="false" />
				</div>
			</div>
		`,
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
