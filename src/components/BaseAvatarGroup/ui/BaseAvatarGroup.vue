<template>
	<!-- Группа — список: аватары скрыты от скринридера, имя человека — скрытым текстом, остаток — «и ещё N» -->
	<ul class="base-avatar-group" :class="[variantClass, classes.root]" :style="[sizeScaleStyle, variantStyle]" :aria-label="ariaLabel">
		<li v-for="(item, index) in visibleItems" :key="`${item.name}-${index}`" class="base-avatar-group__item" :class="classes.item">
			<BaseAvatar
				:src="item.src"
				:name="item.name"
				:variant="variant"
				:shape="shape"
				:size-scale="sizeScale"
				:color="color"
				aria-hidden="true" />
			<span class="base-avatar-group__name">{{ item.name }}</span>
		</li>
		<li
			v-if="restCount > 0"
			class="base-avatar-group__item base-avatar-group__more"
			:class="[`base-avatar-group__more--${shape}`, classes.more]">
			<span aria-hidden="true">+{{ restCount }}</span>
			<span class="base-avatar-group__name">{{ formatMessage(UI_ARIA.AVATARS_MORE, { n: restCount }) }}</span>
		</li>
	</ul>
</template>

<script setup lang="ts">
import { UI_ARIA } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { BaseAvatar } from '@components/BaseAvatar'
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useBaseAvatarGroup } from '../model/useBaseAvatarGroup'
import '../styles/BaseAvatarGroup.style.scss'
import type { BaseAvatarGroupProps } from '../types/BaseAvatarGroup.types'

const props = withDefaults(
	defineProps<BaseAvatarGroupProps>(),
	kitDefaults('BaseAvatarGroup', {
		variant: DEFAULT_VARIANT,
		max: 4,
		shape: 'circle',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const { sizeScaleStyle, variantClass, variantStyle, classes, visibleItems, restCount } = useBaseAvatarGroup(props)
</script>
