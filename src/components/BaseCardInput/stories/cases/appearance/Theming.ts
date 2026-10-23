import { expect } from 'storybook/test'
import type meta from '../../BaseCardInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCardInput from '../../../ui/BaseCardInput.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { face: 'story-themed-face', fields: 'story-themed-fields', brand: 'story-themed-brand' }

const template = `
	<div class="story-grid" style="--story-grid-min: 280px;">
		<BaseCardInput v-bind="args" label="По умолчанию" />
		<div style="--rise-card-input-face-bg: var(--rise-bg-inverted); --rise-card-input-face-radius: var(--rise-radius-sm); --rise-card-input-face-shadow: var(--rise-shadow-xl); --rise-card-input-fields-gap: 4px; --rise-card-input-brand-text: var(--rise-primary);">
			<BaseCardInput v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseCardInput v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { hasPreview: true, hasHolder: false },
	parameters: {
		controls: { include: ['variant', 'layout', 'sizeScale', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'Поля карты — BaseInput: рамку и фон полей задают его токены `--rise-input-*`. Свои токены `--rise-card-input-*` — у частей',
					'поля карты: `gap` (между превью и полями), `fields-gap` (между полями), лицевая сторона превью — `face-bg`, `face-text`,',
					'`face-font-size`, `face-radius`, `face-shadow`; марка в поле номера — `brand-text`, `brand-icon-size`. Фон по марке и',
					'`previewBackground` — запасное значение `face-bg`: проп `previewBackground` сильнее токена. Задавайте токены на `:root`,',
					'в теме или на контейнере, как здесь. Проп `ui` добавляет классы к частям: `face`, `fields`, `brand`, `number`…',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCardInput'], script: `const ui = ${literal(ui)}`, omit: ['label'] }),
		},
	},
	render: args => ({
		components: { BaseCardInput },
		setup: useStorySetup(args, { data: { ui }, slots: ['label'] }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const faces = [...canvasElement.querySelectorAll<HTMLElement>('.base-card-input__face--front')]
		const [plain, themed, classed] = faces
		const fields = [...canvasElement.querySelectorAll<HTMLElement>('.base-card-input__fields')]

		await expect(getComputedStyle(themed).backgroundImage).not.toBe(getComputedStyle(plain).backgroundImage)
		if (!isStoryBranded())
			await expect(getComputedStyle(themed).borderTopLeftRadius).not.toBe(getComputedStyle(plain).borderTopLeftRadius)
		await expect(getComputedStyle(themed).boxShadow).not.toBe(getComputedStyle(plain).boxShadow)
		await expect(getComputedStyle(fields[1]).rowGap).toBe('4px')
		const numbers = canvas.getAllByLabelText('Номер карты')
		await userEvent.type(numbers[0], '4242')
		await userEvent.type(numbers[1], '4242')
		await userEvent.type(numbers[2], '4242')
		const brands = [...canvasElement.querySelectorAll<HTMLElement>('.base-card-input__brand')]
		await expect(getComputedStyle(brands[1]).color).not.toBe(getComputedStyle(brands[0]).color)
		await expect(classed).toHaveClass('base-card-input__face', 'story-themed-face')
		await expect(fields[2]).toHaveClass('base-card-input__fields', 'story-themed-fields')
		await expect(brands[2]).toHaveClass('base-card-input__brand', 'story-themed-brand')
	},
}
