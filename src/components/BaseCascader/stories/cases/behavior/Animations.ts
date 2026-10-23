import type meta from '../../BaseCascader.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCascader from '../../../ui/BaseCascader.vue'
import { expect, screen, waitFor } from 'storybook/test'
import { motionPresetsStory, inlineKey } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseCascader :key="replay" v-bind="args" />
	`,
	components: { BaseCascader, BaseButton },
	imports: ['BaseCascader'],
	slots: ['modelValue'],
	omit: ['modelValue'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'isMultiple', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Раскрытие уровня: выберите узел — колонка следующего уровня въезжает из-под родительской (`transform` и `opacity`,',
					'`--rise-duration`, `--rise-ease-out`, сдвиг `--rise-motion-distance`); ушедшая колонка исчезает сразу, соседи не прыгают.',
					'Путь значения при открытии раскрывается без анимации. Стрелка поля поворачивается за `--rise-duration`.',
					'Панель телепортируется в `body` и берёт пресет `<html>` (переключатель «Движение» в панели Storybook), колонки пресетов',
					"действуют на поле. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда. «Повторить» сбрасывает поля.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		const [field] = canvas.getAllByRole('combobox', { name: 'Район доставки' })
		field.focus()
		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(field).toHaveAttribute('aria-expanded', 'true'))
		await userEvent.keyboard(inlineKey('{ArrowRight}'))
		await waitFor(() => expect(screen.getAllByRole('listbox')).toHaveLength(2))
		await waitFor(() => expect(screen.getAllByRole('listbox')[1]).toBeVisible())
		await expect(screen.getAllByRole('listbox')[1]).toHaveAccessibleName('Москва')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(field).toHaveAttribute('aria-expanded', 'false'))
	},
}
