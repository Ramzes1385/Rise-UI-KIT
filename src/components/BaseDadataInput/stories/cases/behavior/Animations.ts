import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDadataInput.stories'
import { motionPresetsStory } from '@/stories/helpers'
import BaseDadataInput from '../../../ui/BaseDadataInput.vue'

const motion = motionPresetsStory({
	item: `<BaseDadataInput v-bind="args" :model-value="isOther ? 'АО ТБАНК' : 'ПАО СБЕРБАНК'" :error="isOther ? 'Организация не найдена в реестре' : ''" />`,
	components: { BaseDadataInput, BaseButton },
	imports: ['BaseDadataInput'],
	state: { isOther: false },
	action: 'isOther = !isOther',
	trigger: 'Сменить организацию',
	slots: ['modelValue', 'error', 'onUpdate:modelValue'],
	omit: ['modelValue', 'error', 'onUpdate:modelValue'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Поле DaData в четырёх пресетах движения: `none`, `subtle`, `standard` (по умолчанию), `expressive`.',
					'«Сменить организацию» меняет значение через `v-model` и ошибку: рамка и фон поля плавно меняют цвет (`--rise-duration-fast`,',
					'`--rise-ease`). Своей анимации у обёртки нет: список подсказок — BaseAutocomplete, его состояния («Загрузка…», пункты,',
					'«Ничего не найдено») проявляются за `--rise-duration` с кривой `--rise-ease-out` (см. «Анимации» BaseAutocomplete).',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Сменить организацию' }))
		await waitFor(() => expect(canvas.getAllByText('Организация не найдена в реестре')).toHaveLength(4))
		for (const field of canvas.getAllByRole('combobox', { name: 'Организация' })) await expect(field).toHaveValue('АО ТБАНК')
	},
}
