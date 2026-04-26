<template>
	<div class="ui-kit-page">
		<div class="ui-kit-page__container">
			<h1 class="ui-kit-page__title">UI Kit - Максимальная проверка компонентов</h1>

			<!-- Typography & Colors -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Typography & Colors</h2>
				<div class="ui-kit-page__grid ui-kit-page__grid--vertical">
					<h1>Heading 1 - Искусство в металле</h1>
					<h2>Heading 2 - Каталог картин</h2>
					<h3>Heading 3 - Оформление заказа</h3>
					<h4>Heading 4 - Контактная информация</h4>
					<p class="ui-kit-page__text-large">Large text - Эксклюзивные картины ручной работы.</p>
					<p>Base text - Используем только высококачественную сталь и современные технологии лазерной резки.</p>
					<p class="ui-kit-page__text-small">Small text - &copy; 2024 MetalArt. Все права защищены.</p>

					<h3 class="ui-kit-page__small-title">Brand Colors</h3>
					<div class="ui-kit-page__color-grid">
						<div v-for="color in brandColors" :key="color.name" class="ui-kit-page__color-card">
							<div class="ui-kit-page__color-swatch" :style="{ background: color.value }"></div>
							<div class="ui-kit-page__color-info">
								<span>{{ color.name }}</span>
								<code>{{ color.hex }}</code>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Buttons -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Buttons (All Variants & States)</h2>
				<div class="ui-kit-page__grid">
					<div v-for="variant in buttonVariants" :key="variant" class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">{{ variant }}</h3>
						<div class="ui-kit-page__stack">
							<BaseButton :variant="variant">{{ variant }} Default</BaseButton>
							<BaseButton :variant="variant" :is-loading="true">Loading</BaseButton>
							<BaseButton :variant="variant" :is-disabled="true">Disabled</BaseButton>
						</div>
					</div>
				</div>
			</section>

			<!-- Forms -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Form Controls (All Variants & States)</h2>
				<div class="ui-kit-page__grid">
					<!-- Input — Варианты -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Input — Outline</h3>
						<div class="ui-kit-page__stack">
							<BaseInput v-model="formData.name" variant="outline" label="Default" placeholder="Outline input" />
							<BaseInput
								v-model="formData.name"
								variant="outline"
								label="Error"
								error="Обязательное поле"
								placeholder="Ошибка" />
							<BaseInput
								v-model="formData.name"
								variant="outline"
								label="Disabled"
								:is-disabled="true"
								placeholder="Отключено" />
							<BaseInput
								v-model="formData.name"
								variant="outline"
								label="Required"
								:is-required="true"
								placeholder="Обязательное" />
						</div>
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Input — Filled</h3>
						<div class="ui-kit-page__stack">
							<BaseInput v-model="formData.name" variant="filled" label="Default" placeholder="Filled input" />
							<BaseInput
								v-model="formData.name"
								variant="filled"
								label="Error"
								error="Обязательное поле"
								placeholder="Ошибка" />
							<BaseInput
								v-model="formData.name"
								variant="filled"
								label="Disabled"
								:is-disabled="true"
								placeholder="Отключено" />
						</div>
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Input — Underline</h3>
						<div class="ui-kit-page__stack">
							<BaseInput v-model="formData.name" variant="underline" label="Default" placeholder="Underline input" />
							<BaseInput
								v-model="formData.name"
								variant="underline"
								label="Error"
								error="Обязательное поле"
								placeholder="Ошибка" />
							<BaseInput
								v-model="formData.name"
								variant="underline"
								label="Disabled"
								:is-disabled="true"
								placeholder="Отключено" />
						</div>
					</div>

					<!-- Input — Размеры -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Input — Размеры</h3>
						<div class="ui-kit-page__stack">
							<BaseInput v-model="formData.name" :size-scale="75" label="Small" placeholder="SM input" />
							<BaseInput v-model="formData.name" :size-scale="100" label="Medium" placeholder="MD input" />
							<BaseInput v-model="formData.name" :size-scale="150" label="Large" placeholder="LG input" />
						</div>
					</div>

					<!-- Input — Типы -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Input — Типы</h3>
						<div class="ui-kit-page__stack">
							<BaseInput v-model="formData.email" type="email" label="Email" placeholder="user@mail.com" />
							<BaseInput v-model="formData.name" type="number" label="Число" placeholder="0" />
							<BaseInput v-model="formData.name" type="password" label="Пароль" placeholder="••••••••" />
						</div>
					</div>

					<!-- Input — Телефон с маской -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Input — Телефон (маска)</h3>
						<div class="ui-kit-page__stack">
							<BaseInput
								v-model="formData.phoneRu"
								type="tel"
								label="Россия"
								prefix="+7"
								mask="(###) ###-##-##"
								placeholder="(999) 123-45-67" />
							<BaseInput
								v-model="formData.phoneKz"
								type="tel"
								label="Казахстан"
								prefix="+7"
								mask="(###) ###-##-##"
								placeholder="(7XX) XXX-XX-XX" />
							<BaseInput
								v-model="formData.phoneBy"
								type="tel"
								label="Беларусь"
								prefix="+375"
								mask="(##) ###-##-##"
								placeholder="(XX) XXX-XX-XX" />
							<BaseInput
								v-model="formData.phoneUa"
								type="tel"
								label="Украина"
								prefix="+380"
								mask="(##) ###-##-##"
								placeholder="(XX) XXX-XX-XX" />
						</div>
					</div>

					<!-- Input — Маски -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Input — Маски</h3>
						<div class="ui-kit-page__stack">
							<BaseInput
								v-model="formData.date"
								label="Дата"
								mask="##.##.####"
								placeholder="01.01.2024"
								allowed-chars="digits" />
							<BaseInput
								v-model="formData.passport"
								label="Паспорт (серия/номер)"
								mask="## ## ######"
								placeholder="12 34 567890"
								allowed-chars="digits" />
							<BaseInput
								v-model="formData.card"
								label="Карта"
								mask="#### #### #### ####"
								placeholder="0000 0000 0000 0000"
								allowed-chars="digits" />
							<BaseInput
								v-model="formData.time"
								label="Время"
								mask="##:##"
								placeholder="12:30"
								allowed-chars="digits" />
						</div>
					</div>

					<!-- Input — Prefix & Postfix -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Input — Prefix & Postfix</h3>
						<div class="ui-kit-page__stack">
							<BaseInput v-model="formData.widthMm" label="Ширина" postfix="мм" placeholder="1000" />
							<BaseInput v-model="formData.price" label="Цена" prefix="$" placeholder="0.00" />
							<BaseInput v-model="formData.weight" label="Вес" prefix="≈" postfix="кг" placeholder="0.5" />
							<BaseInput
								v-model="formData.widthMm"
								label="Ширина (filled)"
								variant="filled"
								postfix="мм"
								placeholder="1000" />
							<BaseInput
								v-model="formData.price"
								label="Цена (filled)"
								variant="filled"
								prefix="$"
								placeholder="0.00" />
							<BaseInput
								v-model="formData.weight"
								label="Вес (underline)"
								variant="underline"
								prefix="≈"
								postfix="кг"
								placeholder="0.5" />
							<BaseInput
								v-model="formData.widthMm"
								label="Ошибка + postfix"
								postfix="мм"
								error="Слишком мало"
								placeholder="1000" />
							<BaseInput
								v-model="formData.widthMm"
								label="Small + postfix"
								:size-scale="75"
								postfix="мм"
								placeholder="1000" />
							<BaseInput
								v-model="formData.widthMm"
								label="Large + prefix"
								:size-scale="150"
								prefix="https://"
								placeholder="example.com" />
						</div>
					</div>

					<!-- Textarea -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Textarea</h3>
						<div class="ui-kit-page__stack">
							<BaseTextarea v-model="formData.description" label="Default" placeholder="Введите описание" />
							<BaseTextarea
								v-model="formData.description"
								label="Error"
								error="Обязательное поле"
								placeholder="Ошибка" />
							<BaseTextarea
								v-model="formData.description"
								label="Disabled"
								:is-disabled="true"
								placeholder="Отключено" />
						</div>
					</div>

					<!-- Select — Outline -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Select — Outline</h3>
						<div class="ui-kit-page__stack">
							<BaseSelect v-model="formData.select" variant="outline" :options="selectOptions" />
							<BaseSelect v-model="formData.select" variant="outline" :has-error="true" :options="selectOptions" />
							<BaseSelect v-model="formData.select" variant="outline" :is-disabled="true" :options="selectOptions" />
						</div>
					</div>

					<!-- Select — Ghost -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Select — Ghost</h3>
						<div class="ui-kit-page__stack">
							<BaseSelect v-model="formData.select" variant="ghost" :options="selectOptions" />
							<BaseSelect v-model="formData.select" variant="ghost" :has-error="true" :options="selectOptions" />
							<BaseSelect v-model="formData.select" variant="ghost" :is-disabled="true" :options="selectOptions" />
						</div>
					</div>

					<!-- Select — Underline -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Select — Underline</h3>
						<div class="ui-kit-page__stack">
							<BaseSelect v-model="formData.select" variant="underline" :options="selectOptions" />
							<BaseSelect v-model="formData.select" variant="underline" :has-error="true" :options="selectOptions" />
							<BaseSelect v-model="formData.select" variant="underline" :is-disabled="true" :options="selectOptions" />
						</div>
					</div>

					<!-- Select — Searchable & Multiple -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Select — Поиск и мультивыбор</h3>
						<div class="ui-kit-page__stack">
							<BaseSelect
								v-model="formData.select"
								:is-searchable="true"
								:options="selectOptionsExtended"
								placeholder="Поиск..." />
							<BaseSelect
								v-model="formData.multiSelect"
								:is-multiple="true"
								:options="selectOptionsExtended"
								placeholder="Выберите несколько" />
						</div>
					</div>

					<!-- Select — Слоты (переиспользование) -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Select — Слоты (кастомизация)</h3>
						<div class="ui-kit-page__stack">
							<BaseSelect v-model="formData.select" :options="selectOptionsWithIcons" placeholder="С иконками" />
							<BaseSelect v-model="formData.select" :options="selectOptionsWithIcons" placeholder="Кастомная опция">
								<template #option="{ option, isSelected }">
									<span style="display: flex; align-items: center; gap: 8px; width: 100%">
										<span>{{ option.icon }}</span>
										<strong>{{ option.label }}</strong>
										<span v-if="isSelected" style="margin-left: auto; color: var(--color-accent)">✓</span>
									</span>
								</template>
							</BaseSelect>
							<BaseSelect v-model="formData.select" :options="selectOptionsWithIcons" placeholder="Кастомный триггер">
								<template #trigger="{ isOpen, selectedLabel }">
									<div style="display: flex; align-items: center; gap: 6px; flex: 1">
										<span>📍</span>
										<span>{{ selectedLabel || 'Выберите город' }}</span>
										<span v-if="isOpen" style="font-size: 10px; color: var(--color-accent)">открыто</span>
									</div>
								</template>
							</BaseSelect>
							<BaseSelect
								v-model="formData.multiSelect"
								:is-multiple="true"
								:options="selectOptionsWithIcons"
								placeholder="Кастомные теги">
								<template #tag="{ labels, remove }">
									<span
										v-for="lbl in labels"
										:key="lbl"
										style="
											display: inline-flex;
											align-items: center;
											gap: 4px;
											padding: 2px 8px;
											background: var(--color-accent);
											color: #fff;
											border-radius: 12px;
											font-size: 12px;
										">
										{{ lbl }}
										<span style="cursor: pointer; font-weight: bold" @click.stop="remove(lbl)">×</span>
									</span>
								</template>
							</BaseSelect>
						</div>
					</div>

					<!-- Select — С описанием -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Select — С описанием</h3>
						<div class="ui-kit-page__stack">
							<BaseSelect v-model="formData.select" :options="selectOptionsWithDesc" placeholder="Выберите жанр" />
							<BaseSelect
								v-model="formData.multiSelect"
								:is-multiple="true"
								:options="selectOptionsWithDesc"
								placeholder="Выберите несколько" />
						</div>
					</div>

					<!-- Checkbox & Switch -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Checkboxes & Switches</h3>
						<div class="ui-kit-page__stack">
							<BaseCheckbox v-model="formData.checkbox1" label="Default" />
							<BaseCheckbox v-model="formData.checkbox1" :is-disabled="true" label="Disabled" />
							<BaseSwitch v-model="formData.switch1" label="Default" />
							<BaseSwitch v-model="formData.switch1" :is-disabled="true" label="Disabled" />
						</div>
					</div>

					<!-- Other Form Elements -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Other</h3>
						<div class="ui-kit-page__stack">
							<BasePin v-model="formData.pin" :length="4" @complete="handlePinComplete" />
							<BaseRadio v-model="formData.radio" name="ui-radio-v" :is-vertical="true" :options="radioOptions" />
						</div>
					</div>

					<!-- Form Wrapper -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Form Wrapper</h3>
						<BaseForm @submit="addNotification('info')">
							<div class="ui-kit-page__stack">
								<BaseInput v-model="formData.name" label="Name" />
								<BaseButton type="submit">Submit Form</BaseButton>
							</div>
						</BaseForm>
					</div>

					<!-- File Upload -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">File Upload — Изображения</h3>
						<div class="ui-kit-page__stack">
							<BaseFileUpload
								label="Фото картины"
								accept=".jpg,.jpeg,.png,.webp,.svg"
								:is-multiple="true"
								:max-size="10"
								:max-count="5"
								button-text="Загрузите изображения"
								@change="handleFileChange"
								@error="handleFileError" />
							<BaseFileUpload :is-disabled="true" button-text="Отключено" />
						</div>
					</div>

					<!-- File Upload — Документы -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">File Upload — Документы</h3>
						<div class="ui-kit-page__stack">
							<BaseFileUpload
								label="Документы"
								accept=".pdf,.doc,.docx,.xls,.xlsx"
								:max-size="5"
								button-text="Загрузите документы"
								@change="handleFileChange"
								@error="handleFileError" />
						</div>
					</div>

					<!-- File Upload — Любые файлы -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">File Upload — Любые файлы</h3>
						<div class="ui-kit-page__stack">
							<BaseFileUpload
								label="Любые файлы"
								:is-multiple="true"
								:max-count="10"
								button-text="Загрузите файлы"
								@change="handleFileChange"
								@error="handleFileError" />
						</div>
					</div>

					<!-- Form Field -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Form Field Wrapper</h3>
						<div class="ui-kit-page__stack">
							<BaseFormField label="Имя" description="Введите ваше полное имя" required>
								<BaseInput v-model="formData.name" placeholder="Иван Иванов" />
							</BaseFormField>
							<BaseFormField label="Email" error="Некорректный формат почты">
								<BaseInput v-model="formData.email" placeholder="example@mail.com" />
							</BaseFormField>
						</div>
					</div>
				</div>
			</section>

			<!-- Feedback (All Variants & States) -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Feedback & Notifications</h2>
				<div class="ui-kit-page__grid">
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Badges</h3>
						<div class="ui-kit-page__stack ui-kit-page__stack--horizontal">
							<BaseBadge v-for="v in badgeVariants" :key="v" :variant="v">{{ v }}</BaseBadge>
						</div>
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Toast Notifications (Nuxt UI Style)</h3>
						<div class="ui-kit-page__stack ui-kit-page__stack--horizontal">
							<BaseButton variant="outline" @click="addNotification('success')">Success</BaseButton>
							<BaseButton variant="outline" @click="addNotification('error')">Error</BaseButton>
							<BaseButton variant="outline" @click="addNotification('warning')">Warning</BaseButton>
							<BaseButton variant="outline" @click="addNotification('info')">Info</BaseButton>
						</div>
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Tooltips</h3>
						<div class="ui-kit-page__stack ui-kit-page__stack--horizontal">
							<BaseTooltip text="Подсказка сверху" position="top">
								<BaseButton variant="outline">Top</BaseButton>
							</BaseTooltip>
							<BaseTooltip text="Подсказка снизу" position="bottom">
								<BaseButton variant="outline">Bottom</BaseButton>
							</BaseTooltip>
						</div>
					</div>
				</div>
			</section>

			<!-- Data Display (All Variants & States) -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Data Display (All Variants & States)</h2>
				<div class="ui-kit-page__grid">
					<!-- Cards -->
					<div v-for="variant in cardVariants" :key="variant" class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Card {{ variant }}</h3>
						<div class="ui-kit-page__stack">
							<BaseCard :title="variant" :variant="variant" subtitle="Default state">
								Content for {{ variant }} card.
							</BaseCard>
							<BaseCard :title="variant" :variant="variant" :is-hoverable="true" subtitle="Hoverable state">
								Hover me!
							</BaseCard>
						</div>
					</div>

					<!-- Avatars -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Avatars</h3>
						<div class="ui-kit-page__stack ui-kit-page__stack--horizontal">
							<BaseAvatar :size="48" name="JD" />
							<BaseAvatar :size="48" name="SQ" shape="square" />
							<BaseAvatar :size="48" name="BR" variant="bordered" />
							<BaseAvatar :size="48" src="https://i.pravatar.cc/150?u=4" />
						</div>
					</div>

					<!-- Skeletons -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Skeletons</h3>
						<div class="ui-kit-page__stack">
							<BaseSkeleton width="100%" height="20px" />
							<BaseSkeleton width="100%" height="20px" :is-pulse="true" />
							<BaseSkeleton width="48px" height="48px" shape="circle" />
						</div>
					</div>
				</div>
			</section>

			<!-- Navigation & Overlays -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Navigation & Overlays</h2>
				<div class="ui-kit-page__grid ui-kit-page__grid--nav">
					<!-- Pagination — Базовая -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Pagination — Базовая</h3>
						<BasePagination v-model="currentPage" :total="100" :page-size="10" />
					</div>

					<!-- Pagination — Со стрелками -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Pagination — Со стрелками</h3>
						<BasePagination v-model="currentPageSmall" :total="25" :page-size="10" variant="arrows" />
					</div>

					<!-- Pagination — Большой объём -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Pagination — Большой объём</h3>
						<BasePagination v-model="currentPageLarge" :total="20" :page-size="5" :max-visible="7" variant="arrows" />
					</div>

					<!-- Stepper — Горизонтальный -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Stepper — Горизонтальный</h3>
						<BaseStepper v-model="currentStep" :items="stepperSteps" />
					</div>

					<!-- Stepper — Вертикальный -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Stepper — Вертикальный</h3>
						<BaseStepper v-model="currentStepVertical" :items="stepperSteps" orientation="vertical" />
					</div>

					<!-- Stepper — С иконками -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Stepper — С иконками</h3>
						<BaseStepper v-model="currentStepIcons" :items="stepperStepsIcons" />
					</div>

					<!-- Stepper — Отключённый шаг -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Stepper — Отключённый шаг</h3>
						<BaseStepper v-model="currentStepDisabled" :items="stepperStepsDisabled" />
					</div>

					<!-- Stepper — Все шаги пройдены -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Stepper — Все пройдены</h3>
						<BaseStepper v-model="currentStepCompleted" :items="stepperSteps" />
					</div>

					<!-- Menu — Базовое -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Menu — Базовое</h3>
						<BaseMenu :items="[menuItems]" />
					</div>

					<!-- Menu — С группами и разделителями -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Menu — С группами</h3>
						<BaseMenu :items="menuItemsGrouped" />
					</div>

					<!-- Menu — Отключённые пункты -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Menu — Отключённые</h3>
						<BaseMenu :items="[menuItemsDisabled]" />
					</div>
				</div>
			</section>

			<!-- Modals & Popovers -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Modals & Popovers — Вариации</h2>
				<div class="ui-kit-page__grid">
					<!-- Popover позиции -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Popover — Позиции</h3>
						<div class="ui-kit-page__stack ui-kit-page__stack--horizontal">
							<BasePopover position="top">
								<template #trigger>
									<BaseButton variant="outline" size="sm">Сверху</BaseButton>
								</template>
								<p>Popover сверху</p>
							</BasePopover>
							<BasePopover position="bottom">
								<template #trigger>
									<BaseButton variant="outline" size="sm">Снизу</BaseButton>
								</template>
								<p>Popover снизу</p>
							</BasePopover>
							<BasePopover position="left">
								<template #trigger>
									<BaseButton variant="outline" size="sm">Слева</BaseButton>
								</template>
								<p>Popover слева</p>
							</BasePopover>
							<BasePopover position="right">
								<template #trigger>
									<BaseButton variant="outline" size="sm">Справа</BaseButton>
								</template>
								<p>Popover справа</p>
							</BasePopover>
						</div>
					</div>

					<!-- Popover варианты -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Popover — Варианты</h3>
						<div class="ui-kit-page__stack ui-kit-page__stack--horizontal">
							<BasePopover position="bottom" variant="default">
								<template #trigger>
									<BaseButton variant="outline" size="sm">Default</BaseButton>
								</template>
								<h4>Обычный</h4>
								<p>Стандартный popover</p>
							</BasePopover>
							<BasePopover position="bottom" variant="accent">
								<template #trigger>
									<BaseButton variant="primary" size="sm">Accent</BaseButton>
								</template>
								<h4>Акцентный</h4>
								<p>Выделенный popover</p>
							</BasePopover>
							<BasePopover position="bottom" variant="dark">
								<template #trigger>
									<BaseButton variant="ghost" size="sm">Dark</BaseButton>
								</template>
								<h4>Тёмный</h4>
								<p>Тёмная тема popover</p>
							</BasePopover>
						</div>
					</div>

					<!-- Popover с контентом -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Popover — С контентом</h3>
						<div class="ui-kit-page__stack ui-kit-page__stack--horizontal">
							<BasePopover position="bottom">
								<template #trigger>
									<BaseButton variant="primary" size="sm">Профиль</BaseButton>
								</template>
								<h4>Иван Иванов</h4>
								<p>ivan@example.com</p>
							</BasePopover>
							<BasePopover position="bottom" variant="dark">
								<template #trigger>
									<BaseButton variant="outline" size="sm">Действия</BaseButton>
								</template>
								<p>📋 Копировать</p>
								<p>✏️ Редактировать</p>
								<p style="color: #f87171">🗑 Удалить</p>
							</BasePopover>
						</div>
					</div>

					<!-- Модальные окна — размеры -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Modal — Размеры</h3>
						<div class="ui-kit-page__stack ui-kit-page__stack--horizontal">
							<BaseButton variant="outline" size="sm" @click="isModalSmOpen = true">SM</BaseButton>
							<BaseButton variant="primary" size="sm" @click="isModalOpen = true">MD</BaseButton>
							<BaseButton variant="outline" size="sm" @click="isModalLgOpen = true">LG</BaseButton>
							<BaseButton variant="outline" size="sm" @click="isModalXlOpen = true">XL</BaseButton>
						</div>
					</div>

					<!-- Модальные окна — варианты -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Modal — Варианты</h3>
						<div class="ui-kit-page__stack ui-kit-page__stack--horizontal">
							<BaseButton variant="primary" size="sm" @click="isModalOpen = true">Default</BaseButton>
							<BaseButton variant="outline" size="sm" @click="isConfirmModalOpen = true">Confirm</BaseButton>
							<BaseButton variant="outline" size="sm" @click="isFormModalOpen = true">Form</BaseButton>
							<BaseButton variant="ghost" size="sm" @click="isInfoModalOpen = true">Info</BaseButton>
						</div>
					</div>

					<!-- Slideover — Стороны -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Slideover — Стороны</h3>
						<div class="ui-kit-page__stack ui-kit-page__stack--horizontal">
							<BaseButton variant="primary" size="sm" @click="isSlideoverRightOpen = true">Справа</BaseButton>
							<BaseButton variant="outline" size="sm" @click="isSlideoverLeftOpen = true">Слева</BaseButton>
						</div>
					</div>

					<!-- Slideover — Размеры и контент -->
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Slideover — Размеры</h3>
						<div class="ui-kit-page__stack ui-kit-page__stack--horizontal">
							<BaseButton variant="outline" size="sm" @click="isSlideoverWideOpen = true">Широкий (LG)</BaseButton>
							<BaseButton variant="ghost" size="sm" @click="isSlideoverFormOpen = true">С формой</BaseButton>
						</div>
					</div>
				</div>
			</section>

			<!-- Navigation -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Accordion, Tabs & MegaMenu</h2>
				<div class="ui-kit-page__grid ui-kit-page__grid--vertical">
					<div class="ui-kit-page__column" style="width: 100%">
						<h3 class="ui-kit-page__small-title">Tabs</h3>
						<div class="ui-kit-page__stack">
							<BaseTabs v-model="activeTab" :items="tabItems">
								<div
									style="
										padding: 16px;
										border: 1px solid var(--color-border);
										border-top: none;
										border-radius: 0 0 8px 8px;
									">
									Контент таба: {{ activeTab }}
								</div>
							</BaseTabs>
							<BaseTabs v-model="activeTabPills" :items="tabItems" variant="pills" />
						</div>
					</div>

					<div class="ui-kit-page__column" style="width: 100%">
						<h3 class="ui-kit-page__small-title">Accordion Variants</h3>
						<div class="ui-kit-page__stack">
							<BaseAccordion :items="accordionItems" />
							<BaseAccordion variant="ghost" :items="accordionItems" />
							<BaseAccordion variant="bordered" :items="accordionItems" />
						</div>
					</div>

					<div class="ui-kit-page__column" style="width: 100%">
						<h3 class="ui-kit-page__small-title">Mega Menu (3 Levels)</h3>
						<BaseMegaMenu :columns="megaMenuColumns" />
					</div>
				</div>
			</section>

			<!-- Transitions -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Transition Variations</h2>
				<div class="ui-kit-page__grid">
					<div v-for="t in transitions" :key="t.name" class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">{{ t.name }}</h3>
						<BaseButton variant="outline" @click="t.visible = !t.visible">Toggle</BaseButton>
						<BaseAnimation :name="t.name" :show="t.visible">
							<div class="ui-kit-page__box">
								{{ t.name }}
							</div>
						</BaseAnimation>
					</div>
				</div>
			</section>

			<!-- Chip (Badge Wrapper) -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Chip — Обёртка с индикатором</h2>
				<div class="ui-kit-page__grid">
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Позиции индикатора</h3>
						<div class="ui-kit-page__stack ui-kit-page__stack--horizontal">
							<BaseChip :content="5" placement="top-right">
								<BaseButton variant="outline">🛒 Корзина</BaseButton>
							</BaseChip>
							<BaseChip :content="3" placement="top-left">
								<BaseButton variant="outline">Уведомления</BaseButton>
							</BaseChip>
							<BaseChip :content="12" placement="bottom-right">
								<BaseButton variant="outline">Сообщения</BaseButton>
							</BaseChip>
							<BaseChip :content="1" placement="bottom-left">
								<BaseButton variant="outline">Задачи</BaseButton>
							</BaseChip>
						</div>
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Цвета и размеры</h3>
						<div class="ui-kit-page__stack ui-kit-page__stack--horizontal">
							<BaseChip v-for="v in chipVariants" :key="v" :content="7" :variant="v">
								<BaseButton variant="outline">{{ v }}</BaseButton>
							</BaseChip>
						</div>
						<div class="ui-kit-page__stack ui-kit-page__stack--horizontal" style="margin-top: 12px">
							<BaseChip content="99" size="sm">
								<BaseButton variant="outline">SM</BaseButton>
							</BaseChip>
							<BaseChip content="99" size="md">
								<BaseButton variant="outline">MD</BaseButton>
							</BaseChip>
							<BaseChip content="99" size="lg">
								<BaseButton variant="outline">LG</BaseButton>
							</BaseChip>
						</div>
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Переполнение и скрытие</h3>
						<div class="ui-kit-page__stack ui-kit-page__stack--horizontal">
							<BaseChip :content="150" :max-value="99">
								<BaseButton variant="outline">150 → 99+</BaseButton>
							</BaseChip>
							<BaseChip :content="0">
								<BaseButton variant="outline">0 (скрыт)</BaseButton>
							</BaseChip>
							<BaseChip :content="0" :is-hidden-on-zero="false">
								<BaseButton variant="outline">0 (видим)</BaseButton>
							</BaseChip>
							<BaseChip content="new">
								<BaseButton variant="outline">Текст</BaseButton>
							</BaseChip>
						</div>
					</div>
				</div>
			</section>

			<!-- Slider (Carousel) -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Slider — Карусель изображений и видео</h2>
				<div class="ui-kit-page__grid ui-kit-page__grid--vertical">
					<div class="ui-kit-page__column" style="width: 100%">
						<h3 class="ui-kit-page__small-title">Slide анимация (с видео, автопроигрывание)</h3>
						<BaseSlider
							animation="slide"
							navigation="dots"
							:has-arrows="true"
							:is-autoplay="true"
							:autoplay-interval="3000"
							:items="sliderItems"
							height="400px" />
					</div>

					<div class="ui-kit-page__column" style="width: 100%">
						<h3 class="ui-kit-page__small-title">Fade анимация (стрелки сверху справа)</h3>
						<BaseSlider
							animation="fade"
							navigation="dots"
							:has-arrows="true"
							arrows-position="top-right"
							:items="sliderItems"
							height="400px" />
					</div>

					<div class="ui-kit-page__column" style="width: 100%">
						<h3 class="ui-kit-page__small-title">Flip анимация + Миниатюры (без стрелок)</h3>
						<BaseSlider
							animation="flip"
							navigation="thumbnails"
							:has-arrows="false"
							:items="sliderItems"
							height="400px" />
					</div>
				</div>
			</section>

			<!-- Image (Optimized) -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Image — Оптимизированное изображение</h2>
				<div class="ui-kit-page__grid ui-kit-page__grid--vertical">
					<div class="ui-kit-page__column" style="width: 100%">
						<h3 class="ui-kit-page__small-title">Режимы заполнения</h3>
						<div class="ui-kit-page__stack ui-kit-page__stack--horizontal">
							<div v-for="fit in imageFits" :key="fit" style="text-align: center">
								<BaseImage
									:src="'https://picsum.photos/200/200?random=' + fit"
									:alt="fit"
									:fit="fit"
									width="120"
									height="120"
									border-radius="md" />
								<span style="font-size: 11px; color: var(--color-text-muted)">{{ fit }}</span>
							</div>
						</div>
					</div>

					<div class="ui-kit-page__column" style="width: 100%">
						<h3 class="ui-kit-page__small-title">Скругления</h3>
						<div class="ui-kit-page__stack ui-kit-page__stack--horizontal">
							<div v-for="r in imageRadiuses" :key="r" style="text-align: center">
								<BaseImage
									:src="'https://picsum.photos/200/200?random=r' + r"
									:alt="r"
									fit="cover"
									width="100"
									height="100"
									:border-radius="r" />
								<span style="font-size: 11px; color: var(--color-text-muted)">{{ r }}</span>
							</div>
						</div>
					</div>

					<div class="ui-kit-page__column" style="width: 100%">
						<h3 class="ui-kit-page__small-title">Аспектное соотношение</h3>
						<div class="ui-kit-page__stack ui-kit-page__stack--horizontal">
							<BaseImage
								src="https://picsum.photos/400/300?random=ar1"
								alt="16/9"
								fit="cover"
								aspect-ratio="16/9"
								border-radius="md"
								style="width: 200px" />
							<BaseImage
								src="https://picsum.photos/300/400?random=ar2"
								alt="1/1"
								fit="cover"
								aspect-ratio="1/1"
								border-radius="md"
								style="width: 120px" />
						</div>
					</div>
				</div>
			</section>

			<!-- Progress -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Progress — Шкала заполненности</h2>

				<div class="ui-kit-page__progress-control">
					<span class="ui-kit-page__progress-control-label">Значение: {{ progressValue }}%</span>
					<BaseRange v-model="progressValue" :min="0" :max="100" :step="1" variant="primary" />
				</div>

				<div class="ui-kit-page__grid ui-kit-page__grid--progress">
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Линейный — Цвета</h3>
						<div class="ui-kit-page__stack">
							<BaseProgress
								v-for="v in progressVariants"
								:key="v"
								:value="progressValue"
								:variant="v"
								shape="line"
								:has-label="true" />
						</div>
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Линейный — Анимации</h3>
						<div class="ui-kit-page__stack">
							<BaseProgress :value="progressValue" animation="striped" :has-label="true" />
							<BaseProgress :value="progressValue" animation="pulse" variant="success" :has-label="true" />
							<BaseProgress :value="progressValue" animation="glow" variant="info" :has-label="true" />
							<BaseProgress :value="30" :is-indeterminate="true" />
						</div>
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Размеры (линейный)</h3>
						<div class="ui-kit-page__stack">
							<BaseProgress :value="progressValue" :size-scale="50" :has-label="true" />
							<BaseProgress :value="progressValue" :size-scale="75" :has-label="true" />
							<BaseProgress :value="progressValue" :size-scale="100" :has-label="true" />
							<BaseProgress :value="progressValue" :size-scale="150" :has-label="true" />
						</div>
					</div>

					<!-- Круговой — на всю ширину -->
					<div class="ui-kit-page__column ui-kit-page__column--full">
						<h3 class="ui-kit-page__small-title">Круговой — Цвета</h3>
						<div class="ui-kit-page__progress-circles">
							<BaseProgress
								v-for="v in progressVariants"
								:key="'c-' + v"
								:value="progressValue"
								:variant="v"
								shape="circle"
								:size-scale="100"
								:has-label="true" />
						</div>
					</div>
				</div>
			</section>

			<!-- Separator -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Separator — Разделитель</h2>
				<div class="ui-kit-page__grid">
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Толщина и стиль</h3>
						<div class="ui-kit-page__stack">
							<BaseSeparator :thickness="1" />
							<BaseSeparator :thickness="2" />
							<BaseSeparator :thickness="3" />
							<BaseSeparator :is-dashed="true" />
							<BaseSeparator :thickness="5" />
						</div>
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">С меткой</h3>
						<div class="ui-kit-page__stack">
							<BaseSeparator label="ИЛИ" />
							<BaseSeparator label="Глава 2" />
							<BaseSeparator label="• • •" :thickness="1" />
						</div>
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Со слотом</h3>
						<div class="ui-kit-page__stack">
							<BaseSeparator>
								<span style="color: var(--color-accent);">●</span>
							</BaseSeparator>
							<BaseSeparator>
								<span style="color: var(--color-accent);">✦</span>
							</BaseSeparator>
							<BaseSeparator>
								<span style="letter-spacing: 4px; color: var(--color-text-muted);">• • •</span>
							</BaseSeparator>
						</div>
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Вертикальный</h3>
						<div style="display: flex; align-items: center; gap: 16px; height: 120px">
							<span>Слева</span>
							<BaseSeparator orientation="vertical" />
							<span>По центру</span>
							<BaseSeparator orientation="vertical">
								<span style="color: var(--color-accent);">●</span>
							</BaseSeparator>
							<span>Справа</span>
						</div>
					</div>
				</div>
			</section>

			<!-- Editor -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Editor — Текстовый редактор</h2>
				<div class="ui-kit-page__grid">
					<div class="ui-kit-page__column" style="grid-column: 1 / -1">
						<h3 class="ui-kit-page__small-title">Полный редактор</h3>
						<BaseEditor v-model="editorContent" placeholder="Начните вводить текст..." :has-toolbar="true" />
						<div style="margin-top: 16px; padding: 16px; border: 1px dashed var(--color-border); border-radius: 8px">
							<h4 style="margin-top: 0; margin-bottom: 8px; color: var(--color-text-muted)">Превью контента:</h4>
							<div v-html="editorContent"></div>
						</div>
					</div>

					<div class="ui-kit-page__column" style="grid-column: 1 / -1">
						<h3 class="ui-kit-page__small-title">Только чтение</h3>
						<BaseEditor
							model-value="<h2>Заголовок</h2><p>Это <strong>жирный</strong> текст с <em>курсивом</em> и <a href='#'>ссылкой</a>.</p><pre><code>const x = 42;</code></pre>"
							:is-readonly="true"
							:has-toolbar="false" />
					</div>
				</div>
			</section>

			<!-- Search -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Search — Окно поиска</h2>
				<div class="ui-kit-page__grid">
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Outline (с результатами)</h3>
						<BaseSearch
							v-model="searchQuery"
							variant="outline"
							:results="searchResults"
							:is-loading="isSearchLoading"
							placeholder="Поиск картин..."
							@search="handleSearch"
							@select="handleSearchSelect" />
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">В модальном окне</h3>
						<BaseButton variant="outline" @click="isSearchModalOpen = true">Открыть поиск</BaseButton>
						<BaseModal :is-open="isSearchModalOpen" title="Поиск по сайту" size="lg" @close="isSearchModalOpen = false">
							<BaseSearch
								v-model="searchQueryModal"
								variant="filled"
								:size-scale="150"
								:is-autofocus="true"
								:results="searchResults"
								:is-loading="isSearchLoading"
								placeholder="Что вы ищете?"
								@search="handleSearch"
								@select="handleSearchSelectModal" />
						</BaseModal>
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Underline</h3>
						<BaseSearch variant="underline" :size-scale="150" placeholder="Введите запрос..." :results="[]" />
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Размеры</h3>
						<div class="ui-kit-page__stack">
							<BaseSearch :size-scale="75" placeholder="Small search" :results="[]" />
							<BaseSearch :size-scale="100" placeholder="Medium search" :results="[]" />
							<BaseSearch :size-scale="150" placeholder="Large search" :results="[]" />
						</div>
					</div>
				</div>
			</section>

			<!-- Range -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Range — Гибкий слайдер</h2>
				<div class="ui-kit-page__grid">
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Одиночный — Варианты</h3>
						<div class="ui-kit-page__stack">
							<BaseRange v-model="rangeValue" variant="primary" :has-label="true" />
							<BaseRange v-model="rangeValue" variant="accent" :has-tooltip="true" />
							<BaseRange v-model="rangeValue" variant="success" />
							<BaseRange v-model="rangeValue" variant="warning" />
							<BaseRange v-model="rangeValue" variant="error" />
						</div>
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Диапазон (двойной)</h3>
						<div class="ui-kit-page__stack">
							<BaseRange v-model:range-value="rangeDual" variant="accent" :has-label="true" />
							<BaseRange v-model:range-value="rangeDual" variant="primary" :has-tooltip="true" />
						</div>
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Размеры</h3>
						<div class="ui-kit-page__stack">
							<BaseRange v-model="rangeValue" :size-scale="75" variant="accent" :has-label="true" />
							<BaseRange v-model="rangeValue" :size-scale="100" variant="accent" :has-label="true" />
							<BaseRange v-model="rangeValue" :size-scale="150" variant="accent" :has-label="true" />
						</div>
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">С метками</h3>
						<div class="ui-kit-page__stack">
							<BaseRange v-model="rangeValue" variant="accent" :has-tooltip="true" :marks="rangeMarks" />
						</div>
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Шаг и ограничения</h3>
						<div class="ui-kit-page__stack">
							<BaseRange v-model="rangeStep" :min="0" :max="1000" :step="50" variant="primary" :has-label="true" />
							<BaseRange v-model="rangeValue" :is-disabled="true" variant="error" />
						</div>
					</div>
				</div>
			</section>

			<!-- Table -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Table — Таблица</h2>
				<div class="ui-kit-page__grid">
					<!-- Резиновые колонки + кастомные ячейки -->
					<div class="ui-kit-page__column" style="grid-column: 1 / -1">
						<h3 class="ui-kit-page__small-title">Резиновые колонки + кастомные ячейки (слоты)</h3>
						<BaseTable
							:columns="flexColumns"
							:rows="tableRows"
							variant="default"
							:has-search="true"
							:has-row-number="true"
							:page-size="5">
							<template #cell-status="{ value }">
								<span
									class="ui-kit-page__status-badge"
									:class="`ui-kit-page__status-badge--${getStatusColor(String(value))}`">
									{{ value }}
								</span>
							</template>
							<template #cell-price="{ value }">
								<strong>{{ value }} ₽</strong>
							</template>
							<template #header-price="{ column }">
								<span style="color: var(--color-accent)">💰 {{ column.label }}</span>
							</template>
						</BaseTable>
					</div>

					<!-- Bordered + мульти-сортировка + компактные фильтры -->
					<div class="ui-kit-page__column" style="grid-column: 1 / -1">
						<h3 class="ui-kit-page__small-title">Bordered + мульти-сортировка + фильтры</h3>
						<BaseTable
							:columns="tableColumns"
							:rows="tableRows"
							variant="bordered"
							:has-filters="true"
							:is-multi-sort="true"
							:has-column-settings="true" />
					</div>

					<!-- Striped + выделение + вложенные строки -->
					<div class="ui-kit-page__column" style="grid-column: 1 / -1">
						<h3 class="ui-kit-page__small-title">Striped + выделение + вложенные строки</h3>
						<BaseTable :columns="tableColumns" :rows="tableNestedRows" variant="striped" :is-selectable="true" />
					</div>

					<!-- Вложенная таблица -->
					<div class="ui-kit-page__column" style="grid-column: 1 / -1">
						<h3 class="ui-kit-page__small-title">Вложенная таблица (nestedConfig)</h3>
						<BaseTable
							:columns="tableColumns"
							:rows="tableNestedRows"
							variant="default"
							:nested-config="nestedTableConfig" />
					</div>

					<!-- Infinite scroll -->
					<div class="ui-kit-page__column" style="grid-column: 1 / -1">
						<h3 class="ui-kit-page__small-title">Infinite scroll + подгрузка</h3>
						<BaseTable
							:columns="tableColumns"
							:rows="tableRows"
							variant="default"
							load-mode="infinite"
							:has-more="tableHasMore"
							:is-loading="tableIsLoading"
							height="300px"
							@load-more="handleTableLoadMore" />
					</div>

					<!-- Кнопка "Загрузить еще" -->
					<div class="ui-kit-page__column" style="grid-column: 1 / -1">
						<h3 class="ui-kit-page__small-title">Load more (кнопка)</h3>
						<BaseTable
							:columns="tableColumns"
							:rows="tableRows"
							variant="bordered"
							load-mode="button"
							:has-more="tableHasMore"
							:is-loading="tableIsLoading"
							@load-more="handleTableLoadMore" />
					</div>
				</div>
			</section>

			<!-- Chat -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Chat — Чат (базовые стили)</h2>
				<div class="ui-kit-page__grid">
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Bubble стиль</h3>
						<BaseChat
							variant="bubble"
							title="Поддержка"
							subtitle="Онлайн"
							:messages="chatMessages"
							:has-input="true"
							:has-voice-input="true"
							:has-attach-input="true"
							:has-header="true"
							height="400px"
							@send="handleChatSend" />
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Modern стиль</h3>
						<BaseChat
							variant="modern"
							title="Дизайнер"
							subtitle="печатает..."
							:messages="chatMessages"
							:has-input="true"
							:has-voice-input="true"
							:has-header="true"
							height="400px"
							@send="handleChatSend" />
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Minimal стиль</h3>
						<BaseChat
							variant="minimal"
							title="Менеджер"
							:messages="chatMessages"
							:has-input="true"
							:has-header="true"
							height="400px"
							@send="handleChatSend" />
					</div>
				</div>
			</section>

			<!-- Chat Variations -->
			<section class="ui-kit-page__section">
				<h2 class="ui-kit-page__subtitle">Chat — Вариации</h2>
				<div class="ui-kit-page__grid">
					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Support — Поддержка</h3>
						<BaseChat
							variant="support"
							title="Поддержка"
							:is-operator-online="true"
							:quick-replies="supportQuickReplies"
							:messages="supportMessages"
							:has-input="true"
							:has-header="true"
							height="400px"
							@send="handleChatSend"
							@quick-reply="handleQuickReply" />
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Sidebar — Боковая панель</h3>
						<div style="height: 400px; max-width: 320px">
							<BaseChat
								variant="sidebar"
								title="Сообщения"
								:messages="chatMessages"
								:has-input="true"
								:has-header="true"
								height="100%"
								@send="handleChatSend" />
						</div>
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Thread — Треды</h3>
						<BaseChat
							variant="thread"
							title="Обсуждение"
							:messages="threadMessages"
							:has-input="true"
							:has-header="true"
							height="400px"
							@send="handleChatSend"
							@reply="handleThreadReply" />
					</div>

					<div class="ui-kit-page__column">
						<h3 class="ui-kit-page__small-title">Feed — Лента</h3>
						<BaseChat
							variant="feed"
							title="Лента"
							:messages="feedMessages"
							:has-input="true"
							:has-header="true"
							height="400px"
							@send="handleChatSend"
							@reaction="handleReaction" />
					</div>
				</div>
			</section>
		</div>

		<!-- Modal SM -->
		<BaseModal :is-open="isModalSmOpen" title="Малое окно" size="sm" @close="isModalSmOpen = false">
			<p>Компактное модальное окно для коротких сообщений.</p>
			<template #footer>
				<BaseButton variant="outline" size="sm" @click="isModalSmOpen = false">Закрыть</BaseButton>
			</template>
		</BaseModal>

		<!-- Modal MD (default) -->
		<BaseModal :is-open="isModalOpen" title="Базовое окно" size="md" @close="isModalOpen = false">
			<p>Стандартное модальное окно среднего размера. Подходит для большинства случаев.</p>
			<template #footer>
				<BaseButton variant="outline" size="sm" @click="isModalOpen = false">Отмена</BaseButton>
				<BaseButton variant="primary" size="sm" @click="isModalOpen = false">ОК</BaseButton>
			</template>
		</BaseModal>

		<!-- Modal LG -->
		<BaseModal :is-open="isModalLgOpen" title="Широкое окно" size="lg" @close="isModalLgOpen = false">
			<p>
				Увеличенное модальное окно для контента, требующего больше пространства: таблицы, диаграммы, детальная
				информация.
			</p>
			<template #footer>
				<BaseButton variant="outline" size="sm" @click="isModalLgOpen = false">Закрыть</BaseButton>
			</template>
		</BaseModal>

		<!-- Modal XL -->
		<BaseModal :is-open="isModalXlOpen" title="Полноэкранное окно" size="xl" @close="isModalXlOpen = false">
			<p>Максимально широкое модальное окно для сложных интерфейсов: редакторы, галереи, дашборды.</p>
			<template #footer>
				<BaseButton variant="outline" size="sm" @click="isModalXlOpen = false">Закрыть</BaseButton>
			</template>
		</BaseModal>

		<!-- Modal Confirm -->
		<BaseModal
			:is-open="isConfirmModalOpen"
			title="Подтверждение действия"
			variant="confirm"
			size="sm"
			@close="isConfirmModalOpen = false">
			<p>Вы уверены, что хотите удалить этот элемент? Это действие нельзя отменить.</p>
			<template #footer>
				<BaseButton variant="outline" size="sm" @click="isConfirmModalOpen = false">Отмена</BaseButton>
				<BaseButton variant="primary" size="sm" @click="isConfirmModalOpen = false">Удалить</BaseButton>
			</template>
		</BaseModal>

		<!-- Modal Form -->
		<BaseModal :is-open="isFormModalOpen" title="Оформление заказа" variant="default" @close="isFormModalOpen = false">
			<div class="ui-kit-page__stack">
				<BaseInput v-model="formData.name" label="Имя" placeholder="Введите имя" />
				<BaseInput v-model="formData.email" label="Email" placeholder="example@mail.com" />
				<BaseTextarea v-model="formData.description" label="Комментарий" placeholder="Ваш комментарий" />
			</div>
			<template #footer>
				<BaseButton variant="outline" size="sm" @click="isFormModalOpen = false">Отмена</BaseButton>
				<BaseButton variant="primary" size="sm" @click="isFormModalOpen = false">Отправить</BaseButton>
			</template>
		</BaseModal>

		<!-- Modal Info -->
		<BaseModal :is-open="isInfoModalOpen" title="Информация" variant="info" @close="isInfoModalOpen = false">
			<p>
				Это информационное модальное окно. Используется для отображения справки, подсказок и уведомлений пользователю.
			</p>
			<template #footer>
				<BaseButton variant="outline" size="sm" @click="isInfoModalOpen = false">Понятно</BaseButton>
			</template>
		</BaseModal>

		<!-- Slideover Right -->
		<BaseSlideover
			:is-open="isSlideoverRightOpen"
			title="Панель справа"
			side="right"
			:width="100"
			@close="isSlideoverRightOpen = false">
			<p>Боковая панель, выезжающая справа. Подходит для фильтров, настроек и дополнительной информации.</p>
		</BaseSlideover>

		<!-- Slideover Left -->
		<BaseSlideover
			:is-open="isSlideoverLeftOpen"
			title="Панель слева"
			side="left"
			:width="75"
			@close="isSlideoverLeftOpen = false">
			<p>Боковая панель, выезжающая слева. Можно использовать для навигации.</p>
		</BaseSlideover>

		<!-- Slideover Wide -->
		<BaseSlideover
			:is-open="isSlideoverWideOpen"
			title="Широкая панель"
			side="right"
			:width="150"
			@close="isSlideoverWideOpen = false">
			<p>
				Увеличенная боковая панель для контента, требующего больше пространства: таблицы, диаграммы, детальная
				информация.
			</p>
			<template #footer>
				<BaseButton variant="outline" size="sm" @click="isSlideoverWideOpen = false">Закрыть</BaseButton>
			</template>
		</BaseSlideover>

		<!-- Slideover Form -->
		<BaseSlideover
			:is-open="isSlideoverFormOpen"
			title="Оформление заказа"
			side="right"
			:width="100"
			@close="isSlideoverFormOpen = false">
			<div class="ui-kit-page__stack">
				<BaseInput v-model="formData.name" label="Имя" placeholder="Введите имя" />
				<BaseInput v-model="formData.email" label="Email" placeholder="example@mail.com" />
				<BaseTextarea v-model="formData.description" label="Комментарий" placeholder="Ваш комментарий" />
			</div>
			<template #footer>
				<BaseButton variant="outline" size="sm" @click="isSlideoverFormOpen = false">Отмена</BaseButton>
				<BaseButton variant="primary" size="sm" @click="isSlideoverFormOpen = false">Отправить</BaseButton>
			</template>
		</BaseSlideover>

		<!-- Notifications Stack -->
		<BaseNotification ref="notificationRef" />
	</div>
