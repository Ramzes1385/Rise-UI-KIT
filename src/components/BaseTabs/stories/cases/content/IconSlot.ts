import type meta from '../../BaseTabs.stories'
import BaseTabs from '../../../ui/BaseTabs.vue'
import { expect, waitFor } from 'storybook/test'
import { BaseBadge } from '@components/BaseBadge'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TabItem } from '../../../types/BaseTabs.types'
import { storySource, tabTo, useStorySetup, inlineKey } from '@/stories/helpers'

const OWN_ARGS = ['modelValue', 'onUpdate:modelValue']

const state = { tab: 'inbox' }

const items: TabItem[] = [
	{ id: 'inbox', label: 'Входящие' },
	{ id: 'sent', label: 'Отправленные' },
	{ id: 'drafts', label: 'Черновики' },
]

const template = `
	<BaseTabs v-bind="args" v-model="tab">
		<template #icon="{ item }">
			<BaseBadge :size-scale="80">{{ item.label[0] }}</BaseBadge>
		</template>
	</BaseTabs>
`

export const IconSlot: StoryObj<typeof meta> = {
	args: { items },
	parameters: {
		docs: {
			description: {
				story: [
					'Слот `icon` (`{ item }`) — своя разметка значка у каждой вкладки вместо BaseIcon. Обёртка значка — `aria-hidden`,',
					'имя вкладки — только `label`. Клик и Enter по выбранной вкладке не эмитят `change`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseTabs', 'BaseBadge'], state, omit: OWN_ARGS }),
		},
	},
	render: args => ({
		components: { BaseTabs, BaseBadge },
		setup: useStorySetup(args, { state, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const inbox = canvas.getByRole('tab', { name: 'Входящие' })
		await tabTo(inbox, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(args.onChange).not.toHaveBeenCalled()

		await userEvent.keyboard(inlineKey('{ArrowRight}'))
		const sent = canvas.getByRole('tab', { name: 'Отправленные' })
		await expect(sent).toHaveFocus()
		await waitFor(() => expect(sent).toHaveAttribute('aria-selected', 'true'))
	},
}
