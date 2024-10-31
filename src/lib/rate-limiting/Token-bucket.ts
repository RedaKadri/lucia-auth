export class TokenBucket<_Key> {
  public max: number;
  public refillIntervalSeconds: number;

  private storage = new Map<_Key, Bucket>();

  constructor(max: number, refillIntervelSecond: number) {
    this.max = max;
    this.refillIntervalSeconds = refillIntervelSecond;
  }

  public consume(key: _Key, cost: number): boolean {
    let bucket = this.storage.get(key) ?? null;
    const now = Date.now();

    if (!bucket) {
      bucket = {
        count: this.max - cost,
        refilledAt: now,
      };
      this.storage.set(key, bucket);
      return true;
    }

    const refill = Math.floor(
      (now - bucket.refilledAt) / (this.refillIntervalSeconds * 1000),
    );
    bucket.count = Math.min(bucket.count + refill, this.max);
    bucket.refilledAt = now;
    if (bucket.count < cost) {
      return false;
    }
    bucket.count -= cost;
    this.storage.set(key, bucket);
    return true;
  }
}

interface Bucket {
  count: number;
  refilledAt: number;
}
