<template>
	<TransitionGroup
		tag="ul"
		name="base-avatar-group-item"
		:class="[ui('root'), variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle]"
		:aria-label="ariaLabel"
		@before-leave="handleBeforeLeave">
		<li v-for="item in visibleItems" :key="item.key" :class="[ui('item'), classes.item]">
			<BaseAvatar
				:src="item.src"
				:name="item.name"
				:ring="item.ring"
				:mascot="item.mascot"
				:variant="variant"
				:shape="shape"
				:size-scale="sizeScale"
				:color="color"
				aria-hidden="true" />
			<span :class="ui('name')">{{ item.name }}</span>
		</li>
		<li v-if="restCount > 0" key="more" :class="[ui('item'), classes.item]">
			<BaseAvatar
				:class="[ui('more'), `base-avatar-group__more--${shape}`, classes.more]"
				:variant="variant"
				:shape="shape"
				:size-scale="sizeScale"
				:color="color"
				aria-hidden="true">
				<Transition name="base-avatar-group-count">
					<span :key="restCount" :class="ui('count')">+{{ restCount }}</span>
				</Transition>
			</BaseAvatar>
			<span :class="ui('name')">{{ formatMessage(UI_ARIA.AVATARS_MORE, { n: restCount }) }}</span>
		</li>
	</TransitionGroup>
</template>

<script setup lang="ts">
import '../styles/BaseAvatarGroup.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { BaseAvatar } from '@components/BaseAvatar'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseAvatarGroup } from '../model/useBaseAvatarGroup'
import type { BaseAvatarGroupProps } from '../types/BaseAvatarGroup.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseAvatarGroupProps>(),
	kitDefaults('BaseAvatarGroup', {
		variant: DEFAULT_VARIANT,
		max: 4,
		shape: 'square',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const { ui, sizeScaleStyle, variantClass, variantStyle, classes, visibleItems, restCount, handleBeforeLeave } = useBaseAvatarGroup(props)
</script>
