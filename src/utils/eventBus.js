import { ref } from 'vue';

const bus = ref(new Map());

export const eventBus = {
 emit(event, ...args) {
  bus.value.get(event)?.(...args);
 },
 on(event, callback) {
  bus.value.set(event, callback);
 }
};
