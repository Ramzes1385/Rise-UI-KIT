import { BaseApp } from '@components/BaseApp'
import type meta from '../../BaseTour.stories'
import BaseTour from '../../../ui/BaseTour.vue'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { panel: 'story-themed-tour', title: 'story-themed-title' }
const plainSteps = [{ title: 'По умолчанию', content: 'Карточка без настроек.' }]
const themedSteps = [{ title: 'Токены на контейнере', content: 'Фон, текст, радиус и отступ карточки.' }]
const classedSteps = [{ title: 'Классы через ui', content: 'Классы добавлены к карточке и заголовку.' }]

const template = `
	<div class="story-row">
		<div class="story-frame story-medium" style="height: 260px; contain: layout;">
			<BaseApp teleport-to="#tour-layer-plain" :toaster="{ ariaLabel: 'Уведомления: по умолчанию' }">
				<BaseTour v-bind="args" is-open :steps="plainSteps" />
				<div id="tour-layer-plain" />
			</BaseApp>
		</div>
		<div class="story-frame story-medium" style="height: 260px; contain: layout; --rise-tour-card-bg: color-mix(in srgb, var(--rise-primary-soft) 50%, var(--rise-bg)); --rise-tour-card-text: var(--rise-primary-text); --rise-tour-card-radius: var(--rise-radius-2xl); --rise-tour-card-padding: 24px; --rise-tour-title-font-size: var(--rise-font-size-lg);">
			<BaseApp teleport-to="#tour-layer-themed" :toaster="{ ariaLabel: 'Уведомления: токены' }">
				<BaseTour v-bind="args" is-open :steps="themedSteps" />
				<div id="tour-layer-themed" />
			</BaseApp>
		</div>
		<div class="story-frame story-medium" style="height: 260px; contain: layout;">
			<BaseApp teleport-to="#tour-layer-classed" :toaster="{ ariaLabel: 'Уведомления: классы' }">
				<BaseTour v-bind="args" is-open :steps="classedSteps" :ui="ui" />
				<div id="tour-layer-classed" />
			</BaseApp>
		</div>
	</div>
`

const script = [
	`const ui = ${literal(ui)}`,
	`const plainSteps = ${literal(plainSteps)}`,
	`const themedSteps = ${literal(themedSteps)}`,
	`const classedSteps = ${literal(classedSteps)}`,
].join('\n')

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['showProgress', 'showSkip'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-tour-*` кит только читает: `card-bg`, `card-text`, `card-border`, `card-radius`,',
					'`card-shadow`, `card-padding`, `card-width` (карточка и стрелка), `title-font-size`, `spotlight-radius` (без пропа `radius`),',
					'`spotlight-ring` (кольцо подсветки), `progress-bar-bg`, `progress-bar-fill-bg` — задайте их на `:root`, в теме или на контейнере',
					'слоёв (`<BaseApp teleport-to>`): тур телепортируется. Отступ умножается на плотность темы `--rise-density`.',
					'Список — docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы к частям (`root`, `overlay`, `spotlight`, `card`, `arrow`,',
					'`panel`, `header`, `title`, `close`, `content`, `footer`, `progress`, `dot`, `progress-bar`, `progress-bar-fill`, `counter`, `actions`);',
					'глобально — `defaults.BaseTour.ui` плагина. Тур из области с `data-rise-theme` или `data-rise-motion` наследует её тему и движение.',
					'Здесь каждый тур — в своём контейнере слоёв (`contain: layout`), чтобы три тура поместились рядом.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseApp', 'BaseTour'],
				script,
				omit: ['isOpen', 'steps', 'step', 'onUpdate:isOpen', 'onUpdate:step', 'onSkip', 'onFinish', 'onClose'],
			}),
		},
	},
	render: args => ({
		components: { BaseApp, BaseTour },
		setup: useStorySetup(args, { data: { ui, plainSteps, themedSteps, classedSteps }, slots: [] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-tour__panel')).toHaveLength(3))
		const [plain, themed, classed] = Array.from(canvasElement.querySelectorAll<HTMLElement>('.base-tour__panel'))

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).not.toBe(getComputedStyle(plain).borderTopLeftRadius)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).borderTopLeftRadius).toBe('8px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingTop).toBe('24px')
		await expect(classed).toHaveClass('base-tour__panel', 'story-themed-tour')
		await expect(classed.querySelector('.base-tour__title')).toHaveClass('story-themed-title')
	},
}
