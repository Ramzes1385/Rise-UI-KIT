import { MESSAGES } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseAlert.stories'
import BaseAlert from '../../../ui/BaseAlert.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { ALERT_TYPES } from '../../../types/BaseAlert.types'

export const Types: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isClosable'] },
		docs: {
			description: {
				story: 'Четыре типа. `error` и `warning` — `role="alert"`, `info` и `success` — `role="status"`. Вариант меняется в Controls.',
			},
			source: { code: ALERT_TYPES.map(type => `<BaseAlert type="${type}" title="${MESSAGES[type].title}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseAlert },
		setup: () => ({ props: useArgsWithoutSlots(args), types: ALERT_TYPES, messages: MESSAGES }),
		template: `
			<div class="story-stack story-medium">
				<BaseAlert
					v-for="type in types"
					:key="type"
					v-bind="props"
					:type="type"
					:title="messages[type].title"
					:description="messages[type].description" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('status')).toHaveLength(2)
		const [warning, error] = canvas.getAllByRole('alert')
		await expect(warning).toHaveTextContent(MESSAGES.warning.title)
		await expect(error).toHaveTextContent(MESSAGES.error.title)
	},
}
