import { expect } from 'storybook/test'
import type meta from '../BaseQrCode.stories'
import BaseQrCode from '../../ui/BaseQrCode.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { QR_ERROR_LEVELS } from '../../types/BaseQrCode.types'

export const ErrorCorrection: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Один текст на четырёх уровнях коррекции: чем выше уровень, тем больше модулей и тем больше повреждений код переживает.',
			},
		},
		controls: { include: ['value', 'size'] },
	},
	args: { value: 'https://ramzes1385.github.io/Rise-UI-KIT/?path=/docs' },
	render: args => ({
		components: { BaseQrCode },
		setup: () => ({ props: useArgsWithoutSlots(args), levels: QR_ERROR_LEVELS }),
		template: `
			<div class="story-row">
				<figure v-for="level in levels" :key="level" style="margin: 0; text-align: center">
					<BaseQrCode v-bind="props" :error-correction="level" :label="'Уровень ' + level" />
					<figcaption class="story-label">{{ level }}</figcaption>
				</figure>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const sizes = [...canvasElement.querySelectorAll('svg')].map(svg => svg.getAttribute('viewBox'))
		await expect(sizes).toEqual(['0 0 37 37', '0 0 41 41', '0 0 45 45', '0 0 49 49'])
	},
}
