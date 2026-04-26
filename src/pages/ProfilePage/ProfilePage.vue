<template>
	<div class="profile-page">
		<div class="profile-page__container">
			<h1 class="profile-page__title">Личный кабинет</h1>
			<div class="profile-page__content">
				<div class="profile-page__card">
					<h2 class="profile-page__subtitle">Профиль</h2>
					<p><strong>Имя:</strong> Иван Иванов</p>
					<p><strong>Email:</strong> ivan@example.com</p>
					<BaseButton variant="outline">Редактировать</BaseButton>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseButton } from '@/shared/ui/BaseButton'
import './ProfilePage.style.scss'
</script>
