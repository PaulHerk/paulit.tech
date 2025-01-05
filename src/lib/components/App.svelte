<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import '../../app.css';
	import { activeComponent } from '../stores/activeComponent';
	import { slide } from 'svelte/transition';
	import { sineIn } from 'svelte/easing';
</script>

<div id="container">
	<div class="absolute right-0">
		{#if $activeComponent[1] !== 'null'}
			<div in:slide={{ easing: sineIn }} out:slide={{ duration: 300 }}>
				<svelte:component this={$activeComponent[0]} />
			</div>
		{/if}
	</div>
	<Canvas>
		<Scene />
	</Canvas>
</div>

<style>
	#container {
		position: relative;
		height: 100%;
		width: 100%;
	}
</style>
