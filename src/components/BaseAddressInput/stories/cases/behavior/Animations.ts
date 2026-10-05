import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAddressInput.stories'
import { motionPresetsStory } from '@/stories/helpers'
import BaseAddressInput from '../../../ui/BaseAddressInput.vue'

const motion = motionPresetsStory({
	item: `<BaseAddressInput v-bind="args" :model-value="isOther ? 'г Казань, ул Баумана, д 44' : 'г Москва, ул Тверская, д 7'" :error="isOther ? 'Адрес вне зоны доставки' : ''" />`,
	components: { BaseAddressInput, BaseButton },
	imports: ['BaseAddressInput'],
	state: { isOther: false },
	action: 'isOther = !isOther',
	trigger: 'Сменить адрес',
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
					'Поле адреса в четырёх пресетах движения: `none`, `subtle`, `standard` (по умолчанию), `expressive`.',
					'«Сменить адрес» меняет значение через `v-model` и ошибку: рамка и фон поля плавно меняют цвет (`--rise-duration-fast`,',
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
		await userEvent.click(canvas.getByRole('button', { name: 'Сменить адрес' }))
		await waitFor(() => expect(canvas.getAllByText('Адрес вне зоны доставки')).toHaveLength(4))
		for (const field of canvas.getAllByRole('combobox', { name: 'Адрес доставки' }))
			await expect(field).toHaveValue('г Казань, ул Баумана, д 44')
	},
}
