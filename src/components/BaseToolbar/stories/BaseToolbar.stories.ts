/**
 * BaseToolbar — stories.
 *
 * Разделы: Default (песочница) → внешний вид (варианты, вертикальная) → состояния (отключённые кнопки) → сценарии
 * (поле и меню в панели) → клавиатура.
 */

import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { BaseSeparator } from '@components/BaseSeparator'
import { BaseDropdownMenu } from '@components/BaseDropdownMenu'
import { ARG_GROUP, baseArgTypes, propGroup, tabTo, useArgsWithoutSlots } from '@/stories/helpers'
import BaseToolbar from '../ui/BaseToolbar.vue'
import { TOOLBAR_VARIANTS } from '../model/BaseToolbar.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Кнопки форматирования: иконка и имя */
const FORMAT_BUTTONS = [
	{ icon: 'bold', label: 'Полужирный' },
	{ icon: 'italic', label: 'Курсив' },
	{ icon: 'underline', label: 'Подчёркнутый' },
]
const ALIGN_BUTTONS = [
	{ icon: 'align-left', label: 'По левому краю' },
	{ icon: 'align-center', label: 'По центру' },
	{ icon: 'align-right', label: 'По правому краю' },
]

const TOOLBAR_TEMPLATE = `
	<BaseToolbar v-bind="props">
		<BaseButton v-for="button in format" :key="button.icon" variant="ghost" :aria-label="button.label" :padding="{ x: 6, y: 6 }">
			<BaseIcon :name="button.icon" />
		</BaseButton>
		<BaseSeparator orientation="vertical" style="height: 20px;" />
		<BaseButton v-for="button in align" :key="button.icon" variant="ghost" :aria-label="button.label" :padding="{ x: 6, y: 6 }" :is-disabled="button.icon === disabledIcon">
			<BaseIcon :name="button.icon" />
		</BaseButton>
	</BaseToolbar>
`

const meta = {
	title: 'Navigation/BaseToolbar',
	component: BaseToolbar,
	parameters: {
		docs: {
			description: {
				component: [
					'Панель инструментов: форматирование текста, действия над выбранными строками, управление просмотром.',
					'',
					'- По образцу APG Toolbar: `role="toolbar"` с именем `ariaLabel`, в порядке Tab один элемент (последний с фокусом).',
					'- ←/→ (у вертикальной — ↑/↓) ведут по элементам с переходом через край, Home/End — первый и последний.',
					'  В текстовом поле стрелки двигают курсор. Отключённые кнопки пропускаются.',
					'- Внутри — любые кнопки, меню (BaseDropdownMenu), поля и разделители (BaseSeparator).',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: TOOLBAR_VARIANTS }),
		ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
		orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'], table: propGroup(ARG_GROUP.appearance) },
	},
	args: {
		ariaLabel: 'Форматирование',
		orientation: 'horizontal',
		variant: 'outline',
		sizeScale: 100,
	},
	render: args => ({
		components: { BaseToolbar, BaseButton, BaseIcon, BaseSeparator },
		setup: () => ({ props: useArgsWithoutSlots(args, []), format: FORMAT_BUTTONS, align: ALIGN_BUTTONS, disabledIcon: '' }),
		template: TOOLBAR_TEMPLATE,
	}),
} satisfies Meta<typeof BaseToolbar>

export default meta
type Story = StoryObj<typeof meta>

/** Песочница: шесть кнопок и разделитель, в порядке Tab — одна кнопка. */
export const Default: Story = {
	play: async ({ canvas }) => {
		const toolbar = canvas.getByRole('toolbar', { name: 'Форматирование' })
		const buttons = [...toolbar.querySelectorAll('button')]
		await expect(buttons.filter(button => button.tabIndex === 0)).toHaveLength(1)
	},
}

/** Варианты панели: `default` — без фона, `ghost` — без отступа, `outline` — рамка, `soft` — фон. */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale'] } },
	render: args => ({
		components: { BaseToolbar, BaseButton, BaseIcon, BaseSeparator },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['variant', 'ariaLabel']),
			variants: TOOLBAR_VARIANTS,
			format: FORMAT_BUTTONS,
			align: ALIGN_BUTTONS,
		}),
		template: `
			<div class="story-stack">
				<BaseToolbar v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :aria-label="variant">
					<BaseButton v-for="button in format" :key="button.icon" variant="ghost" :aria-label="button.label" :padding="{ x: 6, y: 6 }"><BaseIcon :name="button.icon" /></BaseButton>
				</BaseToolbar>
			</div>
		`,
	}),
}

/** Вертикальная панель: ↑/↓ ведут по кнопкам. */
export const Vertical: Story = {
	args: { orientation: 'vertical' },
	play: async ({ canvas, userEvent }) => {
		const bold = canvas.getByRole('button', { name: 'Полужирный' })
		await tabTo(bold, userEvent)
		await userEvent.keyboard('{ArrowDown}')
		await expect(canvas.getByRole('button', { name: 'Курсив' })).toHaveFocus()
	},
}

/** Отключённая кнопка («По центру») пропускается стрелками. */
export const Disabled: Story = {
	render: args => ({
		components: { BaseToolbar, BaseButton, BaseIcon, BaseSeparator },
		setup: () => ({ props: useArgsWithoutSlots(args, []), format: FORMAT_BUTTONS, align: ALIGN_BUTTONS, disabledIcon: 'align-center' }),
		template: TOOLBAR_TEMPLATE,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('button', { name: 'По центру' })).toBeDisabled()
		canvas.getByRole('button', { name: 'По левому краю' }).focus()
		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('button', { name: 'По правому краю' })).toHaveFocus()
	},
}

/** Поле и меню в панели: в поле стрелки двигают курсор, меню открывается как обычно. */
export const WithFieldAndMenu: Story = {
	args: { ariaLabel: 'Действия со строками' },
	render: args => ({
		components: { BaseToolbar, BaseButton, BaseIcon, BaseInput, BaseDropdownMenu },
		setup: () => ({ props: useArgsWithoutSlots(args, []), items: [{ label: 'Экспорт в CSV' }, { label: 'Экспорт в Excel' }] }),
		template: `
			<BaseToolbar v-bind="props">
				<BaseButton variant="outline">Архивировать</BaseButton>
				<BaseInput model-value="" aria-label="Поиск по строкам" placeholder="Поиск" style="width: 180px;" />
				<BaseDropdownMenu :items="items"><BaseButton variant="outline">Экспорт</BaseButton></BaseDropdownMenu>
			</BaseToolbar>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const search = canvas.getByRole('textbox', { name: 'Поиск по строкам' })
		await userEvent.click(search)
		await userEvent.keyboard('ab{ArrowLeft}')
		await expect(search).toHaveFocus()
	},
}

/** Клавиатура: Tab — в панель, ←/→ по кнопкам с переходом через край, Home/End, Tab — из панели; фокус запоминается. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const bold = canvas.getByRole('button', { name: 'Полужирный' })
		await tabTo(bold, userEvent)
		await userEvent.keyboard('{ArrowLeft}')
		await expect(canvas.getByRole('button', { name: 'По правому краю' })).toHaveFocus()
		await userEvent.keyboard('{Home}{ArrowRight}')
		await expect(canvas.getByRole('button', { name: 'Курсив' })).toHaveFocus()
		await userEvent.keyboard('{End}')
		await expect(canvas.getByRole('button', { name: 'По правому краю' })).toHaveFocus()
		await expect(canvas.getByRole('button', { name: 'Полужирный' })).toHaveAttribute('tabindex', '-1')
	},
}
