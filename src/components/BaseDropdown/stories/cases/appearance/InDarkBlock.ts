import { ref } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseMenu } from '@components/BaseMenu'
import { BaseText } from '@components/BaseText'
import { screen, expect } from 'storybook/test'
import type meta from '../../BaseDropdown.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { docsFrame, FILE_ACTIONS } from '../../shared'
import BaseDropdown from '../../../ui/BaseDropdown.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const InDarkBlock: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			...docsFrame(240),
			description: {
				story: [
					'Тёмный блок на светлой странице: панель телепортирована в body, но берёт `data-theme` ближайшего предка',
					'триггера — её цвета совпадают с блоком, а не со страницей.',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseIcon, BaseMenu, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, ['isOpen', 'onUpdate:isOpen']), isOpen: ref(false), actions: FILE_ACTIONS }),
		template: `
			<div data-theme="dark" class="story-stack" style="padding: 16px; border-radius: var(--rise-radius-md); background: var(--rise-bg); color: var(--rise-text);">
				<BaseText>Плеер: тёмная панель на светлой странице</BaseText>
				<BaseDropdown v-bind="props" v-model:is-open="isOpen">
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
		await userEvent.click(canvas.getByRole('button', { name: 'Действия' }))
		const panel = (await screen.findByText('Скачать')).closest('.base-dropdown__panel')
		await expect(panel).toHaveAttribute('data-theme', 'dark')
	},
}