</template>

<script setup lang="ts">
import { BaseAccordion } from '@/shared/ui/BaseAccordion'
import { BaseAnimation, type TransitionName } from '@/shared/ui/BaseAnimation'
import { BaseAvatar } from '@/shared/ui/BaseAvatar'
import { BaseBadge } from '@/shared/ui/BaseBadge'
import { BaseButton } from '@/shared/ui/BaseButton'
import { BaseCard } from '@/shared/ui/BaseCard'
import { BaseChat, type ChatMessage, type ChatQuickReply } from '@/shared/ui/BaseChat'
import { BaseCheckbox } from '@/shared/ui/BaseCheckbox'
import { BaseChip } from '@/shared/ui/BaseChip'
import { BaseEditor } from '@/shared/ui/BaseEditor'
import { BaseFileUpload } from '@/shared/ui/BaseFileUpload'
import { BaseForm } from '@/shared/ui/BaseForm'
import { BaseFormField } from '@/shared/ui/BaseFormField'
import { BaseImage } from '@/shared/ui/BaseImage'
import { BaseInput } from '@/shared/ui/BaseInput'
import { BaseMegaMenu } from '@/shared/ui/BaseMegaMenu'
import { BaseMenu } from '@/shared/ui/BaseMenu'
import { BaseModal } from '@/shared/ui/BaseModal'
import { BaseNotification } from '@/shared/ui/BaseNotification'
import { BasePagination } from '@/shared/ui/BasePagination'
import { BasePin } from '@/shared/ui/BasePin'
import { BasePopover } from '@/shared/ui/BasePopover'
import { BaseProgress } from '@/shared/ui/BaseProgress'
import { BaseRadio } from '@/shared/ui/BaseRadio'
import { BaseRange, type RangeMark } from '@/shared/ui/BaseRange'
import { BaseSearch, type SearchResult } from '@/shared/ui/BaseSearch'
import { BaseSelect } from '@/shared/ui/BaseSelect'
import { BaseSeparator } from '@/shared/ui/BaseSeparator'
import { BaseSkeleton } from '@/shared/ui/BaseSkeleton'
import { BaseSlideover } from '@/shared/ui/BaseSlideover'
import { BaseSlider, type SliderItem } from '@/shared/ui/BaseSlider'
import { BaseStepper } from '@/shared/ui/BaseStepper'
import { BaseSwitch } from '@/shared/ui/BaseSwitch'
import { BaseTable, type NestedTableConfig, type TableColumn, type TableRow } from '@/shared/ui/BaseTable'
import { BaseTabs } from '@/shared/ui/BaseTabs'
import { BaseTextarea } from '@/shared/ui/BaseTextarea'
import { BaseTooltip } from '@/shared/ui/BaseTooltip'
import { reactive, ref } from 'vue'
import './UiKitPage.style.scss'

