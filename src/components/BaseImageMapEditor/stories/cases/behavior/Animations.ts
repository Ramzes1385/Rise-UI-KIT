import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import type meta from '../../BaseImageMapEditor.stories'
import BaseImageMapEditor from '../../../ui/BaseImageMapEditor.vue'

const motion = motionPresetsStory({
	item: `
		<BaseImageMapEditor v-bind="args" v-model:selected="selected" :has-preview="false" />
	`,
	components: { BaseImageMapEditor, BaseButton },
	imports: ['BaseImageMapEditor'],
	state: { selected: 'peak' },
	action: "selected = selected === 'peak' ? 'lake' : 'peak'",
	trigger: 'Выбрать другой объект',
	omit: ['selected', 'hasPreview'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Смена выделения в четырёх пресетах движения: кнопка выбирает другой объект через `v-model:selected`.',
					'Редактор — рабочий инструмент: холст и панели не въезжают и не гаснут, фигуры на холсте меняются сразу (как в',
					'графических редакторах). Строки списков объектов и этажей меняют фон и рамку при наведении и выделении за',
					'`--rise-duration-fast` с `--rise-ease`; кнопки и поля панели движутся токенами своих компонентов.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Выбрать другой объект' })
		await waitFor(() => expect(canvas.getAllByRole('button', { name: /^Вершина/ })).toHaveLength(4))
		await userEvent.click(trigger)
		for (const item of canvas.getAllByRole('button', { name: /^Озеро/ })) {
			await waitFor(() => expect(item).toHaveAttribute('aria-current', 'true'))
		}
		trigger.focus()
		await userEvent.keyboard('{Enter}')
		for (const item of canvas.getAllByRole('button', { name: /^Вершина/ })) {
			await waitFor(() => expect(item).toHaveAttribute('aria-current', 'true'))
		}
	},
}
