import { expect } from 'storybook/test'
import type meta from '../Localization.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { CALENDAR_COMPONENTS, TODAY } from '../shared'
import { useLocale } from '@composables/app/useLocale'
import { staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack story-medium">
		<dl class="story-stack">
			<div><dt class="story-label">formatNumber(1234567.891)</dt><dd>{{ formatNumber(1234567.891) }}</dd></div>
			<div><dt class="story-label">formatNumber(0.256, { style: 'percent' })</dt><dd>{{ formatNumber(0.256, { style: 'percent' }) }}</dd></div>
			<div><dt class="story-label">formatNumber(1999, { style: 'currency', currency: 'RUB' })</dt><dd>{{ formatNumber(1999, { style: 'currency', currency: 'RUB' }) }}</dd></div>
			<div><dt class="story-label">formatDate(date, { dateStyle: 'long' })</dt><dd>{{ formatDate(date, { dateStyle: 'long' }) }}</dd></div>
			<div><dt class="story-label">plural(messages.plural.PARTICIPANTS, 5)</dt><dd>{{ plural(messages.plural.PARTICIPANTS, 5) }}</dd></div>
			<div><dt class="story-label">firstDayOfWeek</dt><dd>{{ messages.firstDayOfWeek }}</dd></div>
		</dl>
		<span class="story-label">Календарь без locale: язык и первый день недели — от кита</span>
		<BaseCalendar :model-value="date" />
		<span class="story-label">locale="en-US" и first-day-of-week — только у этого календаря</span>
		<BaseCalendar :model-value="date" locale="en-US" :first-day-of-week="0" />
	</div>
`

const script = `
const { formatNumber, formatDate, plural, messages } = useLocale()
const date = new Date(2025, 4, 15)
`

export const Formats: StoryObj<typeof meta> = {
	globals: { locale: 'ru' },
	parameters: {
		docs: {
			description: {
				story: [
					'Форматы следуют за языком кита: `locale.intl` — для `Intl` (даты, числа, валюты, множественное число, относительное время,',
					'сортировка `Intl.Collator`), `locale.firstDayOfWeek` — первый день недели в календарях, диаграмме активности и расписании.',
					'`useLocale()` отдаёт `formatNumber`, `formatDate` и `plural` с текущим языком; в компонентах с пропсом `locale`',
					'(`BaseCalendar`, `BaseDatePicker`) явное значение главнее языка кита.',
					'',
					'Поиск и сравнение текста тоже идут по языку кита: без учёта регистра (турецкая «İ» — по `tr`), «е» и «ё» равны, а китайский, японский',
					'и корейский текст без регистра сравнивается как есть. Переключите «Язык» на панели: значения и первый календарь сменятся, второй — нет.',
				].join('\n'),
			},
			source: staticStorySource({ template, imports: ['BaseCalendar', 'useLocale'], script }),
		},
	},
	render: args => ({
		components: CALENDAR_COMPONENTS,
		setup: useStorySetup(args, {
			setup: () => {
				const { formatNumber, formatDate, plural, messages } = useLocale()
				return { formatNumber, formatDate, plural, messages, date: TODAY }
			},
		}),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('5 участников')).toBeVisible()
		await expect(canvas.getByText(/15 мая 2025/)).toBeVisible()
		await expect(canvas.getByRole('button', { name: /^май 2025/i })).toBeVisible()
		await expect(canvas.getByRole('button', { name: /^may 2025/i })).toBeVisible()
	},
}