// State
const isModalOpen = ref(false)
const isModalSmOpen = ref(false)
const isModalLgOpen = ref(false)
const isModalXlOpen = ref(false)
const isConfirmModalOpen = ref(false)
const isFormModalOpen = ref(false)
const isInfoModalOpen = ref(false)
const isSlideoverRightOpen = ref(false)
const isSlideoverLeftOpen = ref(false)
const isSlideoverWideOpen = ref(false)
const isSlideoverFormOpen = ref(false)
const isSearchModalOpen = ref(false)
const currentStep = ref(1)
const currentPage = ref(1)
const currentPageSmall = ref(1)
const currentPageLarge = ref(1)
const currentStepVertical = ref(2)
const currentStepIcons = ref(1)
const currentStepDisabled = ref(1)
const currentStepCompleted = ref(4)
const notificationRef = ref<any>(null)

interface TransitionItem {
	name: TransitionName
	visible: boolean
}

const transitions = reactive<TransitionItem[]>([
	{ name: 'fade', visible: true },
	{ name: 'slide-up', visible: true },
	{ name: 'slide-down', visible: true },
	{ name: 'scale', visible: true },
])

const formData = reactive({
	name: '',
	email: '',
	phone: '',
	phoneRu: '',
	phoneKz: '',
	phoneBy: '',
	phoneUa: '',
	date: '',
	passport: '',
	card: '',
	time: '',
	description: '',
	widthMm: '',
	price: '',
	weight: '',
	select: 'msk',
	multiSelect: ['animals'],
	pin: '',
	radio: '1',
	checkbox1: true,
	switch1: true,
})

