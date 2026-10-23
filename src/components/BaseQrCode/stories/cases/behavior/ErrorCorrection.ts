import { expect } from 'storybook/test'
import type meta from '../../BaseQrCode.stories'
import BaseQrCode from '../../../ui/BaseQrCode.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { QR_ERROR_LEVELS } from '../../../types/BaseQrCode.types'

const template = `
	<div class="story-row">
		<figure v-for="level in QR_ERROR_LEVELS" :key="level" style="margin: 0; text-align: center">
			<BaseQrCode v-bind="args" :error-correction="level" :label="\`Уровень \${level}\`" />
			<figcaption class="story-label">{{ level }}</figcaption>
		</figure>
	</div>
`

export const ErrorCorrection: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Один текст на четырёх уровнях коррекции: чем выше уровень, тем больше модулей и тем больше повреждений код переживает.',
			},
			source: storySource({ template, imports: ['BaseQrCode', 'QR_ERROR_LEVELS'], omit: ['errorCorrection', 'label'] }),
		},
		controls: { include: ['value', 'size'] },
	},
	args: { value: 'https://ramzes1385.github.io/Rise-UI-KIT/?path=/docs' },
	render: args => ({
		components: { BaseQrCode },
		setup: useStorySetup(args, { data: { QR_ERROR_LEVELS } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const sizes = [...canvasElement.querySelectorAll('svg')].map(svg => svg.getAttribute('viewBox'))
		await expect(sizes).toEqual(['0 0 37 37', '0 0 41 41', '0 0 45 45', '0 0 49 49'])
	},
}
