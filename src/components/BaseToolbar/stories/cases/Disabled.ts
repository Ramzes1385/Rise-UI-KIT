import { expect } from 'storybook/test'
import type meta from '../BaseToolbar.stories'
import { BaseIcon } from '@components/BaseIcon'
import BaseToolbar from '../../ui/BaseToolbar.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { FORMAT_BUTTONS, ALIGN_BUTTONS } from '../shared'
import { BaseSeparator } from '@components/BaseSeparator'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const format = FORMAT_BUTTONS

const align = ALIGN_BUTTONS

const template = `
	<BaseToolbar v-bind="args">
		<BaseButton v-for="button in format" :key="button.icon" variant="ghost" :aria-label="button.label" :padding="{ x: 6, y: 6 }">
			<BaseIcon :name="button.icon" />
		</BaseButton>
		<BaseSeparator orientation="vertical" style="height: 20px;" />
		<BaseButton v-for="button in align" :key="button.icon" variant="ghost" :aria-label="button.label" :padding="{ x: 6, y: 6 }" :is-disabled="button.icon === 'align-center'">
			<BaseIcon :name="button.icon" />
		</BaseButton>
	</BaseToolbar>
`

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Отключённая кнопка («По центру») пропускается стрелками.' },
			source: storySource({
				template,
				imports: ['BaseButton', 'BaseIcon', 'BaseSeparator', 'BaseToolbar'],
				script: [`const format = ${literal(format)}`, `const align = ${literal(align)}`].join('\n'),
			}),
		},
	},
	render: args => ({
		components: { BaseToolbar, BaseButton, BaseIcon, BaseSeparator },
		setup: useStorySetup(args, { data: { format, align }, slots: [] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('button', { name: 'По центру' })).toBeDisabled()
		canvas.getByRole('button', { name: 'По левому краю' }).focus()
		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('button', { name: 'По правому краю' })).toHaveFocus()
	},
}
