import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseNotification.stories'
import BaseNotification from '../../../ui/BaseNotification.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { item: 'story-themed-notification', title: 'story-themed-title' }

const OWN_ARGS = ['title', 'ariaLabel']

const template = `
	<div class="story-stack story-medium">
		<BaseNotification v-bind="args" title="По умолчанию" aria-label="Уведомления по умолчанию" />
		<div style="--rise-notification-bg: var(--rise-primary-soft); --rise-notification-text: var(--rise-primary-text); --rise-notification-description-text: var(--rise-primary-text); --rise-notification-border: var(--rise-primary-border); --rise-notification-radius: var(--rise-radius-2xl); --rise-notification-padding: 20px; --rise-notification-title-font-size: var(--rise-font-size-base);">
			<BaseNotification v-bind="args" title="Токены на контейнере" aria-label="Уведомления с токенами" />
		</div>
		<BaseNotification v-bind="args" title="Классы через ui" aria-label="Уведомления с классами" :ui="ui" />
	</div>
`

const card = (canvas: ReturnType<typeof within>, name: string): HTMLElement =>
	within(canvas.getByRole('region', { name })).getByRole('status')

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['type', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-notification-*` кит только читает: карточка — `bg`, `text`, `border`, `radius`, `shadow`,',
					'`padding`, `width`; `gap` — между карточками; `title-font-size`, `title-font-weight` — заголовок. Задайте их на `:root`,',
					'в теме или на контейнере; уведомления `useToast()` телепортируются, для них — на `:root`, в теме или на цели телепорта.',
					'Отступ карточки умножается на плотность темы `--rise-density`. Проп `ui` добавляет классы к частям (`root`, `list`, `item`,',
					'`icon`, `content`, `title`, `description`, `actions`, `close`, `progress`); глобально — `defaults.BaseNotification.ui`.',
					'Область наследует тему и движение (`data-rise-theme`, `data-rise-motion`) места, где стоит компонент.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseNotification'],
				script: `const ui = ${literal(ui)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseNotification },
		setup: useStorySetup(args, { data: { ui }, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvas }) => {
		await canvas.findAllByRole('status')
		const plain = card(canvas, 'Уведомления по умолчанию')
		const themed = card(canvas, 'Уведомления с токенами')
		const classed = card(canvas, 'Уведомления с классами')

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		if (!isStoryBranded())
			await expect(getComputedStyle(themed).borderTopLeftRadius).not.toBe(getComputedStyle(plain).borderTopLeftRadius)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingTop).toBe('20px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).paddingTop).toBe('16px')
		await expect(classed).toHaveClass('base-notification-item', 'story-themed-notification')
		await expect(classed.querySelector('.base-notification-item__title')).toHaveClass('story-themed-title')
	},
}