// Data for variations
const brandColors = [
	{ name: 'Accent', value: 'var(--color-accent)', hex: '#f97316' },
	{ name: 'Primary', value: 'var(--color-primary)', hex: '#18181b' },
	{ name: 'Success', value: 'var(--color-success)', hex: '#22c55e' },
	{ name: 'Error', value: 'var(--color-error)', hex: '#ef4444' },
	{ name: 'Warning', value: 'var(--color-warning)', hex: '#f59e0b' },
	{ name: 'Info', value: 'var(--color-info)', hex: '#3b82f6' },
]

const buttonVariants = ['primary', 'secondary', 'outline', 'ghost'] as const
const cardVariants = ['default', 'outline', 'ghost'] as const
const badgeVariants = ['primary', 'secondary', 'success', 'warning', 'error', 'info'] as const

const selectOptions = [
	{ label: 'Москва', value: 'msk' },
	{ label: 'Санкт-Петербург', value: 'spb' },
]

const selectOptionsExtended = [
	{ label: 'Москва', value: 'msk' },
	{ label: 'Санкт-Петербург', value: 'spb' },
	{ label: 'Новосибирск', value: 'nsk' },
	{ label: 'Екатеринбург', value: 'ekb' },
	{ label: 'Казань', value: 'kzn' },
	{ label: 'Краснодар', value: 'krd' },
]

