<template>
	<main class="ui-playground">
		<section class="ui-playground__hero">
			<BaseBadge label="Metal UI" variant="soft" />
			<BaseText tag="h1" :size-scale="188" :weight="700">UI-библиотека компонентов</BaseText>
			<BaseText class="ui-playground__lead" :size-scale="112">
				Базовый playground проверяет регистрацию плагина, глобальные стили и SVG-спрайт после миграции структуры.
			</BaseText>
			<div class="ui-playground__actions">
				<BaseButton>Основная кнопка</BaseButton>
				<BaseButton variant="outline">
					<template #left>
						<BaseIcon name="check" />
					</template>
					С иконкой
				</BaseButton>
			</div>
		</section>

		<section class="ui-playground__grid">
			<BaseCard title="Форма" subtitle="Компоненты ввода">
				<div class="ui-playground__stack">
					<BaseInput v-model="inputValue" label="Название" placeholder="Введите текст" />
					<BaseSwitch v-model="isEnabled" label="Включить опцию" />
				</div>
			</BaseCard>

			<BaseCard title="Навигация" subtitle="Компоненты интерфейса">
				<div class="ui-playground__stack">
					<BaseTabs v-model="activeTab" :items="tabs" />
					<BaseProgress :value="65" has-label />
				</div>
			</BaseCard>
		</section>
	</main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
	BaseBadge,
	BaseButton,
	BaseCard,
	BaseIcon,
	BaseInput,
	BaseProgress,
	BaseSwitch,
	BaseTabs,
	BaseText,
} from '@components'
import type { TabItem } from '@components/BaseTabs'

const inputValue = ref('Metal Art')
const isEnabled = ref(true)
const activeTab = ref('components')

const tabs: TabItem[] = [
	{ id: 'components', label: 'Компоненты', icon: 'check' },
	{ id: 'styles', label: 'Стили', icon: 'color-picker' },
]
</script>

<style lang="scss">
.ui-playground {
	min-height: 100vh;
	padding: 48px;
	background: var(--color-bg);
	color: var(--color-text);

	&__hero {
		display: flex;
		flex-direction: column;
		gap: 20px;
		max-width: 760px;
		margin-bottom: 32px;
	}

	&__lead {
		max-width: 680px;
		color: var(--color-text-muted);
	}

	&__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}

	&__grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 24px;
	}

	&__stack {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
}

@media (max-width: 768px) {
	.ui-playground {
		padding: 24px;

		&__grid {
			grid-template-columns: 1fr;
		}
	}
}
</style>
