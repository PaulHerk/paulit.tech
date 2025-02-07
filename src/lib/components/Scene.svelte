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

	let cameraTarget = [0, 0, 0];

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
			cameraTarget = [pointer.x * 5, (pointer.y + 2) * 3, 0];

			raycaster.setFromCamera(pointer, $camera);
			const intersects = raycaster.intersectObject(planeRef);
			intersectionPoint = intersects[0]?.point;

			if (intersectionPoint) {
				intersectionPoint.x = -3;
				sphereRef.position.copy(intersectionPoint);
			}
		}

		window.addEventListener('pointermove', onPointerMove);

		let mobileAndTabletCheck = function () {
			let check = false;
			(function (a) {
				if (
					/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
						a
					) ||
					/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
						a.substr(0, 4)
					)
				)
					check = true;
			})(navigator.userAgent || navigator.vendor || window.opera);
			console.log(check);
			return check;
		};
		if (mobileAndTabletCheck()) {
			window.addEventListener('deviceorientation', (event) => {
				console.log(`${event.alpha} : ${event.beta} : ${event.gamma}`);
			});
		}
		return () => {
			window.removeEventListener('pointermove', onPointerMove);
		};
	});
</script>

<T.PerspectiveCamera
	makeDefault
	position={[-9, 10, 19]}
	fov={40}
	on:create={({ ref }) => {
		ref.lookAt(0, 0, 0);
	}}
>
	<OrbitControls
		enablePan={false}
		enableRotate={false}
		enableDamping
		target={cameraTarget}
		maxPolarAngle={100 * DEG2RAD}
		minPolarAngle={60 * DEG2RAD}
		maxAzimuthAngle={90 * DEG2RAD}
		minAzimuthAngle={-90 * DEG2RAD}
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
