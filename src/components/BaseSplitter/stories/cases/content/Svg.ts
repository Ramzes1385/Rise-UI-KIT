import type meta from '../../BaseSplitter.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSplitter from '../../../ui/BaseSplitter.vue'
import { checkSplitterDrag, checkSplitterKeyboard } from '../../play'
import { literal, staticStorySource, useStorySetup } from '@/stories/helpers'

const months = [
	{ name: 'Июл', value: 120 },
	{ name: 'Авг', value: 150 },
	{ name: 'Сен', value: 210 },
	{ name: 'Окт', value: 180 },
	{ name: 'Ноя', value: 240 },
]

const notes = ['Пик продаж — в ноябре: 240 заказов.', 'Октябрь просел из-за задержки поставки.', 'Рост за полгода — вдвое.']

const state = { size: 60 }

const template = `
	<div style="height: 320px; border: 1px solid var(--rise-border); border-radius: 8px; overflow: hidden">
		<BaseSplitter v-model="size" label="График заказов" :min="30" :max="80">
			<template #start>
				<svg
					viewBox="0 0 400 260"
					width="100%"
					height="100%"
					preserveAspectRatio="xMidYMid meet"
					role="img"
					aria-label="Заказы по месяцам: от 120 в июле до 240 в ноябре">
					<line x1="40" y1="220" x2="380" y2="220" style="stroke: var(--rise-border-accented); stroke-width: 2" />
					<g v-for="(month, index) in months" :key="month.name">
						<rect :x="60 + index * 64" :y="220 - month.value" width="40" :height="month.value" rx="4" style="fill: var(--rise-primary)" />
						<text :x="80 + index * 64" y="242" text-anchor="middle" font-size="14" style="fill: var(--rise-text-muted)">
							{{ month.name }}
						</text>
					</g>
				</svg>
			</template>
			<template #end>
				<section aria-label="Пояснения" style="padding: 12px 16px">
					<h3 style="margin-top: 0">Заказы по месяцам</h3>
					<ul style="margin: 0; padding-inline-start: 20px; display: grid; gap: 8px">
						<li v-for="note in notes" :key="note">{{ note }}</li>
					</ul>
				</section>
			</template>
		</BaseSplitter>
	</div>
`

export const Svg: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Своя SVG-графика в панели: у `<svg>` стоят `viewBox`, `width="100%"` и `height="100%"`, поэтому график масштабируется',
					'вместе с панелью, сохраняя пропорции. Цвета — токены `--rise-*`, у графики есть `role="img"` и подпись.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseSplitter'],
				state,
				script: [`const months = ${literal(months)}`, `const notes = ${literal(notes)}`].join('\n'),
			}),
		},
		controls: { disable: true },
	},
	render: args => ({
		components: { BaseSplitter },
		setup: useStorySetup(args, { state, data: { months, notes } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const separator = canvas.getByRole('separator', { name: 'График заказов' })
		await checkSplitterKeyboard(separator, { min: 30, max: 80, step: 5 }, userEvent)
		await checkSplitterDrag(separator, { min: 30, max: 80 })
	},
}
