/**
 * BaseCard — stories.
 *
 * Разделы: Default (песочница) → внешний вид (варианты, размеры, кастомный цвет, отступы) →
 * содержимое (действия в шапке, подвал, своя шапка, длинный текст) → высота (прокрутка и обрезка) →
 * сценарий «интерактивные карточки» с клавиатурой.
 */

import { expect } from 'storybook/test'
import { ref } from 'vue'
import { ARG_GROUP, baseArgTypes, placeholderImage, propGroup, SIZE_PRESETS, sizeLabel, slotArgType, STORY_USERS, tabTo, useArgsWithoutSlots } from '@/stories/helpers'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { CARD_VARIANTS } from '../model/BaseCard.types'
import BaseCard from '../ui/BaseCard.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const BODY = 'Выручка выросла на 12% к апрелю, средний чек — на 4%. Больше всего заказов пришло из мобильного приложения.'

const LONG_BODY = [
	'Команда закрыла 48 задач из 52 запланированных. Перенесены задачи по интеграции с платёжным сервисом:',
	'партнёр обновляет API и обещает стабильную версию к концу месяца. Дизайн новой главной страницы согласован,',
	'вёрстка начнётся на следующей неделе. Отдел поддержки отметил рост обращений по доставке — нужна отдельная',
	'статья в справочном центре. Бюджет спринта израсходован на 91%, резерв остаётся на тестирование.',
].join(' ')

const PROJECTS = [
	{ id: 1, title: 'Ребрендинг', subtitle: '12 задач · до 30 мая' },
	{ id: 2, title: 'Мобильное приложение', subtitle: '28 задач · до 15 июня' },
	{ id: 3, title: 'Справочный центр', subtitle: '5 задач · до 1 июня' },
]

const meta = {
	title: 'Element/BaseCard',
	component: BaseCard,
	parameters: {
		docs: {
			description: {
				component: [
					'Поверхность для группы контента: сводка, настройки, превью объекта.',
					'',
					'- Шапка — `title` и `subtitle` (или слот `header`) и слот `actions` справа; тело — слот по умолчанию; подвал — слот `footer`.',
					'- Варианты: `default` — рамка, `outline` — рамка темнее, `soft` — мягкий фон, `ghost` — без фона и рамки, `shadow` — рамка и тень.',
					'- Отступы секций — 16px 20px; проп `padding` меняет их (например, `0` для картинки во всю ширину).',
					'- `height` + `scroll` — тело прокручивается, шапка и подвал на месте; `height` без `scroll` обрезает текст до трёх строк.',
					'- `isHoverable` — для кликабельных карточек: рамка и тень при наведении, кольцо фокуса. Фокус и клавиатуру',
					'  (`tabindex="0"`, Enter) добавляет приложение.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: CARD_VARIANTS }),
		title: { control: 'text', table: propGroup(ARG_GROUP.content) },
		subtitle: { control: 'text', table: propGroup(ARG_GROUP.content) },
		padding: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
		height: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
		scroll: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		isHoverable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		default: slotArgType('Содержимое карточки'),
		header: { control: false },
		actions: { control: false },
		footer: { control: false },
	},
	args: {
		title: 'Отчёт за май',
		subtitle: 'Обновлён 15 мая',
		default: BODY,
		variant: 'default',
		isHoverable: false,
		scroll: false,
		sizeScale: 100,
	},
	render: args => ({
		components: { BaseCard },
		setup: () => ({ props: useArgsWithoutSlots(args), args }),
		template: '<div class="story-medium"><BaseCard v-bind="props">{{ args.default }}</BaseCard></div>',
	}),
} satisfies Meta<typeof BaseCard>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: меняйте props в панели Controls. Отступы секций по умолчанию — 16px 20px. */
export const Default: Story = {
	play: async ({ canvas }) => {
		const title = canvas.getByRole('heading', { level: 3, name: 'Отчёт за май' })
		await expect(getComputedStyle(title).fontSize).toBe('16px')
		const header = title.closest('.base-card__header') as HTMLElement
		await expect(getComputedStyle(header).padding).toBe('16px 20px')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Пять вариантов оформления. `soft` и `ghost` — для карточек внутри других поверхностей. */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'isHoverable'] },
		docs: { source: { code: ['default', 'outline', 'soft', 'ghost', 'shadow'].map(variant => `<BaseCard variant="${variant}" title="${variant}">…</BaseCard>`).join('\n') } },
	},
	render: args => ({
		components: { BaseCard },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'title', 'subtitle']), variants: ['default', 'outline', 'soft', 'ghost', 'shadow'] }),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<BaseCard v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :title="variant" subtitle="Обновлён 15 мая">
					Выручка выросла на 12% к апрелю.
				</BaseCard>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: отступы, текст и радиус масштабируются вместе. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant'] },
		docs: { source: { code: SIZE_PRESETS.map(preset => `<BaseCard :size-scale="${preset.sizeScale}" title="${preset.name}">…</BaseCard>`).join('\n') } },
	},
	render: args => ({
		components: { BaseCard },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'title', 'subtitle']), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-grid" style="--story-grid-min: 220px; align-items: start;">
				<BaseCard v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :title="sizeLabel(preset)" subtitle="Обновлён 15 мая">
					Выручка выросла на 12%.
				</BaseCard>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const title = canvas.getByRole('heading', { name: 'xl · 125' })
		await expect(getComputedStyle(title).fontSize).toBe('20px')
		await expect(getComputedStyle(title.closest('.base-card__header') as HTMLElement).padding).toBe('20px 25px')
	},
}

