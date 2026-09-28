/** Открытые поповеры телепортируются в body, поэтому в Docs такие примеры показываются в отдельном фрейме. */

import { ref } from 'vue'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { BaseText } from '@components/BaseText'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { BaseSelect } from '@components/BaseSelect'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import BasePopover from '../ui/BasePopover.vue'
import { POPOVER_VARIANTS } from '../types/BasePopover.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Args, которые витрины задают сами: их нет в v-bind, чтобы не перебить значения примера. */
const SHOWCASE_OWN_ARGS = ['isOpen', 'onUpdate:isOpen'] as const

/** Цвет после подстановки CSS-переменных в текущей теме: так значение `var(--rise-…)` сравнивается с цветом элемента. */
function resolveColor(value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	document.body.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved
}

/** Открытые поповеры телепортируются в body и перекрыли бы страницу Docs — там пример показывается во фрейме. */
function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}

const meta = {
	title: 'Overlay/BasePopover',
	component: BasePopover,
	// Поповер по центру триггера: пример в центре холста, чтобы панель не выходила за край (сдвига у края экрана нет).
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: [
					'Поповер — панель со стрелкой у элемента: пояснение, небольшая форма, дополнительные действия.',
					'',
					'- Триггер — слот `trigger`: клик по нему открывает и закрывает поповер (`v-model:is-open`). Поповер закрывается',
					'  кликом снаружи и по Escape.',
					'- `position` — сторона (`top`, `bottom`, `left`, `right`); панель и стрелка центрируются по триггеру.',
					'- Панель — это панель `BaseDropdown`: те же варианты оформления, телепорт в body и возврат фокуса на триггер',
					'  при закрытии. Поля в поповере получают фокус и ввод.',
					'',
					'Короткая подсказка при наведении — `BaseTooltip`, меню действий — `BaseDropdown` с `BaseMenu`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: POPOVER_VARIANTS }),
		position: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'], table: propGroup(ARG_GROUP.appearance) },
		isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		trigger: { control: false },
		default: { control: false },
	},
	args: {
		isOpen: false,
		position: 'bottom',
		variant: 'default',
		sizeScale: 100,
		onClose: fn(),
		'onUpdate:isOpen': fn(),
	},
	// isOpen хранится в args: клик по триггеру и закрытие поповера обновляют Controls, а переключатель в Controls — поповер.
	render: args => {
		const onUpdate = useModelArg('isOpen')
		return {
			components: { BasePopover, BaseButton, BaseText },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: `
				<BasePopover v-bind="props" @update:is-open="onUpdate">
					<template #trigger>
						<BaseButton variant="outline">Автосохранение</BaseButton>
					</template>
					<BaseText>Изменения сохраняются каждые 30 секунд. История правок хранится 30 дней.</BaseText>
				</BasePopover>
			`,
		}
	},
} satisfies Meta<typeof BasePopover>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: клик по кнопке открывает поповер под ней, повторный клик, клик снаружи или Escape — закрывают. */
export const Default: Story = {
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Автосохранение' })
		await userEvent.click(trigger)
		await expect(await screen.findByText(/Изменения сохраняются/)).toBeInTheDocument()

		await userEvent.click(trigger)
		await waitFor(() => expect(screen.queryByText(/Изменения сохраняются/)).not.toBeInTheDocument())
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Пять вариантов — те же, что у панели `BaseDropdown`. `default` — рамка и тень; `outline` — рамка заметнее, без тени;
 * `shadow` — только тень; `soft` — мягкий нейтральный фон; `ghost` — без фона, рамки и стрелки.
 */
export const Variants: Story = {
	args: { position: 'right' },
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			...docsFrame(340),
			source: {
				code: POPOVER_VARIANTS.map(variant => `<BasePopover v-model:is-open="isOpen" variant="${variant}">…</BasePopover>`).join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BasePopover, BaseButton, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS, 'variant']), variants: POPOVER_VARIANTS }),
		template: `
			<div class="story-col" style="gap: 24px;">
				<BasePopover v-for="variant in variants" :key="variant" v-bind="props" :is-open="true" :variant="variant">
					<template #trigger>
						<BaseButton variant="outline">{{ variant }}</BaseButton>
					</template>
					<BaseText>Поповер {{ variant }}</BaseText>
				</BasePopover>
			</div>
		`,
	}),
}

