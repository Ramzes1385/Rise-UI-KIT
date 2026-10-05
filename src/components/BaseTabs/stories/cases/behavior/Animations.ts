import { MODEL_KEYS } from '../../shared'
import type meta from '../../BaseTabs.stories'
import BaseTabs from '../../../ui/BaseTabs.vue'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const hidden = [...MODEL_KEYS, 'default']

const motion = motionPresetsStory({
	item: `
		<BaseTabs v-bind="args" v-model="tab">
			<template #panel-overview>
				<p>Лёгкий ноутбук с экраном 13 дюймов.</p>
			</template>
			<template #panel-reviews>
				<p>Средняя оценка — 4,8 из 5.</p>
			</template>
			<template #default>
				<p>Раздел пока без своего содержимого.</p>
			</template>
		</BaseTabs>
	`,
	components: { BaseTabs, BaseButton },
	imports: ['BaseTabs'],
	state: { tab: 'overview' },
	action: "tab = tab === 'overview' ? 'reviews' : 'overview'",
	trigger: 'Другая вкладка',
	slots: hidden,
	omit: hidden,
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isFullWidth'] },
		docs: {
			description: {
				story: [
					'Смена вкладки в четырёх пресетах движения: «Другая вкладка» переключает «Обзор» и «Отзывы», вкладки можно нажимать и в колонках.',
					'Один индикатор на список — линия (`underline`, `arc`) или подложка (`pills`, `rounded`) — переезжает к выбранной вкладке:',
					'`transform` и размер на кривой `--rise-ease-spring` за `--rise-duration`. Содержимое панели сменяется мягко: новое',
					'проявляется за `--rise-duration` (`--rise-ease-out`), старое гаснет поверх за `--rise-duration-fast`, не занимая места.',
					'Кнопки прокрутки (`isScrollable`) появляются и исчезают так же. Первый показ — индикатор сразу на месте.',
					"В `none` и при «уменьшить движение» всё меняется сразу. Выключить в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Другая вкладка' }))
		await waitFor(() =>
			canvas.getAllByRole('tab', { name: 'Отзывы' }).forEach(tab => expect(tab).toHaveAttribute('aria-selected', 'true')),
		)
		await waitFor(() => expect(canvas.queryAllByText('Лёгкий ноутбук с экраном 13 дюймов.')).toHaveLength(0))
		await expect(canvas.getAllByText('Средняя оценка — 4,8 из 5.')).toHaveLength(4)
		const none = canvas.getAllByRole('tablist')[0]
		await expect(none.querySelector('.base-tabs__indicator')).toHaveClass('base-tabs__indicator--instant')
	},
}
