import { NAV } from '../shared'
import type meta from '../BaseHeader.stories'
import { BaseLink } from '@components/BaseLink'
import BaseHeader from '../../ui/BaseHeader.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { expect, screen, within, waitFor } from 'storybook/test'

export const WithMenu: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Слот `menu`: на экране уже 768px навигация прячется, а кнопка «Меню» открывает её в выдвижной панели.',
					'Сузьте окно Storybook, чтобы увидеть кнопку; play открывает меню из кода на любой ширине.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseHeader, BaseLink },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<BaseHeader v-bind="props">
				${NAV}
				<template #menu="{ close }">
					<nav aria-label="Основное меню" class="story-stack">
						<BaseLink href="#orders" @click="close">Заказы</BaseLink>
						<BaseLink href="#clients" @click="close">Клиенты</BaseLink>
						<BaseLink href="#reports" @click="close">Отчёты</BaseLink>
					</nav>
				</template>
			</BaseHeader>
		`,
	}),
	play: async ({ canvasElement, userEvent }) => {
		const toggle = canvasElement.querySelector('.base-header__toggle') as HTMLButtonElement
		await expect(toggle).toHaveAttribute('aria-expanded', 'false')
		toggle.click()
		const dialog = await screen.findByRole('dialog', { name: 'Меню' })
		await expect(toggle).toHaveAttribute('aria-expanded', 'true')
		await userEvent.click(within(dialog).getByRole('link', { name: 'Клиенты' }))
		await waitFor(() => expect(dialog).not.toBeInTheDocument())
	},
}