const selectOptionsWithIcons = [
	{ label: 'Живопись', value: 'painting', icon: '🎨' },
	{ label: 'Скульптура', value: 'sculpture', icon: '🗿' },
	{ label: 'Гравюра', value: 'engraving', icon: '🖼️' },
	{ label: 'Керамика', value: 'ceramics', icon: '🏺' },
]

const selectOptionsWithDesc = [
	{ label: 'Живопись', value: 'painting', icon: '🎨', description: 'Масло, акварель, темпера' },
	{ label: 'Скульптура', value: 'sculpture', icon: '🗿', description: 'Бронза, мрамор, дерево' },
	{ label: 'Гравюра', value: 'engraving', icon: '🖼️', description: 'Линогравюра, офорт' },
	{ label: 'Керамика', value: 'ceramics', icon: '🏺', description: 'Фарфор, глина, фаянс' },
]

const multiSelectOptions = [
	{ label: 'Животные', value: 'animals' },
	{ label: 'Природа', value: 'nature' },
	{ label: 'Абстракция', value: 'abstract' },
]

const radioOptions = [
	{ label: 'Вариант 1', value: '1' },
	{ label: 'Вариант 2', value: '2' },
	{ label: 'Вариант 3 (Disabled)', value: '3', isDisabled: true },
]

