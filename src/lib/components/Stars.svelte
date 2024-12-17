<script lang="ts">
	import { T, useFrame } from '@threlte/core';
	import { Instance, InstancedMesh, useTexture } from '@threlte/extras';
	import { Color, DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from 'three';

	const map = useTexture('textures/star.png');

	const STARS_COUNT = 300;
	let stars: Star[] = [];
	const colors = ['#fcaa67', '#C75D59', '#ffffc7', '#8CC5C6', '#A5898C'];

	class Star {
		pos: Vector3;
		len: number;
		speed: number;
		color: Color;

		constructor() {
			if (random(0, 1) > 0.8) {
				this.pos = new Vector3(random(-10, -30), random(-5, 5), random(6, -6));
				this.len = random(1.5, 15);
			} else {
				this.pos = new Vector3(random(-15, -45), random(-10, 2), random(15, -25));
				this.len = random(2.5, 20);
			}
			this.speed = random(5, 15);
			this.color = new Color(colors[Math.floor(Math.random() * colors.length)])
				.convertSRGBToLinear()
				.multiplyScalar(1.3);
		}
	}

	function random(min: number, max: number) {
		let diff = Math.random() * (max - min);
		return diff + min;
	}

	for (let index = 0; index < STARS_COUNT; index++) {
		let star = new Star();
		stars.push(star);
	}

	useFrame((_, delta) => {
		stars.forEach((star, idx) => {
			star.pos.x += star.speed * delta;
			if (star.pos.x > 40) stars[idx] = new Star();
		});
		stars = stars;
	});
</script>

{#await map then value}
	<InstancedMesh limit={STARS_COUNT} range={STARS_COUNT}>
		<T.PlaneGeometry args={[1, 0.05]} />
		<T.MeshBasicMaterial side={DoubleSide} alphaMap={value} transparent />

		{#each stars as star}
			<Instance position={star.pos.toArray()} scale={[star.len, 1, 1]} color={star.color} />
		{/each}
	</InstancedMesh>
{/await}
