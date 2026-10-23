import { documentFile } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type meta from '../../BaseFileUpload.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseFileUpload from '../../../ui/BaseFileUpload.vue'

const motion = motionPresetsStory({
	item: `
		<BaseFileUpload :key="replay" v-bind="args" />
	`,
	components: { BaseFileUpload, BaseButton },
	imports: ['BaseFileUpload'],
	trigger: 'Очистить списки',
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { isMultiple: true, maxCount: 5, label: 'Вложения' },
	parameters: {
		maxWidth: 1200,
		controls: { include: ['variant', 'allowPreview', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Список файлов в четырёх пресетах движения: выберите файлы в любой колонке и удалите строку крестиком.',
					'Новая строка поднимается и проявляется (`transform` и `opacity`, `--rise-duration`, `--rise-ease-out`, сдвиг',
					'`--rise-motion-distance`), удалённая гаснет поверх списка (`position: absolute`, `--rise-duration-fast`), соседи',
					'съезжают плавно (FLIP через `transform`). «Очистить списки» монтирует поля заново. Выключить движение в приложении —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Очистить списки' }))
		for (const input of canvas.getAllByLabelText('Вложения')) {
			await userEvent.upload(input, [documentFile('Договор.pdf', 120), documentFile('Смета.pdf', 36)])
		}
		await waitFor(() => expect(canvas.getAllByRole('listitem')).toHaveLength(8))
		for (const button of canvas.getAllByRole('button', { name: 'Удалить Договор.pdf' })) await userEvent.click(button)
		await waitFor(() => expect(canvas.getAllByRole('listitem')).toHaveLength(4))
		for (const name of canvas.getAllByText('Смета.pdf')) await waitFor(() => expect(name).toBeVisible())
	},
}
