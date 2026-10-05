import { ITEMS } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseAccordion.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseAccordion from '../../../ui/BaseAccordion.vue'

const items = ITEMS.slice(0, 2).map(item => ({ ...item, defaultOpen: false }))
const first = items[0]!.label

const motion = motionPresetsStory({
	item: `
		<BaseAccordion v-bind="args" v-model:open="open" :items="items" />
	`,
	components: { BaseAccordion, BaseButton },
	imports: ['BaseAccordion'],
	state: { open: [], items, first },
	action: 'open = open.length ? [] : [first]',
	trigger: 'Раскрыть или свернуть',
	omit: ['items', 'open'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Раскрытие и сворачивание в колонках четырёх пресетов движения. Панель растёт по высоте через `grid-template-rows`',
					'0fr → 1fr (миксин `expand-rows`) за `--rise-duration-slow` с кривой `--rise-ease-emphasized`, содержимое',
					'проявляется за `--rise-duration`; стрелка поворачивается через `transform` с той же длительностью и кривой, что и панель.',
					'В пресете `none` и при «уменьшить движение» — сразу конечное состояние. Выключить движение в приложении —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const toggle = canvas.getByRole('button', { name: 'Раскрыть или свернуть' })
		await userEvent.click(toggle)
		for (const header of canvas.getAllByRole('button', { name: first }))
			await waitFor(() => expect(header).toHaveAttribute('aria-expanded', 'true'))
		for (const region of canvas.getAllByRole('region', { name: first })) await waitFor(() => expect(region).toBeVisible())
		await userEvent.click(toggle)
		for (const header of canvas.getAllByRole('button', { name: first }))
			await waitFor(() => expect(header).toHaveAttribute('aria-expanded', 'false'))
	},
}
