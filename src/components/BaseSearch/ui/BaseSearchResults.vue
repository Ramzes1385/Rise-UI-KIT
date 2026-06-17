<template>
	<slot name="results" :results="visibleResults" :query="query" :is-loading="isLoading">
		<slot name="loading" v-if="isLoading" />
		<slot name="result-before" :results="visibleResults" :query="query" />
		<TransitionGroup v-if="visibleResults.length > 0" name="search-result">
			<div
				v-for="(item, index) in visibleResults"
				:key="item.id"
				class="base-search__result"
				:class="[{ 'base-search__result--highlighted': index === highlightedIndex }, classes.result]"
				@mousedown.prevent="handleSelect(item)"
				@mouseenter="handleHighlight(index)">
				<slot name="result" :item="item" :index="index">
					<BaseImage
						v-if="item.image"
						:src="item.image"
						:alt="item.title"
						class="base-search__result-image"
						:custom-class="classes.resultImage"
						:border-radius="4"
						fit="cover"
						:size-scale="sizeScale" />
					<BaseIcon
						v-else-if="item.icon"
						:name="item.icon"
						class="base-search__result-icon"
						:custom-class="classes.resultIcon"
						:size-scale="calcIconScale('sm', sizeScale)" />
					<div class="base-search__result-content" :class="classes.resultContent">
						<BaseText
							tag="span"
							class="base-search__result-title"
							:custom-class="classes.resultTitle"
							:size-scale="sizeScale">
							{{ item.title }}
						</BaseText>
						<BaseText
							v-if="item.description"
							tag="span"
							class="base-search__result-desc"
							:custom-class="classes.resultDesc"
							:size-scale="sizeScale">
							{{ item.description }}
						</BaseText>
					</div>
					<BaseText
						v-if="item.category"
						tag="span"
						class="base-search__result-category"
						:custom-class="classes.resultCategory"
						:size-scale="sizeScale">
						{{ item.category }}
					</BaseText>
				</slot>
			</div>
		</TransitionGroup>
		<template v-else-if="query && !isLoading">
			<slot name="empty">
				<div class="base-search__empty" :class="classes.empty">
					<BaseText :custom-class="classes.emptyText" :size-scale="sizeScale">{{ UI_TEXT.NO_RESULTS }}</BaseText>
				</div>
			</slot>
		</template>
		<slot name="result-after" :results="visibleResults" :query="query" />
	</slot>
</template>

<script setup lang="ts">
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseImage } from '@components/BaseImage'
import { BaseText } from '@components/BaseText'
import { UI_TEXT } from '@constants'
import type { SearchResult } from '../model/BaseSearch.types'
import type { BaseSearchResultsEmits, BaseSearchResultsProps } from '../model/BaseSearchResults.types'

defineProps<BaseSearchResultsProps>()

const emit = defineEmits<BaseSearchResultsEmits>()

function handleSelect(item: SearchResult): void {
	emit('select', item)
}

function handleHighlight(index: number): void {
	emit('highlight', index)
}
</script>
