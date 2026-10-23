import BaseToolbar from '../ui/BaseToolbar.vue'
import { BaseIcon } from '@components/BaseIcon'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { FORMAT_BUTTONS, ALIGN_BUTTONS } from './shared'
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
		<BaseButton v-for="button in align" :key="button.icon" variant="ghost" :aria-label="button.label" :padding="{ x: 6, y: 6 }">
			<BaseIcon :name="button.icon" />
		</BaseButton>
	</BaseToolbar>
`

export const source = storySource({
	template,
	imports: ['BaseButton', 'BaseIcon', 'BaseSeparator', 'BaseToolbar'],
	script: [`const format = ${literal(format)}`, `const align = ${literal(align)}`].join('\n'),
})

export const render = (args => ({
	components: { BaseToolbar, BaseButton, BaseIcon, BaseSeparator },
	setup: useStorySetup(args, { data: { format, align }, slots: [] }),
	template,
})) satisfies Meta<typeof BaseToolbar>['render']
