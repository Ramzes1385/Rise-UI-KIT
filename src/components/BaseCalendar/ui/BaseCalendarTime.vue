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
import { UI_CALENDAR } from '@/locales/messages'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { useBaseCalendarTime } from '../model/useBaseCalendarTime'
import type { BaseCalendarTimeEmits, BaseCalendarTimeProps } from '../types/BaseCalendarTime.types'

const props = defineProps<BaseCalendarTimeProps>()

const emit = defineEmits<BaseCalendarTimeEmits>()

const { captionId, hoursModel, minutesModel, secondsModel, resetDrafts, commitTime } = useBaseCalendarTime(props, emit)
</script>
