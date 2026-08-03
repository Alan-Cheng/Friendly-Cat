import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoadingService } from './loading.service';

interface TurnstileApi {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  execute(widgetId: string): void;
  reset(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

@Injectable({ providedIn: 'root' })
export class ProxyTokenService implements OnDestroy {
  private readonly turnstileScriptId = 'turnstile-api';
  private readonly proxyOrigin = new URL(environment.sevenElevenUrl.base).origin;
  private readonly refreshEveryMs = 9 * 60 * 1000;
  private widgetId?: string;
  private refreshTimer?: ReturnType<typeof setInterval>;
  private refreshInProgress?: Promise<void>;
  private tokenResolver?: (token: string) => void;
  private tokenRejecter?: (reason: Error) => void;
  private validUntil = 0;
  private turnstileLoadPromise?: Promise<void>;

  constructor(
    private readonly http: HttpClient,
    private readonly loadingService: LoadingService
  ) {}

  async start(): Promise<void> {
    if (!environment.turnstileSiteKey) {
      console.error('Turnstile site key is not configured; 7-ELEVEN requests will be unavailable.');
      return;
    }

    try {
      await this.ensure();
    } catch (error) {
      console.error('Unable to acquire 7-ELEVEN proxy token.', error);
    } finally {
      // Keep retrying after transient Turnstile/network failures as well.
      this.refreshTimer = setInterval(
        () => void this.refresh().catch(error =>
          console.error('Unable to refresh 7-ELEVEN proxy token.', error)
        ),
        this.refreshEveryMs
      );
    }
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  /** Wait until the browser has a non-expired proxy-token cookie. */
  ensure(): Promise<void> {
    return Date.now() < this.validUntil ? Promise.resolve() : this.refresh();
  }

  private refresh(): Promise<void> {
    if (!this.refreshInProgress) {
      this.refreshInProgress = this.exchangeTurnstileToken().finally(() => {
        this.refreshInProgress = undefined;
      });
    }

    return this.refreshInProgress;
  }

  private async exchangeTurnstileToken(): Promise<void> {
    this.loadingService.showVerification('驗證您的瀏覽器中，請稍後');

    try {
      const turnstile = await this.loadTurnstile();
      const token = await new Promise<string>((resolve, reject) => {
        this.tokenResolver = resolve;
        this.tokenRejecter = reject;
        turnstile.execute(this.widgetId!);
      });

      await firstValueFrom(this.http.get(`${this.proxyOrigin}/proxy-token`, {
        headers: new HttpHeaders({ 'X-Turnstile-Token': token }),
        withCredentials: true
      }));
      this.validUntil = Date.now() + this.refreshEveryMs;
    } finally {
      // Turnstile response tokens are single-use. Reset before the next refresh.
      if (this.widgetId && window.turnstile) {
        window.turnstile.reset(this.widgetId);
      }
      this.loadingService.hideVerification();
    }
  }

  private async loadTurnstile(): Promise<TurnstileApi> {
    if (!window.turnstile) {
      await this.waitForTurnstileScript();
    }

    if (!window.turnstile) {
      throw new Error('Turnstile did not initialise.');
    }

    if (!this.widgetId) {
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;right:0;bottom:0;z-index:2147483647';
      document.body.appendChild(container);
      this.widgetId = window.turnstile.render(container, {
        sitekey: environment.turnstileSiteKey,
        action: 'proxy-token',
        execution: 'execute',
        appearance: 'interaction-only',
        callback: (token: string) => this.tokenResolver?.(token),
        'error-callback': () => this.tokenRejecter?.(new Error('Turnstile challenge failed.')),
        'expired-callback': () => this.tokenRejecter?.(new Error('Turnstile token expired.'))
      });
    }

    return window.turnstile;
  }

  private waitForTurnstileScript(): Promise<void> {
    if (this.turnstileLoadPromise) {
      return this.turnstileLoadPromise;
    }

    let script = document.getElementById(this.turnstileScriptId) as HTMLScriptElement | null;
    const shouldAppendScript = !script;

    if (!script) {
      script = document.createElement('script');
      script.id = this.turnstileScriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
    }

    this.turnstileLoadPromise = new Promise<void>((resolve, reject) => {
      script!.addEventListener('load', () => resolve(), { once: true });
      script!.addEventListener('error', () => {
        script!.remove();
        reject(new Error('Failed to load Turnstile.'));
      }, { once: true });
    }).finally(() => {
      this.turnstileLoadPromise = undefined;
    });

    if (shouldAppendScript) {
      document.head.appendChild(script);
    }

    return this.turnstileLoadPromise;
  }
}