const accordionItems = [
	{ label: 'О компании', content: 'Мы создаем уникальные картины из металла с 2020 года.' },
	{ label: 'Доставка и оплата', content: 'Доставка по всей России. Оплата картой или при получении.' },
	{ label: 'Гарантия', content: 'Гарантия на все изделия 5 лет. Возврат в течение 14 дней.' },
]

const tabItems = [
	{ id: 'tab1', label: 'Описание', icon: '📝' },
	{ id: 'tab2', label: 'Характеристики', icon: '⚙️' },
	{ id: 'tab3', label: 'Отзывы', icon: '⭐' },
]
const activeTab = ref('tab1')
const activeTabPills = ref('tab1')

const megaMenuColumns = [
	{
		title: 'Каталог',
		items: [
			{
				label: 'Картины',
				children: [{ label: 'Животные' }, { label: 'Пейзажи' }, { label: 'Портреты' }],
			},
			{
				label: 'Панно',
				children: [{ label: 'Геометрия' }, { label: 'Карты мира' }],
			},
		],
	},
]

const stepperSteps = [
	{ label: 'Шаг 1', description: 'Личные данные' },
	{ label: 'Шаг 2', description: 'Адрес доставки' },
	{ label: 'Шаг 3', description: 'Оплата' },
]

const stepperStepsIcons = [
	{ label: 'Данные', description: 'Личные данные', icon: '📝' },
	{ label: 'Адрес', description: 'Адрес доставки', icon: '📍' },
	{ label: 'Оплата', description: 'Способ оплаты', icon: '💳' },
	{ label: 'Готово', description: 'Подтверждение', icon: '✅' },
]

