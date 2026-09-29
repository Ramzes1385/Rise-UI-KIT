import { ref } from 'vue'
import { CITIES } from '../../shared'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAutocomplete.stories'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseAutocomplete from '../../../ui/BaseAutocomplete.vue'
import type { AutocompleteOption } from '../../../types/BaseAutocomplete.types'

const SEARCH_DELAY = 400

export const Remote: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Варианты с сервера: `isRemote` и событие `search` — приложение загружает варианты по запросу, пока идёт запрос —',
					'`isLoading`. Здесь «сервер» отвечает через 400 мс.',
				].join('\n'),
			},
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseAutocomplete },
		setup: () => {
			const options = ref<AutocompleteOption[]>([])
			const isLoading = ref(false)
			const selected = ref<string | number | null>(null)
			let timer: ReturnType<typeof setTimeout> | undefined
			function handleSearch(query: string): void {
				isLoading.value = true
				clearTimeout(timer)
				timer = setTimeout(() => {
					options.value = CITIES.filter(city => city.label.toLowerCase().startsWith(query.trim().toLowerCase()))
					isLoading.value = false
				}, SEARCH_DELAY)
			}
			return {
				props: useArgsWithoutSlots(args, ['options', 'isRemote', 'isLoading', 'modelValue', 'onChange']),
				options,
				isLoading,
				selected,
				handleSearch,
			}
		},
		template: `
			<div class="story-narrow">
				<BaseAutocomplete v-bind="props" v-model="selected" :options="options" :is-loading="isLoading" is-remote label="Город (поиск на сервере)" @search="handleSearch" />
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('combobox', { name: 'Город (поиск на сервере)' })
		await userEvent.type(field, 'Но')
		await waitFor(() => expect(document.querySelectorAll('[role="option"]')).toHaveLength(1), { timeout: SEARCH_DELAY * 5 })
		await userEvent.keyboard('{ArrowDown}{Enter}')
		await expect(field).toHaveValue('Новосибирск')
	},
}
