import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseNotificationCenter.stories'
import BaseNotificationCenter from '../../../ui/BaseNotificationCenter.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-center', dot: 'story-themed-dot' }

const OWN_ARGS = ['title']

const template = `
	<div class="story-row" style="align-items: flex-start;">
		<div style="width: 360px;">
			<BaseNotificationCenter v-bind="args" title="По умолчанию" />
		</div>
		<div style="width: 360px; --rise-notification-center-bg: var(--rise-bg-muted); --rise-notification-center-radius: var(--rise-radius-2xl); --rise-notification-center-padding: 16px; --rise-notification-center-shadow: var(--rise-shadow-md); --rise-notification-center-item-bg-hover: var(--rise-primary-soft); --rise-notification-center-dot-bg: var(--rise-error); --rise-notification-center-title-font-size: var(--rise-font-size-lg);">
			<BaseNotificationCenter v-bind="args" title="Токены на контейнере" />
		</div>
		<div style="width: 360px;">
			<BaseNotificationCenter v-bind="args" title="Классы через ui" :ui="ui" />
		</div>
	</div>
`

const dotOf = (panel: HTMLElement): Element => panel.querySelector('.base-notification-center__dot')!

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-notification-center-*` кит только читает: панель — `bg`, `text`, `border`, `radius`,',
					'`shadow`, `padding`; пункт — `item-bg-hover`, `item-padding-x`, `item-padding-y`, `item-gap`; `dot-bg` — точка «не прочитано»;',
					'`title-font-size` — заголовок. Задайте их на `:root`, в теме или на контейнере. Отступ панели умножается на плотность',
					'темы `--rise-density`. Проп `ui` добавляет классы к частям (`root`, `header`, `title`, `count`, `read-all`, `list`, `item`,',
					'`main`, `avatar`, `icon`, `body`, `item-title`, `text`, `time`, `dot`, `toggle`, `empty`); глобально — `defaults.BaseNotificationCenter.ui`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseNotificationCenter'],
				script: `const ui = ${literal(ui)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseNotificationCenter },
		setup: useStorySetup(args, { data: { ui }, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('region', { name: 'По умолчанию' })
		const themed = canvas.getByRole('region', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('region', { name: 'Классы через ui' })

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(dotOf(themed)).backgroundColor).not.toBe(getComputedStyle(dotOf(plain)).backgroundColor)
		await expect(getComputedStyle(themed).boxShadow).not.toBe(getComputedStyle(plain).boxShadow)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingTop).toBe('16px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).paddingTop).toBe('12px')
		await expect(classed).toHaveClass('base-notification-center', 'story-themed-center')
		await expect(dotOf(classed)).toHaveClass('story-themed-dot')
	},
}
