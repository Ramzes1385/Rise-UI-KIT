<template>
	<div class="base-calendar__time" :class="classes.time">
		<div class="base-calendar__time-field">
			<BaseInput
				v-model="hoursModel"
				class="base-calendar__time-input"
				type="number"
				variant="outline"
				:size-scale="sizeScale"
				:is-disabled="isDisabled"
				@change="emit('timeChange')" />
			<BaseText tag="span" class="base-calendar__time-sep" :size-scale="sizeScale">:</BaseText>
			<BaseInput
				v-model="minutesModel"
				class="base-calendar__time-input"
				type="number"
				variant="outline"
				:size-scale="sizeScale"
				:is-disabled="isDisabled"
				@change="emit('timeChange')" />
			<template v-if="showSeconds">
				<BaseText tag="span" class="base-calendar__time-sep" :size-scale="sizeScale">:</BaseText>
				<BaseInput
					v-model="secondsModel"
					class="base-calendar__time-input"
					type="number"
					variant="outline"
					:size-scale="sizeScale"
					:is-disabled="isDisabled"
					@change="emit('timeChange')" />
			</template>
			<template v-if="!is24Hour">
				<BaseButton
					variant="outline"
					class="base-calendar__time-ampm"
					:size-scale="sizeScale"
					:is-disabled="isDisabled"
					@click="emit('toggleAmPm')">
					<BaseText tag="span" :size-scale="sizeScale">{{ isAm ? 'AM' : 'PM' }}</BaseText>
				</BaseButton>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseInput } from '@components/BaseInput'
import { BaseText } from '@components/BaseText'

const props = defineProps<{
	hours: number
	minutes: number
	seconds: number
	is24Hour: boolean
	showSeconds: boolean
	isAm: boolean
	isDisabled: boolean
	sizeScale: number
	classes: Record<string, string>
}>()

const emit = defineEmits<{
	'update:hours': [value: number]
	'update:minutes': [value: number]
	'update:seconds': [value: number]
	toggleAmPm: []
	timeChange: []
}>()

function to12h(h: number): number {
	if (h === 0) return 12
	if (h > 12) return h - 12
	return h
}

function from12h(h: number, am: boolean): number {
	if (am) return h === 12 ? 0 : h
	return h === 12 ? 12 : h + 12
}

const hoursModel = computed({
	get: (): string => String(props.is24Hour ? props.hours : to12h(props.hours)),
	set: (val: string): void => {
		const parsed = parseInt(val, 10) || 0
		emit('update:hours', props.is24Hour ? parsed : from12h(parsed, props.isAm))
	},
})

const minutesModel = computed({
	get: (): string => String(props.minutes),
	set: (val: string): void => {
		emit('update:minutes', parseInt(val, 10) || 0)
	},
})

const secondsModel = computed({
	get: (): string => String(props.seconds),
	set: (val: string): void => {
		emit('update:seconds', parseInt(val, 10) || 0)
	},
})
</script>
