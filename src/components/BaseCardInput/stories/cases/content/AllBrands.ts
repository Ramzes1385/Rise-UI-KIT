import { CARD_SAMPLES } from '../../shared'
import type meta from '../../BaseCardInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import BaseCardInput from '../../../ui/BaseCardInput.vue'
import { literal, staticStorySource } from '@/stories/helpers'

const samples = CARD_SAMPLES.map(sample => ({ id: sample.id, label: `${sample.name} — ${sample.number}`, number: sample.number }))

const template = `
	<div class="story-grid" style="--story-grid-min: 300px">
		<BaseCardInput v-for="sample in samples" :key="sample.id" :label="sample.label" :has-holder="false" />
	</div>
`

export const AllBrands: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Все 18 марок таблицы `CARD_BRANDS`: в подписи — тестовый номер марки (Луна верна). Вставьте или введите его — появится',
					'значок марки, цифры сгруппируются по её правилам (у American Express — 4 6 5, у Diners Club — 4 6 4).',
					'Значки Font Awesome — у Visa, Mastercard, American Express, Discover, JCB и Diners Club; у остальных — название марки,',
					'пока приложение не передаст официальные знаки в `brandIcons`.',
				].join('\n'),
			},
			source: staticStorySource({ template, imports: ['BaseCardInput'], script: `const samples = ${literal(samples)}` }),
		},
		controls: { disable: true },
	},
	render: () => ({
		components: { BaseCardInput },
		setup: () => ({ samples }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		for (const sample of CARD_SAMPLES) {
			const group = within(canvas.getByRole('group', { name: `${sample.name} — ${sample.number}` }))
			const number = group.getByLabelText('Номер карты')
			await userEvent.click(number)
			await userEvent.paste(sample.number)
			await expect(number).toHaveValue(sample.number)
			await waitFor(() => expect(group.getByRole('img', { name: `Марка карты: ${sample.name}` })).toBeVisible())
		}
	},
}
