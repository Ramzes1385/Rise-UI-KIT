import { expect } from 'storybook/test'
import type meta from '../../BaseBadge.stories'
import BaseBadge from '../../../ui/BaseBadge.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-row">
		<BaseBadge v-bind="args" is-round label="3" />
		<BaseBadge v-bind="args" is-round label="128" status="error" />
		<BaseBadge v-bind="args" is-dot label="Есть новые" />
		<BaseBadge v-bind="args" is-dot status="success" label="В сети" />
		<BaseBadge v-bind="args" is-dot status="warning" />
	</div>
`

export const Shapes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'`isRound` — круглый счётчик: минимальная ширина равна высоте, края полностью скруглены.',
					'`isDot` — точка без текста; с `label` она получает `role="img"` и имя, без него скрыта от скринридеров.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseBadge'], omit: ['default', 'label'] }),
		},
	},
	render: args => ({
		components: { BaseBadge },
		setup: useStorySetup(args, { slots: ['default', 'label'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('img', { name: 'Есть новые' })).toHaveClass('base-badge--dot')
		await expect(canvas.getByText('128').closest('.base-badge')).toHaveClass('base-badge--round')
	},
}
