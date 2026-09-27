/**
 * Foundations / Colors — цветовые токены темы.
 * Все образцы берут цвет из CSS-переменных: переключите «Тему» на панели инструментов, чтобы увидеть тёмные значения.
 */

import type { Meta, StoryObj } from '@storybook/vue3-vite'
import './foundations.scss'

const meta = {
	title: 'Foundations/Colors',
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				component: [
					'Цвета устроены в три уровня, как в Nuxt UI:',
					'',
					'1. **Палитры** `--rise-color-{роль}-{50…950}` — сырые оттенки ролей `primary`, `neutral`, `success`, `info`, `warning`, `error`.',
					'2. **Семантические токены** `--rise-*` — что именно красится: фон, текст, рамки, заливка роли. Значения зависят от темы.',
					'3. **Компоненты** используют только семантические токены, поэтому тёмная тема и перекраска работают без правок стилей.',
					'',
					'Пары «текст/фон» проходят WCAG 2.2 AA в обеих темах (`npm run test:contrast`).',
				].join('\n'),
			},
		},
	},
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

interface TokenInfo {
	token: string
	description: string
}

const SEMANTIC_GROUPS: { title: string; hint: string; tokens: TokenInfo[] }[] = [
	{
		title: 'Фон',
		hint: 'bg — основной фон компонентов и страницы; muted/elevated/accented — приподнятые поверхности и состояния наведения.',
		tokens: [
			{ token: '--rise-bg', description: 'Фон страницы, карточек, полей' },
			{ token: '--rise-bg-muted', description: 'Подвалы, второстепенные области' },
			{ token: '--rise-bg-elevated', description: 'Наведение, заголовки таблиц' },
			{ token: '--rise-bg-accented', description: 'Нажатие, трек слайдера' },
			{ token: '--rise-bg-inverted', description: 'Тултипы, инвертированные блоки' },
		],
	},
	{
		title: 'Текст',
		hint: 'highlighted — заголовки и значения, text — основной, toned/muted — вторичный, dimmed — плейсхолдеры и неактивное.',
		tokens: [
			{ token: '--rise-text-highlighted', description: 'Заголовки, значения' },
			{ token: '--rise-text', description: 'Основной текст' },
			{ token: '--rise-text-toned', description: 'Вторичный на bg-elevated' },
			{ token: '--rise-text-muted', description: 'Подписи, подсказки' },
			{ token: '--rise-text-dimmed', description: 'Плейсхолдеры, неактивное' },
			{ token: '--rise-text-inverted', description: 'Текст на bg-inverted' },
		],
	},
	{
		title: 'Рамки',
		hint: 'border — рамки поверхностей и разделители, accented — рамки полей ввода и нейтральных кнопок.',
		tokens: [
			{ token: '--rise-border', description: 'Карточки, разделители' },
			{ token: '--rise-border-muted', description: 'Внутренние разделители' },
			{ token: '--rise-border-accented', description: 'Поля ввода, outline-кнопки' },
			{ token: '--rise-border-inverted', description: 'Рамки на инвертированном фоне' },
		],
	},
]

const ROLES = [
	{ role: 'primary', description: 'Главные действия, выбранные и активные элементы, фокус' },
	{ role: 'success', description: 'Успех, завершённые шаги' },
	{ role: 'info', description: 'Информационные сообщения' },
	{ role: 'warning', description: 'Предупреждения' },
	{ role: 'error', description: 'Ошибки, разрушительные действия' },
]

const PALETTES = ['primary', 'neutral', 'success', 'info', 'warning', 'error']
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

/** Семантические токены фона, текста и рамок с назначением. Эти имена используют стили компонентов. */
export const Semantic: Story = {
	render: () => ({
		setup: () => ({ groups: SEMANTIC_GROUPS }),
		template: `
			<div class="fnd">
				<section v-for="group in groups" :key="group.title" class="fnd__section">
					<h3 class="fnd__title">{{ group.title }}</h3>
					<p class="fnd__hint">{{ group.hint }}</p>
					<div class="fnd__grid">
						<div v-for="item in group.tokens" :key="item.token" class="fnd-token">
							<!-- Образец текста «Aa» — псевдоэлемент: dimmed-цвет намеренно низкоконтрастный и не должен проверяться как текст -->
							<span
								class="fnd-token__swatch"
								:class="{ 'fnd-token__swatch--text': group.title === 'Текст' }"
								aria-hidden="true"
								:style="group.title === 'Текст'
									? { background: 'var(--rise-bg)', color: 'var(' + item.token + ')' }
									: group.title === 'Рамки'
										? { background: 'var(--rise-bg)', boxShadow: 'inset 0 0 0 3px var(' + item.token + ')' }
										: { background: 'var(' + item.token + ')' }" />
							<span>
								<span class="fnd-token__name">{{ item.token }}</span>
								<span class="fnd-token__desc">{{ item.description }}</span>
							</span>
						</div>
					</div>
				</section>
			</div>
		`,
	}),
}

/**
 * Цветовые роли. У каждой роли: основной цвет (`--rise-{роль}`), наведение (`-hover`), текст на заливке (`--rise-on-{роль}`),
 * мягкий фон (`-soft`, `-soft-hover`), текст на мягком фоне (`-text`) и тонкая рамка (`-border`).
 */
export const Roles: Story = {
	render: () => ({
		setup: () => ({ roles: ROLES }),
		template: `
			<div class="fnd__grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
				<div v-for="item in roles" :key="item.role" class="fnd-role">
					<span class="fnd-role__name">{{ item.role }}</span>
					<span class="fnd__hint">{{ item.description }}</span>
					<span class="fnd-role__sample" :style="{ background: 'var(--rise-' + item.role + ')', color: 'var(--rise-on-' + item.role + ')' }">
						Заливка <span class="fnd-role__token">--rise-{{ item.role }}</span>
					</span>
					<span class="fnd-role__sample" :style="{ background: 'var(--rise-' + item.role + '-hover)', color: 'var(--rise-on-' + item.role + ')' }">
						Наведение <span class="fnd-role__token">-hover</span>
					</span>
					<span
						class="fnd-role__sample"
						:style="{ background: 'var(--rise-' + item.role + '-soft)', color: 'var(--rise-' + item.role + '-text)', boxShadow: 'inset 0 0 0 1px var(--rise-' + item.role + '-border)' }">
						Мягкий фон <span class="fnd-role__token">-soft · -text · -border</span>
					</span>
					<span class="fnd-role__sample" :style="{ color: 'var(--rise-' + item.role + ')', padding: '0 10px' }">
						Текст на фоне <span class="fnd-role__token">--rise-{{ item.role }}</span>
					</span>
				</div>
			</div>
		`,
	}),
}

/**
 * Палитры ролей (оттенки Tailwind: orange, zinc, green, blue, amber, red). Чтобы сменить бренд,
 * переопределите `--rise-color-primary-50 … 950` на `:root` — семантические токены обеих тем пересчитаются.
 */
export const Palettes: Story = {
	render: () => ({
		setup: () => ({ palettes: PALETTES, shades: SHADES }),
		template: `
			<div class="fnd" style="gap: 12px;">
				<div v-for="palette in palettes" :key="palette" class="fnd-palette">
					<span class="fnd-palette__name">{{ palette }}</span>
					<span v-for="shade in shades" :key="shade" class="fnd-palette__shade">
						<span class="fnd-palette__chip" :style="{ background: 'var(--rise-color-' + palette + '-' + shade + ')' }" />
						{{ shade }}
					</span>
				</div>
			</div>
		`,
	}),
}
