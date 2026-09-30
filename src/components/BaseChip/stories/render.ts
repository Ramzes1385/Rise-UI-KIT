import BaseChip from '../ui/BaseChip.vue'
import { BaseIcon } from '@components/BaseIcon'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div style="padding: 12px;">
		<BaseChip v-bind="args">
			<BaseButton variant="outline" aria-label="Уведомления" :padding="{ x: 5, y: 5 }">
				<BaseIcon name="inbox" />
			</BaseButton>
		</BaseChip>
	</div>
`

export const source = storySource({ template, imports: ['BaseChip', 'BaseButton', 'BaseIcon'] })

export const render = (args => ({
	components: { BaseChip, BaseButton, BaseIcon },
	setup: useStorySetup(args),
	template,
})) satisfies Meta<typeof BaseChip>['render']
