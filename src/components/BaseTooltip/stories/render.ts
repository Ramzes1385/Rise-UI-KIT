import BaseTooltip from '../ui/BaseTooltip.vue'
import { BaseIcon } from '@components/BaseIcon'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { text: 'text' }

const template = `
	<BaseTooltip v-bind="args" :text="text">
		<BaseButton variant="outline" :aria-label="text" :padding="{ x: 5, y: 5 }">
			<BaseIcon name="link" />
		</BaseButton>
	</BaseTooltip>
`

export const source = storySource({ template, imports: ['BaseTooltip', 'BaseButton', 'BaseIcon'], models })

export const render = (args => ({
	components: { BaseTooltip, BaseButton, BaseIcon },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseTooltip>['render']
