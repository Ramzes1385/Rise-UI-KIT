import { waitFor, expect } from 'storybook/test'
import type meta from '../BaseVirtualList.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseVirtualList from '../../ui/BaseVirtualList.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const PHRASES = [
	'Принято.',
	'Посылку передали в доставку, трек-номер пришлём отдельным сообщением.',
	'Курьер задерживается из-за пробок на мосту: ожидаемое время прибытия сдвигается примерно на сорок минут. Если так неудобно, можно перенести доставку на завтра.',
]

const MESSAGES = Array.from({ length: 2000 }, (_, index) => ({ id: index, text: `${index + 1}. ${PHRASES[index % PHRASES.length]}` }))

const template = `
	<BaseVirtualList v-bind="args" :items="items" style="max-width: 420px; border: 1px solid var(--rise-border); border-radius: 8px">
		<template #default="{ item }">
			<p style="margin: 0; padding: 10px 16px; border-bottom: 1px solid var(--rise-border)">{{ item.text }}</p>
		</template>
	</BaseVirtualList>
`

const script = [
	`const phrases = ${literal(PHRASES)}`,
	'const items = Array.from({ length: 2000 }, (_, index) => ({ id: index, text: `${index + 1}. ${phrases[index % phrases.length]}` }))',
].join('\n')

export const VariableHeight: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Строки разной высоты: каждая замеряется после отрисовки, полоса прокрутки уточняется по мере прокрутки.',
			},
			source: storySource({ template, imports: ['BaseVirtualList'], script, omit: ['items'] }),
		},
	},
	args: { items: MESSAGES, itemSize: 60, ariaLabel: 'Сообщения' },
	render: args => ({
		components: { BaseVirtualList },
		setup: useStorySetup(args, { data: { items: args.items }, slots: ['default', 'items'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const rows = canvas.getAllByRole('listitem')
		await waitFor(() => expect(rows[2].getBoundingClientRect().top).toBeGreaterThanOrEqual(rows[1].getBoundingClientRect().bottom - 1))
	},
}
