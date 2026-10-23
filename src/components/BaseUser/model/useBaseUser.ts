import { computed } from 'vue'
import { useUi } from '@composables/base/useUi'
import type { BaseUserProps } from '../types/BaseUser.types'
import type { StructuredData } from '@utils/seo/structuredDataUtils'
import { useStructuredData } from '@composables/seo/useStructuredData'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { StructuredDataContext } from '@composables/seo/useStructuredData'

function personSchema(props: BaseUserProps, { url }: StructuredDataContext): StructuredData {
	return { '@type': 'Person', name: props.name, description: props.description, image: url(props.src), url: url(props.href ?? props.to) }
}

export function useBaseUser(props: BaseUserProps) {
	const isLink = computed(() => Boolean(props.to || props.href))

	return {
		...useStandardBaseComponent('base-user', props, ['root', 'avatar', 'name', 'description']),
		ui: useUi(props, 'base-user'),
		isLink,
		...useStructuredData(
			'BaseUser',
			() => props.seo,
			context => personSchema(props, context),
		),
		linkProps: computed(() => (isLink.value ? { to: props.to, href: props.href, target: props.target, variant: 'ghost' } : {})),
	}
}
