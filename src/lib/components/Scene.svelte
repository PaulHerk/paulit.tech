<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { ContactShadows, Float, Grid, OrbitControls } from '@threlte/extras';
	import Spaceship from './Spaceship.svelte';
	import {
		AmbientLight,
		DirectionalLight,
		MeshBasicMaterial,
		PerspectiveCamera,
		PlaneGeometry,
		Raycaster,
		SphereGeometry,
		Vector2,
		Vector3
	} from 'three';
	import { onMount } from 'svelte';
	import { spring } from 'svelte/motion';

	let planeRef;
	let sphereRef;

	const { scene, camera, renderer } = useThrelte();
	let intersectionPoint = new Vector3(0, 0, 0);
	let posY = spring(0, { stiffness: 0.003, damping: 0.1 });
	let angleZ = spring(0, { stiffness: 0.01, damping: 0.3 });

	useTask(() => {
		posY.set(sphereRef.position.y);
		const direction = intersectionPoint
			.clone()
			.sub(new Vector3(0, $posY, 0))
			.normalize();
		const angle = -Math.PI / 2 + direction.angleTo(new Vector3(0, 1, 0));
		angleZ.set(angle);
	});

	onMount(() => {
		const raycaster = new Raycaster();
		const pointer = new Vector2();

		function onPointerMove(event) {
			pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
			pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

			raycaster.setFromCamera(pointer, $camera);
			const intersects = raycaster.intersectObject(planeRef);
			intersectionPoint = intersects[0]?.point;

			if (intersectionPoint) {
				intersectionPoint.x = -3;
				sphereRef.position.copy(intersectionPoint);
			}
		}

		window.addEventListener('pointermove', onPointerMove);
		return () => {
			window.removeEventListener('pointermove', onPointerMove);
		};
	});
</script>

<T.PerspectiveCamera
	makeDefault
	position={[-5, 6, 10]}
	fov={25}
	on:create={({ ref }) => {
		ref.lookAt(0, 0, 0);
	}}
>
	<!-- <OrbitControls enableDamping target={[0, 0, 0]} /> -->
</T.PerspectiveCamera>

<T.DirectionalLight intensity={1.8} position={[0, 10, 0]} castShadow shadow.bias={-0.0001} />
<T.AmbientLight intensity={0.2} />

<!-- <Grid
	position.y={-0.001}
	cellColor="#ffffff"
	selectionColor="#ffffff"
	selectionThickness={0}
	fadeDistance={25}
	cellSize={2}
/> -->

<Spaceship position.y={$posY} rotation={[$angleZ, $angleZ / 10, $angleZ, 'ZXY']} />

<T.Mesh renderOrder={2} bind:ref={planeRef}>
	<T.PlaneGeometry args={[20, 20]} />
	<T.MeshBasicMaterial color={[1, 0, 1]} transparent opacity={0} />
</T.Mesh>

<T.Mesh position={[1, 2, 0]} bind:ref={sphereRef}>
	<T.SphereGeometry args={[0.1, 20, 20]} />
	<T.MeshBasicMaterial color={[1, 0, 0]} transparent opacity={0} />
</T.Mesh>
