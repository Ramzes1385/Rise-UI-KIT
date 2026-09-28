/**
 * BaseText — stories.
 *
 * Разделы: Default (песочница) → внешний вид (размеры, начертания, цвет) → семантика тегов →
 * длинный текст (перенос, обрезка в одну и несколько строк, nowrap) → сценарий «иерархия текста».
 */

import { expect } from 'storybook/test'
import {
	ARG_GROUP,
	baseArgTypes,
	hiddenArgTypes,
	propGroup,
	SIZE_PRESETS,
	sizeLabel,
	slotArgType,
	useArgsWithoutSlots,
} from '@/stories/helpers'
import BaseText from '../ui/BaseText.vue'
import { TEXT_WEIGHT } from '../model/textWeight'
import { TEXT_TAGS } from '../types/BaseText.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const LONG_TEXT =
	'Проект «Ребрендинг» объединяет задачи дизайна, разработки и маркетинга. Участники видят сроки, ответственных и статус каждой задачи, а менеджер получает сводку по неделям и отчёт о загрузке команды.'

const meta = {
	title: 'Element/BaseText',
	component: BaseText,
	parameters: {
		docs: {
			description: {
				component: [
					'Текстовый примитив библиотеки: абзацы, подписи, заголовки внутри компонентов.',
					'',
					'- По умолчанию — `<p>`, кегль 14/20, цвет `--rise-text`.',
					'- `tag` задаёт только семантику: заголовок — это нужный тег (`h1`…`h6`) плюс `sizeScale` и `weight`.',
					'- `sizeScale` масштабирует кегль вместе с интерлиньяжем, `color` перекрашивает текст (лучше токенами `var(--rise-…)`).',
					'- Длинный текст переносится; `truncate` обрезает его многоточием в одну строку или в `maxLines` строк, `nowrap` запрещает перенос.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes(),
		...hiddenArgTypes('variant'),
		tag: { control: 'select', options: TEXT_TAGS, table: propGroup(ARG_GROUP.content) },
		weight: { control: 'inline-radio', options: Object.values(TEXT_WEIGHT), table: propGroup(ARG_GROUP.appearance) },
		nowrap: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		truncate: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		maxLines: { control: { type: 'number', min: 1, max: 10 }, table: propGroup(ARG_GROUP.behavior) },
		default: slotArgType('Текст'),
	},
	args: {
		default: 'Сохраните изменения, чтобы их увидели участники проекта.',
		tag: 'p',
		weight: TEXT_WEIGHT.REGULAR,
		sizeScale: 100,
		nowrap: false,
		truncate: false,
		maxLines: 1,
	},
} satisfies Meta<typeof BaseText>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: меняйте props в панели Controls. По умолчанию — абзац 14/20. */
export const Default: Story = {
	play: async ({ canvas }) => {
		const text = canvas.getByText('Сохраните изменения, чтобы их увидели участники проекта.')
		await expect(text.tagName).toBe('P')
		await expect(getComputedStyle(text).fontSize).toBe('14px')
		await expect(getComputedStyle(text).lineHeight).toBe('20px')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Размер задаёт `sizeScale`: кегль и интерлиньяж масштабируются вместе (100 — 14/20px). */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['weight', 'color'] },
		docs: {
			source: {
				code: SIZE_PRESETS.map(preset => `<BaseText :size-scale="${preset.sizeScale}">${preset.name}</BaseText>`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-col">
				<div v-for="preset in presets" :key="preset.name" class="story-row">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseText v-bind="props" :size-scale="preset.sizeScale">Отчёт за май готов</BaseText>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const [xs, , md, , xl] = canvas.getAllByText('Отчёт за май готов')
		await expect(getComputedStyle(xs).fontSize).toBe('10.5px')
		await expect(getComputedStyle(md).fontSize).toBe('14px')
		await expect(getComputedStyle(xl).lineHeight).toBe('25px')
	},
}

/** Начертания из `TEXT_WEIGHT`: 400 — текст, 500 — подписи и кнопки, 600 — заголовки, 700 — акценты. */
export const Weights: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'color'] },
		docs: {
			source: {
				code: Object.values(TEXT_WEIGHT)
					.map(weight => `<BaseText :weight="${weight}">${weight}</BaseText>`)
					.join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args), weights: Object.entries(TEXT_WEIGHT) }),
		template: `
			<div class="story-col">
				<div v-for="[name, weight] in weights" :key="name" class="story-row">
					<span class="story-label">{{ weight }} · {{ name }}</span>
					<BaseText v-bind="props" :weight="weight">Отчёт за май готов</BaseText>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const [regular, , , bold] = canvas.getAllByText('Отчёт за май готов')
		await expect(getComputedStyle(regular).fontWeight).toBe('400')
		await expect(getComputedStyle(bold).fontWeight).toBe('700')
	},
}

/**
 * Цвет через `color: { text: { base } }`. Берите токены темы — тогда цвет меняется вместе с темой:
 * `--rise-text-highlighted` для заголовков, `--rise-text-muted` для подписей, цвет роли для статусов.
 */
export const CustomColor: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'weight'] },
		docs: {
			source: {
				code: [
					`<BaseText :color="{ text: { base: 'var(--rise-text-highlighted)' } }">Заголовок</BaseText>`,
					`<BaseText :color="{ text: { base: 'var(--rise-text-muted)' } }">Подпись</BaseText>`,
					`<BaseText :color="{ text: { base: 'var(--rise-success)' } }">Оплачено</BaseText>`,
					`<BaseText :color="{ text: { base: 'var(--rise-error)' } }">Просрочено</BaseText>`,
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseText },
		setup: () => ({
			props: useArgsWithoutSlots(args),
			samples: [
				{ token: '--rise-text-highlighted', label: 'Заголовок' },
				{ token: '--rise-text', label: 'Основной текст' },
				{ token: '--rise-text-muted', label: 'Подпись' },
				{ token: '--rise-primary', label: 'Акцент' },
				{ token: '--rise-success', label: 'Оплачено' },
				{ token: '--rise-error', label: 'Просрочено' },
			],
		}),
		template: `
			<div class="story-col">
				<div v-for="sample in samples" :key="sample.token" class="story-row">
					<span class="story-label">{{ sample.token }}</span>
					<BaseText v-bind="props" :color="{ text: { base: 'var(' + sample.token + ')' } }">{{ sample.label }}</BaseText>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const overdue = canvas.getByText('Просрочено')
		await expect(overdue.style.getPropertyValue('--custom-text')).toBe('var(--rise-error)')
		await expect(getComputedStyle(overdue).color).not.toBe(getComputedStyle(canvas.getByText('Основной текст')).color)
	},
}