/**
 * Кастомный цвет через `color`: фон и текст карточки, заголовок и подзаголовок берут цвет текста.
 * Вложенные компоненты (кнопка в подвале) цвет карточки не наследуют — у них свои цвета.
 */
export const CustomColor: Story = {
	args: {
		title: 'Тариф «Команда»',
		subtitle: 'До 20 участников',
		color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } },
	},
	render: args => ({
		components: { BaseCard, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<div class="story-narrow">
				<BaseCard v-bind="props">
					Общий календарь, отчёты и приоритетная поддержка.
					<template #footer>
						<BaseButton variant="shadow">Подключить</BaseButton>
					</template>
				</BaseCard>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const title = canvas.getByRole('heading', { name: 'Тариф «Команда»' })
		const card = title.closest('.base-card') as HTMLElement
		await expect(getComputedStyle(card).backgroundColor).toBe('rgb(109, 40, 217)')
		await expect(getComputedStyle(title).color).toBe('rgb(255, 255, 255)')
		// Цвет карточки не наследуется кнопкой в подвале: у неё собственный фон варианта shadow
		const button = canvas.getByRole('button', { name: 'Подключить' })
		await expect(getComputedStyle(button).backgroundColor).not.toBe('rgb(109, 40, 217)')
	},
}

/**
 * Отступы `padding`: без пропа — 16px 20px из стилей; число — Y = n, X = 2n;
 * объект `{ x, y, top, right, bottom, left }` задаёт стороны напрямую; `0` — картинка во всю ширину.
 */
export const Padding: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseCard title="Из стилей">…</BaseCard>',
					'<BaseCard :padding="8" title="8 → 8px 16px">…</BaseCard>',
					'<BaseCard :padding="{ x: 24, y: 12 }" title="x: 24, y: 12">…</BaseCard>',
					'<BaseCard :padding="0"><img :src="cover" alt="…" /></BaseCard>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseCard },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'title', 'subtitle']), cover: placeholderImage({ width: 480, height: 240, hue: 200 }) }),
		template: `
			<div class="story-grid" style="--story-grid-min: 220px; align-items: start;">
				<BaseCard v-bind="props" title="Из стилей">16px 20px</BaseCard>
				<BaseCard v-bind="props" :padding="8" title="8 → 8px 16px">Компактная карточка</BaseCard>
				<BaseCard v-bind="props" :padding="{ x: 24, y: 12 }" title="x: 24, y: 12">Отступы по осям</BaseCard>
				<BaseCard v-bind="props" :padding="0">
					<img :src="cover" alt="Горы в тумане" style="display: block; width: 100%;" />
				</BaseCard>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const [themed, numeric, , edgeToEdge] = canvasElement.querySelectorAll<HTMLElement>('.base-card')
		await expect(themed.style.getPropertyValue('--card-pad-top')).toBe('')
		await expect(numeric.style.getPropertyValue('--card-pad-left')).toBe('16px')
		await expect(getComputedStyle(edgeToEdge.querySelector('.base-card__body') as HTMLElement).padding).toBe('0px')
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/** Слот `actions` — кнопки справа в шапке. Кнопки высотой 32px стоят на строке заголовка и не увеличивают шапку. */
export const WithActions: Story = {
	parameters: {
		docs: {
			source: {
				code: [
					'<BaseCard title="Отчёт за май" subtitle="Обновлён 15 мая">',
					'  <template #actions>',
					'    <BaseButton variant="outline"><template #left><BaseIcon name="download" /></template>Скачать</BaseButton>',
					'    <BaseButton variant="ghost" aria-label="Ещё" :padding="{ x: 5, y: 5 }"><BaseIcon name="menu" /></BaseButton>',
					'  </template>',
					'  …',
					'</BaseCard>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseCard, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args), args }),
		template: `
			<div class="story-medium">
				<BaseCard v-bind="props">
					<template #actions>
						<BaseButton variant="outline"><template #left><BaseIcon name="download" /></template>Скачать</BaseButton>
						<BaseButton variant="ghost" aria-label="Ещё" :padding="{ x: 5, y: 5 }"><BaseIcon name="menu" /></BaseButton>
					</template>
					{{ args.default }}
				</BaseCard>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const download = canvas.getByRole('button', { name: 'Скачать' })
		const header = download.closest('.base-card__header') as HTMLElement
		await expect(header.getBoundingClientRect().height).toBe(81)
		await expect(canvas.getByRole('button', { name: 'Ещё' })).toBeVisible()
	},
}

