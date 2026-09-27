/**
 * BaseTooltip — stories.
 *
 * Разделы: Default (песочница: подсказка при наведении и фокусе) → внешний вид (варианты, позиции, размеры,
 * кастомный цвет) → длинный текст → клавиатура.
 * Постоянно видимые подсказки телепортируются в body, поэтому в Docs такие примеры показываются в отдельном фрейме.
 */

import { expect, screen, waitFor } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots } from '@/stories/helpers'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { TOOLTIP_VARIANTS } from '../model/BaseTooltip.types'
import BaseTooltip from '../ui/BaseTooltip.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Цвет после подстановки CSS-переменных в текущей теме: так значение `var(--rise-…)` сравнивается с цветом элемента. */
function resolveColor(value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	document.body.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved
}

/** Постоянно видимые подсказки телепортируются в body — в Docs пример показывается во фрейме. */
function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}

const meta = {
	title: 'Overlay/BaseTooltip',
	component: BaseTooltip,
	parameters: {
		// Подсказка центрируется по триггеру: пример в центре холста, чтобы она не выходила за край.
		layout: 'centered',
		docs: {
			description: {
				component: [
					'Короткая подсказка к элементу: название кнопки-иконки, пояснение к сокращению, горячая клавиша.',
					'',
					'- Появляется при наведении и при фокусе с клавиатуры, скрывается при уходе курсора или фокуса и по Escape.',
					'- `position` — сторона (`top`, `bottom`, `left`, `right`), `isAlwaysVisible` — показывать постоянно.',
					'- Подсказка телепортируется в body (`role="tooltip"`); вариант, `sizeScale` и `color` применяются к ней,',
					'  а не к элементу в слоте.',
					'- Не кладите в подсказку ссылки и кнопки: для интерактивного содержимого — `BasePopover`.',
					'  Кнопке с одной иконкой нужен ещё `aria-label`: подсказка его не заменяет.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: TOOLTIP_VARIANTS }),
		text: { control: 'text', table: propGroup(ARG_GROUP.content) },
		position: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'], table: propGroup(ARG_GROUP.appearance) },
		isAlwaysVisible: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		default: { control: false },
	},
	args: {
		text: 'Скопировать ссылку',
		position: 'top',
		variant: 'default',
		isAlwaysVisible: false,
		sizeScale: 100,
	},
	render: args => ({
		components: { BaseTooltip, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: `
			<BaseTooltip v-bind="props">
				<BaseButton variant="outline" :aria-label="props.text" :padding="{ x: 5, y: 5 }">
					<BaseIcon name="link" />
				</BaseButton>
			</BaseTooltip>
		`,
	}),
} satisfies Meta<typeof BaseTooltip>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: наведите курсор на кнопку — через 100 мс появится подсказка, при уходе курсора она скроется. */
export const Default: Story = {
	play: async ({ canvas, userEvent }) => {
		const button = canvas.getByRole('button', { name: 'Скопировать ссылку' })
		await userEvent.hover(button)
		await expect(await screen.findByRole('tooltip')).toHaveTextContent('Скопировать ссылку')

		await userEvent.unhover(button)
		await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Пять вариантов. `default` — инвертированный фон (основной); `soft` — мягкий фон основного цвета;
 * `outline` и `shadow` — светлая подсказка с рамкой и с тенью; `ghost` — приподнятый нейтральный фон без стрелки.
 */
export const Variants: Story = {
	args: { isAlwaysVisible: true },
	parameters: {
		controls: { include: ['position', 'sizeScale'] },
		docs: {
			...docsFrame(140),
			source: { code: TOOLTIP_VARIANTS.map(variant => `<BaseTooltip text="${variant}" variant="${variant}">…</BaseTooltip>`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseTooltip, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'text']), variants: TOOLTIP_VARIANTS }),
		template: `
			<div class="story-row" style="gap: 48px;">
				<BaseTooltip v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :text="variant">
					<BaseButton variant="outline">{{ variant }}</BaseButton>
				</BaseTooltip>
			</div>
		`,
	}),
}

/** Сторона `position`: подсказка и стрелка центрируются по элементу. */
export const Positions: Story = {
	args: { isAlwaysVisible: true },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: { ...docsFrame(160), source: { code: '<BaseTooltip text="Справа" position="right">…</BaseTooltip>' } },
	},
	render: args => ({
		components: { BaseTooltip, BaseButton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['position', 'text']),
			items: [
				{ position: 'left', text: 'Слева' },
				{ position: 'top', text: 'Сверху' },
				{ position: 'bottom', text: 'Снизу' },
				{ position: 'right', text: 'Справа' },
			] as const,
		}),
		template: `
			<div class="story-row" style="gap: 96px;">
				<BaseTooltip v-for="item in items" :key="item.position" v-bind="props" :position="item.position" :text="item.text">
					<BaseButton variant="outline">{{ item.position }}</BaseButton>
				</BaseTooltip>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		// Подсказка справа начинается правее кнопки, стрелка смотрит на неё
		const button = canvas.getByRole('button', { name: 'right' })
		const tooltip = (await screen.findByText('Справа')).closest('[role="tooltip"]') as HTMLElement
		await waitFor(() => expect(tooltip.getBoundingClientRect().left).toBeGreaterThan(button.getBoundingClientRect().right))
	},
}

/** Размеры через `sizeScale`: пропорционально меняются кегль, отступы, радиус и стрелка подсказки; кнопка — нет. */
export const Sizes: Story = {
	args: { isAlwaysVisible: true },
	parameters: {
		controls: { include: ['variant', 'position'] },
		docs: {
			...docsFrame(140),
			source: { code: SIZE_PRESETS.map(preset => `<BaseTooltip text="${preset.name}" :size-scale="${preset.sizeScale}">…</BaseTooltip>`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseTooltip, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['sizeScale', 'text']), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-row" style="gap: 40px;">
				<BaseTooltip v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :text="sizeLabel(preset)">
					<BaseButton variant="outline">{{ preset.name }}</BaseButton>
				</BaseTooltip>
			</div>
		`,
	}),
}

/**
 * Кастомный цвет через `color`: фон подсказки и стрелки, цвет текста. Подойдёт любой CSS-цвет; токены `var(--rise-…)`
 * сохраняют контраст в обеих темах. Кнопка в слоте цвет не наследует.
 */
export const CustomColor: Story = {
	args: {
		isAlwaysVisible: true,
		text: 'Новая функция',
		color: { bg: { base: 'var(--rise-primary)' }, text: { base: 'var(--rise-on-primary)' } },
	},
	parameters: { controls: { include: ['color', 'position'] }, docs: docsFrame(120) },
	render: args => ({
		components: { BaseTooltip, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: `
			<BaseTooltip v-bind="props">
				<BaseButton variant="outline">Субтитры</BaseButton>
			</BaseTooltip>
		`,
	}),
	play: async ({ canvas }) => {
		const tooltip = await screen.findByRole('tooltip')
		const primary = resolveColor('var(--rise-primary)')
		await expect(getComputedStyle(tooltip).backgroundColor).toBe(primary)
		await expect(getComputedStyle(tooltip, '::after').backgroundColor).toBe(primary)
		await expect(getComputedStyle(tooltip).color).toBe(resolveColor('var(--rise-on-primary)'))
		const button = canvas.getByRole('button', { name: 'Субтитры' })
		await expect(getComputedStyle(button).backgroundColor).toBe(resolveColor('var(--rise-bg)'))
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/** Длинный текст переносится по словам: ширина подсказки не больше 280px. Переносы строк `\n` сохраняются. */
export const LongContent: Story = {
	args: {
		isAlwaysVisible: true,
		position: 'bottom',
		text: 'Ctrl + Shift + S — сохранить копию проекта.\nКопия появится в списке проектов с пометкой «копия» и текущей датой.',
	},
	parameters: { controls: { include: ['text', 'position', 'variant', 'sizeScale'] }, docs: docsFrame(180) },
	render: args => ({
		components: { BaseTooltip, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: `
			<BaseTooltip v-bind="props">
				<BaseButton variant="outline">Сохранить копию</BaseButton>
			</BaseTooltip>
		`,
	}),
	play: async () => {
		const tooltip = await screen.findByRole('tooltip')
		const box = tooltip.getBoundingClientRect()
		await expect(box.width).toBeLessThanOrEqual(280)
		// Три строки и больше: перенос по \n и по ширине
		await expect(box.height).toBeGreaterThanOrEqual(3 * 16)
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Tab ставит фокус на кнопку — подсказка появляется, как при наведении; Escape скрывает её,
 * а фокус остаётся на кнопке.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const button = canvas.getByRole('button', { name: 'Скопировать ссылку' })
		await tabTo(button, userEvent)
		await expect(await screen.findByRole('tooltip')).toHaveTextContent('Скопировать ссылку')

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())
		await expect(button).toHaveFocus()
	},
}
