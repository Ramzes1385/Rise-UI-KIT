import type meta from '../Typography.stories'
import { templateSource } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'

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

const template = `
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
		`

export const Scale: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Шкала размеров: токен, размер/интервал в пикселях при sizeScale = 100 и где применяется.' },
			source: { code: templateSource(template) },
		},
	},
	render: () => ({
		setup: () => ({ sizes: SIZES }),
		template,
	}),
}
