import { ref } from 'vue';

const bus = ref(new Map());

export const eventBus = {
  emit(event, ...args) {
    const callbacks = bus.value.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(...args));
    }
  },
  on(event, callback) {
    if (!bus.value.has(event)) {
      bus.value.set(event, new Set());
    }
    bus.value.get(event).add(callback);
  },
  off(event, callback) {
    if (bus.value.has(event)) {
      const callbacks = bus.value.get(event);
      if (callback) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          bus.value.delete(event);
        }
      } else {
        bus.value.delete(event);
      }
    }
  }
};
