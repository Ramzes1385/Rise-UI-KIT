<template>
	<div :class="[ui('time'), classes.time]" role="group" :aria-labelledby="captionId">
		<span :id="captionId" :class="ui('time-caption')">{{ UI_CALENDAR.TIME }}</span>
		<div :class="ui('time-fields')">
			<BaseInput
				v-model="hoursModel"
				:class="ui('time-input')"
				type="number"
				:label="UI_CALENDAR.HOURS"
				:size-scale="sizeScale"
				:is-disabled="isDisabled"
				@change="commitTime"
				@blur="resetDrafts" />
			<span :class="ui('time-sep')" aria-hidden="true">:</span>
			<BaseInput
				v-model="minutesModel"
				:class="ui('time-input')"
				type="number"
				:label="UI_CALENDAR.MINUTES"
				:size-scale="sizeScale"
				:is-disabled="isDisabled"
				@change="commitTime"
				@blur="resetDrafts" />
			<template v-if="showSeconds">
				<span :class="ui('time-sep')" aria-hidden="true">:</span>
				<BaseInput
					v-model="secondsModel"
					:class="ui('time-input')"
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
				:class="ui('time-ampm')"
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

const { ui, captionId, hoursModel, minutesModel, secondsModel, resetDrafts, commitTime } = useBaseCalendarTime(props, emit)
</script>