const stepperStepsDisabled = [
	{ label: 'Данные', description: 'Заполнено' },
	{ label: 'Адрес', description: 'Недоступно', isDisabled: true },
	{ label: 'Оплата', description: 'Ожидание' },
]

const menuItems = [
	{ label: 'Профиль', icon: '👤' },
	{ label: 'Настройки', icon: '⚙️' },
	{ label: 'Выход', icon: '🚪' },
]

const menuItemsGrouped = [
	[
		{ label: 'Профиль', icon: '👤' },
		{ label: 'Настройки', icon: '⚙️' },
	],
	[
		{ label: 'Каталог', icon: '🖼' },
		{ label: 'Заказы', icon: '📦' },
		{ label: 'Избранное', icon: '❤️' },
	],
	[{ label: 'Выход', icon: '🚪' }],
]

const menuItemsDisabled = [
	{ label: 'Редактировать', icon: '✏️' },
	{ label: 'Копировать', icon: '📋' },
	{ label: 'Удалить', icon: '🗑', isDisabled: true },
	{ label: 'Архивировать', icon: '📁', isDisabled: true },
]

// Handlers
function handleFileChange(files: File[]) {
	console.log('Files changed:', files)
}

function addNotification(type: 'success' | 'error' | 'warning' | 'info') {
	notificationRef.value?.add({
		title: type.toUpperCase(),
		description: `This is a ${type} notification with progress bar.`,
		type,
		duration: 4000,
	})
}

function handlePinComplete(val: string) {
	notificationRef.value?.add({
		title: 'PIN Complete',
		description: `You entered: ${val}`,
		type: 'info',
		duration: 4000,
	})
}

// ===== Новые компоненты =====

// Chip
const chipVariants = ['primary', 'secondary', 'success', 'warning', 'error', 'info'] as const

// Slider
const sliderItems: SliderItem[] = [
	{
		src: 'https://www.w3schools.com/html/mov_bbb.mp4',
		type: 'video',
		poster: 'https://picsum.photos/800/400?random=vid',
		alt: 'Видео презентация',
		title: 'Процесс создания',
		description: 'Как мы делаем наши картины',
	},
	{
		src: 'https://picsum.photos/800/400?random=1',
		alt: 'Слайд 1',
		title: 'Искусство металла',
		description: 'Эксклюзивные работы',
	},
	{
		src: 'https://picsum.photos/800/400?random=2',
		alt: 'Слайд 2',
		title: 'Лазерная резка',
		description: 'Точность и красота',
	},
	{
		src: 'https://picsum.photos/800/400?random=3',
		alt: 'Слайд 3',
		title: 'Панно на стену',
		description: 'Уникальный декор',
	},
]

// Image
const imageFits = ['cover', 'contain', 'fill', 'none'] as const
const imageRadiuses = ['none', 'sm', 'md', 'lg', 'full'] as const

// Progress
const progressVariants = ['primary', 'secondary', 'success', 'warning', 'error', 'info'] as const
const progressValue = ref(65)

// Range
const rangeValue = ref(50)
const rangeDual = ref<[number, number]>([25, 75])
const rangeStep = ref(200)
const rangeMarks: RangeMark[] = [
	{ value: 0, label: '0' },
	{ value: 25, label: '25' },
	{ value: 50, label: '50' },
	{ value: 75, label: '75' },
	{ value: 100, label: '100' },
]

// Editor
const editorContent = ref('<p>Начните <strong>редактирование</strong> текста!</p>')

// Search
const searchQuery = ref('')
const searchQueryModal = ref('')
const isSearchLoading = ref(false)
const searchResults = ref<SearchResult[]>([])

function handleSearch(query: string): void {
	isSearchLoading.value = true
	setTimeout(() => {
		searchResults.value = [
			{
				id: 1,
				title: `Результат: ${query}`,
				description: 'Описание первого результата',
				icon: '🎨',
				category: 'Картины',
			},
			{ id: 2, title: `${query} — панно`, description: 'Металлическое панно', icon: '🖼', category: 'Панно' },
			{ id: 3, title: `${query} портрет`, description: 'Портрет из металла', icon: '👤', category: 'Портреты' },
		]
		isSearchLoading.value = false
	}, 600)
}

function handleSearchSelect(result: SearchResult): void {
	notificationRef.value?.add({
		title: 'Выбрано',
		description: result.title,
		type: 'info',
		duration: 3000,
	})
}

function handleSearchSelectModal(result: SearchResult): void {
	handleSearchSelect(result)
	isSearchModalOpen.value = false
}

// Chat
const chatMessages = ref<ChatMessage[]>([
	{
		id: 1,
		text: 'Здравствуйте! Чем могу помочь?',
		sender: 'other',
		time: '10:00',
		senderName: 'Менеджер',
		status: 'read',
	},
	{ id: 2, text: 'Хочу заказать картину из металла', sender: 'me', time: '10:01', status: 'delivered' },
	{
		id: 3,
		text: 'Отлично! У нас большой каталог. Какой размер интересует?',
		sender: 'other',
		time: '10:02',
		senderName: 'Менеджер',
		status: 'read',
	},
	{ id: 4, text: 'Примерно 60×40 см', sender: 'me', time: '10:03', status: 'read' },
	{
		id: 5,
		text: 'Пожалуйста, посмотрите варианты:',
		sender: 'other',
		time: '10:04',
		senderName: 'Менеджер',
		status: 'read',
	},
	{
		id: 6,
		imageUrl: 'https://picsum.photos/300/200?random=chat1',
		sender: 'other',
		time: '10:04',
		senderName: 'Менеджер',
	},
	{ id: 7, sender: 'system', text: 'Менеджер загрузил 3 файла', type: 'system', time: '10:05' },
	{ id: 8, text: 'Очень нравится первый вариант!', sender: 'me', time: '10:06', status: 'sent' },
	{
		id: 12,
		sender: 'other',
		type: 'link',
		text: 'Подробности на нашем сайте:',
		linkPreview: {
			url: 'https://example.com/catalog',
			title: 'Каталог металлических картин',
			description: 'Более 500 уникальных работ ручной работы',
			image: 'https://picsum.photos/120/120?random=link1',
		},
		time: '10:09',
		senderName: 'Менеджер',
	},
])

/** Support-чат: быстрые ответы */
const supportQuickReplies: ChatQuickReply[] = [
	{ label: 'Как заказать?', value: 'order' },
	{ label: 'Доставка', value: 'delivery' },
	{ label: 'Возврат', value: 'refund' },
	{ label: 'Прайс-лист', value: 'price' },
]

