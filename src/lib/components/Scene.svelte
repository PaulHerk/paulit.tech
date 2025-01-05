<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import Spaceship from './spaceship/Spaceship.svelte';
	import {
		BufferGeometry,
		Color,
		DoubleSide,
		Material,
		Mesh,
		PMREMGenerator,
		Raycaster,
		Texture,
		Vector2,
		Vector3,
		WebGLRenderTarget,
		type NormalBufferAttributes,
		type Object3DEventMap
	} from 'three';
	import { onMount } from 'svelte';
	import { spring } from 'svelte/motion';
	import Stars from './Stars.svelte';
	import {
		BlendFunction,
		BloomEffect,
		EffectComposer,
		EffectPass,
		RenderPass
	} from 'postprocessing';
	import Planet from './planets/Planet.svelte';
	import Aboutme from './Aboutme.svelte';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	type RefMesh = Mesh<
		BufferGeometry<NormalBufferAttributes>,
		Material | Material[],
		Object3DEventMap
	>;
	let planeRef: RefMesh;
	let sphereRef: RefMesh;
	let spaceshipRef: any;

	const { camera, renderStage, scene, renderer } = useThrelte();

	let intersectionPoint = new Vector3(0, 0, 0);
	let posY = spring(0, { stiffness: 0.003, damping: 0.1 });
	let angleZ = spring(0, { stiffness: 0.01, damping: 0.3 });

	const composer = new EffectComposer(renderer);
	function setupBlurComposer(camera: THREE.Camera) {
		composer.addPass(new RenderPass(scene, camera));
		composer.addPass(
			new EffectPass(
				camera,
				new BloomEffect({
					intensity: 2,
					radius: 0.5,
					mipmapBlur: true,
					luminanceThreshold: 0,
					luminanceSmoothing: 0,
					blendFunction: BlendFunction.ADD
				})
			)
		);
	}
	$: setupBlurComposer($camera);

	let pmrem = new PMREMGenerator(renderer);
	let envMapRT: WebGLRenderTarget<Texture>;

	useTask(
		(delta) => {
			posY.set(sphereRef.position.y);
			if (!intersectionPoint) intersectionPoint = sphereRef.position;
			const direction = intersectionPoint
				.clone()
				.sub(new Vector3(0, $posY, 0))
				.normalize();
			const angle = -Math.PI / 2 + direction.angleTo(new Vector3(0, 1, 0));
			angleZ.set(angle);

			// reflections
			if (envMapRT) envMapRT.dispose();
			if (!spaceshipRef) return;

			spaceshipRef.visible = false;
			scene.background = null;
			envMapRT = pmrem.fromScene(scene, 0, 0.1, 1000);
			scene.background = new Color('#598889').multiplyScalar(0.05);
			spaceshipRef.visible = true;

			spaceshipRef.traverse((child: any) => {
				if (child?.material?.envMapIntensity) {
					child.material.envMap = envMapRT.texture;
					child.material.envMapIntensity = 200;
					child.material.metalness = 1;
					child.material.roughness = 0.1;

					child.material.normalScale.set(1, 1);
				}
			});

			composer.render(delta);
		},
		{ stage: renderStage, autoInvalidate: false }
	);

	onMount(() => {
		const raycaster = new Raycaster();
		const pointer = new Vector2();

		function onPointerMove(event: { clientX: number; clientY: number }) {
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
	position={[-9, 11, 19]}
	fov={25}
	on:create={({ ref }) => {
		ref.lookAt(0, 0, 0);
	}}
>
	<OrbitControls
		enableDamping
		target={[0, 0, 0]}
		maxPolarAngle={100 * DEG2RAD}
		minPolarAngle={60 * DEG2RAD}
		maxAzimuthAngle={45 * DEG2RAD}
		minAzimuthAngle={-45 * DEG2RAD}
		enableZoom={false}
	/>
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

<Stars />

<Planet position={[0, 0, -10]} component={[Aboutme, 'aboutme']} name={'About me'}>
	<T.Mesh>
		<T.SphereGeometry args={[2, 32, 16]} />
		<T.MeshPhysicalMaterial
			metalness={0.9}
			roughness={0.8}
			iridesence={1}
			iridesencelOR={1}
			color={[0.5, 0.25, 0.1]}
			transparent
		/>
	</T.Mesh>
</Planet>

<Spaceship
	bind:ref={spaceshipRef}
	position.y={$posY}
	rotation={[$angleZ, $angleZ / 10, $angleZ, 'ZXY']}
/>

<T.Mesh renderOrder={2} bind:ref={planeRef}>
	<T.PlaneGeometry args={[1000, 1000]} />
	<T.MeshBasicMaterial transparent opacity={0} side={DoubleSide} />
</T.Mesh>

<T.Mesh position={[1, 2, 0]} bind:ref={sphereRef}>
	<!-- <T.SphereGeometry args={[0.1, 20, 20]} /> -->
	<T.MeshBasicMaterial transparent opacity={1} />
</T.Mesh>
