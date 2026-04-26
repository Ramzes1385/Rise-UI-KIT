<template>
	<div class="main-layout">
		<Header />
		<main class="main-layout__content">
			<slot />
		</main>
		<Footer />
	</div>
</template>

<script setup lang="ts">
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'
import './MainLayout.style.scss'
</script>
