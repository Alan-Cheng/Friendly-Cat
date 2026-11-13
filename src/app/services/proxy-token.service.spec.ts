import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { BrowserVerificationState, ProxyTokenService } from './proxy-token.service';
import { LoadingService } from './loading.service';

describe('ProxyTokenService world entry verification', () => {
  let service: ProxyTokenService;
  let loading: LoadingService;
  let get: jasmine.Spy;
  let original: typeof window.turnstile;
  let reset: jasmine.Spy;
  beforeEach(() => {
    original = window.turnstile;
    let callback: (token: string) => void;
    reset = jasmine.createSpy('reset');
    window.turnstile = {
      render: (_container, options) => { callback = options['callback'] as (token: string) => void; return 'test-widget'; },
      execute: () => callback('test-only-token'), reset
    };
    get = jasmine.createSpy('get').and.returnValue(of({ ok: true }));
    loading = new LoadingService();
    service = new ProxyTokenService({ get } as unknown as HttpClient, loading);
  });
  afterEach(() => {
    service.ngOnDestroy(); window.turnstile = original;
    document.querySelectorAll('.browser-verification-widget').forEach(node => node.remove());
  });

  it('reports verified only after the worker exchange succeeds and keeps its token private', async () => {
    const states: BrowserVerificationState[] = [];
    service.verificationState$.subscribe(state => states.push(state));
    const first = service.ensure(); const second = service.ensure();
    expect(first).toBe(second);
    await first;
    expect(states).toEqual(['checking', 'checking', 'verified']);
    expect(get).toHaveBeenCalledTimes(1);
    const options = get.calls.mostRecent().args[1];
    expect(options.withCredentials).toBeTrue();
    expect(options.headers.get('X-Turnstile-Token')).toBe('test-only-token');
    expect(loading.isVerifying).toBeFalse();
    await service.ensure(); expect(get).toHaveBeenCalledTimes(1);
  });

  it('reports failure without unlocking the world and permits a successful retry', async () => {
    const states: BrowserVerificationState[] = [];
    service.verificationState$.subscribe(state => states.push(state));
    get.and.returnValue(throwError(() => new Error('worker unavailable')));
    await expectAsync(service.ensure()).toBeRejected();
    expect(states[states.length - 1]).toBe('failed');
    expect(loading.isVerifying).toBeFalse();
    get.and.returnValue(of({ ok: true }));
    await service.ensure();
    expect(states[states.length - 1]).toBe('verified'); expect(reset).toHaveBeenCalledTimes(2);
  });
});
