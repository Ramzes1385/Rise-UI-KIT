/** Открытая панель телепортируется в body, поэтому в Docs примеры показываются в отдельном фрейме. */

import { BaseButton } from '@components/BaseButton'
import BasePopconfirm from '../ui/BasePopconfirm.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { POPCONFIRM_VARIANTS } from '../types/BasePopconfirm.types'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots } from '@/stories/helpers'

function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}

const meta = {
	title: 'Overlay/BasePopconfirm',
	component: BasePopconfirm,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: [
					'Вопрос у кнопки перед действием: «Снять с публикации?», «Удалить комментарий?». Легче окна',
					'`BaseConfirm`: не закрывает страницу и стоит рядом с тем, что подтверждают.',
					'',
					'- Кнопка — слот по умолчанию: клик открывает вопрос, кнопке ставятся `aria-haspopup`, `aria-expanded`',
					'  и `aria-controls`. Панель — `role="alertdialog"` с именем из `title` и описанием из `description`.',
					'- Ответ — события `confirm` и `cancel`. Escape и клик снаружи — отмена. После ответа фокус',
					'  возвращается на кнопку.',
					'- `isDanger` — необратимое действие: значок предупреждения, кнопка цвета ошибки, фокус при открытии на',
					'  «Отмене». Иначе фокус на подтверждении.',
					'- Tab ходит между кнопками по кругу. У края окна панель переворачивается и сдвигается.',
					'',
					'Подтверждение, которое требует внимания всей страницы, — `BaseConfirm` или `useConfirm()`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: POPCONFIRM_VARIANTS }),
		title: { control: 'text', table: propGroup(ARG_GROUP.content) },
		description: { control: 'text', table: propGroup(ARG_GROUP.content) },
		confirmLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
		cancelLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
		position: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'], table: propGroup(ARG_GROUP.appearance) },
		isDanger: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		default: { control: false },
	},
	args: {
		title: 'Снять серию с публикации?',
		description: 'Подписчики перестанут её видеть. Вернуть можно в любой момент.',
		confirmLabel: 'Снять',
		position: 'top',
		isDanger: false,
		variant: 'default',
		sizeScale: 100,
		onConfirm: fn(),
		onCancel: fn(),
	},
	render: args => ({
		components: { BasePopconfirm, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: `
			<BasePopconfirm v-bind="props">
				<BaseButton variant="outline">Снять с публикации</BaseButton>
			</BasePopconfirm>
		`,
	}),
} satisfies Meta<typeof BasePopconfirm>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: клик по кнопке открывает вопрос, фокус — на «Снять». «Снять» эмитит `confirm`, «Отмена», Escape
 * и клик снаружи — `cancel`; фокус возвращается на кнопку.
 */
export const Default: Story = {
	parameters: { docs: docsFrame(260) },
	play: async ({ canvas, userEvent, args }) => {
		const trigger = canvas.getByRole('button', { name: 'Снять с публикации' })
		await userEvent.click(trigger)
		const dialog = await screen.findByRole('alertdialog', { name: 'Снять серию с публикации?' })
		await expect(dialog).toHaveAccessibleDescription('Подписчики перестанут её видеть. Вернуть можно в любой момент.')
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Снять' })).toHaveFocus())

		await userEvent.click(within(dialog).getByRole('button', { name: 'Снять' }))
		await expect(args.onConfirm).toHaveBeenCalledOnce()
		await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Варианты панели — те же, что у BaseDropdown и BasePopover. */
export const Variants: Story = {
	parameters: { layout: 'padded', controls: { include: ['sizeScale'] }, docs: docsFrame(260) },
	render: args => ({
		components: { BasePopconfirm, BaseButton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['isOpen', 'variant', 'description', 'position']),
			variants: POPCONFIRM_VARIANTS,
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 320px; padding-top: 110px;">
				<div v-for="variant in variants" :key="variant" style="height: 150px;">
					<BasePopconfirm v-bind="props" :is-open="true" :variant="variant" position="top" :title="'Вариант ' + variant">
						<BaseButton variant="outline">{{ variant }}</BaseButton>
					</BasePopconfirm>
				</div>
			</div>
		`,
	}),
}

/** Позиции: сверху (по умолчанию), снизу, слева, справа. У края окна панель переворачивается. */
export const Positions: Story = {
	parameters: { controls: { include: ['variant'] }, docs: docsFrame(420) },
	render: args => ({
		components: { BasePopconfirm, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['isOpen', 'position', 'description']) }),
		template: `
			<div style="display: grid; grid-template-columns: repeat(3, auto); gap: 140px 24px; align-items: center; justify-items: center; padding: 120px 280px;">
				<span />
				<BasePopconfirm v-bind="props" :is-open="true" position="top" title="Сверху"><BaseButton variant="outline">top</BaseButton></BasePopconfirm>
				<span />
				<BasePopconfirm v-bind="props" :is-open="true" position="left" title="Слева"><BaseButton variant="outline">left</BaseButton></BasePopconfirm>
				<span />
				<BasePopconfirm v-bind="props" :is-open="true" position="right" title="Справа"><BaseButton variant="outline">right</BaseButton></BasePopconfirm>
				<span />
				<BasePopconfirm v-bind="props" :is-open="true" position="bottom" title="Снизу"><BaseButton variant="outline">bottom</BaseButton></BasePopconfirm>
				<span />
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125 — текст, отступы и кнопки панели. */
export const Sizes: Story = {
	parameters: { layout: 'padded', controls: { include: ['variant'] }, docs: docsFrame(300) },
	render: args => ({
		components: { BasePopconfirm, BaseButton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['isOpen', 'sizeScale', 'description', 'position']),
			presets: SIZE_PRESETS,
			sizeLabel,
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 320px; padding-top: 140px;">
				<div v-for="preset in presets" :key="preset.name" style="height: 180px;">
					<BasePopconfirm v-bind="props" :is-open="true" :size-scale="preset.sizeScale" position="top" :title="sizeLabel(preset)">
						<BaseButton variant="outline" :size-scale="preset.sizeScale">{{ sizeLabel(preset) }}</BaseButton>
					</BasePopconfirm>
				</div>
			</div>
		`,
	}),
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Необратимое действие (`isDanger`): значок предупреждения, кнопка цвета ошибки, фокус при открытии —
 * на «Отмене», чтобы случайный Enter ничего не удалил.
 */
export const Danger: Story = {
	args: { title: 'Удалить комментарий?', description: 'Ответы на него тоже удалятся.', confirmLabel: 'Удалить', isDanger: true },
	parameters: { docs: docsFrame(260) },
	render: args => ({
		components: { BasePopconfirm, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: `
			<BasePopconfirm v-bind="props">
				<BaseButton variant="ghost">Удалить комментарий</BaseButton>
			</BasePopconfirm>
		`,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить комментарий' }))
		const dialog = await screen.findByRole('alertdialog', { name: 'Удалить комментарий?' })
		await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Отмена' })).toHaveFocus())

		await userEvent.keyboard('{Enter}')
		await expect(args.onCancel).toHaveBeenCalledOnce()
		await expect(args.onConfirm).not.toHaveBeenCalled()
	},
}

/** Длинный вопрос и пояснение переносятся по словам; панель не шире 300px. */
export const LongContent: Story = {
	args: {
		title: 'Отозвать доступ к черновикам сезона у всех переводчиков сообщества?',
		description:
			'Переводчики перестанут видеть черновики серий 1–12 и не смогут сохранять правки субтитров. Уже опубликованные серии останутся доступны.',
		confirmLabel: 'Отозвать доступ',
		isOpen: true,
	},
	parameters: { docs: docsFrame(320) },
	play: async () => {
		const dialog = await screen.findByRole('alertdialog')
		await expect(dialog.getBoundingClientRect().width).toBeLessThanOrEqual(300)
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Enter на кнопке открывает вопрос, Tab и Shift+Tab ходят между «Отменой» и подтверждением по кругу,
 * Escape отменяет и возвращает фокус на кнопку.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const trigger = canvas.getByRole('button', { name: 'Снять с публикации' })
		await tabTo(trigger, userEvent)
		await userEvent.keyboard('{Enter}')
		const dialog = await screen.findByRole('alertdialog')
		const confirm = within(dialog).getByRole('button', { name: 'Снять' })
		const cancel = within(dialog).getByRole('button', { name: 'Отмена' })
		await waitFor(() => expect(confirm).toHaveFocus())

		await userEvent.tab()
		await expect(cancel).toHaveFocus()
		await userEvent.tab()
		await expect(confirm).toHaveFocus()
		await userEvent.tab({ shift: true })
		await expect(cancel).toHaveFocus()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
		await expect(args.onCancel).toHaveBeenCalledOnce()
		await expect(trigger).toHaveFocus()
	},
}
