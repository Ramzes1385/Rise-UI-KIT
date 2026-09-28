/**
 * BaseButtonGroup — stories.
 *
 * Разделы: Default (песочница) → внешний вид (варианты кнопок, вертикально) → сценарии (с кнопкой меню).
 */

import { expect } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, useArgsWithoutSlots } from '@/stories/helpers'
import { BaseButton } from '@components/BaseButton'
import { BUTTON_VARIANTS } from '@components/BaseButton/model/BaseButton.types'
import { BaseIcon } from '@components/BaseIcon'
import { BaseSplitButton } from '@components/BaseSplitButton'
import { BUTTON_GROUP_VARIANTS } from '../model/BaseButtonGroup.types'
import BaseButtonGroup from '../ui/BaseButtonGroup.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseButtonGroup',
	component: BaseButtonGroup,
	parameters: {
		docs: {
			description: {
				component: [
					'Склеенные кнопки связанных действий: выравнивание текста, навигация «назад / вперёд», вид списка.',
					'',
					'- Группа — `role="group"` с именем `ariaLabel`; каждая кнопка — отдельный таб-стоп (для стрелок между кнопками — BaseToolbar).',
					'- У крайних кнопок внешние скругления, соседние рамки совпадают; кнопка в фокусе — поверх соседей.',
					'- Вид задают кнопки: один вариант для всех кнопок группы.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: BUTTON_GROUP_VARIANTS }),
		orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'], table: propGroup(ARG_GROUP.appearance) },
		ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	},
	args: {
		orientation: 'horizontal',
		ariaLabel: 'Период',
		variant: 'default',
		sizeScale: 100,
	},
	render: args => ({
		components: { BaseButtonGroup, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: `
			<BaseButtonGroup v-bind="props">
				<BaseButton variant="outline">День</BaseButton>
				<BaseButton variant="outline">Неделя</BaseButton>
				<BaseButton variant="outline">Месяц</BaseButton>
			</BaseButtonGroup>
		`,
	}),
} satisfies Meta<typeof BaseButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

/** Песочница: три outline-кнопки с общей рамкой. */
export const Default: Story = {
	play: async ({ canvas }) => {
		const group = canvas.getByRole('group', { name: 'Период' })
		const [first, middle] = group.querySelectorAll<HTMLElement>('.base-button')
		await expect(getComputedStyle(middle).borderTopLeftRadius).toBe('0px')
		await expect(getComputedStyle(first).borderTopLeftRadius).not.toBe('0px')
	},
}

/** Варианты кнопок в группе: вариант задают сами кнопки. */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale', 'orientation'] } },
	render: args => ({
		components: { BaseButtonGroup, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['ariaLabel']), variants: BUTTON_VARIANTS }),
		template: `
			<div class="story-stack">
				<BaseButtonGroup v-for="variant in variants" :key="variant" v-bind="props" :aria-label="variant">
					<BaseButton :variant="variant">Назад</BaseButton>
					<BaseButton :variant="variant">Сегодня</BaseButton>
					<BaseButton :variant="variant">Вперёд</BaseButton>
				</BaseButtonGroup>
			</div>
		`,
	}),
}

/** Вертикальная группа кнопок-иконок: масштаб карты. */
export const Vertical: Story = {
	args: { orientation: 'vertical', ariaLabel: 'Масштаб' },
	render: args => ({
		components: { BaseButtonGroup, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: `
			<BaseButtonGroup v-bind="props">
				<BaseButton variant="outline" aria-label="Приблизить" :padding="{ x: 7, y: 7 }"><BaseIcon name="plus" /></BaseButton>
				<BaseButton variant="outline" aria-label="Отдалить" :padding="{ x: 7, y: 7 }"><BaseIcon name="minus" /></BaseButton>
			</BaseButtonGroup>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('group', { name: 'Масштаб' })).toHaveClass('base-button-group--vertical')
	},
}

/** С кнопкой меню: BaseSplitButton в группе получает общие скругления. */
export const WithSplitButton: Story = {
	render: args => ({
		components: { BaseButtonGroup, BaseButton, BaseSplitButton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['ariaLabel']),
			items: [{ label: 'Сохранить как шаблон' }, { label: 'Сохранить копию' }],
		}),
		template: `
			<BaseButtonGroup v-bind="props" aria-label="Документ">
				<BaseButton variant="outline">Отмена</BaseButton>
				<BaseSplitButton variant="outline" label="Сохранить" :items="items" />
			</BaseButtonGroup>
		`,
	}),
}
