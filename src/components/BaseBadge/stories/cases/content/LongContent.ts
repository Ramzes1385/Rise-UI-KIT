import { expect } from 'storybook/test'
import type meta from '../../BaseBadge.stories'
import BaseBadge from '../../../ui/BaseBadge.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div style="width: 160px;"><BaseBadge v-bind="args" /></div>
`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Длинный `label` обрезается многоточием: бейдж не шире контейнера (здесь — 160px), полный текст доступен скринридеру.',
			},
			source: storySource({ template, imports: ['BaseBadge'] }),
		},
	},
	args: { label: 'Ожидает согласования юристом' },
	render: args => ({
		components: { BaseBadge },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const text = canvas.getByText('Ожидает согласования юристом')
		await expect(text.closest('.base-badge')?.getBoundingClientRect().width).toBeLessThanOrEqual(160)
		await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)
	},
}
