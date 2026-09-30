import { expect } from 'storybook/test'
import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseFooter.stories'
import { BaseInput } from '@components/BaseInput'
import BaseFooter from '../../../ui/BaseFooter.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, staticStorySource, useStorySetup } from '@/stories/helpers'

const columns = [
	{
		title: 'Блог',
		links: [
			{ label: 'Статьи', href: '#articles' },
			{ label: 'Кейсы', href: '#cases' },
		],
	},
	{
		title: 'Помощь',
		links: [
			{ label: 'Вопросы и ответы', href: '#faq' },
			{ label: 'Поддержка', href: '#support' },
		],
	},
]

const state = { email: '', isSubscribed: false }

const template = `
	<BaseFooter variant="soft" container-size="lg" :columns="columns">
		<template #top>
			<strong>Рассылка раз в месяц</strong>
			<p v-if="isSubscribed" role="status" style="margin: 0">Готово: письмо придёт на {{ email }}</p>
			<form v-else aria-label="Подписка на рассылку" class="story-row" @submit.prevent="isSubscribed = true">
				<BaseInput v-model="email" type="email" aria-label="Электронная почта" placeholder="you@example.ru" is-required />
				<BaseButton type="submit">Подписаться</BaseButton>
			</form>
		</template>
		<template #start>© 2026 Rise Studio</template>
		<template #end>
			<BaseLink href="#privacy">Конфиденциальность</BaseLink>
		</template>
	</BaseFooter>
`

export const WithSubscribe: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'С подпиской: форма в слоте `top` слева от колонок, после отправки — сообщение `role="status"`.' },
			source: staticStorySource({
				template,
				imports: ['BaseFooter', 'BaseLink', 'BaseInput', 'BaseButton'],
				state,
				script: `const columns = ${literal(columns)}`,
			}),
		},
		controls: { disable: true },
	},
	render: args => ({
		components: { BaseFooter, BaseLink, BaseInput, BaseButton },
		setup: useStorySetup(args, { state, data: { columns } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.type(canvas.getByRole('textbox', { name: 'Электронная почта' }), 'anna@example.ru')
		await userEvent.click(canvas.getByRole('button', { name: 'Подписаться' }))
		await expect(canvas.getByRole('status')).toHaveTextContent('anna@example.ru')
	},
}
