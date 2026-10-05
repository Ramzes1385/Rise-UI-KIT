import BasePin from '../../../ui/BasePin.vue'
import type meta from '../../BasePin.stories'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BasePin v-bind="args" v-model="code" aria-label="Код из СМС" />
	`,
	components: { BasePin, BaseButton },
	imports: ['BasePin'],
	state: { code: '' },
	action: "code = code ? '' : '4821'",
	trigger: 'Заполнить',
	slots: ['modelValue', 'onUpdate:modelValue'],
	omit: ['modelValue', 'onUpdate:modelValue'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'length', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Ввод символа в четырёх пресетах движения: `none`, `subtle`, `standard` (по умолчанию), `expressive`. «Заполнить»',
					'ставит код в `v-model` (как автозаполнение кода из СМС), повторное нажатие очищает. Заполненная ячейка плавно меняет',
					'цвет рамки (`--rise-duration-fast`, токен цвета — `--rise-pin-border-checked`), а новый символ коротко «впрыгивает»:',
					'масштаб от `--rise-motion-scale-from` за `--rise-duration` по кривой `--rise-ease-spring`. Так же отмечаются',
					'ввод с клавиатуры и вставка; при монтировании с готовым значением анимации нет. Выключить движение —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка «уменьшить движение»",
					'действует всегда — ячейки сразу в конечном состоянии.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Заполнить' }))
		await waitFor(() => expect(canvas.getAllByRole('textbox', { name: 'Символ 4 из 4' })).toHaveLength(4))
		for (const cell of canvas.getAllByRole('textbox', { name: 'Символ 4 из 4' })) await waitFor(() => expect(cell).toHaveValue('1'))
		for (const cell of canvas.getAllByRole('textbox', { name: 'Символ 1 из 4' })) {
			await waitFor(() => expect(cell).toHaveClass('base-pin__input--filled'))
		}
	},
}
