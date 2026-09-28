/** Composable: логика BaseCalendarTime — поля часов, минут и секунд с черновиками ввода и 12-часовым форматом */
import { computed, ref, useId } from 'vue'
import type { BaseCalendarTimeEmits, BaseCalendarTimeProps } from '../types/BaseCalendarTime.types'

function to12h(h: number): number {
	if (h === 0) return 12
	if (h > 12) return h - 12
	return h
}

function from12h(h: number, am: boolean): number {
	if (am) return h === 12 ? 0 : h
	return h === 12 ? 12 : h + 12
}

/**
 * Разобрать ввод поля времени и ограничить его диапазоном.
 * Без ограничения buildDateWithTime переносит «лишнее» на соседние часы/сутки (99 ч → +4 дня).
 * Пустое или нечисловое значение → null: время не меняется, пока не введена цифра
 */
function parseTimeField(value: string, min: number, max: number): number | null {
	const parsed = parseInt(value, 10)
	if (Number.isNaN(parsed)) return null
	return Math.min(Math.max(parsed, min), max)
}

/**
 * Поле с черновиком ввода: пока поле редактируется, в нём остаётся набранный текст, а не нормализованное значение.
 * Иначе очистка поля сразу подставляла «0»/«12», и следующая цифра дописывалась к нему («12» + «3» → 123 ч)
 */
function useDraftField(read: () => string, write: (value: string) => void) {
	const draft = ref<string | null>(null)
	return {
		draft,
		model: computed({
			get: (): string => draft.value ?? read(),
			set: (value: string): void => {
				draft.value = value
				write(value)
			},
		}),
	}
}

function useTimeFields(props: BaseCalendarTimeProps, emit: BaseCalendarTimeEmits) {
	const hours = useDraftField(
		() => String(props.is24Hour ? props.hours : to12h(props.hours)),
		value => {
			const parsed = props.is24Hour ? parseTimeField(value, 0, 23) : parseTimeField(value, 1, 12)
			if (parsed !== null) emit('update:hours', props.is24Hour ? parsed : from12h(parsed, props.isAm))
		},
	)
	const minutes = useDraftField(
		() => String(props.minutes),
		value => {
			const parsed = parseTimeField(value, 0, 59)
			if (parsed !== null) emit('update:minutes', parsed)
		},
	)
	const seconds = useDraftField(
		() => String(props.seconds),
		value => {
			const parsed = parseTimeField(value, 0, 59)
			if (parsed !== null) emit('update:seconds', parsed)
		},
	)
	return { hours, minutes, seconds }
}

export function useBaseCalendarTime(props: BaseCalendarTimeProps, emit: BaseCalendarTimeEmits) {
	// id подписи «Время»: группа полей называется по ней
	const captionId = useId()
	const { hours, minutes, seconds } = useTimeFields(props, emit)
	// Поля снова показывают нормализованное значение (например, «99» → «23»)
	const resetDrafts = (): void => {
		hours.draft.value = null
		minutes.draft.value = null
		seconds.draft.value = null
	}

	return {
		captionId,
		hoursModel: hours.model,
		minutesModel: minutes.model,
		secondsModel: seconds.model,
		resetDrafts,
		/** Завершение ввода (change): нормализовать отображение и применить время к выбранной дате */
		commitTime(): void {
			resetDrafts()
			emit('timeChange')
		},
	}
}
