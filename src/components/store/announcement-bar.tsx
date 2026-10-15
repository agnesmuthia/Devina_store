import { getStoreSettings } from "@/lib/store-config";

export async function AnnouncementBar() {
  const { announcement } = await getStoreSettings();
  if (!announcement.enabled || !announcement.text) return null;
  return (
    <div className="bg-brand-800 px-4 py-2 text-center text-[13px] leading-snug text-white">
      {announcement.text}
    </div>
  );
}