/** Сторона `position`: поповер и стрелка центрируются по триггеру. */
export const Positions: Story = {
	parameters: {
		layout: 'padded',
		controls: { include: ['variant', 'sizeScale'] },
		docs: { ...docsFrame(300), source: { code: '<BasePopover v-model:is-open="isOpen" position="left">…</BasePopover>' } },
	},
	render: args => ({
		components: { BasePopover, BaseButton, BaseText },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS, 'position']),
			// Отступы ячеек оставляют место для поповера с нужной стороны от кнопки
			cells: [
				{ position: 'top', text: 'Сверху', padding: '64px 0 0 64px' },
				{ position: 'bottom', text: 'Снизу', padding: '0 0 64px 64px' },
				{ position: 'left', text: 'Слева', padding: '16px 0 16px 180px' },
				{ position: 'right', text: 'Справа', padding: '16px 0 16px 16px' },
			] as const,
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 320px;">
				<div v-for="cell in cells" :key="cell.position" :style="{ padding: cell.padding }">
					<BasePopover v-bind="props" :is-open="true" :position="cell.position">
						<template #trigger>
							<BaseButton variant="outline">{{ cell.position }}</BaseButton>
						</template>
						<BaseText>{{ cell.text }}</BaseText>
					</BasePopover>
				</div>
			</div>
		`,
	}),
	play: async () => {
		// Стрелка поповера сверху смотрит вниз, на центр кнопки
		const button = screen.getByRole('button', { name: 'top' })
		const arrow = (await screen.findByText('Сверху'))
			.closest('.base-dropdown__panel')
			?.querySelector('.base-popover__arrow') as HTMLElement
		await waitFor(() => {
			const buttonBox = button.getBoundingClientRect()
			const arrowBox = arrow.getBoundingClientRect()
			expect(Math.abs(arrowBox.left + arrowBox.width / 2 - (buttonBox.left + buttonBox.width / 2))).toBeLessThan(1)
		})
	},
}

/** Размеры через `sizeScale`: пропорционально меняются отступы, кегль, стрелка и ширина панели (до 320px при 100). */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			...docsFrame(180),
			source: { code: SIZE_PRESETS.map(preset => `<BasePopover :size-scale="${preset.sizeScale}">…</BasePopover>`).join('\n') },
		},
	},
	render: args => ({
		components: { BasePopover, BaseButton, BaseText },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS, 'sizeScale']),
			presets: SIZE_PRESETS.filter(preset => ['sm', 'md', 'lg'].includes(preset.name)),
			sizeLabel,
		}),
		template: `
			<div class="story-row" style="gap: 96px;">
				<BasePopover v-for="preset in presets" :key="preset.name" v-bind="props" :is-open="true" :size-scale="preset.sizeScale">
					<template #trigger>
						<BaseButton variant="outline" :size-scale="preset.sizeScale">{{ sizeLabel(preset) }}</BaseButton>
					</template>
					<BaseText>Текст поповера</BaseText>
				</BasePopover>
			</div>
		`,
	}),
}

/**
 * Кастомный цвет через `color`: фон и текст панели, стрелка того же цвета. Подойдёт любой CSS-цвет; токены `var(--rise-…)`
 * сохраняют контраст в обеих темах. Содержимое `color` не наследует — кнопка «Включить» сохраняет свой цвет.
 */
export const CustomColor: Story = {
	args: {
		isOpen: true,
		color: { bg: { base: 'var(--rise-primary-soft)' }, text: { base: 'var(--rise-primary-text)' } },
	},
	parameters: { controls: { include: ['color', 'position'] }, docs: docsFrame(200) },
	render: args => {
		const onUpdate = useModelArg('isOpen')
		return {
			components: { BasePopover, BaseButton },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: `
				<BasePopover v-bind="props" @update:is-open="onUpdate">
					<template #trigger>
						<BaseButton variant="outline">Новое в редакторе</BaseButton>
					</template>
					<div class="story-col">
						Субтитры теперь можно сдвигать горячими клавишами.
						<BaseButton>Включить</BaseButton>
					</div>
				</BasePopover>
			`,
		}
	},
	play: async () => {
		const action = await screen.findByRole('button', { name: 'Включить' })
		const panel = action.closest('.base-dropdown__panel') as HTMLElement
		const arrow = panel.querySelector('.base-popover__arrow') as HTMLElement
		await expect(getComputedStyle(panel).backgroundColor).toBe(resolveColor('var(--rise-primary-soft)'))
		await expect(getComputedStyle(arrow).backgroundColor).toBe(resolveColor('var(--rise-primary-soft)'))
		await expect(getComputedStyle(panel).color).toBe(resolveColor('var(--rise-primary-text)'))
		await expect(getComputedStyle(action).backgroundColor).toBe(resolveColor('var(--rise-primary)'))
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/** Длинный текст переносится по словам: ширина поповера не больше 320px. */
export const LongContent: Story = {
	args: { isOpen: true },
	parameters: { controls: { include: ['position', 'variant', 'sizeScale'] }, docs: docsFrame(260) },
	render: args => {
		const onUpdate = useModelArg('isOpen')
		return {
			components: { BasePopover, BaseButton, BaseText },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: `
				<BasePopover v-bind="props" @update:is-open="onUpdate">
					<template #trigger>
						<BaseButton variant="outline">Как считается стоимость</BaseButton>
					</template>
					<div class="story-col" style="gap: 4px;">
						<BaseText :color="{ text: { base: 'var(--rise-text-highlighted)' } }" :weight="600">Стоимость озвучки</BaseText>
						<BaseText :color="{ text: { base: 'var(--rise-text-muted)' } }">
							Стоимость зависит от длительности серии, числа ролей и срочности. Минута с одним голосом — базовый тариф,
							каждая следующая роль добавляет 30%, срочная сдача в течение суток — ещё 50%.
						</BaseText>
					</div>
				</BasePopover>
			`,
		}
	},
	play: async () => {
		const title = await screen.findByText('Стоимость озвучки')
		const panel = title.closest('.base-dropdown__panel') as HTMLElement
		await expect(panel.getBoundingClientRect().width).toBeLessThanOrEqual(320)
		await expect(panel.getBoundingClientRect().height).toBeGreaterThan(title.getBoundingClientRect().height * 3)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Форма в поповере: поле получает фокус и ввод, кнопка отправляет форму и закрывает поповер.
 * После закрытия фокус возвращается на кнопку-триггер.
 */
export const WithForm: Story = {
	parameters: { controls: { include: ['position', 'variant'] } },
	render: args => ({
		components: { BasePopover, BaseButton, BaseInput },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS]), isOpen: ref(false), email: ref('') }),
		template: `
			<BasePopover v-bind="props" v-model:is-open="isOpen">
				<template #trigger>
					<BaseButton variant="outline">Пригласить</BaseButton>
				</template>
				<form class="story-col" aria-label="Приглашение" @submit.prevent="isOpen = false">
					<BaseInput v-model="email" type="email" label="Почта участника" placeholder="name@example.com" />
					<BaseButton type="submit">Отправить приглашение</BaseButton>
				</form>
			</BasePopover>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Пригласить' })
		await userEvent.click(trigger)
		const field = await screen.findByLabelText('Почта участника')

		await userEvent.click(field)
		await expect(field).toHaveFocus()
		await userEvent.keyboard('ivan@example.com')
		await expect(field).toHaveValue('ivan@example.com')

		await userEvent.click(
			within(screen.getByRole('form', { name: 'Приглашение' })).getByRole('button', { name: 'Отправить приглашение' }),
		)
		await waitFor(() => expect(screen.queryByLabelText('Почта участника')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}

/**
 * Список в поповере: выбор в выпадающем списке не закрывает поповер, хотя панель списка телепортирована в body.
 * Escape сначала закрывает список, следующее нажатие — поповер.
 */
export const NestedList: Story = {
	parameters: { controls: { include: ['position', 'variant'] }, docs: docsFrame(360) },
	render: args => ({
		components: { BasePopover, BaseButton, BaseSelect },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS]),
			isOpen: ref(false),
			status: ref('draft'),
			statuses: [
				{ value: 'draft', label: 'Черновик' },
				{ value: 'review', label: 'На проверке' },
				{ value: 'published', label: 'Опубликована' },
			],
		}),
		template: `
			<BasePopover v-bind="props" v-model:is-open="isOpen">
				<template #trigger>
					<BaseButton variant="outline">Фильтры</BaseButton>
				</template>
				<div style="width: 240px;">
					<BaseSelect v-model="status" label="Статус серии" :options="statuses" />
				</div>
			</BasePopover>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Фильтры' }))
		const select = await screen.findByRole('combobox', { name: 'Статус серии' })

		await userEvent.click(select)
		await userEvent.click(await screen.findByRole('option', { name: 'Опубликована' }))
		await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
		await expect(select).toHaveTextContent('Опубликована')
		await expect(select).toBeVisible()

		await userEvent.click(select)
		await screen.findByRole('listbox')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
		await expect(select).toBeVisible()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('combobox', { name: 'Статус серии' })).not.toBeInTheDocument())
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/** Клавиатура: Tab ставит фокус на кнопку-триггер, Enter открывает поповер, Escape закрывает его (событие `close`). */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Автосохранение' })
		await tabTo(trigger, userEvent)

		await userEvent.keyboard('{Enter}')
		await expect(await screen.findByText(/Изменения сохраняются/)).toBeInTheDocument()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByText(/Изменения сохраняются/)).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
