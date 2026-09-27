/**
 * BaseInputTags — stories.
 *
 * Разделы: Default (песочница с рабочим v-model) → внешний вид (варианты) → состояния (отключено, ошибка, только
 * чтение) → сценарии (вставка списка, проверка и лимит) → клавиатура.
 */

import { expect, fn } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import { INPUT_TAGS_VARIANTS } from '../model/BaseInputTags.types'
import BaseInputTags from '../ui/BaseInputTags.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
	title: 'Form/BaseInputTags',
	component: BaseInputTags,
	parameters: {
		docs: {
			description: {
				component: [
					'Поле тегов: навыки, получатели, ключевые слова. Теги стоят в рамке поля перед строкой ввода.',
					'',
					'- Enter или запятая (`separators`) добавляют тег, вставка «a, b, c» — несколько тегов; пустой Enter отправляет форму.',
					'- Повтор не добавляется (`isUnique`), `maxTags` ограничивает число, `validate` отклоняет тег — текст остаётся в поле.',
					'- Клавиатура: в пустой строке ← или Backspace переводят фокус на последний тег, ←/→ — между тегами,',
					'  Backspace, Delete и Enter на теге удаляют его. Кнопки удаления вне порядка Tab.',
					'- Добавление и удаление тегов объявляются скринридеру через `role="status"`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: INPUT_TAGS_VARIANTS }),
		modelValue: { control: 'object', table: propGroup(ARG_GROUP.content) },
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
		maxTags: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		isUnique: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		isAddOnBlur: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		separators: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
		error: { control: 'text', table: propGroup(ARG_GROUP.state) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isReadonly: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	},
	args: {
		modelValue: ['Vue', 'TypeScript'],
		label: 'Навыки',
		placeholder: 'Добавьте навык',
		isUnique: true,
		isAddOnBlur: true,
		isDisabled: false,
		isReadonly: false,
		isRequired: false,
		variant: 'default',
		sizeScale: 100,
		onAdd: fn(),
		onRemove: fn(),
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseInputTags },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: '<div class="story-narrow"><BaseInputTags v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
} satisfies Meta<typeof BaseInputTags>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: Enter добавляет тег, крестик удаляет. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.type(canvas.getByRole('textbox', { name: 'Навыки' }), 'Pinia{Enter}')
		await expect(args.onAdd).toHaveBeenLastCalledWith('Pinia')
		await expect(canvas.getByRole('list', { name: 'Теги' })).toHaveTextContent('Pinia')
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить TypeScript' }))
		await expect(args.onRemove).toHaveBeenLastCalledWith('TypeScript')
		await expect(canvas.getByRole('status')).toHaveTextContent('Удалено: TypeScript')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Варианты поля — как у BaseInput. */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale'] } },
	render: args => ({
		components: { BaseInputTags },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'label']), variants: INPUT_TAGS_VARIANTS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<BaseInputTags v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" />
			</div>
		`,
	}),
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённое поле: теги видны, удалить и добавить нельзя. */
export const Disabled: Story = {
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('textbox', { name: 'Навыки' })).toBeDisabled()
		await expect(canvas.queryByRole('button', { name: 'Удалить Vue' })).toBeNull()
	},
}

/** Ошибка: текст под полем описывает его. */
export const WithError: Story = {
	args: { modelValue: [], isRequired: true, error: 'Добавьте хотя бы один навык' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('textbox', { name: 'Навыки' })).toHaveAccessibleDescription('Добавьте хотя бы один навык')
	},
}

/** Много тегов: переносятся на новые строки, длинный тег обрезается многоточием. */
export const LongContent: Story = {
	args: {
		modelValue: ['Vue', 'TypeScript', 'Pinia', 'Vite', 'Vitest', 'Playwright', 'Storybook', 'Доступность интерфейсов по WCAG 2.2 и шаблонам APG'],
	},
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('listitem')).toHaveLength(8)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Проверка и лимит: `validate` принимает только адреса с «@», `maxTags` — не больше трёх получателей.
 * Отклонённый адрес остаётся в поле, чтобы его можно было исправить.
 */
export const Validation: Story = {
	args: {
		label: 'Получатели',
		placeholder: 'name@example.com',
		modelValue: ['anna@example.com'],
		maxTags: 3,
		validate: (tag: string) => /^\S+@\S+\.\S+$/.test(tag),
	},
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('textbox', { name: 'Получатели' })
		await userEvent.type(field, 'boris{Enter}')
		await expect(field).toHaveValue('boris')
		await userEvent.type(field, '@example.com{Enter}')
		await expect(args.onAdd).toHaveBeenLastCalledWith('boris@example.com')
	},
}

// ─── Клавиатура ────────────────────────────────────────────────────────────────

/** Клавиатура: запятая добавляет тег, Backspace в пустой строке — к последнему тегу, ещё Backspace — удаляет его. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('textbox', { name: 'Навыки' })
		await tabTo(field, userEvent)
		await userEvent.keyboard('Nuxt,')
		await expect(args.onAdd).toHaveBeenLastCalledWith('Nuxt')
		await expect(field).toHaveValue('')
		await userEvent.keyboard('{Backspace}')
		await expect(canvas.getByRole('button', { name: 'Удалить Nuxt' })).toHaveFocus()
		await userEvent.keyboard('{ArrowLeft}')
		await expect(canvas.getByRole('button', { name: 'Удалить TypeScript' })).toHaveFocus()
		await userEvent.keyboard('{Backspace}')
		await expect(args.onRemove).toHaveBeenLastCalledWith('TypeScript')
		await expect(canvas.getByRole('button', { name: 'Удалить Vue' })).toHaveFocus()
	},
}
