/**
 * BaseRating — stories.
 *
 * Разделы: Default (песочница с рабочим v-model) → внешний вид (варианты, размеры, цвет) →
 * состояния (только чтение, disabled) → содержимое (свои иконки, рейтинг в поле формы) →
 * сценарии (половинки звёзд, предпросмотр при наведении) → клавиатура.
 */

import { expect, fn, waitFor } from 'storybook/test'
import { ref } from 'vue'
import {
	ARG_GROUP,
	baseArgTypes,
	hiddenArgTypes,
	propGroup,
	SIZE_PRESETS,
	sizeLabel,
	tabTo,
	useArgsWithoutSlots,
	useModelArg,
} from '@/stories/helpers'
import { BaseFormField } from '@components/BaseFormField'
import { RATING_VARIANTS } from '../model/BaseRating.types'
import BaseRating from '../ui/BaseRating.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Звезда рейтинга по номеру с нуля: у звёзд нет роли, поэтому — по классу внутри слайдера или изображения. */
function starOf(rating: HTMLElement, index: number): HTMLElement {
	return rating.querySelectorAll<HTMLElement>('.base-rating__star').item(index)
}

/** Ширина слоя заливки звезды — доля оценки в ней: '100%', '50%', '0%'. */
function fillOf(star: HTMLElement): string {
	return (star.querySelector('.base-rating__star-fill') as HTMLElement).style.width
}

/**
 * Точка на звезде для указателя: ratio — доля ширины от левого края (0.2 — у края, 0.5 — середина).
 * Оценка зависит от места клика, а `userEvent.click` без координат шлёт clientX = 0 (левый край экрана), поэтому
 * клики по звёздам — через `userEvent.pointer` с этой точкой.
 */
function pointOn(star: HTMLElement, ratio = 0.5): { x: number; y: number } {
	const rect = star.getBoundingClientRect()
	return { x: rect.left + rect.width * ratio, y: rect.top + rect.height / 2 }
}

