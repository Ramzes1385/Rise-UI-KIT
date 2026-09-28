import BaseInplace from '../ui/BaseInplace.vue'
import { expect, fn, waitFor } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { INPLACE_VARIANTS } from '../types/BaseInplace.types'
import { ARG_GROUP, baseArgTypes, propGroup, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'

const meta = {
	title: 'Form/BaseInplace',
	component: BaseInplace,
	parameters: {
		docs: {
			description: {
				component: [
					'Текст с правкой на месте: название проекта, имя в профиле, заметка в строке таблицы.',
					'',
					'- В просмотре — кнопка: скринридер слышит «что: значение» и подсказку «Нажмите, чтобы изменить».',
					'- Клик, Enter или пробел открывают поле с выделенным текстом; Enter сохраняет, Escape отменяет, выход из поля сохраняет',
					'  (`isSaveOnBlur=false` — отменяет). После правки фокус возвращается на кнопку.',
					'- Шрифт наследуется: подходит для заголовков и строк таблиц. Слот `display` — свой вид значения.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: INPLACE_VARIANTS }),
		modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
		label: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
		placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
		isSaveOnBlur: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	},
	args: {
		modelValue: 'Редизайн личного кабинета',
		label: 'Название проекта',
		placeholder: 'Без названия',
		isSaveOnBlur: true,
		isDisabled: false,
		variant: 'default',
		sizeScale: 100,
		onSave: fn(),
		onCancel: fn(),
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseInplace },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: '<BaseInplace v-bind="props" @update:model-value="onUpdate" />',
		}
	},
} satisfies Meta<typeof BaseInplace>

export default meta
type Story = StoryObj<typeof meta>

/** Песочница: клик открывает поле, Enter сохраняет. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: /Название проекта: Редизайн личного кабинета/ }))
		const field = canvas.getByRole('textbox', { name: 'Название проекта' })
		await expect(field).toHaveFocus()
		await userEvent.clear(field)
		await userEvent.type(field, 'Новый кабинет{Enter}')
		await expect(args.onSave).toHaveBeenLastCalledWith('Новый кабинет')
		await waitFor(() => expect(canvas.getByRole('button', { name: /Название проекта: Новый кабинет/ })).toHaveFocus())
	},
}

/** Варианты: `default` — пунктирное подчёркивание, `ghost` — без него. */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale'] } },
	render: args => ({
		components: { BaseInplace },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant']), variants: INPLACE_VARIANTS }),
		template:
			'<div class="story-stack"><div v-for="variant in variants" :key="variant" class="story-row"><span class="story-label" style="width: 64px;">{{ variant }}</span><BaseInplace v-bind="props" :variant="variant" /></div></div>',
	}),
}

/** В заголовке: шрифт наследуется от окружения. */
export const InHeading: Story = {
	render: args => ({
		components: { BaseInplace },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: '<h2 style="margin: 0; font-size: 24px;"><BaseInplace v-bind="props" /></h2>',
	}),
}

/** Пустое значение: плейсхолдер приглушён. */
export const Empty: Story = {
	args: { modelValue: '' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Название проекта: Без названия' })).toBeVisible()
	},
}

/** Отключено: текст виден, правка недоступна. */
export const Disabled: Story = {
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: /Название проекта/ })).toBeDisabled()
	},
}

/** Выход из поля отменяет правку (`isSaveOnBlur=false`). */
export const CancelOnBlur: Story = {
	args: { isSaveOnBlur: false },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: /Название проекта/ }))
		await userEvent.type(canvas.getByRole('textbox', { name: 'Название проекта' }), ' 2.0')
		await userEvent.tab()
		await expect(args.onCancel).toHaveBeenCalled()
		await expect(canvas.getByRole('button', { name: 'Название проекта: Редизайн личного кабинета' })).toBeVisible()
	},
}

/** Клавиатура: Enter открывает поле, Escape отменяет правку и возвращает фокус на кнопку. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const display = canvas.getByRole('button', { name: /Название проекта/ })
		await tabTo(display, userEvent)
		await userEvent.keyboard('{Enter}')
		const field = canvas.getByRole('textbox', { name: 'Название проекта' })
		await waitFor(() => expect(field).toHaveFocus())
		await userEvent.keyboard('Черновик{Escape}')
		await expect(args.onCancel).toHaveBeenCalled()
		await waitFor(() => expect(canvas.getByRole('button', { name: /Название проекта: Редизайн/ })).toHaveFocus())
	},
}
