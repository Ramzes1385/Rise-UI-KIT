import { expect } from 'storybook/test'
import { LONG_ITEMS } from '../../shared'
import type meta from '../../BaseBottomNav.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBottomNav from '../../../ui/BaseBottomNav.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow">
		<BaseBottomNav v-bind="args" />
	</div>
`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Длинные подписи обрезаются многоточием в своей колонке, пункты остаются равной ширины; доступное имя — полная подпись. Подписи лучше держать в одно-два слова.',
			},
			source: storySource({ template, imports: ['BaseBottomNav'] }),
		},
	},
	args: { items: LONG_ITEMS },
	render: args => ({
		components: { BaseBottomNav },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const link = canvas.getByRole('button', { name: 'Документы и договоры с контрагентами' })
		const label = link.querySelector('.base-bottom-nav__label') as HTMLElement
		await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth)
	},
}
