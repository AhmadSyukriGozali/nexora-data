import Image from "next/image";
import { cn } from "@/lib/cn";
import type { AtmospherePhoto } from "@/lib/media";

type PhotoBandProps = {
  photo: AtmospherePhoto;
  /** Height classes differ per section, so the caller decides. */
  className?: string;
};

/** Full-width atmosphere photograph with its credit underneath. */
export function PhotoBand({ photo, className }: PhotoBandProps) {
  return (
    <figure data-chapter="dark" className="bg-navy">
      <div className={cn("relative overflow-hidden", className)}>
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes="100vw"
          className={cn("h-full w-full object-cover", photo.motion && "drift")}
        />
      </div>

      <figcaption className="container-page flex flex-wrap justify-between gap-3 py-5 text-[13px] leading-relaxed text-dim">
        <span>{photo.caption}</span>
        <span>Foto: {photo.credit}</span>
      </figcaption>
    </figure>
  );
}
