import { ref } from 'vue'
import { CARD_SAMPLES } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseCardInput.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCardInput from '../../../ui/BaseCardInput.vue'
import { literal, motionPresetsStory, storySource, useStorySetup } from '@/stories/helpers'

const NUMBERS = CARD_SAMPLES.filter(card => card.id === 'visa' || card.id === 'mir').map(card => card.number.slice(0, 9))

const motion = motionPresetsStory({
	item: `<BaseCardInput v-bind="args" />`,
	components: { BaseCardInput, BaseButton },
	imports: ['BaseCardInput'],
	action: 'switchCard',
	trigger: 'Сменить карту',
})

const script = `
const NUMBERS = ${literal(NUMBERS)}
const index = ref(-1)

function switchCard(event: MouseEvent): void {
	index.value = (index.value + 1) % NUMBERS.length
	const story = (event.currentTarget as HTMLElement).closest('.story-motion')!
	for (const input of story.querySelectorAll<HTMLInputElement>('[data-card-field="number"]')) {
		input.value = NUMBERS[index.value]
		input.dispatchEvent(new Event('input', { bubbles: true }))
	}
}
`

function useSwitchCard() {
	const index = ref(-1)
	return {
		switchCard(event: MouseEvent): void {
			index.value = (index.value + 1) % NUMBERS.length
			const story = (event.currentTarget as HTMLElement).closest('.story-motion')!
			for (const input of story.querySelectorAll<HTMLInputElement>('[data-card-field="number"]')) {
				input.value = NUMBERS[index.value]
				input.dispatchEvent(new Event('input', { bubbles: true }))
			}
		},
	}
}

function brandLabels(root: HTMLElement): string[] {
	return [...root.querySelectorAll('.base-card-input__brand')].map(brand => brand.getAttribute('aria-label') ?? '')
}

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { hasPreview: true, hasHolder: false },
	parameters: {
		controls: { include: ['variant', 'layout', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Поле карты в четырёх пресетах движения: `none`, `subtle`, `standard` (по умолчанию), `expressive`.',
					'«Сменить карту» вводит в поле номера начало карты Visa, затем Мир: значок марки в поле и на превью сменяется',
					'проявлением с масштабом (`opacity` и `transform`, `--rise-duration` и `--rise-ease-out`; уход — `--rise-duration-fast`),',
					'новый значок встаёт на место сразу, старый уходит поверх. Поворот превью к полю кода — `--rise-duration-slow`, `--rise-ease`.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда: марка сменяется сразу.',
				].join('\n'),
			},
			source: storySource({ template: motion.template, imports: ['BaseButton', 'BaseCardInput'], vue: ['ref'], script }),
		},
	},
	render: args => ({
		components: { BaseCardInput, BaseButton },
		setup: useStorySetup(args, { setup: useSwitchCard }),
		template: motion.template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Сменить карту' }))
		await waitFor(() => expect(brandLabels(canvasElement)).toEqual(Array(4).fill(expect.stringContaining('Visa'))))
		await userEvent.click(canvas.getByRole('button', { name: 'Сменить карту' }))
		await waitFor(() => expect(brandLabels(canvasElement)).toEqual(Array(4).fill(expect.stringContaining('Мир'))))
		for (const field of canvas.getAllByLabelText('Номер карты')) await expect(field).toHaveValue(NUMBERS[1])
	},
}
