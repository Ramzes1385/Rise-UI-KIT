import type meta from '../../BaseImageMap.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap from '../../../ui/BaseImageMap.vue'
import { expect, screen, waitFor, within } from 'storybook/test'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { active: 'active' } as const

const template = `
	<div class="story-medium">
		<BaseImageMap v-bind="args" v-model:active="active">
			<template #point="{ object, isActive }">
				<strong>{{ isActive ? '✓' : object.title.charAt(0) }}</strong>
			</template>
			<template #tooltip="{ object, group }">
				<strong>{{ object.title }}</strong>
				<div v-if="group">{{ group.title }}</div>
			</template>
			<template #popup="{ object, close }">
				<div class="story-stack">
					<p>{{ object.description ?? 'Описания пока нет' }}</p>
					<BaseButton @click="close">Понятно</BaseButton>
				</div>
			</template>
		</BaseImageMap>
	</div>
`

export const Slots: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Слоты `point` (содержимое метки, `isActive`), `tooltip` (подсказка) и `popup` (окно; `close` закрывает его). В слоты приходят объект и его группа.',
			},
			source: storySource({ template, imports: ['BaseImageMap', 'BaseButton'], models: MODELS, types: { active: 'string | null' } }),
		},
	},
	render: args => ({
		components: { BaseImageMap, BaseButton },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const sun = canvas.getByRole('button', { name: 'Солнце' })
		await expect(sun).toHaveTextContent('С')
		await tabTo(canvas.getByRole('button', { name: 'Вершина' }), userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await expect(sun).toHaveFocus()
		await expect(await screen.findByText('Кафе и рестораны')).toBeVisible()
		await userEvent.keyboard('{Enter}')
		const dialog = await screen.findByRole('dialog', { name: 'Солнце' })
		await userEvent.click(within(dialog).getByRole('button', { name: 'Понятно' }))
		await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Солнце' })).not.toBeInTheDocument())
		await expect(sun).toHaveTextContent('✓')
	},
}
