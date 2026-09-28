import { ref } from 'vue'
import BaseStepper from '../ui/BaseStepper.vue'
import { BaseButton } from '@components/BaseButton'
import { expect, fn, waitFor } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { BaseStepperStep } from '../types/BaseStepper.types'
import { STEPPER_ORIENTATIONS, STEPPER_SHAPES, STEPPER_VARIANTS } from '../types/BaseStepper.types'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'

const STEPS: BaseStepperStep[] = [
	{ label: 'Корзина', description: 'Проверьте товары' },
	{ label: 'Доставка', description: 'Адрес и время' },
	{ label: 'Оплата', description: 'Карта или счёт' },
	{ label: 'Подтверждение', description: 'Итог заказа' },
]

const DISABLED_STEPS: BaseStepperStep[] = [STEPS[0], STEPS[1], { ...STEPS[2], isDisabled: true }, STEPS[3]]

const ICON_STEPS: BaseStepperStep[] = [
	{ label: 'Документы', icon: 'file' },
	{ label: 'Проверка', icon: 'search' },
	{ label: 'Отправка', icon: 'send' },
]

const LONG_STEPS: BaseStepperStep[] = [
	{ label: 'Заполнение анкеты участника программы', description: 'Контактные данные, опыт работы и образование' },
	{ label: 'Загрузка подтверждающих документов', description: 'Скан паспорта, диплом и сертификаты о повышении квалификации' },
	{ label: 'Собеседование с комиссией', description: 'Онлайн, около 30 минут' },
]

/** Ключи args, которые витрины задают сами (у каждого экземпляра свой шаг). */
const MODEL_KEYS = ['modelValue', 'onUpdate:modelValue']
const SLOT_KEYS = ['item', 'header', 'footer']

const meta = {
	title: 'Navigation/BaseStepper',
	component: BaseStepper,
	parameters: {
		docs: {
			description: {
				component: [
					'Степпер показывает прогресс многошагового процесса: оформление заказа, регистрация, мастер настройки.',
					'',
					'- `v-model` — номер текущего шага (с 1). Пройденные шаги отмечены галочкой, текущий — кольцом,',
					'  линия между шагами заполняется до текущего.',
					'- Клик по шагу, Enter или Space эмитят `update:modelValue` и `change`; отключённый шаг (`isDisabled`) недоступен.',
					'  Шаг — кнопка, текущий помечен `aria-current="step"`.',
					'- Ориентация `horizontal` / `vertical`, формы индикатора `circle`, `square`, `diamond`, `empty`,',
					'  вариант `animated` плавно заполняет линию.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: STEPPER_VARIANTS }),
		modelValue: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.content) },
		items: { control: 'object', table: propGroup(ARG_GROUP.content) },
		orientation: { control: 'inline-radio', options: STEPPER_ORIENTATIONS, table: propGroup(ARG_GROUP.appearance) },
		shape: { control: 'inline-radio', options: STEPPER_SHAPES, table: propGroup(ARG_GROUP.appearance) },
		item: { control: false },
		header: { control: false },
		footer: { control: false },
	},
	args: {
		modelValue: 2,
		items: STEPS,
		orientation: 'horizontal',
		shape: 'circle',
		variant: 'default',
		sizeScale: 100,
		'onUpdate:modelValue': fn(),
		onChange: fn(),
	},
	// Текущий шаг хранится в args: клик по шагу меняет Controls, а изменение в Controls — степпер.
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseStepper },
			setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), onUpdate }),
			template: '<BaseStepper v-bind="props" @update:model-value="onUpdate" />',
		}
	},
} satisfies Meta<typeof BaseStepper>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: клик по шагу делает его текущим — значение синхронизировано с Controls. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('button', { name: /Доставка/ })).toHaveAttribute('aria-current', 'step')
		await userEvent.click(canvas.getByRole('button', { name: /Оплата/ }))
		await expect(args.onChange).toHaveBeenCalledWith(3)
		await waitFor(() => expect(canvas.getByRole('button', { name: /Оплата/ })).toHaveAttribute('aria-current', 'step'))
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Формы индикатора: `circle` (по умолчанию), `square`, `diamond` и `empty` — без индикатора, только линия прогресса. */
export const Shapes: Story = {
	argTypes: { shape: { control: false } },
	parameters: {
		controls: { include: ['orientation', 'sizeScale', 'variant'] },
		docs: {
			source: { code: STEPPER_SHAPES.map(shape => `<BaseStepper v-model="step" :items="items" shape="${shape}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseStepper },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...MODEL_KEYS, ...SLOT_KEYS, 'shape']),
			shapes: STEPPER_SHAPES,
			steps: ref<Record<string, number>>(Object.fromEntries(STEPPER_SHAPES.map(shape => [shape, 3]))),
		}),
		template: `
			<div class="story-stack">
				<div v-for="shape in shapes" :key="shape" class="story-stack">
					<span class="story-label">{{ shape }}</span>
					<BaseStepper v-bind="props" v-model="steps[shape]" :shape="shape" />
				</div>
			</div>
		`,
	}),
}

/** Вертикальная ориентация: подписи справа от индикаторов, линия — отрезками между шагами. */
export const Vertical: Story = {
	args: { orientation: 'vertical', modelValue: 3 },
	play: async ({ canvas }) => {
		const [first, second] = canvas.getAllByRole('button')
		await expect(second.getBoundingClientRect().top).toBeGreaterThan(first.getBoundingClientRect().bottom - 1)
	},
}

/** Размеры через `sizeScale`: индикатор 21–35px, подписи и линия масштабируются пропорционально. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['shape', 'orientation'] },
		docs: {
			source: {
				code: SIZE_PRESETS.map(p => `<BaseStepper v-model="step" :items="items" :size-scale="${p.sizeScale}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseStepper },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...MODEL_KEYS, ...SLOT_KEYS, 'sizeScale']),
			presets: SIZE_PRESETS,
			sizeLabel,
			steps: ref<Record<string, number>>(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, 2]))),
		}),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-stack">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseStepper v-bind="props" v-model="steps[preset.name]" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`,
	}),
}

