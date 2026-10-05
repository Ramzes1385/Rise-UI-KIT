import { BaseButton } from '@components/BaseButton'
import type meta from '../../BaseTreeSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { expect, screen, waitFor } from 'storybook/test'
import BaseTreeSelect from '../../../ui/BaseTreeSelect.vue'

const motion = motionPresetsStory({
	item: `
		<BaseTreeSelect :key="replay" v-bind="args" />
	`,
	components: { BaseTreeSelect, BaseButton },
	imports: ['BaseTreeSelect'],
	slots: ['modelValue'],
	omit: ['modelValue'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'isMultiple', 'isSearchable', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Раскрытие ветки: строки детей проявляются (`opacity`, `--rise-duration`), строки ниже съезжают плавно (FLIP через',
					'`transform`), при сворачивании уходящие строки гаснут поверх списка (`position: absolute`) за `--rise-duration-fast` —',
					'соседи не прыгают; так же ведёт себя поиск. Свёрнутые строки убраны из DOM — недоступны фокусу и скринридеру.',
					'Стрелка узла поворачивается за `--rise-duration`. Панель телепортируется в `body` и берёт пресет `<html>`',
					'(переключатель «Движение» в панели Storybook), колонки пресетов действуют на поле. Выключить движение в приложении —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		const [field] = canvas.getAllByRole('combobox', { name: 'Город доставки' })
		field.focus()
		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(field).toHaveAttribute('aria-expanded', 'true'))
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(screen.getByRole('treeitem', { name: 'Центральный округ' })).toHaveAttribute('aria-expanded', 'true'))
		await waitFor(() => expect(screen.getByRole('treeitem', { name: 'Тула' })).toBeVisible())
		await userEvent.keyboard('{ArrowLeft}')
		await waitFor(() => expect(screen.queryByRole('treeitem', { name: 'Тула' })).not.toBeInTheDocument())
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(field).toHaveAttribute('aria-expanded', 'false'))
	},
}