/** Слот `footer` — подвал с действиями, отделён линией. */
export const WithFooter: Story = {
	parameters: {
		docs: {
			source: {
				code: [
					'<BaseCard title="Уведомления">',
					'  …',
					'  <template #footer>',
					'    <BaseButton variant="outline">Отмена</BaseButton>',
					'    <BaseButton>Сохранить</BaseButton>',
					'  </template>',
					'</BaseCard>',
				].join('\n'),
			},
		},
	},
	args: { title: 'Уведомления', subtitle: 'Письма о задачах и комментариях', default: 'Присылать сводку раз в день, в 9:00 по московскому времени.' },
	render: args => ({
		components: { BaseCard, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args), args }),
		template: `
			<div class="story-medium">
				<BaseCard v-bind="props">
					{{ args.default }}
					<template #footer>
						<div class="story-row" style="justify-content: flex-end; gap: 8px;">
							<BaseButton variant="outline">Отмена</BaseButton>
							<BaseButton>Сохранить</BaseButton>
						</div>
					</template>
				</BaseCard>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const save = canvas.getByRole('button', { name: 'Сохранить' })
		const footer = save.closest<HTMLElement>('.base-card__footer')
		await expect(footer).not.toBeNull()
		// Подвал — не ориентир contentinfo: несколько карточек на странице не дают дублей ориентиров
		await expect(footer?.tagName).toBe('DIV')
	},
}

/** Слот `header` заменяет заголовок и подзаголовок: например, автор записи с аватаром. */
export const CustomHeader: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseCard>',
					'  <template #header>',
					'    <img :src="user.avatar" alt="" class="avatar" />',
					'    <div>{{ user.name }} · {{ user.role }}</div>',
					'  </template>',
					'  …',
					'</BaseCard>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseCard },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'title', 'subtitle']), user: STORY_USERS[0] }),
		template: `
			<div class="story-medium">
				<BaseCard v-bind="props">
					<template #header>
						<div class="story-row" style="gap: 12px;">
							<img :src="user.avatar" alt="" width="40" height="40" style="border-radius: var(--rise-radius-full);" />
							<div>
								<div style="color: var(--rise-text-highlighted); font-weight: var(--rise-font-weight-medium);">{{ user.name }}</div>
								<div style="color: var(--rise-text-muted);">{{ user.role }}</div>
							</div>
						</div>
					</template>
					Подготовила макеты главной страницы. Жду комментариев до пятницы.
				</BaseCard>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Анна Смирнова')).toBeVisible()
		await expect(canvas.queryByRole('heading')).toBeNull()
	},
}

