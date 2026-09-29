<template>
	<div class="base-markdown__code-block">
		<div class="base-markdown__code-header">
			<span class="base-markdown__code-lang">{{ block.lang || UI_MARKDOWN.CODE }}</span>
			<button type="button" class="base-markdown__copy" @click="copy">
				<BaseIcon :name="isCopied ? 'check' : 'copy'" />
				{{ isCopied ? UI_MARKDOWN.CODE_COPIED : UI_MARKDOWN.COPY_CODE }}
			</button>
		</div>
		<pre
			class="base-markdown__pre"
			tabindex="0"><code>{{ block.value }}<span v-if="block.hasCaret" class="base-markdown__caret" aria-hidden="true"></span></code></pre>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { UI_MARKDOWN } from '@/locales/messages'
import { useMarkdownCode } from '../model/useMarkdownCode'
import type { MarkdownCodeProps } from '../types/MarkdownParts.types'

const props = defineProps<MarkdownCodeProps>()

const { isCopied, copy } = useMarkdownCode(props)
</script>
