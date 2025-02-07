import { writable } from 'svelte/store';

export type ComponentType = 'aboutme' | 'null';
export const activeComponent = writable<[any, ComponentType]>([null, 'null']);
