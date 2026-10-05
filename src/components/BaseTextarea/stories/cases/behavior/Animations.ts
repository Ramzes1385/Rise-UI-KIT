import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseTextarea.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseTextarea from '../../../ui/BaseTextarea.vue'

const motion = motionPresetsStory({
	item: `
		<BaseTextarea v-bind="args" v-model="text" />
	`,
	components: { BaseTextarea, BaseButton },
	imports: ['BaseTextarea'],
	state: { text: 'Первая строка' },
	action: "text = text.length > 60 ? 'Первая строка' : text + '\\nЕщё строка'",
	trigger: 'Добавить строку',
	slots: ['modelValue', 'onUpdate:modelValue'],
	omit: ['modelValue', 'onUpdate:modelValue'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { label: 'Отзыв', placeholder: '', rows: 1, isAutosize: true },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'rows'] },
		docs: {
			description: {
				story: [
					'Авторост высоты (`isAutosize`) в четырёх пресетах движения: `none`, `subtle`, `standard` (по умолчанию), `expressive`.',
					'«Добавить строку» дописывает строку — поле плавно растёт до новой высоты; после пяти строк текст сбрасывается и поле',
					'плавно сжимается. Длительность и кривая — токены `--rise-duration-fast` и `--rise-ease`; первая высота при монтировании',
					"и ручное изменение размера не анимируются. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда: высота меняется сразу.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const fields = [...canvasElement.querySelectorAll<HTMLTextAreaElement>('.base-textarea__field')]
		const heights = fields.map(field => field.getBoundingClientRect().height)

		await expect(fields).toHaveLength(4)
		await userEvent.click(canvas.getByRole('button', { name: 'Добавить строку' }))
		for (const [index, field] of fields.entries()) {
			await waitFor(() => expect(field.getBoundingClientRect().height).toBeGreaterThan(heights[index]))
			await waitFor(() =>
				expect(Math.abs(field.getBoundingClientRect().height - Number.parseFloat(field.style.height))).toBeLessThan(1),
			)
		}
	},
}
