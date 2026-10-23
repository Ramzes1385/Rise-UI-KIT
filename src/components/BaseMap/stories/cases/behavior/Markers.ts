import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { MOSCOW, OFFICES, liveOrDemo } from '../../shared'
import { literal, storySource, tabTo, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const state = { center: MOSCOW, zoom: 12, selected: '—' }

const template = `
	<div class="story-stack">
		<BaseMap v-bind="args" v-model:center="center" v-model:zoom="zoom" :markers="markers" @marker-click="marker => (selected = marker.title)" />
		<p>Выбрано: {{ selected }}</p>
	</div>
`

export const Markers: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Метки — кнопки: Tab переходит между ними, Enter выбирает, событие `marker-click` передаёт метку. Центр и масштаб — `v-model:center` и `v-model:zoom`. С ключом из `.env.local` — Яндекс Карты, без него — демо-поставщик без сети (ключ `demo`); в приложении — ваш ключ.',
			},
			source: storySource({ template, imports: ['BaseMap'], state, script: `const markers = ${literal(OFFICES)}` }),
			story: { inline: false, height: '420px' },
		},
	},
	decorators: [withYandexMapsKey],
	args: liveOrDemo.args,
	beforeEach: liveOrDemo.beforeEach,
	render: args => ({
		components: { BaseMap },
		setup: useStorySetup(args, { state, data: { markers: OFFICES } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const marker = await waitFor(() => canvas.getByRole('button', { name: 'Арбат' }))
		await tabTo(marker, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByText('Выбрано: Арбат')).toBeInTheDocument()
	},
}
