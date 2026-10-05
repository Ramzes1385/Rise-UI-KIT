import { docsFrame } from '../../shared'
import { BaseApp } from '@components/BaseApp'
import { expect, screen } from 'storybook/test'
import type meta from '../../BaseTooltip.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTooltip from '../../../ui/BaseTooltip.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { popup: 'story-themed-tooltip', text: 'story-themed-text' }

const template = `
	<div class="story-row" style="gap: 48px; padding-top: 56px;">
		<BaseTooltip v-bind="args" text="По умолчанию" is-always-visible>
			<BaseButton variant="outline">По умолчанию</BaseButton>
		</BaseTooltip>
		<div style="--rise-tooltip-bg: var(--rise-primary-soft); --rise-tooltip-text: var(--rise-primary-text); --rise-tooltip-radius: var(--rise-radius-lg); --rise-tooltip-padding-x: 12px; --rise-tooltip-padding-y: 8px; --rise-tooltip-font-size: var(--rise-font-size-sm);">
			<BaseApp teleport-to="#story-tooltip-layer">
				<BaseTooltip v-bind="args" text="Токены на контейнере" is-always-visible>
					<BaseButton variant="outline">Токены</BaseButton>
				</BaseTooltip>
				<div id="story-tooltip-layer" />
			</BaseApp>
		</div>
		<BaseTooltip v-bind="args" text="Классы через ui" is-always-visible :ui="ui">
			<BaseButton variant="outline">Классы через ui</BaseButton>
		</BaseTooltip>
	</div>
`

const popupOf = async (text: string): Promise<HTMLElement> => (await screen.findByText(text)).closest<HTMLElement>('[role="tooltip"]')!

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['position', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-tooltip-*` кит только читает: `bg` (и стрелка), `text`, `radius`, `shadow`,',
					'`padding-x`, `padding-y`, `font-size`, `width` (наибольшая ширина) — задайте их на `:root`, в теме или на контейнере.',
					'Подсказка телепортируется, поэтому токены контейнера доходят до неё, когда контейнер — цель телепорта',
					'(`<BaseApp teleport-to>`, как здесь) или его предок. Отступы умножаются на плотность темы `--rise-density`.',
					'Проп `ui` добавляет классы к частям (`root` — обёртка триггера, `popup`, `text`); глобально — `defaults.BaseTooltip.ui`.',
					'Подсказка наследует тему (`data-theme`, `data-rise-theme`) и движение (`data-rise-motion`) области триггера.',
				].join('\n'),
			},
			...docsFrame(160),
			source: storySource({
				template,
				imports: ['BaseTooltip', 'BaseButton', 'BaseApp'],
				script: `const ui = ${literal(ui)}`,
				omit: ['text', 'isAlwaysVisible'],
			}),
		},
	},
	render: args => ({
		components: { BaseTooltip, BaseButton, BaseApp },
		setup: useStorySetup(args, { data: { ui }, slots: [] }),
		template,
	}),
	play: async () => {
		const plain = await popupOf('По умолчанию')
		const themed = await popupOf('Токены на контейнере')
		const classed = await popupOf('Классы через ui')

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).paddingLeft).not.toBe(getComputedStyle(plain).paddingLeft)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingLeft).toBe('12px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).paddingLeft).toBe('8px')
		await expect(classed).toHaveClass('base-tooltip-popup', 'story-themed-tooltip')
		await expect(classed.querySelector('.base-tooltip__text')).toHaveClass('story-themed-text')
	},
}
