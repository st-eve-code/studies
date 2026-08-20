// ── Single source of truth for platform-level contact & identity info ───────
// Every value is read from an env var (NEXT_PUBLIC_* so it works in both
// server and client components) and falls back to the current defaults when
// the env var is missing. Edit `.env` — not individual pages.

export type HourRow = { days: string; time: string };

function parseHours(raw: string | undefined, fallback: HourRow[]): HourRow[] {
  if (!raw) return fallback;
  return raw.split(";").map((row) => {
    const idx = row.indexOf(":");
    return idx === -1
      ? { days: row.trim(), time: "" }
      : { days: row.slice(0, idx).trim(), time: row.slice(idx + 1).trim() };
  });
}

function splitLines(raw: string | undefined, fallback: string[]): string[] {
  if (!raw) return fallback;
  return raw
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Xtreme Powersports Inc.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.xtremepowersports.com",
  website: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.xtremepowersports.com").replace(/^https?:\/\//, ""),
  region: process.env.NEXT_PUBLIC_SITE_REGION ?? "Columbus, Ohio",
  dealerLicense: process.env.NEXT_PUBLIC_SITE_DEALER_LICENSE ?? "OH-2024-PSP",

  phone: process.env.NEXT_PUBLIC_SITE_PHONE ?? "(614) 555-0199",
  phoneTel: process.env.NEXT_PUBLIC_SITE_PHONE_TEL ?? "+16145550199",
  whatsapp: process.env.NEXT_PUBLIC_SITE_WHATSAPP ?? "16145550199",
  email: process.env.NEXT_PUBLIC_SITE_EMAIL ?? "info@xtremepowersports.com",
  emailPrivacy: process.env.NEXT_PUBLIC_SITE_EMAIL_PRIVACY ?? "privacy@xtremepowersports.com",
  emailCopyright: process.env.NEXT_PUBLIC_SITE_EMAIL_COPYRIGHT ?? "copyright@xtremepowersports.com",

  address: {
    street: process.env.NEXT_PUBLIC_SITE_STREET ?? "1234 Powersports Blvd",
    city: process.env.NEXT_PUBLIC_SITE_CITY ?? "Columbus",
    state: process.env.NEXT_PUBLIC_SITE_STATE ?? "OH",
    zip: process.env.NEXT_PUBLIC_SITE_ZIP ?? "43215",
    line: process.env.NEXT_PUBLIC_SITE_ADDRESS ?? "1234 Powersports Blvd, Columbus, OH 43215",
  },
  mapsUrl: process.env.NEXT_PUBLIC_SITE_MAPS_URL ?? "https://maps.google.com/?q=1234+Powersports+Blvd+Columbus+OH",
  mapsEmbed:
    process.env.NEXT_PUBLIC_SITE_MAPS_EMBED ??
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d96773.15491438754!2d-83.07991!3d39.9611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88388f2b4a5a1b6b%3A0x76fbcbabef22d1bc!2sColumbus%2C%20OH!5e0!3m2!1sen!2sus!4v1700000000000",

  hours: {
    announcement: process.env.NEXT_PUBLIC_SITE_HOURS_ANNOUNCEMENT ?? "Mon–Sat 9am–6pm | Sun 11am–4pm",
    main: splitLines(process.env.NEXT_PUBLIC_SITE_HOURS_MAIN, [
      "Mon–Fri: 9AM–6PM",
      "Sat: 9AM–5PM",
      "Sun: 11AM–4PM",
    ]),
    phoneLine: process.env.NEXT_PUBLIC_SITE_HOURS_PHONE_LINE ?? "Mon–Sat 9AM–6PM",
    brochure: process.env.NEXT_PUBLIC_SITE_HOURS_BROCHURE ?? "Mon–Sat 9:00 AM – 6:00 PM",
    showroom: parseHours(process.env.NEXT_PUBLIC_SITE_HOURS_SHOWROOM, [
      { days: "Mon–Fri", time: "9:00 AM – 6:00 PM" },
      { days: "Saturday", time: "9:00 AM – 5:00 PM" },
      { days: "Sunday", time: "11:00 AM – 4:00 PM" },
    ]),
    service: parseHours(process.env.NEXT_PUBLIC_SITE_HOURS_SERVICE, [
      { days: "Mon–Fri", time: "8:00 AM – 5:30 PM" },
      { days: "Saturday", time: "9:00 AM – 3:00 PM" },
      { days: "Sunday", time: "Closed" },
    ]),
    parts: parseHours(process.env.NEXT_PUBLIC_SITE_HOURS_PARTS, [
      { days: "Mon–Sat", time: "8:00 AM – 6:00 PM" },
      { days: "Sunday", time: "11:00 AM – 4:00 PM" },
      { days: "Online", time: "24/7" },
    ]),
  },

  social: {
    facebook: process.env.NEXT_PUBLIC_SITE_SOCIAL_FACEBOOK ?? "https://www.facebook.com/xtremepowersports",
    instagram: process.env.NEXT_PUBLIC_SITE_SOCIAL_INSTAGRAM ?? "https://www.instagram.com/xtremepowersports",
    youtube: process.env.NEXT_PUBLIC_SITE_SOCIAL_YOUTUBE ?? "https://www.youtube.com/@xtremepowersports",
    tiktok: process.env.NEXT_PUBLIC_SITE_SOCIAL_TIKTOK ?? "https://www.tiktok.com/@xtremepowersports",
    x: process.env.NEXT_PUBLIC_SITE_SOCIAL_X ?? "https://x.com/xtremepwrsports",
  },
};
