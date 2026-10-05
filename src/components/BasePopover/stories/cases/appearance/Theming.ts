import { docsFrame } from '../../shared'
import { BaseApp } from '@components/BaseApp'
import { BaseText } from '@components/BaseText'
import { expect, screen } from 'storybook/test'
import type meta from '../../BasePopover.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePopover from '../../../ui/BasePopover.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { panel: 'story-themed-panel', inner: 'story-themed-inner' }

const template = `
	<div class="story-row" style="align-items: flex-start; gap: 48px;">
		<BasePopover v-bind="args" is-open>
			<template #trigger><BaseButton variant="outline">По умолчанию</BaseButton></template>
			<BaseText>Поповер без настроек</BaseText>
		</BasePopover>
		<div style="--rise-popover-inner-padding-x: 24px; --rise-popover-inner-padding-y: 16px; --rise-popover-inner-font-size: var(--rise-font-size-base); --rise-popover-panel-width: 240px;">
			<BaseApp teleport-to="#story-popover-layer">
				<BasePopover v-bind="args" is-open>
					<template #trigger><BaseButton variant="outline">Токены</BaseButton></template>
					Токены на контейнере
				</BasePopover>
				<div id="story-popover-layer" />
			</BaseApp>
		</div>
		<BasePopover v-bind="args" is-open :ui="ui">
			<template #trigger><BaseButton variant="outline">Классы через ui</BaseButton></template>
			<BaseText>Классы на частях</BaseText>
		</BasePopover>
	</div>
`

const innerOf = async (text: string): Promise<HTMLElement> => (await screen.findByText(text)).closest<HTMLElement>('.base-popover__inner')!

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-popover-*` кит только читает: `panel-width` (наибольшая ширина панели),',
					'`inner-padding-x`, `inner-padding-y`, `inner-font-size` (содержимое) — задайте их на `:root`, в теме или на контейнере.',
					'Фон, рамка, радиус и тень панели — общие для всплывающих панелей токены `--rise-dropdown-panel-*` (BaseDropdown).',
					'Панель телепортируется, поэтому токены контейнера доходят до неё, когда контейнер — цель телепорта',
					'(`<BaseApp teleport-to>`, как здесь) или его предок. Отступы умножаются на плотность темы `--rise-density`.',
					'Проп `ui` добавляет классы к частям (`root`, `trigger`, `panel`, `inner`, `arrow`); глобально — `defaults.BasePopover.ui`.',
				].join('\n'),
			},
			...docsFrame(220),
			source: storySource({
				template,
				imports: ['BasePopover', 'BaseButton', 'BaseText', 'BaseApp'],
				script: `const ui = ${literal(ui)}`,
				omit: ['isOpen', 'onUpdate:isOpen'],
			}),
		},
	},
	render: args => ({
		components: { BasePopover, BaseButton, BaseText, BaseApp },
		setup: useStorySetup(args, { data: { ui }, slots: [] }),
		template,
	}),
	play: async () => {
		const plain = await innerOf('Поповер без настроек')
		const themed = await innerOf('Токены на контейнере')
		const classed = await innerOf('Классы на частях')

		await expect(getComputedStyle(themed).paddingLeft).not.toBe(getComputedStyle(plain).paddingLeft)
		await expect(getComputedStyle(themed).fontSize).not.toBe(getComputedStyle(plain).fontSize)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingLeft).toBe('24px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).paddingLeft).toBe('16px')
		await expect(classed).toHaveClass('base-popover__inner', 'story-themed-inner')
		await expect(classed.closest('.base-dropdown__panel')).toHaveClass('base-popover__panel', 'story-themed-panel')
	},
}
