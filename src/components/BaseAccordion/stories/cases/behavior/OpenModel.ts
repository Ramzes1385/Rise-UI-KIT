import { ITEMS } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseAccordion.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAccordion from '../../../ui/BaseAccordion.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const models = { opened: 'open' }

const KEYS = ITEMS.map(item => item.label)

const template = `
	<div class="story-medium story-stack">
		<div class="story-row">
			<BaseButton variant="outline" @click="opened = keys">Открыть все</BaseButton>
			<BaseButton variant="outline" @click="opened = []">Закрыть все</BaseButton>
		</div>
		<BaseAccordion v-bind="args" v-model:open="opened" />
	</div>
`

export const OpenModel: StoryObj<typeof meta> = {
	args: { isMultiple: true, open: [ITEMS[1]!.label] },
	parameters: {
		docs: {
			description: {
				story: [
					'`v-model:open` — открытые пункты по ключу (`id`, иначе `label`): приложение открывает и закрывает их само,',
					'например кнопками «Открыть все» и «Закрыть все», а клик по заголовку возвращает новый список.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseAccordion', 'BaseButton'], models, script: `const keys = ${literal(KEYS)}` }),
		},
	},
	render: args => ({
		components: { BaseAccordion, BaseButton },
		setup: useStorySetup(args, { models, data: { keys: KEYS } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getAllByRole('button', { expanded: true })).toHaveLength(1)
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть все' }))
		await waitFor(() => expect(canvas.getAllByRole('button', { expanded: true })).toHaveLength(KEYS.length))

		const first = canvas.getByRole('button', { name: KEYS[0] })
		first.focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(first).toHaveAttribute('aria-expanded', 'false'))

		await userEvent.click(canvas.getByRole('button', { name: 'Закрыть все' }))
		await waitFor(() => expect(canvas.queryAllByRole('button', { expanded: true })).toHaveLength(0))
	},
}
