import getIp from "../get-ip";
import { TokenBucket } from "./Token-bucket";

export const globalBucket = new TokenBucket<string>(100, 1);

export async function globalGETRateLimit() {
  const clientIP = await getIp();

  if (clientIP === null) {
    return true;
  }
  return globalBucket.consume(clientIP, 1);
}
