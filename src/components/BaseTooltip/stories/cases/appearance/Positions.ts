import type meta from '../../BaseTooltip.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTooltip from '../../../ui/BaseTooltip.vue'
import { screen, waitFor, expect } from 'storybook/test'
import { literal, storySource, useStorySetup, docsFrame } from '@/stories/helpers'

const items = [
	{ position: 'left', text: 'Слева' },
	{ position: 'top', text: 'Сверху' },
	{ position: 'bottom', text: 'Снизу' },
	{ position: 'right', text: 'Справа' },
] as const

const OWN_ARGS = ['position', 'text']

const template = `
	<div class="story-row" style="gap: 96px;">
		<BaseTooltip v-for="item in items" :key="item.position" v-bind="args" :position="item.position" :text="item.text">
			<BaseButton variant="outline">{{ item.position }}</BaseButton>
		</BaseTooltip>
	</div>
`

export const Positions: StoryObj<typeof meta> = {
	args: { isAlwaysVisible: true },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: { story: 'Сторона `position`: подсказка и стрелка центрируются по элементу.' },
			...docsFrame(160),
			source: storySource({
				template,
				imports: ['BaseTooltip', 'BaseButton'],
				script: `const items = ${literal(items)} as const`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseTooltip, BaseButton },
		setup: useStorySetup(args, { data: { items }, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'right' })
		const tooltip = (await screen.findByText('Справа')).closest('[role="tooltip"]') as HTMLElement
		await waitFor(() => expect(tooltip.getBoundingClientRect().left).toBeGreaterThan(button.getBoundingClientRect().right))
	},
}
