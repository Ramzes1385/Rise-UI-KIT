<template>
	<footer class="footer">
		<div class="footer__container">
			<div class="footer__info">
				<span class="footer__logo">MetalArt</span>
				<p class="footer__text">Создаем уникальные картины из металла для вашего интерьера.</p>
			</div>

			<div class="footer__contacts">
				<h4 class="footer__title">Контакты</h4>
				<ul class="footer__list">
					<li class="footer__item">Тел: +7 (999) 123-45-67</li>
					<li class="footer__item">Email: info@metalart.ru</li>
					<li class="footer__item">Адрес: г. Москва, ул. Металлургов, 15</li>
				</ul>
			</div>

			<div class="footer__navigation">
				<h4 class="footer__title">Навигация</h4>
				<ul class="footer__list">
					<li class="footer__item footer__item--link" @click="$router.push({ name: 'home' })">Главная</li>
					<li class="footer__item footer__item--link" @click="$router.push({ name: 'catalog' })">Каталог</li>
					<li class="footer__item footer__item--link" @click="$router.push({ name: 'ui-kit' })">UI Kit</li>
				</ul>
			</div>

			<div class="footer__social">
				<h4 class="footer__title">Мы в соцсетях</h4>
				<div class="footer__social-links">
					<a href="#" class="footer__social-link">VK</a>
					<a href="#" class="footer__social-link">TG</a>
				</div>
			</div>
		</div>
		<div class="footer__bottom">
			<p class="footer__copy">&copy; 2024 MetalArt. Все права защищены.</p>
		</div>
	</footer>
</template>

<script setup lang="ts">
import './Footer.style.scss'
</script>
