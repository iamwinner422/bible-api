import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

/**
 * Simple in-memory cache where every entry expires at the next local midnight.
 * - set(key, value): stores value and marks it to expire at next midnight
 * - get(key): returns value or undefined if expired/missing
 * - clearAll(): clears entire cache immediately
 *
 * This is intentionally minimal and synchronous. For a distributed setup use
 * a real cache (Redis) and a TTL based on seconds-until-midnight.
 */
@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private store = new Map<string, any>();
  private expires = new Map<string, number>();
  private midnightTimer: NodeJS.Timeout | null = null;

  onModuleInit() {
    this.scheduleMidnightClear();
  }

  onModuleDestroy() {
    if (this.midnightTimer) clearTimeout(this.midnightTimer);
  }

  private getNextMidnightTs(): number {
    const now = new Date();
    const next = new Date(now);
    next.setDate(now.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    return next.getTime();
  }

  /** Store value and mark it to expire at next midnight */
  set(key: string, value: any): void {
    const expiresAt = this.getNextMidnightTs();
    this.store.set(key, value);
    this.expires.set(key, expiresAt);
  }

  /** Get value or undefined if missing/expired */
  get<T = any>(key: string): T | undefined {
    const exp = this.expires.get(key);
    if (!exp) return undefined;
    if (Date.now() >= exp) {
      this.delete(key);
      return undefined;
    }
    return this.store.get(key) as T;
  }

  delete(key: string): void {
    this.store.delete(key);
    this.expires.delete(key);
  }

  clearAll(): void {
    this.store.clear();
    this.expires.clear();
    Logger.log('Cache cleared at midnight');
  }

  private scheduleMidnightClear(): void {
    const nextTs = this.getNextMidnightTs();
    const delay = Math.max(0, nextTs - Date.now());
    if (this.midnightTimer) clearTimeout(this.midnightTimer);
    this.midnightTimer = setTimeout(() => {
      try {
        this.clearAll();
      } finally {
        // schedule subsequent clears every 24h
        this.midnightTimer = setInterval(() => this.clearAll(), 24 * 60 * 60 * 1000) as unknown as NodeJS.Timeout;
      }
    }, delay);
  }
}