const meta = {
	title: 'Form/BaseRating',
	component: BaseRating,
	parameters: {
		docs: {
			description: {
				component: [
					'Оценка звёздами: выбор кликом или с клавиатуры, дробные значения (`step` 0.5 или 0.1), режим только для чтения.',
					'',
					'- `v-model` — число от 0 до `max`. Клик записывает оценку с шагом `step`; `isHoverSmooth` делает плавным',
					'  только предпросмотр под курсором.',
					'- Доступность: интерактивный рейтинг — `slider`: стрелки меняют оценку на `step`, Home — 0, End — максимум,',
					'  значение озвучивается как «3 из 5». Только чтение (`isReadonly`) — изображение с именем «Оценка 4.5 из 5».',
					'- Иконки — `icon` и `iconFilled` из спрайта; цвет заполненных звёзд — `color.text`.',
					'',
					'Подпись и описание в форме даёт `BaseFormField`. `<fieldset disabled>` рейтинг не блокирует — используйте `isDisabled`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: RATING_VARIANTS }),
		modelValue: { control: { type: 'number', min: 0, step: 0.1 }, table: propGroup(ARG_GROUP.content) },
		max: { control: { type: 'number', min: 1, max: 10 }, table: propGroup(ARG_GROUP.content) },
		icon: { control: 'text', table: propGroup(ARG_GROUP.content) },
		iconFilled: { control: 'text', table: propGroup(ARG_GROUP.content) },
		step: { control: 'inline-radio', options: [1, 0.5, 0.1], table: propGroup(ARG_GROUP.behavior) },
		isHoverSmooth: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		isReadonly: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		// Слот объявлен в типах, но компонент его не выводит
		...hiddenArgTypes('default'),
	},
	args: {
		modelValue: 3,
		max: 5,
		step: 1,
		icon: 'star',
		isHoverSmooth: true,
		variant: 'default',
		sizeScale: 100,
		isReadonly: false,
		isDisabled: false,
		'onUpdate:modelValue': fn(),
		onChange: fn(),
	},
	// Оценка хранится в args: клик по звезде обновляет Controls, а изменение в Controls — звёзды.
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseRating },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
			template: '<BaseRating v-bind="props" @update:model-value="onUpdate" />',
		}
	},
} satisfies Meta<typeof BaseRating>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: кликните по звезде или меняйте props в Controls — оценка синхронизирована. */
export const Default: Story = {
	play: async ({ canvas, userEvent }) => {
		const star = starOf(canvas.getByRole('slider'), 3)
		await userEvent.pointer({ keys: '[MouseLeft]', target: star, coords: pointOn(star) })
		// Клик в середину звезды записывает целую оценку (step = 1): плавным бывает только предпросмотр
		await waitFor(() => expect(canvas.getByRole('slider')).toHaveAttribute('aria-valuetext', '4 из 5'))
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Пять вариантов. `default` — только звёзды; `outline` — ряд в коробке поля высотой 32px, как `BaseInput`;
 * `soft` — мягкий фон; `ghost` — фон появляется при наведении; `shadow` — коробка поля с тенью.
 */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'isReadonly'] },
		docs: { source: { code: RATING_VARIANTS.map(variant => `<BaseRating v-model="rating" variant="${variant}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseRating },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'variant', 'onUpdate:modelValue']),
			variants: RATING_VARIANTS,
			values: ref<Record<string, number>>(Object.fromEntries(RATING_VARIANTS.map(variant => [variant, 3]))),
		}),
		template: `
			<div class="story-col">
				<div v-for="variant in variants" :key="variant" class="story-row">
					<span class="story-label">{{ variant }}</span>
					<BaseRating v-bind="props" v-model="values[variant]" :variant="variant" />
				</div>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: звезда 15, 17.5, 20, 22.5 и 25px; коробка вариантов — 24–40px, как поле того же размера. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant'] },
		docs: { source: { code: SIZE_PRESETS.map(p => `<BaseRating v-model="rating" :size-scale="${p.sizeScale}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseRating },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, number>>(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, 3]))),
		}),
		template: `
			<div class="story-col">
				<div v-for="preset in presets" :key="preset.name" class="story-row">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseRating v-bind="props" v-model="values[preset.name]" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`,
	}),
}

/** Кастомный цвет через `color`: `text` — заполненные звёзды (`text.hover` — предпросмотр), `bg` — фон коробки. */
export const CustomColor: Story = {
	args: {
		modelValue: 4,
		variant: 'soft',
		color: { bg: { base: '#fefce8' }, text: { base: '#ca8a04', hover: '#a16207' } },
	},
	play: async ({ canvas }) => {
		const rating = canvas.getByRole('slider')
		await expect(getComputedStyle(rating).backgroundColor).toBe('rgb(254, 252, 232)')
		const fill = starOf(rating, 0).querySelector('.base-rating__star-fill') as HTMLElement
		await expect(getComputedStyle(fill).color).toBe('rgb(202, 138, 4)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/**
 * Только чтение (`isReadonly`) — например, средняя оценка: дробное значение заливает часть звезды.
 * Это изображение с оценкой в имени, а не слайдер: клик и клавиатура его не меняют.
 */
export const Readonly: Story = {
	args: { modelValue: 4.3, step: 0.1, isReadonly: true },
	parameters: { docs: { source: { code: '<BaseRating :model-value="4.3" :step="0.1" is-readonly />' } } },
	render: args => ({
		components: { BaseRating },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<div class="story-row">
				<BaseRating v-bind="props" />
				<span class="story-label" style="min-width: 0;">{{ props.modelValue }} · 128 отзывов</span>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const rating = canvas.getByRole('img', { name: 'Оценка 4.3 из 5' })
		await expect(rating).not.toHaveAttribute('tabindex')
		await expect(fillOf(starOf(rating, 4))).toBe('30%')

		const star = starOf(rating, 0)
		await userEvent.pointer({ keys: '[MouseLeft]', target: star, coords: pointOn(star) })
		await expect(rating).toHaveAccessibleName('Оценка 4.3 из 5')
		await expect(fillOf(starOf(rating, 4))).toBe('30%')
	},
}

/** Отключённый рейтинг: приглушён, не получает фокус, не реагирует на наведение, клик и клавиатуру. */
export const Disabled: Story = {
	args: { modelValue: 2, isDisabled: true },
	play: async ({ canvas, userEvent, args }) => {
		const rating = canvas.getByRole('slider')
		await expect(rating).toHaveAttribute('aria-disabled', 'true')
		await expect(rating).not.toHaveAttribute('tabindex')

		const star = starOf(rating, 4)
		await userEvent.pointer({ keys: '[MouseLeft]', target: star, coords: pointOn(star) })
		await expect(args.onChange).not.toHaveBeenCalled()
		await expect(fillOf(starOf(rating, 4))).toBe('0%')
		await expect(rating).not.toHaveFocus()
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/**
 * Свои иконки: `icon` — пустая и (без `iconFilled`) заполненная, `iconFilled` — отдельная иконка заполненного
 * состояния. Иконки берутся из спрайта библиотеки.
 */
export const CustomIcons: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'variant'] },
		docs: {
			source: {
				code: [
					'<BaseRating v-model="quality" icon="mic" />',
					'<BaseRating v-model="stages" icon="x-circle" icon-filled="check-circle" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseRating },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'icon', 'iconFilled', 'onUpdate:modelValue']),
			quality: ref(4),
			stages: ref(3),
		}),
		template: `
			<div class="story-col">
				<div class="story-row">
					<span class="story-label">Озвучка</span>
					<BaseRating v-bind="props" v-model="quality" icon="mic" />
				</div>
				<div class="story-row">
					<span class="story-label">Этапы серии</span>
					<BaseRating v-bind="props" v-model="stages" icon="x-circle" icon-filled="check-circle" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const star = starOf(canvas.getAllByRole('slider')[1] as HTMLElement, 0)
		await expect(star.querySelector(':scope > .base-icon use')).toHaveAttribute('href', expect.stringContaining('#x-circle'))
		await expect(star.querySelector('.base-rating__star-fill use')).toHaveAttribute('href', expect.stringContaining('#check-circle'))
	},
}

/**
 * Рейтинг в форме: подпись и описание даёт `BaseFormField`. Без `for` содержимое поля — группа с именем из подписи,
 * описание связано с ней через `aria-describedby`.
 */
export const InFormField: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'step'] },
		docs: {
			source: {
				code: [
					'<BaseFormField label="Качество озвучки" description="Оцените дубляж серии от 1 до 5">',
					'  <BaseRating v-model="rating" />',
					'</BaseFormField>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseRating, BaseFormField },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'modelValue', 'onUpdate:modelValue']), rating: ref(0) }),
		template: `
			<div class="story-narrow">
				<BaseFormField label="Качество озвучки" description="Оцените дубляж серии от 1 до 5">
					<BaseRating v-bind="props" v-model="rating" />
				</BaseFormField>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const group = canvas.getByRole('group', { name: 'Качество озвучки' })
		await expect(group).toHaveAccessibleDescription('Оцените дубляж серии от 1 до 5')
		const rating = canvas.getByRole('slider')
		await expect(group).toContainElement(rating)
		const star = starOf(rating, 4)
		await userEvent.pointer({ keys: '[MouseLeft]', target: star, coords: pointOn(star) })
		await expect(rating).toHaveAttribute('aria-valuetext', '5 из 5')
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Половинки звёзд (`step: 0.5`): клик в левую половину звезды ставит «.5», в правую — целую оценку.
 * С `isHoverSmooth: false` и предпросмотр под курсором идёт по половинкам.
 */
export const HalfStars: Story = {
	args: { modelValue: 2.5, step: 0.5, isHoverSmooth: false },
	play: async ({ canvas, userEvent }) => {
		const rating = canvas.getByRole('slider')
		await expect(fillOf(starOf(rating, 2))).toBe('50%')

		const star = starOf(rating, 3)
		await userEvent.pointer({ keys: '[MouseLeft]', target: star, coords: pointOn(star, 0.2) })
		await waitFor(() => expect(canvas.getByRole('slider')).toHaveAttribute('aria-valuetext', '3.5 из 5'))
		await userEvent.unhover(star)
		await waitFor(() => expect(fillOf(starOf(canvas.getByRole('slider'), 3))).toBe('50%'))
	},
}

/**
 * Предпросмотр при наведении. По умолчанию (`isHoverSmooth`) заливка плавно следует за курсором, с `false` —
 * идёт по шагу `step`. Клик в обоих случаях записывает оценку с шагом `step`.
 */
export const HoverPreview: Story = {
	args: { modelValue: 0 },
	parameters: {
		controls: { include: ['step', 'variant', 'sizeScale'] },
		docs: {
			source: { code: ['<BaseRating v-model="rating" />', '<BaseRating v-model="rating" :is-hover-smooth="false" />'].join('\n') },
		},
	},
	render: args => ({
		components: { BaseRating },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'isHoverSmooth', 'onUpdate:modelValue']),
			smooth: ref(0),
			stepped: ref(0),
		}),
		template: `
			<div class="story-col">
				<div class="story-row">
					<span class="story-label">Плавно</span>
					<BaseRating v-bind="props" v-model="smooth" />
				</div>
				<div class="story-row">
					<span class="story-label">По шагу</span>
					<BaseRating v-bind="props" v-model="stepped" :is-hover-smooth="false" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const [smooth, stepped] = canvas.getAllByRole('slider') as [HTMLElement, HTMLElement]

		const smoothStar = starOf(smooth, 2)
		await userEvent.pointer({ target: smoothStar, coords: pointOn(smoothStar) })
		const smoothFill = Number.parseFloat(fillOf(smoothStar))
		await expect(smoothFill).toBeGreaterThan(0)
		await expect(smoothFill).toBeLessThan(100)

		const steppedStar = starOf(stepped, 2)
		await userEvent.pointer({ target: steppedStar, coords: pointOn(steppedStar) })
		await expect(fillOf(steppedStar)).toBe('100%')
		// Курсор ушёл с первого рейтинга — его предпросмотр сброшен
		await expect(fillOf(smoothStar)).toBe('0%')

		await userEvent.unhover(steppedStar)
		await waitFor(() => expect(fillOf(steppedStar)).toBe('0%'))
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Tab ставит фокус на рейтинг (видно кольцо фокуса), стрелки вправо/вверх увеличивают оценку на `step`,
 * влево/вниз — уменьшают, End — максимум, Home — 0. Каждое изменение — событие `change`.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	// Оценка — в локальном ref: обновление args перерисовало бы story и сбросило шпион onChange
	render: args => ({
		components: { BaseRating },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'modelValue', 'onUpdate:modelValue']), rating: ref(3) }),
		template: '<BaseRating v-bind="props" v-model="rating" />',
	}),
	play: async ({ canvas, userEvent, args }) => {
		const rating = canvas.getByRole('slider', { name: 'Оценка от 0 до 5' })
		await tabTo(rating, userEvent)
		await expect(getComputedStyle(rating).outlineStyle).toBe('solid')

		await userEvent.keyboard('{ArrowRight}')
		await expect(rating).toHaveAttribute('aria-valuetext', '4 из 5')
		await expect(args.onChange).toHaveBeenLastCalledWith(4)

		await userEvent.keyboard('{ArrowDown}{ArrowDown}')
		await expect(rating).toHaveAttribute('aria-valuenow', '2')

		await userEvent.keyboard('{End}')
		await expect(rating).toHaveAttribute('aria-valuenow', '5')
		await userEvent.keyboard('{Home}')
		await expect(rating).toHaveAttribute('aria-valuenow', '0')
		await expect(args.onChange).toHaveBeenLastCalledWith(0)
	},
}
