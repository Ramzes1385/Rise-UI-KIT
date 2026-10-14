import { WIDTH_ITEMS } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMegaMenu from '../../../ui/BaseMegaMenu.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const items = WIDTH_ITEMS

const widths = [360, 720]

const template = `
	<div class="story-stack">
		<div v-for="width in widths" :key="width" :data-width="width" :style="{ width: width + 'px', minHeight: '300px' }">
			<BaseMegaMenu v-bind="args" :items="items" open-key="catalog" :aria-label="'Меню шириной ' + width" />
		</div>
	</div>
`

export const DrilldownByWidth: StoryObj<typeof meta> = {
	argTypes: { openKey: { control: false }, items: { control: false } },
	args: { drilldown: 'auto', drilldownFrom: 3, drilldownBelow: 480, trigger: 'click' },
	parameters: {
		controls: { include: ['drilldown', 'drilldownFrom', 'drilldownBelow'] },
		docs: {
			description: {
				story: [
					'`drilldown="auto"` смотрит и на ширину меню: уже `drilldownBelow` (по умолчанию 480px, с учётом `sizeScale`) каскаду справа',
					'от пункта не хватает места, и разделы с вложенностью от двух уровней показывают уровни внутри колонки (drill-down).',
					'Слева меню шириной 360px — drill-down, справа 720px — каскад. Ширина замеряется при монтировании, до показа панели, поэтому',
					'при открытии нет переключения режимов, и следит за размером меню (ResizeObserver). `drilldownBelow: 0` отключает учёт ширины.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseMegaMenu'],
				script: [`const items = ${literal(items)}`, `const widths = ${literal(widths)}`].join('\n'),
				omit: ['link', 'promo', 'end', 'items', 'openKey'],
			}),
		},
	},
	render: args => ({
		components: { BaseMegaMenu },
		setup: useStorySetup(args, { data: { items, widths }, slots: ['link', 'promo', 'end', 'items', 'openKey'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const narrow = canvasElement.querySelector('[data-width="360"]') as HTMLElement
		const wide = canvasElement.querySelector('[data-width="720"]') as HTMLElement
		await waitFor(() => expect(narrow.querySelector('.base-mega-menu__drill')).not.toBeNull())
		await expect(wide.querySelector('.base-mega-menu__drill')).toBeNull()
	},
}