/** Support-чат: сообщения */
const supportMessages = ref<ChatMessage[]>([
	{
		id: 1,
		text: 'Здравствуйте! 👋 Чем могу помочь?',
		sender: 'other',
		time: '10:00',
		senderName: 'Оператор',
	},
	{ id: 2, text: 'Здравствуйте! Хочу узнать про доставку', sender: 'me', time: '10:01', status: 'read' },
	{
		id: 3,
		text: 'Доставка по России 3-5 дней, по Москве — на следующий день. Стоимость от 500 ₽',
		sender: 'other',
		time: '10:01',
		senderName: 'Оператор',
	},
])

/** Thread-чат: сообщения с ответами */
const threadMessages = ref<ChatMessage[]>([
	{
		id: 1,
		text: 'Какие материалы вы используете?',
		sender: 'other',
		time: '10:00',
		senderName: 'Клиент',
	},
	{ id: 2, text: 'Нержавеющая сталь и медь', sender: 'me', time: '10:01', status: 'read' },
	{
		id: 3,
		text: 'А есть варианты из латуни?',
		sender: 'other',
		time: '10:02',
		senderName: 'Клиент',
		replyToId: 2,
		replyToText: 'Нержавеющая сталь и медь',
		replyToName: 'Вы',
	},
	{
		id: 4,
		text: 'Да, латунь доступна под заказ. Срок изготовления 5-7 дней',
		sender: 'me',
		time: '10:03',
		status: 'read',
		replyToId: 3,
		replyToText: 'А есть варианты из латуни?',
		replyToName: 'Клиент',
	},
])

/** Feed-чат: сообщения с реакциями */
const feedMessages = ref<ChatMessage[]>([
	{
		id: 1,
		text: 'Новая коллекция «Космос» уже в каталоге! 🚀',
		sender: 'other',
		time: '09:00',
		senderName: 'MetalArt',
		reactions: [
			{ emoji: '🔥', count: 12, isMine: true },
			{ emoji: '❤️', count: 5 },
			{ emoji: '👏', count: 3 },
		],
	},
	{
		id: 2,
		imageUrl: 'https://picsum.photos/400/250?random=feed1',
		sender: 'other',
		time: '09:15',
		senderName: 'MetalArt',
		reactions: [
			{ emoji: '😍', count: 8, isMine: true },
			{ emoji: '🔥', count: 4 },
		],
	},
	{
		id: 3,
		text: 'Вау, потрясающая работа!',
		sender: 'me',
		time: '09:20',
		status: 'read',
		reactions: [{ emoji: '❤️', count: 2 }],
	},
])

function handleChatSend(text: string): void {
	chatMessages.value.push({
		id: Date.now(),
		text,
		sender: 'me',
		time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
		status: 'sent',
	})
}

function handleQuickReply(value: string): void {
	const reply = supportQuickReplies.find(r => r.value === value)
	supportMessages.value.push({
		id: Date.now(),
		text: reply?.label || value,
		sender: 'me',
		time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
		status: 'sent',
	})
}

function handleThreadReply(messageId: string | number): void {
	const msg = threadMessages.value.find(m => m.id === messageId)
	if (!msg) return
	threadMessages.value.push({
		id: Date.now(),
		text: 'Ответ на сообщение',
		sender: 'me',
		time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
		status: 'sent',
		replyToId: messageId,
		replyToText: msg.text || '',
		replyToName: msg.senderName || '',
	})
}

function handleReaction(payload: { messageId: string | number; emoji: string }): void {
	const msg = feedMessages.value.find(m => m.id === payload.messageId)
	if (!msg || !msg.reactions) return
	const existing = msg.reactions.find(r => r.emoji === payload.emoji)
	if (existing) {
		existing.isMine = !existing.isMine
		existing.count += existing.isMine ? 1 : -1
	} else {
		msg.reactions.push({ emoji: payload.emoji, count: 1, isMine: true })
	}
}

// ===== Table =====
const tableColumns: TableColumn[] = [
	{ key: 'name', label: 'Название', isSortable: true, isFilterable: true, isResizable: true, minWidth: '120px' },
	{ key: 'category', label: 'Категория', isSortable: true, isFilterable: true },
	{ key: 'price', label: 'Цена', isSortable: true, sortType: 'number', align: 'right' },
	{ key: 'status', label: 'Статус', isSortable: true, isFilterable: true },
	{ key: 'date', label: 'Дата', isSortable: true, sortType: 'date' },
]

/** Резиновые колонки с flex-коэффициентами */
const flexColumns: TableColumn[] = [
	{ key: 'name', label: 'Название', isSortable: true, flex: 3, minWidth: '140px' },
	{ key: 'category', label: 'Категория', isSortable: true, flex: 2, minWidth: '100px' },
	{ key: 'price', label: 'Цена', isSortable: true, sortType: 'number', align: 'right', flex: 1, minWidth: '90px' },
	{ key: 'status', label: 'Статус', isSortable: true, flex: 1, minWidth: '90px' },
	{ key: 'date', label: 'Дата', isSortable: true, sortType: 'date', flex: 1, minWidth: '90px' },
]

/** Цвет бейджа статуса */
function getStatusColor(status: string): string {
	if (status === 'В наличии') return 'success'
	if (status === 'Под заказ') return 'warning'
	if (status === 'Продано') return 'error'
	return 'default'
}

const tableRows = ref<TableRow[]>([
	{
		id: 1,
		data: { name: 'Панно «Листья»', category: 'Панно', price: '12 500', status: 'В наличии', date: '2024-01-15' },
	},
	{
		id: 2,
		data: { name: 'Картина «Закат»', category: 'Картины', price: '28 000', status: 'Под заказ', date: '2024-02-20' },
	},
	{
		id: 3,
		data: { name: 'Портрет «Дама»', category: 'Портреты', price: '35 000', status: 'В наличии', date: '2024-03-10' },
	},
	{ id: 4, data: { name: 'Панно «Дерево»', category: 'Панно', price: '9 800', status: 'Продано', date: '2024-01-28' } },
	{
		id: 5,
		data: { name: 'Картина «Море»', category: 'Картины', price: '22 000', status: 'В наличии', date: '2024-04-05' },
	},
	{
		id: 6,
		data: { name: 'Панно «Горы»', category: 'Панно', price: '15 300', status: 'Под заказ', date: '2024-02-14' },
	},
	{
		id: 7,
		data: { name: 'Портрет «Рыцарь»', category: 'Портреты', price: '42 000', status: 'В наличии', date: '2024-05-01' },
	},
	{
		id: 8,
		data: { name: 'Картина «Лес»', category: 'Картины', price: '18 500', status: 'Продано', date: '2024-03-22' },
	},
	{
		id: 9,
		data: { name: 'Панно «Цветы»', category: 'Панно', price: '11 200', status: 'В наличии', date: '2024-06-10' },
	},
	{
		id: 10,
		data: { name: 'Картина «Ночь»', category: 'Картины', price: '31 000', status: 'Под заказ', date: '2024-04-18' },
	},
])

const tableNestedRows = ref<TableRow[]>([
	{
		id: 1,
		data: { name: 'Панно «Листья»', category: 'Панно', price: '12 500', status: 'В наличии', date: '2024-01-15' },
		children: [
			{
				id: 101,
				data: { name: 'Лист клёна', category: 'Фрагмент', price: '3 200', status: 'Готов', date: '2024-01-10' },
			},
			{
				id: 102,
				data: { name: 'Лист дуба', category: 'Фрагмент', price: '3 500', status: 'Готов', date: '2024-01-12' },
			},
			{
				id: 103,
				data: { name: 'Лист берёзы', category: 'Фрагмент', price: '2 800', status: 'В работе', date: '2024-01-14' },
			},
		],
	},
	{
		id: 2,
		data: { name: 'Картина «Закат»', category: 'Картины', price: '28 000', status: 'Под заказ', date: '2024-02-20' },
		children: [
			{ id: 201, data: { name: 'Небо', category: 'Фрагмент', price: '8 000', status: 'Готов', date: '2024-02-15' } },
			{
				id: 202,
				data: { name: 'Горизонт', category: 'Фрагмент', price: '6 500', status: 'В работе', date: '2024-02-18' },
			},
		],
	},
	{
		id: 3,
		data: { name: 'Портрет «Дама»', category: 'Портреты', price: '35 000', status: 'В наличии', date: '2024-03-10' },
	},
	{ id: 4, data: { name: 'Панно «Дерево»', category: 'Панно', price: '9 800', status: 'Продано', date: '2024-01-28' } },
])

const nestedTableConfig: NestedTableConfig = {
	columns: [
		{ key: 'name', label: 'Элемент', isSortable: true },
		{ key: 'category', label: 'Тип' },
		{ key: 'price', label: 'Цена', align: 'right', sortType: 'number', isSortable: true },
		{ key: 'status', label: 'Статус' },
	],
	childrenKey: 'children',
	title: 'Составные элементы',
}

const tableIsLoading = ref(false)
const tableHasMore = ref(true)

function handleTableLoadMore(): void {
	if (tableIsLoading.value) return
	tableIsLoading.value = true
	setTimeout(() => {
		const newId = tableRows.value.length + 1
		tableRows.value.push({
			id: newId,
			data: {
				name: `Работа №${newId}`,
				category: 'Картины',
				price: `${(newId * 3500).toLocaleString('ru-RU')}`,
				status: newId % 2 === 0 ? 'В наличии' : 'Под заказ',
				date: '2024-06-15',
			},
		})
		if (newId >= 20) tableHasMore.value = false
		tableIsLoading.value = false
	}, 800)
}
</script>
