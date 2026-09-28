<template>
	<slot name="results" :results="visibleResults" :query="query" :is-loading="isLoading">
		<!-- Загрузка без результатов: строка статуса вместо пустой панели (слот loading её заменяет) -->
		<slot v-if="isLoading" name="loading">
			<div v-if="visibleResults.length === 0" class="base-search__status" role="status">
				<BaseText tag="span" :size-scale="sizeScale">{{ UI_TEXT.LOADING }}</BaseText>
			</div>
		</slot>
		<slot name="result-before" :results="visibleResults" :query="query" />
		<!-- Список — listbox: фокус остаётся в поле, подсвеченный результат — aria-activedescendant поля -->
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
						<!-- Совпадения с запросом выделены <mark>: видно, почему результат попал в список -->
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
import { getSearchOptionId } from '../model/BaseSearch.types'
import type { SearchResult } from '../model/BaseSearch.types'
import type { BaseSearchResultsEmits, BaseSearchResultsProps, BaseSearchResultsSlots } from '../model/BaseSearchResults.types'

const props = defineProps<BaseSearchResultsProps>()

const emit = defineEmits<BaseSearchResultsEmits>()

defineSlots<BaseSearchResultsSlots>()

/** Часть текста результата: совпадение с запросом (выделяется <mark>) или обычный текст */
interface TextPart {
	text: string
	isMatch: boolean
}

/**
 * Делит текст на части по вхождениям запроса без учёта регистра. Если запрос пуст или нижний регистр меняет
 * длину строки (редкие символы вроде «İ»), индексы не совпали бы с исходным текстом — текст возвращается целиком.
 */
function splitByQuery(text: string): TextPart[] {
	const query = props.query.trim().toLowerCase()
	const lowerText = text.toLowerCase()
	if (!query || lowerText.length !== text.length) return [{ text, isMatch: false }]

	const parts: TextPart[] = []
	let from = 0
	for (let index = lowerText.indexOf(query); index !== -1; index = lowerText.indexOf(query, from)) {
		if (index > from) parts.push({ text: text.slice(from, index), isMatch: false })
		parts.push({ text: text.slice(index, index + query.length), isMatch: true })
		from = index + query.length
	}
	if (from < text.length) parts.push({ text: text.slice(from), isMatch: false })
	return parts
}

function handleSelect(item: SearchResult): void {
	emit('select', item)
}

function handleHighlight(index: number): void {
	emit('highlight', index)
}
</script>