/**
 * Кастомный цвет через `color`: `bg.base` (и `bg.hover`) — пройденные шаги, кольцо текущего и линия прогресса,
 * `text.base` — галочка на заливке.
 */
export const CustomColor: Story = {
	args: {
		modelValue: 3,
		color: {
			bg: { base: '#2563eb', hover: '#1d4ed8' },
			text: { base: '#ffffff' },
		},
	},
	play: async ({ canvas }) => {
		const completed = canvas.getByRole('button', { name: /Корзина/ }).querySelector('.base-stepper__indicator') as HTMLElement
		await expect(getComputedStyle(completed).backgroundColor).toBe('rgb(37, 99, 235)')
		await expect(getComputedStyle(completed).color).toBe('rgb(255, 255, 255)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённый шаг приглушён, помечен `aria-disabled`, выведен из порядка Tab и не выбирается. */
export const Disabled: Story = {
	args: { items: DISABLED_STEPS },
	play: async ({ canvas }) => {
		const disabled = canvas.getByRole('button', { name: /Оплата/ })
		await expect(disabled).toHaveAttribute('aria-disabled', 'true')
		await expect(disabled).toHaveAttribute('tabindex', '-1')
	},
}

/** Длинные подписи и описания переносятся по словам в пределах своего шага. */
export const LongContent: Story = {
	args: { items: LONG_STEPS, modelValue: 2 },
	play: async ({ canvas }) => {
		for (const step of canvas.getAllByRole('button')) {
			await expect(step.scrollWidth).toBeLessThanOrEqual(step.clientWidth)
		}
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/** Иконка шага (`icon`) заменяет номер в индикаторе; у пройденного шага — галочка. */
export const WithIcons: Story = {
	args: { items: ICON_STEPS, modelValue: 2 },
}

/**
 * Слот `item` заменяет разметку шага целиком (параметры: `item`, `index`, `stepNumber`, `isActive`, `isCompleted`,
 * `isDisabled`); клик по шагу по-прежнему переключает его.
 */
export const CustomItem: Story = {
	parameters: {
		docs: {
			source: {
				code: [
					'<BaseStepper v-model="step" :items="items">',
					'  <template #item="{ item, stepNumber, isActive }">',
					'    <span :class="{ active: isActive }">{{ stepNumber }}. {{ item.label }}</span>',
					'  </template>',
					'</BaseStepper>',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseStepper },
			setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), onUpdate }),
			template: `
				<BaseStepper v-bind="props" @update:model-value="onUpdate">
					<template #item="{ item, stepNumber, isActive }">
						<span class="story-label" :style="{ color: isActive ? 'var(--rise-text-highlighted)' : undefined }">
							{{ stepNumber }}. {{ item.label }}
						</span>
					</template>
				</BaseStepper>
			`,
		}
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: '2. Доставка' })).toHaveAttribute('aria-current', 'step')
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Пошаговая форма: слоты `header` и `footer`, кнопки «Назад» и «Далее» меняют `v-model`, вариант `animated`
 * плавно заполняет линию.
 */
export const Wizard: Story = {
	args: { variant: 'animated', modelValue: 1 },
	parameters: {
		docs: {
			source: {
				code: [
					'<BaseStepper v-model="step" :items="items" variant="animated">',
					'  <template #header>Оформление заказа</template>',
					'  <template #footer>',
					'    <BaseButton variant="outline" :is-disabled="step === 1" @click="step--">Назад</BaseButton>',
					'    <BaseButton :is-disabled="step === items.length" @click="step++">Далее</BaseButton>',
					'  </template>',
					'</BaseStepper>',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseStepper, BaseButton },
			setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), onUpdate }),
			template: `
				<BaseStepper v-bind="props" @update:model-value="onUpdate">
					<template #header><strong>Оформление заказа</strong></template>
					<template #footer>
						<div class="story-row">
							<BaseButton variant="outline" :is-disabled="props.modelValue <= 1" @click="onUpdate(props.modelValue - 1)">Назад</BaseButton>
							<BaseButton :is-disabled="props.modelValue >= props.items.length" @click="onUpdate(props.modelValue + 1)">Далее</BaseButton>
						</div>
					</template>
				</BaseStepper>
			`,
		}
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Далее' }))
		await waitFor(() => expect(canvas.getByRole('button', { name: /Доставка/ })).toHaveAttribute('aria-current', 'step'))
		await expect(canvas.getByRole('button', { name: 'Назад' })).toBeEnabled()
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/** Клавиатура: Tab переводит фокус между шагами (видно кольцо фокуса), Enter и Space делают шаг текущим. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	args: { modelValue: 1 },
	play: async ({ canvas, userEvent, args }) => {
		const delivery = canvas.getByRole('button', { name: /Доставка/ })
		await tabTo(delivery, userEvent)
		await expect(getComputedStyle(delivery).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(args.onChange).toHaveBeenLastCalledWith(2)
		await waitFor(() => expect(delivery).toHaveAttribute('aria-current', 'step'))

		await userEvent.tab()
		await userEvent.keyboard(' ')
		await expect(args.onChange).toHaveBeenLastCalledWith(3)
	},
}
