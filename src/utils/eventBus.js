import { ref } from 'vue';

const bus = ref(new Map());

export const eventBus = {
 emit(event) {
  bus.value.get(event)?.();
 },
 on(event, callback) {
  bus.value.set(event, callback);
 }
};
