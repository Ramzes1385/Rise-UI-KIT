import { ref } from 'vue'
import { CITIES } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAutocomplete.stories'
import BaseAutocomplete from '../../../ui/BaseAutocomplete.vue'
import type { AutocompleteOption } from '../../../types/BaseAutocomplete.types'
import { literal, motionPresetsStory, storySource, useStorySetup } from '@/stories/helpers'

const SEARCH_DELAY = 400

const SERVER_ARGS = ['options', 'isRemote', 'isLoading', 'modelValue', 'onUpdate:modelValue']

const motion = motionPresetsStory({
	item: `
		<BaseAutocomplete
			:key="replay"
			v-bind="args"
			:options="options"
			:is-loading="isLoading"
			is-remote
			@search="handleSearch" />
	`,
	components: { BaseAutocomplete, BaseButton },
	imports: ['BaseAutocomplete'],
	trigger: 'Сбросить',
})

const script = `
const CITIES = ${literal(CITIES)}
const replay = ref(0)
const options = ref<AutocompleteOption[]>([])
const isLoading = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

function handleSearch(query: string): void {
	isLoading.value = true
	clearTimeout(timer)
	timer = setTimeout(() => {
		options.value = CITIES.filter(city => city.label.toLowerCase().startsWith(query.trim().toLowerCase()))
		isLoading.value = false
	}, ${SEARCH_DELAY})
}
`

function useFakeServer() {
	const options = ref<AutocompleteOption[]>([])
	const isLoading = ref(false)
	let timer: ReturnType<typeof setTimeout> | undefined
	const handleSearch = (query: string): void => {
		isLoading.value = true
		clearTimeout(timer)
		timer = setTimeout(() => {
			options.value = CITIES.filter(city => city.label.toLowerCase().startsWith(query.trim().toLowerCase()))
			isLoading.value = false
		}, SEARCH_DELAY)
	}
	return { options, isLoading, handleSearch }
}

function listState(): string {
	return document.querySelector('.base-autocomplete__empty')?.textContent?.trim() ?? ''
}

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { label: 'Город', placeholder: 'Наберите «Ка»' },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Смена состояний списка в четырёх пресетах движения: `none`, `subtle`, `standard` (по умолчанию), `expressive`.',
					'Наберите «Ка» — «сервер» отвечает через 400 мс: «Загрузка…» сменяется результатами, затем допишите букву — «Ничего',
					'не найдено». Новое состояние и новые пункты проявляются (`opacity`) за `--rise-duration` с кривой `--rise-ease-out`;',
					'прежнее уходит сразу, поэтому высота списка меняется один раз, без наложения двух состояний. Переключить состояния',
					'кнопкой нельзя: список открыт, пока фокус в поле, а нажатие кнопки уводит фокус и закрывает его. Список открывается',
					'в слое страницы, поэтому длительности и кривые берутся из пресета страницы; колонка `none` показывает смену сразу.',
					"Выключить движение — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка",
					'«уменьшить движение» действует всегда: состояния сменяются сразу.',
				].join('\n'),
			},
			source: storySource({
				template: motion.template,
				imports: ['BaseButton', 'BaseAutocomplete', 'type AutocompleteOption'],
				vue: ['ref'],
				script,
				omit: SERVER_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseAutocomplete, BaseButton },
		setup: useStorySetup(args, { state: { replay: 0 }, slots: SERVER_ARGS, setup: useFakeServer }),
		template: motion.template,
	}),
	play: async ({ canvas, userEvent }) => {
		const fields = canvas.getAllByRole('combobox', { name: 'Город' })
		await expect(fields).toHaveLength(4)
		for (const field of fields) {
			await userEvent.clear(field)
			await userEvent.type(field, 'Ка')
			await waitFor(() => expect(listState()).toContain('Загрузка'))
			await waitFor(() => expect(document.querySelectorAll('[role="option"]')).toHaveLength(1), { timeout: SEARCH_DELAY * 5 })
			await userEvent.type(field, 'щ')
			await waitFor(() => expect(listState()).toBe('Ничего не найдено'), { timeout: SEARCH_DELAY * 5 })
			await userEvent.keyboard('{Escape}')
		}
		await userEvent.click(canvas.getByRole('button', { name: 'Сбросить' }))
		for (const field of canvas.getAllByRole('combobox', { name: 'Город' })) await expect(field).toHaveValue('')
	},
}
