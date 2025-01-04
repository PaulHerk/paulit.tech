<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import '../../app.css';
	import { activeComponent } from '../stores/activeComponent';
</script>

<div id="container">
	<div class="absolute right-0">
		{#if $activeComponent[1] !== 'null'}
			<svelte:component this={$activeComponent[0]} />
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
