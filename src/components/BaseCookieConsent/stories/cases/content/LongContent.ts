import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCookieConsent.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseCookieConsent from '../../../ui/BaseCookieConsent.vue'

const template = `
	<div class="story-frame" style="height: 360px; background: var(--rise-bg-muted)">
		<BaseCookieConsent v-bind="args" />
	</div>
`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Много категорий с длинными описаниями и длинный заголовок: высота окна ограничена рамкой (`max-height`), содержимое прокручивается,',
					'текст переносится по словам.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCookieConsent'] }),
		},
	},
	args: {
		isSettingsOpen: true,
		title: 'Мы используем cookies и похожие технологии, чтобы магазин работал быстрее и точнее',
		categories: [
			{
				id: 'necessary',
				label: 'Необходимые',
				description: 'Без них не работают корзина, вход в аккаунт и оформление заказа, поэтому отключить их нельзя.',
				isRequired: true,
			},
			{
				id: 'preferences',
				label: 'Настройки интерфейса',
				description:
					'Запоминают выбранный город, язык, тему оформления и размер шрифта, чтобы вам не приходилось выбирать их при каждом визите.',
			},
			{
				id: 'analytics',
				label: 'Аналитика посещаемости',
				description:
					'Обезличенно показывают, какие страницы читают чаще всего и где покупатели чаще всего прерывают оформление заказа.',
			},
			{
				id: 'marketing',
				label: 'Маркетинг и реклама',
				description:
					'Помогают показывать предложения, которые вам действительно подходят, и не повторять рекламу, которую вы уже видели.',
			},
			{
				id: 'social',
				label: 'Социальные сети',
				description:
					'Позволяют делиться товарами в соцсетях и показывают на страницах встроенные ленты и видео сторонних сервисов.',
			},
			{
				id: 'support',
				label: 'Онлайн-консультант',
				description:
					'Сохраняют историю обращения в чат поддержки, чтобы вы могли продолжить разговор с того же места на другом устройстве.',
			},
		],
	},
	render: args => ({
		components: { BaseCookieConsent },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const dialog = canvas.getByRole('dialog')
		const frame = dialog.parentElement as HTMLElement
		await expect(dialog.scrollHeight).toBeGreaterThan(dialog.clientHeight)
		await expect(dialog.getBoundingClientRect().top).toBeGreaterThanOrEqual(frame.getBoundingClientRect().top)
		await expect(dialog.getBoundingClientRect().bottom).toBeLessThanOrEqual(frame.getBoundingClientRect().bottom)
		await expect(dialog.scrollWidth).toBeLessThanOrEqual(dialog.clientWidth)
		await expect(canvas.getByRole('button', { name: 'Принять все' })).toBeInTheDocument()
	},
}
