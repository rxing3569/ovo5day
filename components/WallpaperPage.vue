<script setup lang="ts">
import fiveDayLogo from "../5day.png";

useHead({ title: "5DAY｜Wallpaper" });

const orbitText =
  "MAYDAY • EVERYDAY • HAPPYDAY • GOODDAY • MAYDAY • EVERYDAY • HAPPYDAY • GOODDAY • ";
const orbitCharacters = Array.from(orbitText);
const wallpaperCanvas = ref<HTMLElement>();
const isDownloading = ref(false);
const downloadError = ref("");
const stickerImages = import.meta.glob<string>(
  "../assets/images/sticker/*.{png,jpg,jpeg,webp,gif,avif}",
  { eager: true, import: "default" },
);
const stickerLayouts = [
  { left: "-2%", top: "0.5%", width: "15%", rotate: "-14deg" },
  { left: "20%", top: "0%", width: "14%", rotate: "8deg" },
  { left: "42%", top: "0.8%", width: "15%", rotate: "-7deg" },
  { left: "64%", top: "0%", width: "14%", rotate: "11deg" },
  { left: "86%", top: "0.6%", width: "15%", rotate: "-10deg" },
  { left: "-8%", top: "58%", width: "28%", rotate: "-12deg" },
  { left: "67%", top: "63%", width: "25%", rotate: "9deg" },
  { left: "19%", top: "70%", width: "23%", rotate: "13deg" },
  { left: "83%", top: "73%", width: "27%", rotate: "-8deg" },
  { left: "-5%", top: "81%", width: "25%", rotate: "7deg" },
  { left: "45%", top: "84%", width: "27%", rotate: "-13deg" },
  { left: "73%", top: "91%", width: "25%", rotate: "6deg" },
  { left: "23%", top: "94%", width: "18%", rotate: "-9deg" },
];
const wallpaperStickerOrder = [
  "08",
  "09",
  "10",
  "12",
  "13",
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "14",
];
const wallpaperStickers = Object.entries(stickerImages)
  .filter(([path]) => !/\/11\.[^.]+$/.test(path))
  .sort(([a], [b]) => {
    const aId = a.split("/").at(-1)?.replace(/\.[^.]+$/, "") ?? "";
    const bId = b.split("/").at(-1)?.replace(/\.[^.]+$/, "") ?? "";
    return wallpaperStickerOrder.indexOf(aId) - wallpaperStickerOrder.indexOf(bId);
  })
  .slice(0, stickerLayouts.length)
  .map(([path, src], index) => ({
    id: path.split("/").at(-1)?.replace(/\.[^.]+$/, "") ?? String(index + 1),
    src,
    ...stickerLayouts[index]!,
  }));

const downloadWallpaper = async () => {
  if (!wallpaperCanvas.value || isDownloading.value) return;
  isDownloading.value = true;
  downloadError.value = "";
  try {
    await document.fonts.ready;
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(wallpaperCanvas.value, {
      cacheBust: true,
      pixelRatio: 3,
      backgroundColor: "#8dcce8",
    });
    const link = document.createElement("a");
    link.download = "5day-wallpaper.png";
    link.href = dataUrl;
    link.click();
  } catch {
    downloadError.value = "圖片產生失敗，請再試一次。";
  } finally {
    isDownloading.value = false;
  }
};
</script>

<template>
  <main class="wallpaper-page">
    <section ref="wallpaperCanvas" class="wallpaper-canvas" aria-label="5DAY 手機桌布預覽">
      <span class="wallpaper-tape wallpaper-tape--one" aria-hidden="true" />
      <span class="wallpaper-tape wallpaper-tape--two" aria-hidden="true" />
      <div class="wallpaper-heading">
        <p>every day,</p>
        <p>a little lovely<span aria-hidden="true">✦</span></p>
      </div>

      <div class="wallpaper-brand" aria-label="5DAY Logo">
        <div class="wallpaper-brand__orbit" aria-hidden="true">
          <span
            v-for="(character, index) in orbitCharacters"
            :key="`${character}-${index}`"
            :style="{
              '--character-index': index,
              '--character-count': orbitCharacters.length,
            }"
          >{{ character === " " ? "\u00a0" : character }}</span>
        </div>
        <img :src="fiveDayLogo" alt="5DAY" />
      </div>

      <div class="wallpaper-collage" aria-hidden="true">
        <img
          v-for="sticker in wallpaperStickers"
          :key="sticker.id"
          :src="sticker.src"
          alt=""
          :style="{
            left: sticker.left,
            top: sticker.top,
            width: sticker.width,
            transform: `rotate(${sticker.rotate})`,
          }"
        />
      </div>
    </section>
    <div class="wallpaper-download">
      <button type="button" :disabled="isDownloading" @click="downloadWallpaper">
        {{ isDownloading ? "正在製作 PNG⋯" : "下載 PNG" }}
      </button>
      <NuxtLink to="/">返回首頁</NuxtLink>
      <p v-if="downloadError" role="alert">{{ downloadError }}</p>
    </div>
  </main>
</template>

<style scoped>
.wallpaper-page {
  display: grid;
  min-width: 320px;
  min-height: 100svh;
  place-items: center;
  overflow: hidden;
  background: #c9e5f2;
}

