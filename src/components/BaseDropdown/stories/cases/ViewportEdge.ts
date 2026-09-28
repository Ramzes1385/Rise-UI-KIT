import { ref } from 'vue'
import { FILE_ACTIONS } from '../shared'
import type meta from '../BaseDropdown.stories'
import { BaseIcon } from '@components/BaseIcon'
import { BaseMenu } from '@components/BaseMenu'
import { BaseButton } from '@components/BaseButton'
import BaseDropdown from '../../ui/BaseDropdown.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { screen, waitFor, expect } from 'storybook/test'

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
		},
		layout: 'fullscreen',
		controls: { include: ['gap', 'variant'] },
	},
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseIcon, BaseMenu },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['isOpen', 'position', 'onUpdate:isOpen']),
			isOpen: ref(false),
			actions: FILE_ACTIONS,
		}),
		template: `
			<div style="box-sizing: border-box; display: flex; align-items: flex-end; justify-content: flex-end; min-height: 100vh; padding: 16px;">
				<BaseDropdown v-bind="props" v-model:is-open="isOpen" position="bottom-start">
					<BaseButton variant="outline" @click="isOpen = !isOpen">
						Действия
						<template #right><BaseIcon name="chevron-down" :size-scale="80" /></template>
					</BaseButton>
					<template #dropdown>
						<BaseMenu variant="ghost" :items="actions" @select="isOpen = false" />
					</template>
				</BaseDropdown>
			</div>
		`,
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
