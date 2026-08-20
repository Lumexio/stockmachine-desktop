import { describe, it, expect, beforeEach, vi } from 'vitest';
import { eventBus } from '../src/utils/eventBus';

describe('Event Bus (src/utils/eventBus.js)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Subscription & Emission (on / emit)', () => {
    it('should call callback when registered event is emitted', () => {
      const spy = vi.fn();
      eventBus.on('test:event', spy);
      eventBus.emit('test:event');
      expect(spy).toHaveBeenCalledTimes(1);
      eventBus.off('test:event', spy);
    });

    it('should support multiple independent callbacks for the same event', () => {
      const spy1 = vi.fn();
      const spy2 = vi.fn();
      eventBus.on('multi:event', spy1);
      eventBus.on('multi:event', spy2);

      eventBus.emit('multi:event');

      expect(spy1).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledTimes(1);

      eventBus.off('multi:event');
    });
  });

  describe('Payload & Argument Passing', () => {
    it('should pass arguments and complex payload objects to callbacks', () => {
      const spy = vi.fn();
      eventBus.on('data:event', spy);

      const payload = { id: 101, name: 'Widget' };
      eventBus.emit('data:event', payload, 'extraParam');

      expect(spy).toHaveBeenCalledWith(payload, 'extraParam');
      eventBus.off('data:event', spy);
    });

    it('should handle domain-specific payloads like syncComplete', () => {
      const spy = vi.fn();
      eventBus.on('syncComplete', spy);

      const syncPayload = { synced: 10, failed: 0, errors: [] };
      eventBus.emit('syncComplete', syncPayload);

      expect(spy).toHaveBeenCalledWith(syncPayload);
      eventBus.off('syncComplete');
    });

    it('should handle refreshData event without payload', () => {
      const spy = vi.fn();
      eventBus.on('refreshData', spy);
      eventBus.emit('refreshData');
      expect(spy).toHaveBeenCalledTimes(1);
      eventBus.off('refreshData');
    });
  });

  describe('Unsubscription (off)', () => {
    it('should unsubscribe a specific callback when off(event, callback) is called', () => {
      const spy1 = vi.fn();
      const spy2 = vi.fn();
      eventBus.on('unsub:event', spy1);
      eventBus.on('unsub:event', spy2);

      eventBus.off('unsub:event', spy1);
      eventBus.emit('unsub:event');

      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalledTimes(1);
      eventBus.off('unsub:event');
    });

    it('should unsubscribe all callbacks for an event when off(event) is called without callback', () => {
      const spy1 = vi.fn();
      const spy2 = vi.fn();
      eventBus.on('clear:event', spy1);
      eventBus.on('clear:event', spy2);

      eventBus.off('clear:event');
      eventBus.emit('clear:event');

      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
    });

    it('should clean up Map entry when all callbacks are removed individually', () => {
      const spy = vi.fn();
      eventBus.on('cleanup:event', spy);
      eventBus.off('cleanup:event', spy);

      eventBus.emit('cleanup:event');
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases & Idempotency', () => {
    it('should not throw when emitting an event with no listeners', () => {
      expect(() => eventBus.emit('nonexistent:event')).not.toThrow();
    });

    it('should not throw when unsubscribing from a non-existent event or missing callback', () => {
      expect(() => eventBus.off('nonexistent:event')).not.toThrow();

      const unusedCb = () => {};
      eventBus.on('existing:event', () => {});
      expect(() => eventBus.off('existing:event', unusedCb)).not.toThrow();
      eventBus.off('existing:event');
    });

    it('should prevent duplicate listener registration for the same function reference', () => {
      const spy = vi.fn();
      eventBus.on('dup:event', spy);
      eventBus.on('dup:event', spy);

      eventBus.emit('dup:event');
      expect(spy).toHaveBeenCalledTimes(1);
      eventBus.off('dup:event');
    });
  });

  describe('Exception Handling', () => {
    it('should propagate callback errors when emitted', () => {
      const errorCb = () => {
        throw new Error('Callback Failure');
      };
      eventBus.on('err:event', errorCb);

      expect(() => eventBus.emit('err:event')).toThrow('Callback Failure');
      eventBus.off('err:event');
    });
  });
});
