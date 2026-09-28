import { ref } from 'vue'
import type meta from './BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDatePicker from '../ui/BaseDatePicker.vue'
import { screen, waitFor, expect } from 'storybook/test'
import { storyDate, useArgsWithoutSlots } from '@/stories/helpers'

const DAY_NAME = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export function dayName(days: number): string {
	return DAY_NAME.format(storyDate(days))
}

export async function findPanel(): Promise<HTMLElement> {
	const panel = await screen.findByRole('dialog', { name: 'Выберите дату' })
	await waitFor(() => expect(panel).toBeVisible())
	return panel
}

export function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}

export function renderWithLocalModel(
	width: 'story-narrow' | 'story-medium' = 'story-narrow',
): NonNullable<StoryObj<typeof meta>['render']> {
	return args => ({
		components: { BaseDatePicker },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'modelValueEnd', 'selectedDates']),
			value: ref<Date | null>(args.modelValue ?? null),
			valueEnd: ref<Date | null>(args.modelValueEnd ?? null),
			dates: ref<Date[]>(args.selectedDates ?? []),
			width,
		}),
		template: `
			<div :class="width">
				<BaseDatePicker v-bind="props" v-model="value" v-model:model-value-end="valueEnd" v-model:selected-dates="dates" />
			</div>
		`,
	})
}
