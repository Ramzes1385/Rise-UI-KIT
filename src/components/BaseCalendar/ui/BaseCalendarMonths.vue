<template>
	<div class="base-calendar__months" :class="classes.months">
		<button
			v-for="(name, index) in monthNames"
			:key="index"
			type="button"
			class="base-calendar__month-btn"
			:class="{ 'base-calendar__month-btn--current': index === currentMonth }"
			:aria-current="index === currentMonth ? 'true' : undefined"
			:disabled="isDisabled"
			@click="emit('select', index)">
			{{ name }}
		</button>
	</div>
</template>

<script setup lang="ts">
import type { BaseCalendarMonthsEmits, BaseCalendarMonthsProps } from '../model/BaseCalendarMonths.types'

defineProps<BaseCalendarMonthsProps>()

const emit = defineEmits<BaseCalendarMonthsEmits>()
</script>
