<script lang="ts">
	import { T, useTask } from '@threlte/core';
	export let pos: [number, number, number];
	let beamMeshRef: any;

	const cosMultiplier = Math.sqrt(Math.random());
	const sinMultiplier = Math.sqrt(Math.random());

	useTask((delta) => {
		if (beamMeshRef) {
			beamMeshRef.material.uniforms.time.value += delta;
			beamMeshRef.scale.set(
				Math.cos(beamMeshRef.material.uniforms.time.value) * cosMultiplier + 1,
				1,
				Math.sin(beamMeshRef.material.uniforms.time.value) * sinMultiplier + 1
			);
		}
	});
</script>

<T.Mesh position={pos} rotation.x={Math.PI * 0.5} bind:ref={beamMeshRef}>
	<T.CylinderGeometry args={[25, 0, 450, 8]} />
	<T.ShaderMaterial
		uniforms={{
			time: { value: 0 },
			color: { value: [1, 0.3, 0.02] }
		}}
		vertexShader={`
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
		fragmentShader={`
        uniform float time;
        uniform vec3 color;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 1.5);
          intensity *= 5.0;
          gl_FragColor = vec4(color * intensity, 1);
        }
      `}
		transparent
	/>
	<!-- <T.MeshBasicMaterial color={[1, 0.3, 0.02]} alphaMap={mapValue} transparent /> -->
</T.Mesh>
