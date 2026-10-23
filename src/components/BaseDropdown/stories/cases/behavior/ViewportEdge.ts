import { FILE_ACTIONS } from '../../shared'
import { BaseIcon } from '@components/BaseIcon'
import { BaseMenu } from '@components/BaseMenu'
import type meta from '../../BaseDropdown.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDropdown from '../../../ui/BaseDropdown.vue'
import { screen, waitFor, expect } from 'storybook/test'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const HIDDEN_ARGS = ['isOpen', 'position', 'onUpdate:isOpen']

const actions = FILE_ACTIONS

const state = { isOpen: false }

const template = `
	<div style="box-sizing: border-box; display: flex; align-items: flex-end; justify-content: flex-end; min-height: 100vh; padding: 16px;">
		<BaseDropdown v-bind="args" v-model:is-open="isOpen" position="bottom-start">
			<BaseButton variant="outline" @click="isOpen = !isOpen">
				Действия
				<template #right><BaseIcon name="chevron-down" :size-scale="80" /></template>
			</BaseButton>
			<template #dropdown>
				<BaseMenu variant="ghost" :items="actions" @select="isOpen = false" />
			</template>
		</BaseDropdown>
	</div>
`

export const ViewportEdge: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				story: [
					'У края окна: снизу места не хватает — панель открывается над триггером; справа не хватает — сдвигается влево',
					'и оставляет 8px до края окна. Позиция в пропе остаётся `bottom-start`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseDropdown', 'BaseButton', 'BaseIcon', 'BaseMenu'],
				state,
				script: `const actions = ${literal(actions)}`,
				omit: HIDDEN_ARGS,
			}),
		},
		layout: 'fullscreen',
		controls: { include: ['gap', 'variant'] },
	},
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseIcon, BaseMenu },
		setup: useStorySetup(args, { state, data: { actions }, slots: HIDDEN_ARGS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Действия' })
		await userEvent.click(trigger)
		const panel = (await screen.findByText('Скачать')).closest('.base-dropdown__panel') as HTMLElement

		await waitFor(() => {
			const panelRect = panel.getBoundingClientRect()
			expect(panelRect.bottom).toBeLessThanOrEqual(trigger.getBoundingClientRect().top)
			expect(panelRect.right).toBeLessThanOrEqual(document.documentElement.clientWidth - 8)
		})
	},
}
