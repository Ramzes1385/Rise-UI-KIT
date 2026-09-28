import { ref } from 'vue'
import { OPTIONS } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../Sizing.stories'
import { BaseInput } from '@components/BaseInput'
import { templateSource } from '@/stories/helpers'
import { BaseButton } from '@components/BaseButton'
import { BaseSelect } from '@components/BaseSelect'
import type { StoryObj } from '@storybook/vue3-vite'

const template = `
			<div class="story-row" style="flex-wrap: nowrap; align-items: flex-start;">
				<div style="width: 220px;"><BaseInput v-model="text" placeholder="Название проекта" /></div>
				<div style="width: 160px;"><BaseSelect v-model="lang" :options="options" /></div>
				<BaseButton variant="outline">Отмена</BaseButton>
				<BaseButton>Создать</BaseButton>
			</div>
		`

export const Alignment: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Выравнивание: при одинаковом sizeScale кнопка, поле и селект одной высоты (32px при 100).',
					'Play-функция сверяет высоты — если стили компонента разойдутся со шкалой, проверка упадёт.',
				].join('\n'),
			},
			source: { code: templateSource(template) },
		},
	},
	render: () => ({
		components: { BaseButton, BaseInput, BaseSelect },
		setup: () => ({ options: OPTIONS, text: ref(''), lang: ref('ru') }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const height = (selector: string) =>
			Math.round((canvasElement.querySelector(selector) as HTMLElement).getBoundingClientRect().height)
		const button = height('.base-button')
		await expect(button).toBe(32)
		await expect(height('.base-input__wrapper')).toBe(button)
		await expect(height('.base-select__trigger')).toBe(button)
	},
}
