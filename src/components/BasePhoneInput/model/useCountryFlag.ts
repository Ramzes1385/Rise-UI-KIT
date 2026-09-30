import { computed } from 'vue'
import { countryFlag } from './phone/countryFlags'
import type { CountryFlagProps } from '../types/CountryFlag.types'

export function useCountryFlag(props: CountryFlagProps) {
	return { shapes: computed(() => countryFlag(props.code)) }
}
