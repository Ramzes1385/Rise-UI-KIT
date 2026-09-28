<template>
	<!-- Группа «Время»: у каждого поля своё доступное имя (подпись скрыта визуально), разделители — декоративные -->
	<div class="base-calendar__time" :class="classes.time" role="group" :aria-labelledby="captionId">
		<span :id="captionId" class="base-calendar__time-caption">{{ UI_CALENDAR.TIME }}</span>
		<div class="base-calendar__time-fields">
			<BaseInput
				v-model="hoursModel"
				class="base-calendar__time-input"
				type="number"
				:label="UI_CALENDAR.HOURS"
				:size-scale="sizeScale"
				:is-disabled="isDisabled"
				@change="commitTime"
				@blur="resetDrafts" />
			<span class="base-calendar__time-sep" aria-hidden="true">:</span>
			<BaseInput
				v-model="minutesModel"
				class="base-calendar__time-input"
				type="number"
				:label="UI_CALENDAR.MINUTES"
				:size-scale="sizeScale"
				:is-disabled="isDisabled"
				@change="commitTime"
				@blur="resetDrafts" />
			<template v-if="showSeconds">
				<span class="base-calendar__time-sep" aria-hidden="true">:</span>
				<BaseInput
					v-model="secondsModel"
					class="base-calendar__time-input"
					type="number"
					:label="UI_CALENDAR.SECONDS"
					:size-scale="sizeScale"
					:is-disabled="isDisabled"
					@change="commitTime"
					@blur="resetDrafts" />
			</template>
			<BaseButton
				v-if="!is24Hour"
				variant="outline"
				class="base-calendar__time-ampm"
				:size-scale="sizeScale"
				:is-disabled="isDisabled"
				@click="emit('toggleAmPm')">
				{{ isAm ? 'AM' : 'PM' }}
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { UI_CALENDAR } from '@/locales/messages'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import type { BaseCalendarTimeEmits, BaseCalendarTimeProps } from '../types/BaseCalendarTime.types'

const props = defineProps<BaseCalendarTimeProps>()

const emit = defineEmits<BaseCalendarTimeEmits>()

/** id подписи «Время»: группа полей называется по ней */
const captionId = useId()

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
 * Пустое или нечисловое значение → null: время не меняется, пока не введена цифра.
 */
function parseTimeField(value: string, min: number, max: number): number | null {
	const parsed = parseInt(value, 10)
	if (Number.isNaN(parsed)) return null
	return Math.min(Math.max(parsed, min), max)
}

/**
 * Черновики ввода: пока поле редактируется, в нём остаётся набранный текст, а не нормализованное значение.
 * Иначе очистка поля сразу подставляла «0»/«12», и следующая цифра дописывалась к нему («12» + «3» → 123 ч).
 */
const hoursDraft = ref<string | null>(null)
const minutesDraft = ref<string | null>(null)
const secondsDraft = ref<string | null>(null)

const hoursModel = computed({
	get: (): string => hoursDraft.value ?? String(props.is24Hour ? props.hours : to12h(props.hours)),
	set: (val: string): void => {
		hoursDraft.value = val
		const parsed = props.is24Hour ? parseTimeField(val, 0, 23) : parseTimeField(val, 1, 12)
		if (parsed === null) return
		emit('update:hours', props.is24Hour ? parsed : from12h(parsed, props.isAm))
	},
})

const minutesModel = computed({
	get: (): string => minutesDraft.value ?? String(props.minutes),
	set: (val: string): void => {
		minutesDraft.value = val
		const parsed = parseTimeField(val, 0, 59)
		if (parsed === null) return
		emit('update:minutes', parsed)
	},
})

const secondsModel = computed({
	get: (): string => secondsDraft.value ?? String(props.seconds),
	set: (val: string): void => {
		secondsDraft.value = val
		const parsed = parseTimeField(val, 0, 59)
		if (parsed === null) return
		emit('update:seconds', parsed)
	},
})

/** Сбросить черновики: поля снова показывают нормализованное значение (например, «99» → «23») */
function resetDrafts(): void {
	hoursDraft.value = null
	minutesDraft.value = null
	secondsDraft.value = null
}

/** Завершение ввода (change): нормализовать отображение и применить время к выбранной дате */
function commitTime(): void {
	resetDrafts()
	emit('timeChange')
}
</script>
