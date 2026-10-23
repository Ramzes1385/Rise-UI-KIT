import type meta from '../Colors.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, staticStorySource, useStorySetup } from '@/stories/helpers'

interface TokenInfo {
	token: string
	description: string
}

const SEMANTIC_GROUPS: { title: string; hint: string; tokens: TokenInfo[] }[] = [
	{
		title: 'Фон',
		hint: 'Слои отделяет оттенок, а не рамка: страница → контейнер (muted) → поле, наведение (elevated) → нажатие, трек (accented).',
		tokens: [
			{ token: '--rise-bg', description: 'Фон страницы и окон' },
			{ token: '--rise-bg-muted', description: 'Контейнер: карточка, панель, подвал' },
			{ token: '--rise-bg-elevated', description: 'Поле, наведение, дорожка сегментов' },
			{ token: '--rise-bg-accented', description: 'Нажатие, трек слайдера, выключенный переключатель' },
			{ token: '--rise-surface-raised', description: 'Поле внутри тонального контейнера' },
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
		hint: 'Рамки нужны разделителям и вариантам outline: у карточек, полей и кнопок по умолчанию их нет.',
		tokens: [
			{ token: '--rise-border', description: 'Разделители внутри поверхностей' },
			{ token: '--rise-border-muted', description: 'Внутренние разделители' },
			{ token: '--rise-border-accented', description: 'Рамка вариантов outline' },
			{ token: '--rise-border-control', description: 'Граница флажка и радио' },
			{ token: '--rise-border-inverted', description: 'Рамки на инвертированном фоне' },
		],
	},
]

const template = `
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
`

export const Semantic: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Семантические токены фона, текста и рамок с назначением. Эти имена используют стили компонентов; в тёмной теме значения другие, имена те же.',
			},
			source: staticStorySource({ template, imports: [], script: `const groups = ${literal(SEMANTIC_GROUPS)}` }),
		},
	},
	render: args => ({
		setup: useStorySetup(args, { data: { groups: SEMANTIC_GROUPS } }),
		template,
	}),
}