// ─── Семантика ─────────────────────────────────────────────────────────────────

/**
 * `tag` меняет только семантику: `h2` озвучивается как заголовок второго уровня, но выглядит как обычный текст.
 * Размер и начертание заголовка задаются `sizeScale` и `weight` — даже `strong` без `weight` остаётся 400.
 */
export const Tags: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'weight'] },
		docs: {
			source: {
				code: [
					'<BaseText tag="h2" :size-scale="125" :weight="600">Заголовок раздела</BaseText>',
					'<BaseText tag="p">Абзац текста</BaseText>',
					'<BaseText tag="small" :size-scale="87.5">Примечание</BaseText>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'tag']), tags: TEXT_TAGS }),
		template: `
			<div class="story-col">
				<div v-for="tag in tags" :key="tag" class="story-row">
					<span class="story-label">&lt;{{ tag }}&gt;</span>
					<BaseText v-bind="props" :tag="tag">Итоги квартала</BaseText>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('heading', { level: 2, name: 'Итоги квартала' })).toBeVisible()
		const [paragraph] = canvas.getAllByText('Итоги квартала')
		const heading = canvas.getByRole('heading', { level: 1 })
		await expect(getComputedStyle(heading).fontSize).toBe(getComputedStyle(paragraph).fontSize)
	},
}

// ─── Длинный текст ─────────────────────────────────────────────────────────────

/** Длинный текст переносится по словам и не выходит за ширину контейнера (здесь — 360px). */
export const LongContent: Story = {
	args: { default: LONG_TEXT },
	render: args => ({
		components: { BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args), text: args.default }),
		template: '<div class="story-narrow"><BaseText v-bind="props">{{ text }}</BaseText></div>',
	}),
	play: async ({ canvas }) => {
		const text = canvas.getByText(/Ребрендинг/)
		await expect(text.getBoundingClientRect().width).toBeLessThanOrEqual(360)
		await expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth)
		await expect(text.getBoundingClientRect().height).toBeGreaterThan(20)
	},
}

/** `truncate`: текст в одну строку с многоточием, полный текст остаётся в DOM и доступен скринридеру. */
export const Truncate: Story = {
	args: { default: LONG_TEXT, truncate: true },
	render: args => ({
		components: { BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args), text: args.default }),
		template: '<div class="story-narrow"><BaseText v-bind="props">{{ text }}</BaseText></div>',
	}),
	play: async ({ canvas }) => {
		const text = canvas.getByText(/Ребрендинг/)
		await expect(getComputedStyle(text).textOverflow).toBe('ellipsis')
		await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)
		await expect(text.getBoundingClientRect().height).toBe(20)
	},
}

/** `truncate` + `maxLines`: не больше указанного числа строк (здесь — 2), дальше многоточие. */
export const MaxLines: Story = {
	args: { default: LONG_TEXT, truncate: true, maxLines: 2 },
	render: args => ({
		components: { BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args), text: args.default }),
		template: '<div class="story-narrow"><BaseText v-bind="props">{{ text }}</BaseText></div>',
	}),
	play: async ({ canvas }) => {
		const text = canvas.getByText(/Ребрендинг/)
		await expect(text.getBoundingClientRect().height).toBe(40)
		await expect(text.scrollHeight).toBeGreaterThan(text.clientHeight)
	},
}

/**
 * `nowrap` запрещает перенос: строка остаётся одной, даже если шире контейнера. Многоточия нет —
 * лишнее обрезает контейнер (здесь `overflow: hidden`). Нужно многоточие — используйте `truncate`.
 */
export const Nowrap: Story = {
	args: { default: LONG_TEXT, nowrap: true },
	render: args => ({
		components: { BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args), text: args.default }),
		template: '<div class="story-narrow" style="overflow: hidden;"><BaseText v-bind="props">{{ text }}</BaseText></div>',
	}),
	play: async ({ canvas }) => {
		const text = canvas.getByText(/Ребрендинг/)
		await expect(text.getBoundingClientRect().height).toBe(20)
		await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/** Иерархия текста в блоке: заголовок (`h3`, sizeScale 125, 600), основной текст и подпись (`--rise-text-muted`). */
export const Hierarchy: Story = {
	parameters: {
		controls: { disable: true },
		docs: {
			source: {
				code: [
					`<BaseText tag="h3" :size-scale="125" :weight="600" :color="{ text: { base: 'var(--rise-text-highlighted)' } }">`,
					'  Ребрендинг',
					'</BaseText>',
					'<BaseText>Новый логотип, палитра и шаблоны презентаций для всех отделов.</BaseText>',
					`<BaseText tag="small" :size-scale="87.5" :color="{ text: { base: 'var(--rise-text-muted)' } }">Обновлено 15 мая</BaseText>`,
				].join('\n'),
			},
		},
	},
	render: () => ({
		components: { BaseText },
		setup: () => ({ TEXT_WEIGHT }),
		template: `
			<div class="story-col story-narrow" style="gap: 4px;">
				<BaseText tag="h3" :size-scale="125" :weight="TEXT_WEIGHT.SEMIBOLD" :color="{ text: { base: 'var(--rise-text-highlighted)' } }">
					Ребрендинг
				</BaseText>
				<BaseText>Новый логотип, палитра и шаблоны презентаций для всех отделов.</BaseText>
				<BaseText tag="small" :size-scale="87.5" :color="{ text: { base: 'var(--rise-text-muted)' } }">Обновлено 15 мая</BaseText>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const heading = canvas.getByRole('heading', { level: 3, name: 'Ребрендинг' })
		await expect(getComputedStyle(heading).fontSize).toBe('17.5px')
		await expect(getComputedStyle(heading).fontWeight).toBe('600')
	},
}
