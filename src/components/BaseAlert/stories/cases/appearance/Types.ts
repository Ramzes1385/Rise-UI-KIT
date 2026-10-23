import { MESSAGES } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseAlert.stories'
import BaseAlert from '../../../ui/BaseAlert.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { ALERT_TYPES } from '../../../types/BaseAlert.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const types = ALERT_TYPES

const messages = MESSAGES

const template = `
	<div class="story-stack story-medium">
		<BaseAlert
			v-for="type in types"
			:key="type"
			v-bind="args"
			:type="type"
			:title="messages[type].title"
			:description="messages[type].description" />
	</div>
`

export const Types: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isClosable'] },
		docs: {
			description: {
				story: 'Четыре типа. `error` и `warning` — `role="alert"`, `info` и `success` — `role="status"`. Вариант меняется в Controls.',
			},
			source: storySource({
				template,
				imports: ['BaseAlert'],
				script: [`const types = ${literal(types)}`, `const messages = ${literal(messages)}`].join('\n'),
			}),
		},
	},
	render: args => ({
		components: { BaseAlert },
		setup: useStorySetup(args, { data: { types, messages } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('status')).toHaveLength(2)
		const [warning, error] = canvas.getAllByRole('alert')
		await expect(warning).toHaveTextContent(MESSAGES.warning.title)
		await expect(error).toHaveTextContent(MESSAGES.error.title)
	},
}
