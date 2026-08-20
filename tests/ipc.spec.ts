import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Electron IPC Security & URL Scheme Sanitization', () => {
  describe('preload.js IPC Channel Whitelisting', () => {
    let exposedApi: {
      send: (channel: string, data: any) => void;
      receive: (channel: string, func: (...args: any[]) => void) => void;
    };
    let mockIpcRenderer: {
      send: ReturnType<typeof vi.fn>;
      on: ReturnType<typeof vi.fn>;
    };

    beforeEach(async () => {
      mockIpcRenderer = {
        send: vi.fn(),
        on: vi.fn(),
      };

      // Simulating contextBridge.exposeInMainWorld('api', ...) behavior from preload.js
      exposedApi = {
        send: (channel: string, data: any) => {
          const validChannels = ['toMain'];
          if (validChannels.includes(channel)) {
            mockIpcRenderer.send(channel, data);
          }
        },
        receive: (channel: string, func: (...args: any[]) => void) => {
          const validChannels = ['fromMain'];
          if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender`
            mockIpcRenderer.on(channel, (_event: any, ...args: any[]) => func(...args));
          }
        },
      };
    });

    it('allows whitelisted "toMain" channel to send data via ipcRenderer', () => {
      exposedApi.send('toMain', { type: 'openExternal', url: 'https://example.com' });
      expect(mockIpcRenderer.send).toHaveBeenCalledWith('toMain', {
        type: 'openExternal',
        url: 'https://example.com',
      });
    });

    it('blocks arbitrary non-whitelisted send channels', () => {
      exposedApi.send('unauthorizedChannel', { secret: 'data' });
      exposedApi.send('shellExecute', { cmd: 'rm -rf /' });
      exposedApi.send('readLocalFiles', {});

      expect(mockIpcRenderer.send).not.toHaveBeenCalled();
    });

    it('allows whitelisted "fromMain" channel to receive data and strips event object', () => {
      const listener = vi.fn();
      exposedApi.receive('fromMain', listener);

      expect(mockIpcRenderer.on).toHaveBeenCalledWith('fromMain', expect.any(Function));

      // Simulate event firing from ipcRenderer
      const registeredCallback = mockIpcRenderer.on.mock.calls[0][1];
      const fakeEvent = { sender: { id: 1, send: vi.fn() } };
      registeredCallback(fakeEvent, 'payload1', 123);

      expect(listener).toHaveBeenCalledWith('payload1', 123);
      expect(listener).not.toHaveBeenCalledWith(fakeEvent, 'payload1', 123);
    });

    it('blocks arbitrary non-whitelisted receive channels', () => {
      const listener = vi.fn();
      exposedApi.receive('unauthorizedListener', listener);
      exposedApi.receive('fromSubprocess', listener);

      expect(mockIpcRenderer.on).not.toHaveBeenCalled();
    });
  });

  describe('main.js URL Scheme Sanitization for openExternal', () => {
    let mockShell: {
      openExternal: ReturnType<typeof vi.fn>;
    };
    let handleToMainIpc: (event: any, data: any) => void;

    beforeEach(() => {
      mockShell = {
        openExternal: vi.fn(),
      };

      // Handler logic matching main.js lines 57-65
      handleToMainIpc = (_event: any, data: any) => {
        if (data?.type === 'openExternal' && typeof data.url === 'string') {
          const url = data.url;
          // Only allow http/https URLs to prevent shell injection
          if (/^https?:\/\//.test(url)) {
            mockShell.openExternal(url);
          }
        }
      };
    });

    it('allows valid https:// URLs to open in external browser', () => {
      handleToMainIpc({}, { type: 'openExternal', url: 'https://stockmachine.online' });
      expect(mockShell.openExternal).toHaveBeenCalledWith('https://stockmachine.online');
    });

    it('allows valid http:// URLs to open in external browser', () => {
      handleToMainIpc({}, { type: 'openExternal', url: 'http://localhost:3000/docs' });
      expect(mockShell.openExternal).toHaveBeenCalledWith('http://localhost:3000/docs');
    });

    it('blocks file:// protocol to prevent local filesystem exploration', () => {
      handleToMainIpc({}, { type: 'openExternal', url: 'file:///etc/passwd' });
      handleToMainIpc({}, { type: 'openExternal', url: 'file:///C:/Windows/System32' });
      expect(mockShell.openExternal).not.toHaveBeenCalled();
    });

    it('blocks javascript: URI scheme to prevent XSS/eval execution', () => {
      handleToMainIpc({}, { type: 'openExternal', url: 'javascript:alert(document.cookie)' });
      expect(mockShell.openExternal).not.toHaveBeenCalled();
    });

    it('blocks data: and command injection payloads', () => {
      handleToMainIpc({}, { type: 'openExternal', url: 'data:text/html,<script>alert(1)</script>' });
      handleToMainIpc({}, { type: 'openExternal', url: 'powershell.exe -enc AAAAA' });
      handleToMainIpc({}, { type: 'openExternal', url: 'cmd.exe /c calc' });
      expect(mockShell.openExternal).not.toHaveBeenCalled();
    });

    it('ignores non-openExternal actions and invalid data payloads', () => {
      handleToMainIpc({}, { type: 'otherAction', url: 'https://stockmachine.online' });
      handleToMainIpc({}, null);
      handleToMainIpc({}, { type: 'openExternal', url: 12345 });
      expect(mockShell.openExternal).not.toHaveBeenCalled();
    });
  });
});
