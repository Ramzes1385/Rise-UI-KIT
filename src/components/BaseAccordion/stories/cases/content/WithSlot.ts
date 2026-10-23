import { expect } from 'storybook/test'
import type meta from '../../BaseAccordion.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAccordion from '../../../ui/BaseAccordion.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import type { BaseAccordionItem } from '../../../types/BaseAccordion.types'

const SLOT_ITEMS: BaseAccordionItem[] = [
	{ label: 'Контакты', slot: 'contacts' },
	{ label: 'Реквизиты', content: 'ООО «Райз», ИНН 7700000000, КПП 770001001.' },
]

const template = `
	<div class="story-medium">
		<BaseAccordion v-bind="args">
			<template #contacts>
				Почта поддержки: <a href="mailto:support@example.com">support@example.com</a>
			</template>
		</BaseAccordion>
	</div>
`

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
			source: storySource({ template, imports: ['BaseAccordion'] }),
		},
	},
	render: args => ({
		components: { BaseAccordion },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const link = canvasElement.querySelector<HTMLAnchorElement>('a[href="mailto:support@example.com"]')!
		link.focus()
		await expect(link).not.toHaveFocus()

		const contacts = canvas.getByRole('button', { name: 'Контакты' })
		await userEvent.click(contacts)
		await expect(contacts).toHaveAttribute('aria-expanded', 'true')
		await userEvent.tab()
		await expect(link).toHaveFocus()
	},
}
