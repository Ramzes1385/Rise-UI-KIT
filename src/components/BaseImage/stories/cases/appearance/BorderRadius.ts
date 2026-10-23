import { expect } from 'storybook/test'
import type meta from '../../BaseImage.stories'
import BaseImage from '../../../ui/BaseImage.vue'
import { expectImagesVisible } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const radii = [
	{ label: 'по умолчанию (md)', value: undefined },
	{ label: '0', value: 0 },
	{ label: '16', value: 16 },
	{ label: '9999 — круг', value: 9999 },
]

const template = `
	<div class="story-row" style="align-items: flex-start;">
		<div v-for="radius in radii" :key="radius.label" class="story-col" style="gap: 8px;">
			<span class="story-label">{{ radius.label }}</span>
			<BaseImage v-bind="args" :border-radius="radius.value" :width="120" :height="120" />
		</div>
	</div>
`

export const BorderRadius: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['src', 'sizeScale'] },
		docs: {
			description: {
				story: 'Скругление: по умолчанию md из темы, `borderRadius` задаёт своё в px (масштабируется `sizeScale`), 9999 — круг.',
			},
			source: storySource({
				template,
				imports: ['BaseImage'],
				script: `const radii = ${literal(radii)}`,
				omit: ['borderRadius', 'width', 'height'],
			}),
		},
	},
	render: args => ({
		components: { BaseImage },
		setup: useStorySetup(args, { data: { radii }, slots: ['borderRadius', 'width', 'height'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		await expectImagesVisible(canvasElement, 4)
		const [themed, square] = Array.from(canvasElement.querySelectorAll<HTMLElement>('.base-image'))
		await expect(themed?.style.borderRadius).toBe('')
		if (!isStoryBranded()) await expect(getComputedStyle(themed!).borderTopLeftRadius).toBe('6px')
		await expect(getComputedStyle(square!).borderTopLeftRadius).toBe('0px')
	},
}
