<template>
	<slot name="results" :results="visibleResults" :query="query" :is-loading="isLoading">
		<slot v-if="isLoading" name="loading">
			<div v-if="visibleResults.length === 0" class="base-search__status" role="status">
				<BaseText tag="span" :size-scale="sizeScale">{{ UI_TEXT.LOADING }}</BaseText>
			</div>
		</slot>
		<slot name="result-before" :results="visibleResults" :query="query" />
		<div v-if="visibleResults.length > 0" :id="listboxId" class="base-search__listbox" role="listbox" :aria-label="listboxLabel">
			<div
				v-for="(item, index) in visibleResults"
				:id="listboxId ? getSearchOptionId(listboxId, index) : undefined"
				:key="item.id"
				class="base-search__result"
				:class="[{ 'base-search__result--highlighted': index === highlightedIndex }, classes.result]"
				role="option"
				:aria-selected="index === highlightedIndex ? 'true' : 'false'"
				@mousedown.prevent="handleSelect(item)"
				@mouseenter="handleHighlight(index)">
				<slot name="result" :item="item" :index="index">
					<BaseImage
						v-if="item.image"
						:src="item.image"
						:alt="item.title"
						class="base-search__result-image"
						:custom-class="classes.resultImage"
						fit="cover"
						:size-scale="sizeScale" />
					<BaseIcon
						v-else-if="item.icon"
						:name="item.icon"
						class="base-search__result-icon"
						:custom-class="classes.resultIcon"
						:size-scale="calcIconScale('sm', sizeScale)" />
					<div class="base-search__result-content" :class="classes.resultContent">
						<BaseText tag="span" class="base-search__result-title" :custom-class="classes.resultTitle" :size-scale="sizeScale">
							<template v-for="(part, partIndex) in splitByQuery(item.title)" :key="partIndex">
								<mark v-if="part.isMatch" class="base-search__match">{{ part.text }}</mark>
								<template v-else>{{ part.text }}</template>
							</template>
						</BaseText>
						<BaseText
							v-if="item.description"
							tag="span"
							class="base-search__result-desc"
							:custom-class="classes.resultDesc"
							:size-scale="sizeScale">
							<template v-for="(part, partIndex) in splitByQuery(item.description)" :key="partIndex">
								<mark v-if="part.isMatch" class="base-search__match">{{ part.text }}</mark>
								<template v-else>{{ part.text }}</template>
							</template>
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
		</div>
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
import { UI_TEXT } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { calcIconScale } from '@utils/iconUtils'
import { BaseImage } from '@components/BaseImage'
import { getSearchOptionId } from '../model/searchOptionId'
import { useBaseSearchResults } from '../model/useBaseSearchResults'
import type { BaseSearchResultsEmits, BaseSearchResultsProps, BaseSearchResultsSlots } from '../types/BaseSearchResults.types'

const props = defineProps<BaseSearchResultsProps>()

const emit = defineEmits<BaseSearchResultsEmits>()

defineSlots<BaseSearchResultsSlots>()

const { splitByQuery, handleSelect, handleHighlight } = useBaseSearchResults(props, emit)
</script>