.wallpaper-canvas {
  position: relative;
  isolation: isolate;
  width: min(100vw, 430px);
  min-height: 100svh;
  overflow: hidden;
  background-color: #8dccE8;
  background-image:
    linear-gradient(rgb(255 255 255 / 20%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 20%) 1px, transparent 1px),
    radial-gradient(circle at 18% 15%, rgb(255 255 255 / 16%) 0 1px, transparent 1.5px);
  background-size: 24px 24px, 24px 24px, 15px 19px;
  box-shadow: 0 0 45px rgb(41 115 151 / 18%);
}

.wallpaper-canvas::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  background: linear-gradient(180deg, rgb(255 255 255 / 7%), rgb(88 178 220 / 7%));
  content: "";
}

.wallpaper-heading {
  position: absolute;
  z-index: 6;
  top: 8.5%;
  left: 8%;
  color: white;
  font: 900 clamp(42px, 12vw, 58px)/0.98 ui-rounded, "Arial Rounded MT Bold", sans-serif;
  letter-spacing: -0.045em;
  text-shadow: 4px 5px 0 rgb(41 115 151 / 18%);
  transform: rotate(-2deg);
}

.wallpaper-heading p {
  margin: 0;
  white-space: nowrap;
}

.wallpaper-heading span {
  display: inline-block;
  margin-left: 0.12em;
  font-size: 0.66em;
  vertical-align: 0.15em;
  transform: rotate(10deg);
}

.wallpaper-brand {
  position: absolute;
  z-index: 6;
  top: 29%;
  left: 50%;
  width: 210px;
  height: 210px;
  transform: translateX(-50%) rotate(2deg);
}

.wallpaper-brand__orbit {
  position: absolute;
  inset: 0;
}

.wallpaper-brand__orbit span {
  --angle: calc(360deg / var(--character-count) * var(--character-index));
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 14px;
  margin: -7px 0 0 -5px;
  color: white;
  font: 900 9px/14px ui-rounded, "Arial Rounded MT Bold", sans-serif;
  text-align: center;
  text-shadow: 1px 2px 0 rgb(41 115 151 / 22%);
  transform: rotate(var(--angle)) translateY(-96px);
}

.wallpaper-brand > img {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 126px;
  filter: drop-shadow(0 7px 0 rgb(41 115 151 / 13%));
  transform: translate(-50%, -50%);
}

.wallpaper-collage {
  position: absolute;
  z-index: 5;
  inset: 0;
}

.wallpaper-collage img {
  position: absolute;
  max-width: none;
  object-fit: contain;
  filter: drop-shadow(3px 5px 0 rgb(41 115 151 / 12%));
}

.wallpaper-tape {
  position: absolute;
  z-index: 3;
  width: 88px;
  height: 25px;
  background: rgb(248 230 173 / 72%);
  clip-path: polygon(3% 5%, 100% 0, 96% 95%, 0 100%);
}

.wallpaper-tape--one {
  top: 5%;
  right: -18px;
  transform: rotate(38deg);
}

.wallpaper-tape--two {
  top: 48%;
  left: -25px;
  background: rgb(240 184 189 / 65%);
  transform: rotate(-24deg);
}

.wallpaper-download {
  position: fixed;
  z-index: 20;
  top: max(24px, env(safe-area-inset-top));
  right: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.wallpaper-download button {
  min-width: 126px;
  padding: 12px 18px;
  color: #58b2dc;
  border: 2px solid #58b2dc;
  border-radius: 13px;
  background: #fffdf7;
  box-shadow: 0 4px 0 #58b2dc, 0 8px 16px rgb(41 115 151 / 18%);
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: box-shadow 0.12s ease, transform 0.12s ease;
}

.wallpaper-download button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.wallpaper-download button:active:not(:disabled) {
  box-shadow: 0 1px 0 #58b2dc, 0 3px 7px rgb(41 115 151 / 15%);
  transform: translateY(3px);
}

.wallpaper-download button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.wallpaper-download a {
  display: inline-flex;
  min-width: 126px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  margin-top: 13px;
  padding: 10px 18px;
  color: #d89498;
  border: 2px solid #d89498;
  border-radius: 13px;
  background: #fffdf7;
  box-shadow: 0 4px 0 #d89498, 0 8px 16px rgb(216 148 152 / 16%);
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-decoration: none;
  transition: box-shadow 0.12s ease, transform 0.12s ease;
}

.wallpaper-download a:hover,
.wallpaper-download a:focus-visible {
  outline: 2px dashed white;
  outline-offset: 4px;
  transform: translateY(-1px);
}

.wallpaper-download a:active {
  box-shadow: 0 1px 0 #d89498, 0 3px 7px rgb(216 148 152 / 14%);
  transform: translateY(3px);
}

.wallpaper-download p {
  margin: 9px 0 0;
  padding: 6px 9px;
  color: #df4349;
  border-radius: 7px;
  background: rgb(255 253 247 / 92%);
  font-size: 10px;
  font-weight: 700;
}

@media (min-width: 500px) {
  .wallpaper-canvas {
    min-height: min(100svh, 932px);
    aspect-ratio: 9 / 19.5;
  }
}

@media (min-width: 760px) {
  .wallpaper-download {
    right: auto;
    left: calc(50% + 239px);
  }
}

</style>
