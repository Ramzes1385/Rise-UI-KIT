import type meta from '../Colors.stories'
import { templateSource } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'

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
			description: { story: 'Семантические токены фона, текста и рамок с назначением. Эти имена используют стили компонентов.' },
			source: { code: templateSource(template) },
		},
	},
	render: () => ({
		setup: () => ({ groups: SEMANTIC_GROUPS }),
		template,
	}),
}
