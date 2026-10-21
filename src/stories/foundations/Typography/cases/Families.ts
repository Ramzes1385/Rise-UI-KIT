import type meta from '../Typography.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div>
		<div class="fnd-type">
			<span class="fnd-type__meta">--rise-font-sans<br />Rise Grotesk</span>
			<span class="fnd-type__sample" style="font-size: 20px;">АБВГДЕЁЖЗ абвгдеёжз ABCDEFG abcdefg 0123456789</span>
		</div>
		<div class="fnd-type">
			<span class="fnd-type__meta">--rise-font-mono<br />Rise Mono</span>
			<span class="fnd-type__sample" style="font-size: 18px; font-family: var(--rise-font-mono);">const theme = 'dark' // 0O 1lI</span>
		</div>
		<div class="fnd-type">
			<span class="fnd-type__meta">caps-label<br />Rise Mono · капс · --rise-tracking-label</span>
			<span class="fnd-type__sample" style="font-family: var(--rise-font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: var(--rise-tracking-label);">Статус · Владелец · Обновлено</span>
		</div>
	</div>
`

export const Families: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Семейства шрифтов кита: основной и моноширинный (код, значения, таблицы чисел). Служебные подписи — шапки таблиц, бейджи, подписи групп меню, номера шагов и страниц — набираются Rise Mono капсом с разрядкой `--rise-tracking-label` (миксин `caps-label`); системных и дефолтных шрифтов в кит не подмешивают.',
			},
			source: staticStorySource({ template, imports: [] }),
		},
	},
	render: args => ({
		setup: useStorySetup(args),
		template,
	}),
}
