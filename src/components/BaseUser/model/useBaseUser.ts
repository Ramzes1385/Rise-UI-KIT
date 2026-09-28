/** Composable: логика BaseUser — классы и ссылка профиля */
import { computed } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseUserProps } from '../types/BaseUser.types'

export function useBaseUser(props: BaseUserProps) {
	const isLink = computed(() => Boolean(props.to || props.href))

	return {
		...useStandardBaseComponent('base-user', props, ['root', 'avatar', 'name', 'description']),
		isLink,
		linkProps: computed(() => (isLink.value ? { to: props.to, href: props.href, target: props.target, variant: 'ghost' } : {})),
	}
}
