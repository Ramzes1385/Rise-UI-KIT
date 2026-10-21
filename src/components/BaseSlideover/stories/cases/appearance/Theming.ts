import { expect } from 'storybook/test'
import { BaseText } from '@components/BaseText'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import type meta from '../../BaseSlideover.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSlideover from '../../../ui/BaseSlideover.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const MOBILE_QUERY = '(max-width: 639.98px)'

const ui = { panel: 'story-themed-slideover', title: 'story-themed-title' }

const template = `
	<div class="story-row">
		<div class="story-frame story-medium" style="height: 220px;">
			<BaseSlideover v-bind="args" is-open is-contained title="По умолчанию">
				<BaseText>Панель без настроек.</BaseText>
			</BaseSlideover>
		</div>
		<div class="story-frame story-medium" style="height: 220px; --rise-slideover-panel-bg: var(--rise-primary-soft); --rise-slideover-panel-text: var(--rise-primary-text); --rise-slideover-panel-radius: var(--rise-radius-2xl); --rise-slideover-panel-padding-x: 28px; --rise-slideover-title-font-size: var(--rise-font-size-lg);">
			<BaseSlideover v-bind="args" is-open is-contained title="Токены на контейнере">
				<BaseText>Фон, текст, радиус и отступы панели.</BaseText>
			</BaseSlideover>
		</div>
		<div class="story-frame story-medium" style="height: 220px;">
			<BaseSlideover v-bind="args" is-open is-contained title="Классы через ui" :ui="ui">
				<BaseText>Классы добавлены к панели и заголовку.</BaseText>
			</BaseSlideover>
		</div>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'side', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-slideover-*` кит только читает: `bg` (затемнение), `panel-bg`, `panel-text`,',
					'`panel-border`, `panel-radius`, `panel-shadow`, `panel-width` (ширина при `width: 100`), `panel-padding-x`, `panel-padding-y`',
					'(шапка, тело, подвал; проп `padding` важнее), `title-font-size` — задайте их на `:root`, в теме или на контейнере.',
					'Токены контейнера доходят до панели в блоке (`isContained`, `container`); телепортированной в body — только с `:root` или темы.',
					'Отступы умножаются на плотность темы `--rise-density`. На экране уже 640 px панель во всю ширину и без радиуса. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `panel`, `header`, `title`, `close`, `body`, `footer`);',
					'глобально — `defaults.BaseSlideover.ui` плагина. Панель из области с `data-rise-theme` или `data-rise-motion` наследует её тему и движение.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseSlideover', 'BaseText'],
				script: `const ui = ${literal(ui)}`,
				omit: [...SHOWCASE_OWN_ARGS],
			}),
		},
	},
	render: args => ({
		components: { BaseSlideover, BaseText },
		setup: useStorySetup(args, { data: { ui }, slots: [...SHOWCASE_OWN_ARGS] }),
		template,
	}),
	play: async ({ canvas }) => {
		const [plain, themed, classed] = await canvas.findAllByRole('dialog')
		const radius = (element: HTMLElement): string => getComputedStyle(element).borderStartStartRadius

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		const hasRadius = !isStoryBranded() && !window.matchMedia(MOBILE_QUERY).matches
		if (hasRadius) await expect(radius(themed)).not.toBe(radius(plain))
		if (hasRadius) await expect(radius(themed)).toBe('16px')
		if (hasRadius) await expect(radius(plain)).toBe('12px')
		await expect(classed).toHaveClass('base-slideover__panel', 'story-themed-slideover')
		await expect(classed.querySelector('.base-slideover__title')).toHaveClass('story-themed-title')
	},
}
