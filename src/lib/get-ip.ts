import { headers } from "next/headers";

export default async function getIp() {
  const headersList = await headers();

  const realIp = headersList.get("x-real-ip");
  const forwardedFor = headersList.get("x-forwarded-for");

  if (realIp) {
    return realIp.trim();
  }

  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0].trim();

    if (ip.startsWith("::ffff:")) {
      return ip.substring(7);
    }

    return ip;
  }

  return null;
}
