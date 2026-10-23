import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseVirtualList.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { BaseAnimation } from '@components/BaseAnimation'
import BaseVirtualList from '../../ui/BaseVirtualList.vue'
import { ORDERS, ROW_STYLE, ordersScript } from '../shared'
import { motionPresetsStory, storySource, useStorySetup } from '@/stories/helpers'

const state = { replay: 0 }

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="slide-up">
			<BaseVirtualList v-bind="args" :items="items" style="border: 1px solid var(--rise-border); border-radius: 8px">
				<template #default="{ item }">
					<div :style="rowStyle">{{ item.title }}</div>
				</template>
			</BaseVirtualList>
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseVirtualList },
	imports: ['BaseAnimation', 'BaseVirtualList'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { items: ORDERS.slice(0, 100), height: 160 },
	parameters: {
		controls: { include: ['height', 'itemSize'] },
		docs: {
			description: {
				story: [
					'Своего движения у списка нет: строки при прокрутке меняются сразу (анимация здесь мешала бы чтению и замеру строк).',
					'В колонках четырёх пресетов движения список появляется через `BaseAnimation` (`slide-up`); «Повторить» монтирует его',
					'заново. Длительность и сдвиг — токены `--rise-duration*` и `--rise-motion-distance`, поэтому атрибут `data-rise-motion`',
					"меняет движение всей области. Выключить — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: storySource({
				template: motion.template,
				imports: ['BaseButton', 'BaseAnimation', 'BaseVirtualList'],
				state,
				script: ordersScript(100),
				omit: ['items'],
			}),
		},
	},
	render: args => ({
		components: { BaseAnimation, BaseButton, BaseVirtualList },
		setup: useStorySetup(args, { state, data: { items: args.items, rowStyle: ROW_STYLE }, slots: ['default', 'items'] }),
		template: motion.template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-virtual-list')).toHaveLength(4))
		for (const list of canvas.getAllByRole('list', { name: 'Заказы' })) await waitFor(() => expect(list).toBeVisible())
		await waitFor(() => expect(canvas.getAllByText('Заказ № 1000')).toHaveLength(4))
	},
}
