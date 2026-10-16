import { BaseApp } from '@components/BaseApp'
import { BaseText } from '@components/BaseText'
import { expect, screen } from 'storybook/test'
import type meta from '../../BaseDropdown.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDropdown from '../../../ui/BaseDropdown.vue'
import { docsFrame, isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { panel: 'story-themed-panel' }

const template = `
	<div class="story-row" style="align-items: flex-start; gap: 24px;">
		<BaseDropdown v-bind="args" is-open>
			<BaseButton variant="outline">По умолчанию</BaseButton>
			<template #dropdown><BaseText>Панель без настроек</BaseText></template>
		</BaseDropdown>
		<div style="--rise-dropdown-panel-bg: var(--rise-primary-soft); --rise-dropdown-panel-text: var(--rise-primary-text); --rise-dropdown-panel-border: var(--rise-primary); --rise-dropdown-panel-radius: var(--rise-radius-xl); --rise-dropdown-panel-padding: 12px; --rise-dropdown-panel-width: 200px;">
			<BaseApp teleport-to="#story-dropdown-layer">
				<BaseDropdown v-bind="args" is-open>
					<BaseButton variant="outline">Токены</BaseButton>
					<template #dropdown><BaseText>Токены на контейнере</BaseText></template>
				</BaseDropdown>
				<div id="story-dropdown-layer" />
			</BaseApp>
		</div>
		<BaseDropdown v-bind="args" is-open :ui="ui">
			<BaseButton variant="outline">Классы через ui</BaseButton>
			<template #dropdown><BaseText>Класс на панели</BaseText></template>
		</BaseDropdown>
	</div>
`

const panelOf = async (text: string): Promise<HTMLElement> => (await screen.findByText(text)).closest<HTMLElement>('.base-dropdown__panel')!

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-dropdown-panel-*` кит только читает: `bg`, `text`, `border` (и стрелка),',
					'`radius`, `shadow`, `padding` (отступ со всех сторон), `width` (наименьшая ширина) — задайте их на `:root`, в теме или на контейнере.',
					'Панель телепортируется, поэтому токены контейнера доходят до неё, когда контейнер — цель телепорта',
					'(`<BaseApp teleport-to>`, как здесь) или его предок. Отступ умножается на плотность темы `--rise-density`.',
					'Проп `ui` добавляет классы к частям (`root`, `panel`, `arrow`); глобально — `defaults.BaseDropdown.ui`.',
					'Панель наследует тему (`data-theme`, `data-rise-theme`) и движение (`data-rise-motion`) области триггера.',
				].join('\n'),
			},
			...docsFrame(200),
			source: storySource({
				template,
				imports: ['BaseDropdown', 'BaseButton', 'BaseText', 'BaseApp'],
				script: `const ui = ${literal(ui)}`,
				omit: ['isOpen', 'onUpdate:isOpen'],
			}),
		},
	},
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseText, BaseApp },
		setup: useStorySetup(args, { data: { ui }, slots: [] }),
		template,
	}),
	play: async () => {
		const plain = await panelOf('Панель без настроек')
		const themed = await panelOf('Токены на контейнере')
		const classed = await panelOf('Класс на панели')

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		if (!isStoryBranded())
			await expect(getComputedStyle(themed).borderTopLeftRadius).not.toBe(getComputedStyle(plain).borderTopLeftRadius)
		await expect(getComputedStyle(themed).paddingLeft).not.toBe(getComputedStyle(plain).paddingLeft)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingLeft).toBe('12px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).paddingLeft).toBe('4px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).minWidth).toBe('200px')
		await expect(classed).toHaveClass('base-dropdown__panel', 'story-themed-panel')
	},
}
