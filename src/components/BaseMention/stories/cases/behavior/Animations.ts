import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseMention.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMention from '../../../ui/BaseMention.vue'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseMention :key="replay" v-bind="args" />
	`,
	components: { BaseMention, BaseButton },
	imports: ['BaseMention'],
	trigger: 'Очистить',
	slots: ['modelValue', 'onUpdate:modelValue'],
	omit: ['modelValue', 'onUpdate:modelValue'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { label: 'Комментарий', placeholder: 'Наберите @', rows: 2 },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Попап упоминаний в четырёх пресетах движения: `none`, `subtle`, `standard` (по умолчанию), `expressive`.',
					'Наберите `@` в поле — список появляется из масштаба `--rise-motion-scale-from` с проявлением за `--rise-duration`',
					'(кривая `--rise-ease-out`); Escape, выбор или уход из поля — гаснет за `--rise-duration-fast`. Ссылка поля на список',
					'(`aria-controls`) снимается сразу, не дожидаясь конца ухода. Открыть попап кнопкой нельзя: он открывается по положению',
					'курсора в тексте, поэтому «Очистить» только сбрасывает поля. Выключить движение в приложении —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка «уменьшить движение»",
					'действует всегда: попап появляется и исчезает сразу.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const fields = canvas.getAllByRole('textbox', { name: 'Комментарий' })
		await expect(fields).toHaveLength(4)
		for (const [index, field] of fields.entries()) {
			const column = canvasElement.querySelectorAll('.story-motion__preset')[index]
			await userEvent.type(field, '@')
			await waitFor(() => expect(column.querySelector('.base-mention__popup')).toBeVisible())
			await waitFor(() => expect(getComputedStyle(column.querySelector('.base-mention__popup')!).opacity).toBe('1'))
			await userEvent.keyboard('{Escape}')
			await waitFor(() => expect(column.querySelector('.base-mention__popup')).toBeNull())
		}
		await userEvent.click(canvas.getByRole('button', { name: 'Очистить' }))
		for (const field of canvas.getAllByRole('textbox', { name: 'Комментарий' })) await expect(field).toHaveValue('')
	},
}
