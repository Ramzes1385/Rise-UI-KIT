import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type meta from '../../BasePhoneInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BasePhoneInput from '../../../ui/BasePhoneInput.vue'

const motion = motionPresetsStory({
	item: `
		<BasePhoneInput v-bind="args" v-model="phone" v-model:country="country" />
	`,
	components: { BasePhoneInput, BaseButton },
	imports: ['BasePhoneInput'],
	state: { phone: '', country: 'RU' },
	action: "country = country === 'RU' ? 'KZ' : 'RU'",
	trigger: 'Сменить страну',
	slots: ['modelValue', 'country', 'onUpdate:modelValue', 'onUpdate:country'],
	omit: ['modelValue', 'country', 'onUpdate:modelValue', 'onUpdate:country'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Смена страны в четырёх пресетах движения: `none`, `subtle`, `standard` (по умолчанию), `expressive`.',
					'«Сменить страну» переключает `v-model:country` между Россией и Казахстаном: старый флаг гаснет поверх нового',
					'(`--rise-duration-fast`), новый появляется из масштаба `--rise-motion-scale-from` за `--rise-duration` — ширина',
					'кнопки страны не прыгает. Так же флаг меняется при выборе в списке и при вставке номера другой страны. Список стран',
					'открывается движением BaseDropdown, стрелка поворачивается за `--rise-duration`, подсветка строк — `--rise-duration-fast`.',
					"Выключить движение — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка",
					'«уменьшить движение» действует всегда — флаг меняется сразу.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Сменить страну' }))
		const triggers = canvas.getAllByRole('combobox', { name: 'Код страны' })
		await expect(triggers).toHaveLength(4)
		for (const trigger of triggers) {
			await waitFor(() => expect(trigger).toHaveTextContent('Казахстан +7'))
			await waitFor(() => expect(trigger.querySelectorAll('.base-phone-input__flag')).toHaveLength(1))
		}
	},
}
