<template>
	<section
		ref="rootRef"
		:class="[ui('root'), variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-label="label ?? UI_COMMENT_THREAD.TITLE">
		<component :is="'script'" v-if="structuredData" type="application/ld+json" v-html="structuredData" />
		<p :class="ui('count')">{{ countText }}</p>
		<TransitionGroup
			v-if="comments.length"
			tag="ul"
			name="base-comment-thread-item"
			:css="!isMotionReduced"
			:class="[ui('list'), classes.list]"
			@leave="leaveAtOnce">
			<CommentNode v-for="comment in comments" :key="comment.id" :comment="comment" :depth="0" />
		</TransitionGroup>
		<p v-else :class="ui('empty')">{{ UI_COMMENT_THREAD.EMPTY }}</p>
		<CommentComposer
			v-if="!isReadonly"
			:class="classes.composer"
			:label="UI_COMMENT_THREAD.NEW"
			:placeholder="UI_COMMENT_THREAD.PLACEHOLDER"
			:author="currentUser"
			:size-scale="sizeScale"
			@submit="submitRoot" />
	</section>
</template>

<script setup lang="ts">
import '../styles/BaseCommentThread.style.scss'
import CommentNode from './CommentNode.vue'
import CommentComposer from './CommentComposer.vue'
import { UI_COMMENT_THREAD } from '@/locales/messages'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseCommentThread } from '../model/useBaseCommentThread'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseCommentThreadEmits, BaseCommentThreadProps } from '../types/BaseCommentThread.types'

const props = withDefaults(
	defineProps<BaseCommentThreadProps>(),
	kitDefaults('BaseCommentThread', {
		variant: 'default',
		currentUser: undefined,
		label: undefined,
		now: undefined,
		maxDepth: 3,
		seo: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseCommentThreadEmits>()

const {
	rootRef,
	ui,
	isMotionReduced,
	leaveAtOnce,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	countText,
	submitRoot,
	structuredData,
} = useBaseCommentThread(props, emit)
</script>
