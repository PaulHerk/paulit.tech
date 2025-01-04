<script lang="ts">
	import { T } from '@threlte/core';
	import { tweened } from 'svelte/motion';
	import { HTML, interactivity, useCursor } from '@threlte/extras';
	import { activeComponent, type ComponentType } from '../../stores/activeComponent';

	export let component: [any, ComponentType];
	export let name: string;

	interactivity();
	const { hovering, onPointerEnter, onPointerLeave } = useCursor('pointer', 'grab');

	let size = tweened(2, {
		duration: 200
	});
	function setActiveComponent() {
		if ($activeComponent[1] === component[1]) {
			activeComponent.set([null, 'null']);
			return;
		}
		activeComponent.set(component);
	}
	$: console.log($activeComponent);

	$: $hovering ? ($size = 2.5) : ($size = 2);
</script>

<T.Group
	position={[0, 0, -4]}
	on:click={setActiveComponent}
	on:pointerenter={onPointerEnter}
	on:pointerleave={onPointerLeave}
>
	<HTML center>
		<button
			on:click={setActiveComponent}
			on:pointerenter={onPointerEnter}
			on:pointerleave={onPointerLeave}
			on:keydown={(e) => e.key === 'Enter' && setActiveComponent()}
			style="background: none; border: none; padding: 0; cursor: pointer;"
			aria-label={name}
		>
			<p class="unselectable" style="color: white; font-size: {$size}rem; margin: 0">{name}</p>
		</button>
	</HTML>

	<T.Mesh>
		<T.SphereGeometry args={[$size, 32, 16]} />
		<T.MeshPhysicalMaterial
			metalness={0.9}
			roughness={0.8}
			iridesence={1}
			iridesencelOR={1}
			color={[0.5, 0.25, 0.1]}
			transparent
		/>
	</T.Mesh>
</T.Group>

<style>
	.unselectable {
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	p {
		font-weight: 900;
		white-space: nowrap;
	}
</style>
