import { ref } from 'vue'
import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { MOSCOW, OFFICES, liveOrDemo } from '../../shared'
import { expect, userEvent, waitFor } from 'storybook/test'
import type { MapMarker } from '../../../types/BaseMap.types'
import { literal, storySource, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const template = `
	<div class="story-grid" style="--story-grid-min: 220px; grid-template-columns: 220px 1fr">
		<div class="story-col">
			<BaseButton v-for="office in OFFICES" :key="office.id" :variant="office.id === selected ? 'soft' : 'ghost'" @click="show(office)">
				{{ office.title }}
			</BaseButton>
			<p class="story-label">{{ selected ? \`Выбрано: \${OFFICES.find(office => office.id === selected).title}\` : 'Выберите офис' }}</p>
		</div>
		<BaseMap v-bind="args" v-model:center="center" v-model:zoom="zoom" :markers="OFFICES" @marker-click="show" />
	</div>
`

const script = `
const OFFICES = ${literal(OFFICES)}
const center = ref(${literal(MOSCOW)})
const zoom = ref(12)
const selected = ref<string | number | null>(null)

function show(office: MapMarker): void {
	selected.value = office.id
	center.value = office.coordinates
	zoom.value = 15
}
`

export const OfficeList: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: [
					'Список и карта по одним данным: кнопка офиса центрирует карту на нём (`v-model:center`, `v-model:zoom`) и подсвечивается, клик по метке',
					'(`marker-click`) выбирает тот же офис в списке. Так собирают страницу «Контакты» или выбор пункта выдачи.',
					'С ключом из `.env.local` — Яндекс Карты, без него — демо-поставщик без сети.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseButton', 'BaseMap', 'type MapMarker'], vue: ['ref'], script }),
			story: { inline: false, height: '440px' },
		},
		controls: { include: ['variant', 'sizeScale', 'height'] },
	},
	args: liveOrDemo.args,
	beforeEach: liveOrDemo.beforeEach,
	render: args => ({
		components: { BaseButton, BaseMap },
		setup: useStorySetup(args, {
			setup: () => {
				const center = ref(MOSCOW)
				const zoom = ref(12)
				const selected = ref<string | number | null>(null)
				const show = (office: MapMarker): void => {
					selected.value = office.id
					center.value = office.coordinates
					zoom.value = 15
				}
				return { OFFICES, center, zoom, selected, show }
			},
		}),
		template,
	}),
	play: async ({ canvas }) => {
		const buttonOf = (name: string, part: string) =>
			canvas.getAllByRole('button', { name }).find(button => button.classList.contains(part))!
		await userEvent.click(buttonOf('Арбат', 'base-button'))
		await expect(canvas.getByText('Выбрано: Арбат')).toBeInTheDocument()
		await expect(buttonOf('Арбат', 'base-button')).toHaveClass('base-button--soft')
		await waitFor(() => expect(buttonOf('Парк Горького', 'base-map__marker')).toBeInTheDocument())
		await userEvent.click(buttonOf('Парк Горького', 'base-map__marker'))
		await expect(canvas.getByText('Выбрано: Парк Горького')).toBeInTheDocument()
		await expect(buttonOf('Парк Горького', 'base-button')).toHaveClass('base-button--soft')
	},
}
