import type meta from '../Errors.stories'
import { setup } from './ServerError.setup'
import { BaseIcon } from '@components/BaseIcon'
import { waitFor, expect } from 'storybook/test'
import { BaseAlert } from '@components/BaseAlert'
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseButton } from '@components/BaseButton'
import setupSource from './ServerError.setup.ts?raw'
import type { StoryObj } from '@storybook/vue3-vite'
import { scriptSource, staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<main class="blk-page blk-error">
		<BaseEmpty variant="ghost" :custom-class="{ content: 'blk-error__content', actions: 'blk-error__actions' }">
			<template #icon><p class="blk-error__code" aria-hidden="true">500</p></template>
			<div class="blk-error__text">
				<h1 class="blk-title">Что-то пошло не так</h1>
				<p class="blk-muted">На сервере произошла ошибка. Мы уже знаем о ней. Повторите запрос или напишите в поддержку.</p>
			</div>
			<BaseAlert class="blk-error__alert" type="error">
				<strong>Сервис временно недоступен.</strong> Номер обращения: <code>{{ requestId }}</code> — назовите его поддержке, чтобы мы быстрее нашли причину.
			</BaseAlert>
			<template #actions>
				<BaseButton :is-loading="isRetrying" @click="retry">
					<template #left><BaseIcon name="rotate-ccw" /></template>
					Повторить
				</BaseButton>
				<BaseButton variant="outline" @click="report">Сообщить о проблеме</BaseButton>
			</template>
		</BaseEmpty>
		<p role="status" class="blk-muted">{{ message }}</p>
	</main>
`

export const ServerError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			story: { inline: false, height: '520px' },
			description: {
				story: [
					'Страница 500 на BaseEmpty: код в слоте `icon` (скрыт от скринридера), заголовок `h1` и BaseAlert с номером обращения —',
					'в слоте по умолчанию, кнопки — в слоте `actions`: «Повторить»',
					'с состоянием загрузки (`isLoading`) и «Сообщить о проблеме». Итог действия объявляет область `role="status"`.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseAlert', 'BaseButton', 'BaseEmpty', 'BaseIcon'],
				vue: ['ref'],
				script: scriptSource(setupSource),
			}),
		},
	},
	render: args => ({
		components: { BaseAlert, BaseButton, BaseEmpty, BaseIcon },
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('heading', { level: 1, name: 'Что-то пошло не так' })).toBeVisible()
		await expect(canvas.getByText('REQ-7F3A-2C91')).toBeVisible()

		canvas.getByRole('button', { name: 'Повторить' }).focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getByText(/^Попытка 1: сервис пока недоступен/)).toHaveAttribute('role', 'status'))

		await userEvent.click(canvas.getByRole('button', { name: 'Сообщить о проблеме' }))
		await waitFor(() => expect(canvas.getByText('Обращение REQ-7F3A-2C91 отправлено в поддержку')).toHaveAttribute('role', 'status'))
	},
}
