import { useEffect, useState } from "react";
import client, { API_URL } from "../api/client";

export default function PromoBanners() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    client.get("/banners").then((res) => setBanners(res.data));
  }, []);

  if (banners.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      {banners.map((b) => {
        const content = (
          <div className="relative rounded-xl overflow-hidden bg-stone-100">
            <img src={`${API_URL}${b.imageUrl}`} alt={b.title || "Promoción"} className="w-full max-h-64 object-cover" />
            {(b.title || b.subtitle) && (
              <div className="absolute inset-0 bg-black/30 flex flex-col justify-center px-6 text-white">
                {b.title && <h3 className="text-xl font-bold">{b.title}</h3>}
                {b.subtitle && <p className="text-sm">{b.subtitle}</p>}
              </div>
            )}
          </div>
        );
        return b.linkUrl ? (
          <a key={b.id} href={b.linkUrl}>{content}</a>
        ) : (
          <div key={b.id}>{content}</div>
        );
      })}
    </div>
  );
}