/** Длинные заголовок, подзаголовок и текст переносятся по словам и не выходят за ширину карточки (здесь — 360px). */
export const LongContent: Story = {
	args: {
		title: 'Итоги квартала по всем проектам отдела маркетинга и продаж',
		subtitle: 'Сводка обновляется автоматически каждый понедельник в 9:00 по московскому времени',
		default: LONG_BODY,
	},
	render: args => ({
		components: { BaseCard },
		setup: () => ({ props: useArgsWithoutSlots(args), args }),
		template: '<div class="story-narrow"><BaseCard v-bind="props">{{ args.default }}</BaseCard></div>',
	}),
	play: async ({ canvas }) => {
		const title = canvas.getByRole('heading', { level: 3 })
		const card = title.closest('.base-card') as HTMLElement
		await expect(card.getBoundingClientRect().width).toBeLessThanOrEqual(360)
		await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth)
		await expect(title.getBoundingClientRect().height).toBeGreaterThan(24)
	},
}

// ─── Высота ────────────────────────────────────────────────────────────────────

/**
 * Фиксированная высота `height`. Слева — со `scroll`: тело прокручивается, шапка на месте; тело получает фокус
 * по Tab, чтобы его можно было прокрутить стрелками. Справа — без `scroll`: текст тела обрезается до трёх строк.
 */
export const FixedHeight: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			source: {
				code: ['<BaseCard title="Со scroll" height="240px" scroll>…</BaseCard>', '<BaseCard title="Без scroll" height="240px">…</BaseCard>'].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseCard },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'title', 'subtitle', 'height', 'scroll']), text: LONG_BODY }),
		template: `
			<div class="story-grid" style="--story-grid-min: 260px; align-items: start;">
				<BaseCard v-bind="props" title="Со scroll" subtitle="Тело прокручивается" height="240px" scroll>{{ text }}</BaseCard>
				<BaseCard v-bind="props" title="Без scroll" subtitle="Текст — три строки" height="240px">{{ text }}</BaseCard>
			</div>
		`,
	}),
	play: async ({ canvasElement, userEvent }) => {
		const [scrolled, truncated] = canvasElement.querySelectorAll<HTMLElement>('.base-card')
		await expect(scrolled.getBoundingClientRect().height).toBe(240)
		const scrolledBody = scrolled.querySelector('.base-card__body') as HTMLElement
		await expect(scrolledBody.scrollHeight).toBeGreaterThan(scrolledBody.clientHeight)
		await tabTo(scrolledBody, userEvent)
		await expect(getComputedStyle(truncated.querySelector('.base-card__body') as HTMLElement).webkitLineClamp).toBe('3')
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Интерактивные карточки: `isHoverable` даёт курсор, рамку и тень при наведении и кольцо фокуса.
 * Фокус и клавиатуру добавляет приложение: `tabindex="0"`, `role="link"`, обработчики click и Enter.
 */
export const Hoverable: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseCard',
					'  v-for="project in projects"',
					'  :key="project.id"',
					'  is-hoverable',
					'  tabindex="0"',
					'  role="link"',
					'  :title="project.title"',
					'  :subtitle="project.subtitle"',
					'  @click="open(project)"',
					'  @keydown.enter="open(project)" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseCard },
		setup: () => {
			const opened = ref('')
			return { props: useArgsWithoutSlots(args, ['default', 'title', 'subtitle', 'isHoverable']), projects: PROJECTS, opened }
		},
		template: `
			<div class="story-stack">
				<div class="story-grid" style="--story-grid-min: 220px;">
					<BaseCard
						v-for="project in projects"
						:key="project.id"
						v-bind="props"
						is-hoverable
						tabindex="0"
						role="link"
						:title="project.title"
						:subtitle="project.subtitle"
						@click="opened = project.title"
						@keydown.enter="opened = project.title" />
				</div>
				<p class="story-label" role="status">{{ opened ? 'Открыт проект «' + opened + '»' : 'Проект не выбран' }}</p>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const [first, second] = canvas.getAllByRole('link')
		await tabTo(first, userEvent)
		await expect(getComputedStyle(first).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByRole('status')).toHaveTextContent('Открыт проект «Ребрендинг»')
		await userEvent.click(second)
		await expect(canvas.getByRole('status')).toHaveTextContent('Открыт проект «Мобильное приложение»')
	},
}
