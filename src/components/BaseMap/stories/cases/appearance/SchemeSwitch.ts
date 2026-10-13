import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import { OFFICES, liveOrDemo } from '../../shared'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { MAP_SCHEMES } from '../../../types/BaseMap.types'
import { literal, storySource, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const state = { current: 'light' }

const markers = OFFICES.slice(0, 2)

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton
				v-for="scheme in MAP_SCHEMES"
				:key="scheme"
				:variant="current === scheme ? 'default' : 'outline'"
				:aria-pressed="current === scheme"
				@click="current = scheme">
				{{ scheme }}
			</BaseButton>
		</div>
		<BaseMap v-bind="args" :scheme="current" :markers="markers" />
		<p class="story-label">Схема: {{ current }}</p>
	</div>
`

export const SchemeSwitch: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: 'Схема меняется на лету: кнопки подставляют `light`, `dark` или `auto` в `scheme`, карта остаётся на месте — у Яндекса слой схемы обновляется без пересоздания карты.',
			},
			source: storySource({
				template,
				imports: ['BaseButton', 'BaseMap', 'MAP_SCHEMES'],
				state,
				script: `const markers = ${literal(markers)}`,
			}),
			story: { inline: false, height: '460px' },
		},
		controls: { include: ['sizeScale', 'height', 'zoom'] },
	},
	args: { ...liveOrDemo.args, zoom: 12 },
	beforeEach: liveOrDemo.beforeEach,
	render: args => ({
		components: { BaseButton, BaseMap },
		setup: useStorySetup(args, { state, data: { MAP_SCHEMES, markers } }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const map = canvas.getByRole('region', { name: 'Карта' })
		await waitFor(() => expect(within(map).getByRole('button', { name: 'Красная площадь' })).toBeInTheDocument())
		const demo = canvasElement.querySelector('.story-demo-map') as HTMLElement | null
		await userEvent.click(canvas.getByRole('button', { name: 'dark' }))
		await expect(canvas.getByRole('button', { name: 'dark' })).toHaveAttribute('aria-pressed', 'true')
		await expect(canvas.getByText('Схема: dark')).toBeInTheDocument()
		if (demo) await waitFor(() => expect(demo.dataset.scheme).toBe('dark'))
		await userEvent.click(canvas.getByRole('button', { name: 'light' }))
		await expect(canvas.getByRole('button', { name: 'dark' })).toHaveAttribute('aria-pressed', 'false')
		if (demo) await waitFor(() => expect(demo.dataset.scheme).toBe('light'))
		await userEvent.click(canvas.getByRole('button', { name: 'auto' }))
		await expect(canvas.getByText('Схема: auto')).toBeInTheDocument()
	},
}
