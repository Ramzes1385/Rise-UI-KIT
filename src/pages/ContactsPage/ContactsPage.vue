<template>
	<div class="contacts-page">
		<div class="contacts-page__container">
			<h1 class="contacts-page__title">Контакты</h1>
			<div class="contacts-page__grid">
				<div class="contacts-page__info">
					<div class="contacts-page__item">
						<h3 class="contacts-page__item-title">Адрес</h3>
						<p>г. Москва, ул. Металлургов, 15</p>
					</div>
					<div class="contacts-page__item">
						<h3 class="contacts-page__item-title">Телефон</h3>
						<p>+7 (999) 123-45-67</p>
					</div>
					<div class="contacts-page__item">
						<h3 class="contacts-page__item-title">Email</h3>
						<p>info@metalart.ru</p>
					</div>
				</div>

				<div class="contacts-page__form-wrapper">
					<h2 class="contacts-page__subtitle">Напишите нам</h2>
					<form class="contacts-page__form" @submit.prevent="handleSubmit">
						<BaseInput v-model="form.name" label="Имя" placeholder="Ваше имя" />
						<BaseInput v-model="form.email" label="Email" type="email" placeholder="your@email.com" />
						<BaseInput v-model="form.message" label="Сообщение" placeholder="Ваш вопрос" />
						<BaseButton type="submit" variant="primary">Отправить</BaseButton>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseButton } from '@/shared/ui/BaseButton'
import { BaseInput } from '@/shared/ui/BaseInput'
import { reactive } from 'vue'
import './ContactsPage.style.scss'

const form = reactive({
	name: '',
	email: '',
	message: '',
})

function handleSubmit(): void {
	alert('Сообщение отправлено!')
	form.name = ''
	form.email = ''
	form.message = ''
}
</script>
