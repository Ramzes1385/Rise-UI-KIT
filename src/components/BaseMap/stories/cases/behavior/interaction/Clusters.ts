import BaseMap from '../../../../ui/BaseMap.vue'
import type meta from '../../../BaseMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { CROWD, MOSCOW, liveOrDemo } from '../../../shared'
import { literal, storySource, tabTo, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const state = { center: MOSCOW, zoom: 10 }

const template = `
	<div class="story-stack">
		<BaseMap v-bind="args" v-model:center="center" v-model:zoom="zoom" is-clustered :markers="markers" />
		<p class="story-label">Масштаб: {{ zoom }}</p>
	</div>
`

const GROUP = /^Группа меток, всего \d+$/

export const Clusters: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: [
					'`isClustered` объединяет близкие метки в группы-кружки с числом (сетка 64px, до масштаба 17). Группа — кнопка с именем «Группа меток, всего N»;',
					'клик или Enter приближает карту к её меткам, при приближении группы распадаются на отдельные метки. Работает одинаково у Яндекса и Google, без дополнительных пакетов.',
					'Метка вне группы остаётся обычной кнопкой со своей подписью. С ключом из `.env.local` — Яндекс Карты, без него — демо-поставщик без сети.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseMap'], state, script: `const markers = ${literal(CROWD)}` }),
			story: { inline: false, height: '480px' },
		},
		controls: { include: ['variant', 'sizeScale', 'height'] },
	},
	args: liveOrDemo.args,
	beforeEach: liveOrDemo.beforeEach,
	render: args => ({
		components: { BaseMap },
		setup: useStorySetup(args, { state, data: { markers: CROWD } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const map = canvas.getByRole('region', { name: 'Карта' })
		const group = await waitFor(() => within(map).getAllByRole('button', { name: GROUP })[0]!)
		await expect(canvas.getByText('Масштаб: 10')).toBeInTheDocument()
		await tabTo(group, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.queryByText('Масштаб: 10')).toBeNull())
		const next = Number(/Масштаб: (\d+)/.exec(canvas.getByText(/^Масштаб: /).textContent ?? '')?.[1])
		await expect(next).toBeGreaterThan(10)
		await waitFor(() => expect(within(map).getAllByRole('button').length).toBeGreaterThan(0))
	},
}
