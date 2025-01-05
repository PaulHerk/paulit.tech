<script lang="ts">
	import { T } from '@threlte/core';
	import { tweened } from 'svelte/motion';
	import { HTML, interactivity, Suspense, useCursor, Text } from '@threlte/extras';

	import { activeComponent, type ComponentType } from '../../stores/activeComponent';
	import { Color } from 'three';

	export let component: [any, ComponentType];
	export let name: string;
	export let position: [number, number, number];

	interactivity();
	const { hovering, onPointerEnter, onPointerLeave } = useCursor('pointer', 'grab');

	let size = tweened(1, {
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

	$: $hovering ? ($size = 1.5) : ($size = 1);
</script>

<T.Group
	{position}
	on:click={setActiveComponent}
	on:pointerenter={onPointerEnter}
	on:pointerleave={onPointerLeave}
	scale={[$size, $size, $size]}
>
	<!-- <HTML center position.y={3} transform>
		<button
			on:click={setActiveComponent}
			on:pointerenter={onPointerEnter}
			on:pointerleave={onPointerLeave}
			on:keydown={(e) => e.key === 'Enter' && setActiveComponent()}
			style="background: none; border: none; padding: 0; cursor: pointer;"
			aria-label={name}
		>
			<h1
				class="unselectable scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
				style="color: white; font-size: 40px; margin: 0"
			>
				{name}
			</h1>
		</button>
	</HTML> -->
	<Suspense>
		<Text
			text={name}
			position.y={3.5}
			fontSize={1}
			anchorX={'center'}
			color={new Color(56, 189, 248)}
		>
			<T.MeshBasicMaterial color={new Color(56, 189, 248)} />
		</Text>

		<svelte:fragment slot="fallback">
			<!-- show fallback content while font data is loading -->
		</svelte:fragment>
	</Suspense>

	<slot />
</T.Group>
