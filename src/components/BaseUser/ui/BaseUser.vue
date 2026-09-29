<template>
	<component
		:is="isLink ? BaseLink : 'div'"
		class="base-user"
		:class="[`base-user--${orientation}`, { 'base-user--link': isLink }, classes.root]"
		:style="[sizeScaleStyle, customColorStyle]"
		v-bind="linkProps">
		<BaseAvatar
			class="base-user__avatar"
			:src="src"
			:name="name"
			:is-online="isOnline"
			:size-scale="sizeScale"
			:custom-class="{ root: classes.avatar }"
			aria-hidden="true" />
		<span class="base-user__text">
			<span class="base-user__name" :class="classes.name">
				{{ name }}<span v-if="isOnline" class="base-user__status">, {{ UI_CHAT_TEXT.ONLINE }}</span>
			</span>
			<span v-if="description || $slots.description" class="base-user__description" :class="classes.description">
				<slot name="description">{{ description }}</slot>
			</span>
		</span>
	</component>
</template>

<script setup lang="ts">
import '@components/BaseLink/styles/BaseLink.style.scss'
import '../styles/BaseUser.style.scss'
import { BaseLink } from '@components/BaseLink'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { useBaseUser } from '../model/useBaseUser'
import { BaseAvatar } from '@components/BaseAvatar'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseUserProps, BaseUserSlots } from '../types/BaseUser.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseUserProps>(),
	kitDefaults('BaseUser', {
		variant: DEFAULT_VARIANT,
		isOnline: false,
		orientation: 'horizontal',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

defineSlots<BaseUserSlots>()

const { sizeScaleStyle, customColorStyle, classes, isLink, linkProps } = useBaseUser(props)
</script>
