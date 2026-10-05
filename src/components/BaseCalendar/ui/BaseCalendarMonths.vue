<template>
	<div :class="[ui('months'), classes.months]">
		<button
			v-for="(name, index) in monthNames"
			:key="index"
			type="button"
			:class="[ui('month-btn'), { 'base-calendar__month-btn--current': index === currentMonth }]"
			:aria-current="index === currentMonth ? 'true' : undefined"
			:disabled="isDisabled"
			@click="emit('select', index)">
			{{ name }}
		</button>
	</div>
</template>

<script setup lang="ts">
import { useCalendarUi } from '../model/useCalendarUi'
import type { BaseCalendarMonthsEmits, BaseCalendarMonthsProps } from '../types/BaseCalendarMonths.types'

defineProps<BaseCalendarMonthsProps>()

const emit = defineEmits<BaseCalendarMonthsEmits>()

const ui = useCalendarUi()
</script>
