import type meta from '../../BaseModal.stories'
import { BaseText } from '@components/BaseText'
import BaseModal from '../../../ui/BaseModal.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, within, expect } from 'storybook/test'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const TERMS = [
	'Сервис предоставляет доступ к облачному хранилищу проектов, редактору субтитров и инструментам совместной работы.',
	'Учётная запись создаётся для одного человека. Передавать доступ третьим лицам нельзя, для команды есть общие проекты.',
	'Загруженные файлы остаются вашими: мы используем их только для работы сервиса и не передаём другим пользователям.',
	'Резервные копии проектов хранятся 30 дней. После удаления проекта восстановить его можно только из резервной копии.',
	'Бесплатный тариф ограничен тремя проектами и 5 ГБ хранилища. Лимиты платных тарифов указаны на странице цен.',
	'Оплата списывается в начале каждого периода. Отменить подписку можно в любой момент в настройках аккаунта.',
	'При нарушении правил доступ к проекту может быть ограничен. Мы сообщим о причине и сроках на почту аккаунта.',
	'О плановых работах мы предупреждаем за сутки. Во время работ проекты доступны только для чтения.',
	'Вопросы и претензии принимаются через форму обратной связи. Мы отвечаем в течение двух рабочих дней.',
	'Условия могут меняться. О существенных изменениях мы сообщим заранее, продолжение работы означает согласие.',
	'Вы можете выгрузить все данные аккаунта одним архивом: проекты, субтитры, комментарии и историю правок.',
	'Удаление аккаунта необратимо. Перед удалением мы отправим письмо с подтверждением на почту аккаунта.',
] as const

const terms = TERMS

const models = { isOpen: 'isOpen' }

const template = `
	<BaseButton variant="outline" @click="onUpdate(true)">Открыть условия</BaseButton>
	<BaseModal v-bind="args" v-model:is-open="isOpen">
		<div class="story-stack">
			<BaseText v-for="(term, index) in terms" :key="index">{{ index + 1 }}. {{ term }}</BaseText>
		</div>
		<template #footer>
			<BaseButton @click="onUpdate(false)">Понятно</BaseButton>
		</template>
	</BaseModal>
`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Длинный текст прокручивается внутри тела окна: шапка и подвал с действиями остаются на экране.' },
			source: storySource({
				template,
				imports: ['BaseModal', 'BaseButton', 'BaseText'],
				script: `const terms = ${literal(terms)}`,
				models,
			}),
		},
	},
	tags: ['!autodocs'],
	args: { isOpen: true, title: 'Условия использования' },
	render: args => ({
		components: { BaseModal, BaseButton, BaseText },
		setup: useStorySetup(args, { models, data: { terms } }),
		template,
	}),
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Условия использования' })
		const accept = within(dialog).getByRole('button', { name: 'Понятно' })
		const body = within(dialog).getByText(/^1\. /).closest('.base-modal__body') as HTMLElement
		await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)
		await expect(accept.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight)
	},
}
