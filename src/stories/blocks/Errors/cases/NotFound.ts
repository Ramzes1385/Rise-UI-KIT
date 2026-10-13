import { setup } from './NotFound.setup'
import type meta from '../Errors.stories'
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import { waitFor, expect } from 'storybook/test'
import setupSource from './NotFound.setup.ts?raw'
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseButton } from '@components/BaseButton'
import { BaseSearch } from '@components/BaseSearch'
import type { StoryObj } from '@storybook/vue3-vite'
import { scriptImports, scriptSource, staticStorySource, tabTo, useStorySetup } from '@/stories/helpers'

const template = `
	<main class="blk-page blk-error">
		<BaseEmpty variant="ghost" :custom-class="{ content: 'blk-error__content', actions: 'blk-error__actions' }">
			<template #icon><p class="blk-error__code" aria-hidden="true">404</p></template>
			<div class="blk-error__text">
				<h1 class="blk-title">Страница не найдена</h1>
				<p class="blk-muted">Возможно, её переместили или в адресе опечатка. Найдите нужное через поиск или вернитесь на главную.</p>
			</div>
			<div class="blk-error__search">
				<BaseSearch v-model="query" :results="pages" placeholder="Поиск по сайту" @select="open" />
			</div>
			<template #actions>
				<BaseButton variant="outline" @click="message = 'Возврат на предыдущую страницу'">
					<template #left><BaseIcon name="arrow-left" /></template>
					Назад
				</BaseButton>
				<BaseLink href="#">На главную</BaseLink>
			</template>
		</BaseEmpty>
		<nav class="blk-error__links" aria-label="Популярные разделы">
			<p class="blk-muted">Популярные разделы</p>
			<ul class="blk-error__list">
				<li v-for="page in popular" :key="page.id">
					<BaseLink href="#" @click.prevent="open(page)">{{ page.title }}</BaseLink>
				</li>
			</ul>
		</nav>
		<p role="status" class="blk-muted">{{ message }}</p>
	</main>
`

export const NotFound: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			story: { inline: false, height: '540px' },
			description: {
				story: [
					'Страница 404 на BaseEmpty: крупный код ошибки в слоте `icon` скрыт от скринридера, смысл передаёт заголовок `h1` в слоте по умолчанию',
					'(проп `title` BaseEmpty рисует `h3`, а на странице ошибки нужен заголовок первого уровня). Поиск по разделам сайта (стрелки и Enter),',
					'кнопка «Назад» и ссылка на главную — в слоте `actions`, ниже список популярных разделов. Выбранный раздел объявляет область `role="status"`.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				...scriptImports(setupSource, { imports: ['BaseButton', 'BaseEmpty', 'BaseIcon', 'BaseLink', 'BaseSearch'] }),
				vue: ['ref'],
				script: scriptSource(setupSource),
			}),
		},
	},
	render: args => ({
		components: { BaseButton, BaseEmpty, BaseIcon, BaseLink, BaseSearch },
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('heading', { level: 1, name: 'Страница не найдена' })).toBeVisible()
		const field = canvas.getByPlaceholderText('Поиск по сайту')
		await tabTo(field, userEvent)
		await userEvent.keyboard('тари')
		await waitFor(() => expect(document.querySelector('.base-search__result')).toHaveTextContent('Тарифы'))
		await userEvent.keyboard('{ArrowDown}{Enter}')
		await waitFor(() => expect(canvas.getByText('Открыт раздел «Тарифы»')).toHaveAttribute('role', 'status'))

		await userEvent.click(canvas.getByRole('link', { name: 'Документация' }))
		await waitFor(() => expect(canvas.getByText('Открыт раздел «Документация»')).toHaveAttribute('role', 'status'))
	},
}
