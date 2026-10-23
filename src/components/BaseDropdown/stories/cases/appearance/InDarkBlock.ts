import { FILE_ACTIONS } from '../../shared'
import { BaseIcon } from '@components/BaseIcon'
import { BaseMenu } from '@components/BaseMenu'
import { BaseText } from '@components/BaseText'
import { screen, expect } from 'storybook/test'
import type meta from '../../BaseDropdown.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDropdown from '../../../ui/BaseDropdown.vue'
import { docsFrame, literal, storySource, useStorySetup } from '@/stories/helpers'

const HIDDEN_ARGS = ['isOpen', 'onUpdate:isOpen']

const actions = FILE_ACTIONS

const state = { isOpen: false }

const template = `
	<div data-theme="dark" class="story-stack" style="padding: 16px; border-radius: var(--rise-radius-md); background: var(--rise-bg); color: var(--rise-text);">
		<BaseText>Плеер: тёмная панель на светлой странице</BaseText>
		<BaseDropdown v-bind="args" v-model:is-open="isOpen">
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
			source: storySource({
				template,
				imports: ['BaseDropdown', 'BaseButton', 'BaseIcon', 'BaseMenu', 'BaseText'],
				state,
				script: `const actions = ${literal(actions)}`,
				omit: HIDDEN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseIcon, BaseMenu, BaseText },
		setup: useStorySetup(args, { state, data: { actions }, slots: HIDDEN_ARGS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Действия' }))
		const panel = (await screen.findByText('Скачать')).closest('.base-dropdown__panel')
		await expect(panel).toHaveAttribute('data-theme', 'dark')
	},
}
