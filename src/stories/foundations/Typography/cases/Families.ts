import type meta from '../Typography.stories'
import { templateSource } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'

const template = `
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
		`

export const Families: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Семейства шрифтов: основной и моноширинный (код, значения, таблицы чисел).' },
			source: { code: templateSource(template) },
		},
	},
	render: () => ({
		template,
	}),
}
