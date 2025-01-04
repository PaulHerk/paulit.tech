import { writable } from 'svelte/store';
import type { SvelteComponent } from 'svelte';

export type ComponentType = 'aboutme' | 'null';
export const activeComponent = writable<[any, ComponentType]>([null, 'null']);
