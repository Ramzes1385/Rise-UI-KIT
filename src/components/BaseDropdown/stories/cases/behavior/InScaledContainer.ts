import { FILE_ACTIONS } from '../../shared'
import { BaseApp } from '@components/BaseApp'
import { BaseIcon } from '@components/BaseIcon'
import { BaseMenu } from '@components/BaseMenu'
import type meta from '../../BaseDropdown.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDropdown from '../../../ui/BaseDropdown.vue'
import { screen, waitFor, expect } from 'storybook/test'
import { docsFrame, literal, storySource, useStorySetup } from '@/stories/helpers'

const HIDDEN_ARGS = ['isOpen', 'position', 'onUpdate:isOpen']

const actions = FILE_ACTIONS

const state = { isOpen: false }

const template = `
	<div data-story-scaled style="width: 480px; height: 240px; transform: scale(0.75); transform-origin: top left; padding: 16px; border: 1px dashed var(--rise-border);">
		<BaseApp teleport-to="#story-scaled-layer">
			<BaseDropdown v-bind="args" v-model:is-open="isOpen" position="bottom-start">
				<BaseButton variant="outline" @click="isOpen = !isOpen">
					Действия
					<template #right><BaseIcon name="chevron-down" :size-scale="80" /></template>
				</BaseButton>
				<template #dropdown>
					<BaseMenu variant="ghost" :items="actions" @select="isOpen = false" />
				</template>
			</BaseDropdown>
			<div id="story-scaled-layer" />
		</BaseApp>
	</div>
`

export const InScaledContainer: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		controls: { include: ['gap', 'variant'] },
		docs: {
			...docsFrame(320),
			description: {
				story: [
					'Панель внутри предка с `transform: scale(0.75)` (слой телепорта лежит в нём): координаты панели переводятся в единицы предка,',
					'и она остаётся у триггера — без сдвига на разницу масштаба.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseDropdown', 'BaseButton', 'BaseIcon', 'BaseMenu', 'BaseApp'],
				state,
				script: `const actions = ${literal(actions)}`,
				omit: HIDDEN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseIcon, BaseMenu, BaseApp },
		setup: useStorySetup(args, { state, data: { actions }, slots: HIDDEN_ARGS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Действия' })
		await userEvent.click(trigger)
		const panel = (await screen.findByText('Скачать')).closest('.base-dropdown__panel') as HTMLElement

		await waitFor(() => {
			const panelRect = panel.getBoundingClientRect()
			const triggerRect = trigger.getBoundingClientRect()
			expect(Math.abs(panelRect.left - triggerRect.left)).toBeLessThanOrEqual(2)
			expect(panelRect.top - triggerRect.bottom).toBeGreaterThanOrEqual(0)
			expect(panelRect.top - triggerRect.bottom).toBeLessThanOrEqual(12)
		})
	},
}
