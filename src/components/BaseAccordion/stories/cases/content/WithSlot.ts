import { expect } from 'storybook/test'
import type meta from '../../BaseAccordion.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseAccordion from '../../../ui/BaseAccordion.vue'
import type { BaseAccordionItem } from '../../../types/BaseAccordion.types'

const SLOT_ITEMS: BaseAccordionItem[] = [
	{ label: 'Контакты', slot: 'contacts' },
	{ label: 'Реквизиты', content: 'ООО «Райз», ИНН 7700000000, КПП 770001001.' },
]

export const WithSlot: StoryObj<typeof meta> = {
	args: { items: SLOT_ITEMS },
	parameters: {
		docs: {
			description: {
				story: [
					'Своё содержимое панели — именованный слот, имя которого задаёт поле `slot` пункта. Пока панель закрыта,',
					'ссылки внутри неё недоступны для Tab (`inert`).',
				].join('\n'),
			},
			source: {
				code: [
					"<BaseAccordion :items=\"[{ label: 'Контакты', slot: 'contacts' }, …]\">",
					'  <template #contacts>',
					'    <a href="mailto:support@example.com">support@example.com</a>',
					'  </template>',
					'</BaseAccordion>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseAccordion },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<div class="story-medium">
				<BaseAccordion v-bind="props">
					<template #contacts>
						Почта поддержки: <a href="mailto:support@example.com">support@example.com</a>
					</template>
				</BaseAccordion>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const link = canvas.getByRole('link', { name: 'support@example.com', hidden: true })
		link.focus()
		await expect(link).not.toHaveFocus()

		const contacts = canvas.getByRole('button', { name: 'Контакты' })
		await userEvent.click(contacts)
		await expect(contacts).toHaveAttribute('aria-expanded', 'true')
		await userEvent.tab()
		await expect(link).toHaveFocus()
	},
}
