import { expect } from 'storybook/test'
import { ICON_NAMES } from '../../shared'
import type meta from '../../BaseIcon.stories'
import BaseIcon from '../../../ui/BaseIcon.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const names = ICON_NAMES

const template = `
	<div class="story-grid" style="--story-grid-min: 128px;">
		<div v-for="name in names" :key="name" class="story-col" style="align-items: center; gap: 8px;">
			<BaseIcon v-bind="args" :name="name" />
			<span class="story-label" style="min-width: 0;">{{ name }}</span>
		</div>
	</div>
`

export const Gallery: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'color'] },
		docs: {
			description: { story: 'Все иконки спрайта с именами. Размер и цвет меняются в Controls для всей сетки.' },
			source: storySource({ template, imports: ['BaseIcon'], script: `const names = ${literal(names)}`, omit: ['name'] }),
		},
	},
	render: args => ({
		components: { BaseIcon },
		setup: useStorySetup(args, { data: { names }, slots: ['name'] }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const uses = canvasElement.querySelectorAll('use')
		await expect(uses).toHaveLength(ICON_NAMES.length)
		await expect(uses[0]).toHaveAttribute('href', `icons.svg#${ICON_NAMES[0]}`)
		await expect(canvas.getByText('search')).toBeVisible()
	},
}
