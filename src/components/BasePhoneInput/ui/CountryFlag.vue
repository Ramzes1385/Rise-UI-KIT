<template>
	<svg :class="className" viewBox="0 0 30 20" aria-hidden="true" focusable="false">
		<component :is="item.tag" v-for="(item, index) in shapes" :key="index" v-bind="item.attrs">{{ item.text }}</component>
	</svg>
</template>

<script setup lang="ts">
import { useCountryFlag } from '../model/useCountryFlag'
import type { CountryFlagProps } from '../types/CountryFlag.types'

const props = defineProps<CountryFlagProps>()

const { shapes } = useCountryFlag(props)
</script>
