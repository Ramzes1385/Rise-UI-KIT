import { docsFrame } from '../../shared'
import type { SearchArgs } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import BaseSearch from '../../../ui/BaseSearch.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { MOTION_PRESETS } from '@composables/app/useMotion/types/useMotion.types'

const motion = motionPresetsStory({
	item: `
		<BaseSearch v-bind="args" v-model="query" />
	`,
	components: { BaseSearch, BaseButton },
	imports: ['BaseSearch'],
	state: { query: 'Лис' },
	action: "query = query === 'Лис' ? 'Луна' : 'Лис'",
	trigger: 'Сменить запрос',
	slots: ['modelValue', 'onUpdate:modelValue'],
	omit: ['modelValue', 'onUpdate:modelValue'],
})

export const Animations: StoryObj<SearchArgs> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'mode'] },
		docs: {
			...docsFrame(420),
			description: {
				story: [
					'Поиск в четырёх пресетах движения: `none`, `subtle`, `standard` (по умолчанию), `expressive`. Нажмите в поле колонки —',
					'панель открывается движением BaseDropdown, её содержимое проявляется за `--rise-duration` (кривая `--rise-ease-out`).',
					'«Сменить запрос» переключает запрос между «Лис» (есть результаты) и «Луна» (ничего не найдено). Смена состояний',
					'«загрузка → результаты → пусто» — без рывка: прежнее состояние убирается сразу, новое проявляется. В режимах',
					'`modal` и `sidebar` подложка проявляется, окно — из масштаба `--rise-motion-scale-from`, боковая панель выезжает',
					'справа; закрытие — за `--rise-duration-fast` (`--rise-ease-in`). Панель и окно открываются в слое страницы и берут',
					"пресет области поля (`data-rise-motion` у предка). Выключить движение — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда — состояния меняются сразу.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Сменить запрос' }))
		const fields = canvas.getAllByRole('combobox')
		await expect(fields).toHaveLength(MOTION_PRESETS.length)
		for (const [index, field] of fields.entries()) {
			await userEvent.click(field)
			await waitFor(() => {
				const empty = document.querySelector(`.base-search__empty[data-rise-motion="${MOTION_PRESETS[index]}"]`)
				expect(empty).toHaveTextContent('Ничего не найдено')
				expect(empty!.className).not.toMatch(/enter/)
			})
		}
	},
}
