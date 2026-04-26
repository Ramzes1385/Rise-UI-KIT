<template>
	<header class="header">
		<div class="header__container">
			<BaseTooltip text="На главную" position="bottom">
				<router-link :to="{ name: 'home' }" class="header__logo">
					<span class="header__logo-text">MetalArt</span>
				</router-link>
			</BaseTooltip>

			<nav class="header__nav">
				<ul class="header__list">
					<li class="header__item">
						<router-link :to="{ name: 'catalog' }" class="header__link">Каталог</router-link>
					</li>
					<li class="header__item">
						<router-link :to="{ name: 'about' }" class="header__link">О нас</router-link>
					</li>
					<li class="header__item">
						<router-link :to="{ name: 'contacts' }" class="header__link">Контакты</router-link>
					</li>
				</ul>
			</nav>

			<div class="header__actions">
				<BaseButton variant="ghost" class="header__theme-toggle" @click="toggleTheme">
					{{ theme === 'dark' ? '☀️' : '🌙' }}
				</BaseButton>
				<router-link :to="{ name: 'profile' }" class="header__link header__link--profile"> Кабинет </router-link>
				<BaseButton class="header__button" variant="outline" @click="$router.push({ name: 'contacts' })">
					Связаться
				</BaseButton>
			</div>
		</div>
	</header>
</template>

<script setup lang="ts">
import { useTheme } from '@/app/providers'
import { BaseButton } from '@/shared/ui/BaseButton'
import { BaseTooltip } from '@/shared/ui/BaseTooltip'
import './Header.style.scss'

const { theme, toggleTheme } = useTheme()
</script>
