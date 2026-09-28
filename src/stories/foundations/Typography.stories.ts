import './foundations.scss'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
	title: 'Foundations/Typography',
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				component: [
					'Шрифты: `--rise-font-sans` (Inter Variable) и `--rise-font-mono` (JetBrains Mono Variable).',
					'Файлы шрифтов подключает приложение — см. README, раздел «Шрифты».',
					'',
					'Размер и межстрочный интервал идут парами: `--rise-font-size-sm` + `--rise-line-height-sm` и т. д.',
					'В SCSS компонентов — миксин `@include text-size(sm)`, который ещё и масштабирует пару по `sizeScale`.',
				].join('\n'),
			},
		},
	},
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SIZES = [
	{ name: '2xs', size: 10, line: 14, usage: 'Счётчики в бейджах xs' },
	{ name: 'xs', size: 12, line: 16, usage: 'Подписи, подсказки, бейджи' },
	{ name: 'sm', size: 14, line: 20, usage: 'Текст контролов, таблиц, меню — основной размер' },
	{ name: 'base', size: 16, line: 24, usage: 'Текст статей, заголовки карточек' },
	{ name: 'lg', size: 18, line: 28, usage: 'Заголовки модальных окон' },
	{ name: 'xl', size: 20, line: 28, usage: 'Заголовки разделов' },
	{ name: '2xl', size: 24, line: 32, usage: 'Заголовки страниц' },
	{ name: '3xl', size: 30, line: 36, usage: 'Крупные заголовки' },
]

const WEIGHTS = [
	{ token: '--rise-font-weight-normal', value: 400, usage: 'Текст' },
	{ token: '--rise-font-weight-medium', value: 500, usage: 'Кнопки, пункты меню, подписи полей' },
	{ token: '--rise-font-weight-semibold', value: 600, usage: 'Заголовки' },
	{ token: '--rise-font-weight-bold', value: 700, usage: 'Акценты в тексте' },
]

/** Шкала размеров: токен, размер/интервал в пикселях при sizeScale = 100 и где применяется. */
export const Scale: Story = {
	render: () => ({
		setup: () => ({ sizes: SIZES }),
		template: `
			<div>
				<div v-for="item in sizes" :key="item.name" class="fnd-type">
					<span class="fnd-type__meta">
						text-size({{ item.name }})<br />{{ item.size }}/{{ item.line }}px · {{ item.usage }}
					</span>
					<span
						class="fnd-type__sample"
						:style="{ fontSize: 'var(--rise-font-size-' + item.name + ')', lineHeight: 'var(--rise-line-height-' + item.name + ')' }">
						Съешь же ещё этих мягких французских булок
					</span>
				</div>
			</div>
		`,
	}),
}

/** Начертания шрифта. */
export const Weights: Story = {
	render: () => ({
		setup: () => ({ weights: WEIGHTS }),
		template: `
			<div>
				<div v-for="item in weights" :key="item.token" class="fnd-type">
					<span class="fnd-type__meta">{{ item.token }}<br />{{ item.value }} · {{ item.usage }}</span>
					<span class="fnd-type__sample" :style="{ fontWeight: 'var(' + item.token + ')', fontSize: '18px' }">
						Интерфейс Rise UI Kit — Interface 0123456789
					</span>
				</div>
			</div>
		`,
	}),
}

/** Семейства шрифтов: основной и моноширинный (код, значения, таблицы чисел). */
export const Families: Story = {
	render: () => ({
		template: `
			<div>
				<div class="fnd-type">
					<span class="fnd-type__meta">--rise-font-sans<br />Inter Variable</span>
					<span class="fnd-type__sample" style="font-size: 20px;">АБВГДЕЁЖЗ абвгдеёжз ABCDEFG abcdefg 0123456789</span>
				</div>
				<div class="fnd-type">
					<span class="fnd-type__meta">--rise-font-mono<br />JetBrains Mono Variable</span>
					<span class="fnd-type__sample" style="font-size: 18px; font-family: var(--rise-font-mono);">const theme = 'dark' // 0O 1lI</span>
				</div>
			</div>
		`,
	}),
}
