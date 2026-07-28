import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export type Locale = "en" | "ko";

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale: Locale = store.get("NEXT_LOCALE")?.value === "ko" ? "ko" : "en";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
