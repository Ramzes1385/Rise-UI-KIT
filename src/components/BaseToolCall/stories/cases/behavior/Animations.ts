import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseToolCall.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseToolCall from '../../../ui/BaseToolCall.vue'

const omit = ['isOpen', 'onUpdate:isOpen', 'output', 'default']

const motion = motionPresetsStory({
	item: `
		<BaseToolCall v-bind="args" v-model:is-open="isOpen" />
	`,
	components: { BaseToolCall, BaseButton },
	imports: ['BaseToolCall'],
	state: { isOpen: false },
	action: 'isOpen = !isOpen',
	trigger: 'Раскрыть или свернуть',
	slots: ['output', 'default'],
	omit,
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'status', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Раскрытие и сворачивание подробностей в четырёх пресетах движения: «Раскрыть или свернуть» переключает все карточки,',
					'заголовок — свою. Высота меняется строками сетки 0fr↔1fr за `--rise-duration-slow` (`--rise-ease-emphasized`),',
					'подробности проявляются за `--rise-duration` (`--rise-ease`), шеврон поворачивается на 180° за `--rise-duration`.',
					'Индикатор `running` — спиннер BaseLoader с периодом от `--rise-duration-loop`. В `none` и при «уменьшить движение»',
					"подробности раскрываются сразу. Выключить в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const triggers = () => canvas.getAllByRole('button', { name: /^Поиск по документации/ })
		await userEvent.click(canvas.getByRole('button', { name: 'Раскрыть или свернуть' }))
		await waitFor(() => {
			for (const trigger of triggers()) expect(trigger).toHaveAttribute('aria-expanded', 'true')
			expect(canvas.getAllByText(/"query": "тёмная тема"/)).toHaveLength(4)
			for (const code of canvas.getAllByText(/"query": "тёмная тема"/)) expect(code).toBeVisible()
		})
		await userEvent.click(canvas.getByRole('button', { name: 'Раскрыть или свернуть' }))
		await waitFor(() => {
			for (const trigger of triggers()) expect(trigger).toHaveAttribute('aria-expanded', 'false')
		})
	},
}
