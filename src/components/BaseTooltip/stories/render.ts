import BaseTooltip from '../ui/BaseTooltip.vue'
import { BaseIcon } from '@components/BaseIcon'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => ({
	components: { BaseTooltip, BaseButton, BaseIcon },
	setup: () => ({ props: useArgsWithoutSlots(args, []) }),
	template: `
			<BaseTooltip v-bind="props">
				<BaseButton variant="outline" :aria-label="props.text" :padding="{ x: 5, y: 5 }">
					<BaseIcon name="link" />
				</BaseButton>
			</BaseTooltip>
		`,
})) satisfies Meta<typeof BaseTooltip>['render']
