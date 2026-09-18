<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import fiveDayLogo from "./5day.png";

interface ProductCard {
  id: string;
  eyebrow: string;
  title: string;
  price: string;
  color: string;
  accent: string;
  tilt: string;
}

const products: ProductCard[] = [
  {
    id: "01",
    eyebrow: "DAY ONE",
    title: "今天的可愛小物",
    price: "NT$ ---",
    color: "#f3c6c4",
    accent: "#d84a4f",
    tilt: "-2deg",
  },
  {
    id: "02",
    eyebrow: "DAY TWO",
    title: "輕飄飄日常選物",
    price: "NT$ ---",
    color: "#ccebf7",
    accent: "#58b2dc",
    tilt: "2.5deg",
  },
  {
    id: "03",
    eyebrow: "DAY THREE",
    title: "一點點閃亮心情",
    price: "NT$ ---",
    color: "#f2dda2",
    accent: "#bc7c2d",
    tilt: "-1.5deg",
  },
  {
    id: "04",
    eyebrow: "DAY FOUR",
    title: "陪你散步的好朋友",
    price: "NT$ ---",
    color: "#cddcf1",
    accent: "#6381ad",
    tilt: "1.5deg",
  },
];

const orbitText =
  "MAYDAY • EVERYDAY • HAPPYDAY • GOODDAY • MAYDAY • EVERYDAY • HAPPYDAY • GOODDAY • ";
const orbitCharacters = Array.from(orbitText);
const stickerImages = import.meta.glob<string>(
  "./assets/sticker/*.{png,jpg,jpeg,webp,gif,avif}",
  { eager: true, import: "default" },
);
const stickerOffsets = [-18, 12, -6, 20, -12, 5, -20, 14, -4, 18, -15, 8, -10];
const marqueeItems = Object.entries(stickerImages)
  .sort(([firstPath], [secondPath]) =>
    firstPath.localeCompare(secondPath, undefined, { numeric: true }),
  )
  .map(([path, src], index) => ({
    id: path.split("/").at(-1)?.replace(/\.[^.]+$/, "") ?? String(index + 1),
    src,
    delay: `${index * -0.17}s`,
    offset: `${stickerOffsets[index % stickerOffsets.length]}px`,
  }));

const pageHeight = ref<string>();
const sheetTransform = ref<string>();
const sheet = ref<HTMLElement>();
let frameId = 0;
let observer: IntersectionObserver | undefined;
let desktopQuery: MediaQueryList | undefined;

const syncDesktopScroll = () => {
  if (!sheet.value || !desktopQuery) return;
  if (desktopQuery.matches) {
    pageHeight.value = `${sheet.value.offsetHeight}px`;
    sheetTransform.value = `translate3d(0, ${-window.scrollY}px, 0)`;
  } else {
    pageHeight.value = undefined;
    sheetTransform.value = undefined;
  }
};

const requestSync = () => {
  if (frameId) return;
  frameId = window.requestAnimationFrame(() => {
    syncDesktopScroll();
    frameId = 0;
  });
};

onMounted(() => {
  desktopQuery = window.matchMedia("(min-width: 1280px)");
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  document
    .querySelectorAll<HTMLElement>("[data-reveal]")
    .forEach((item) => observer?.observe(item));
  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync);
  window.addEventListener("load", requestSync);
  desktopQuery.addEventListener("change", requestSync);
  requestSync();
});

onBeforeUnmount(() => {
  observer?.disconnect();
  window.removeEventListener("scroll", requestSync);
  window.removeEventListener("resize", requestSync);
  window.removeEventListener("load", requestSync);
  desktopQuery?.removeEventListener("change", requestSync);
  if (frameId) window.cancelAnimationFrame(frameId);
});
</script>

<template>
  <div class="site-canvas" :style="{ height: pageHeight }">
    <div class="desktop-doodles desktop-doodles--left" aria-hidden="true">
      <span class="doodle-flower">✿</span>
      <span class="doodle-line" />
      <span class="doodle-star">✦</span>
    </div>

    <div
      class="desktop-brand"
      aria-label="5DAY — Mayday, Everyday, Happyday, Goodday"
    >
      <div class="desktop-brand__orbit" aria-hidden="true">
        <span
          v-for="(character, index) in orbitCharacters"
          :key="`${character}-${index}`"
          class="desktop-brand__character"
          :style="{
            '--character-index': index,
            '--character-count': orbitCharacters.length,
          }"
          >{{ character === " " ? "\u00a0" : character }}</span
        >
      </div>
      <img class="desktop-brand__logo" :src="fiveDayLogo" alt="" />
      <span class="desktop-brand__tagline">every day, a little lovely</span>
    </div>

    <div class="phone-frame">
      <div
        ref="sheet"
        class="paper-sheet"
        :style="{ transform: sheetTransform }"
      >
        <main>
          <section class="hero" aria-labelledby="hero-title">
            <div class="hero__sun" aria-hidden="true">5</div>
            <span class="hero__flower hero__flower--one" aria-hidden="true"
              >✿</span
            >
            <span class="hero__flower hero__flower--two" aria-hidden="true"
              >✽</span
            >

            <div class="hero__inner">
              <img class="hero__logo" :src="fiveDayLogo" alt="5DAY" />

              <div class="hero__headline" data-reveal>
                <p class="hero__kicker">A TINY JOY FOR EVERY DAY</p>
                <h1 id="hero-title">把喜歡的日子<br /><em>貼</em>在一起</h1>
              </div>

              <div class="hero-collage" data-reveal>
                <div class="tape tape--pink" aria-hidden="true" />
                <div
                  class="hero-collage__photo placeholder-art"
                  role="img"
                  aria-label="主視覺圖片預留位置"
                >
                  <span class="placeholder-art__sun" />
                  <span
                    class="placeholder-art__hill placeholder-art__hill--one"
                  />
                  <span
                    class="placeholder-art__hill placeholder-art__hill--two"
                  />
                  <span class="placeholder-art__label">YOUR<br />PHOTO</span>
                </div>
                <span class="hero-collage__note"
                  >每天一點點，<br />就是剛剛好的可愛。</span
                >
                <span class="hero-collage__stamp" aria-hidden="true"
                  >GOOD<br />DAY!</span
                >
              </div>

              <p class="hero__caption" data-reveal>
                蒐集五天份的小心情，<br />讓普通的日常也值得好好紀念。
              </p>
            </div>
          </section>

          <section class="products" aria-labelledby="products-title">
            <div class="section-heading" data-reveal>
              <span>5DAY PICKS</span>
              <h2 id="products-title">本週的小小選物</h2>
              <p>pick your tiny favorite ♡</p>
            </div>

            <ul class="product-list">
              <li v-for="product in products" :key="product.id" data-reveal>
                <article
                  class="product-card"
                  :style="{ '--tilt': product.tilt }"
                >
                  <div
                    class="product-card__image"
                    :style="{
                      '--card-color': product.color,
                      '--card-accent': product.accent,
                    }"
                    role="img"
                    :aria-label="`${product.title}圖片預留位置`"
                  >
                    <span class="product-card__number">{{ product.id }}</span>
                    <span
                      class="product-card__shape product-card__shape--big"
                    />
                    <span
                      class="product-card__shape product-card__shape--small"
                    />
                  </div>
                  <div class="product-card__content">
                    <p class="product-card__eyebrow">{{ product.eyebrow }}</p>
                    <h3>{{ product.title }}</h3>
                    <p class="product-card__price">{{ product.price }}</p>
                    <span class="product-card__button" aria-label="商品即將推出"
                      >COMING SOON</span
                    >
                  </div>
                </article>
              </li>
            </ul>
          </section>

          <section class="about" aria-labelledby="about-title">
            <div class="about__inner">
              <div class="about__copy" data-reveal>
                <img :src="fiveDayLogo" alt="5DAY" />
                <p class="about__english">five days, five little joys.</p>
                <h2 id="about-title">給每天的自己，<br />一張可愛的紙膠帶。</h2>
                <p>
                  生活不一定天天閃閃發亮，<br />
                  但我們可以把喜歡的顏色、形狀和心情，<br />
                  一點一點貼進每一天。
                </p>
              </div>

              <div class="about-collage" data-reveal>
                <div
                  class="about-collage__photo about-collage__photo--one"
                  role="img"
                  aria-label="品牌圖片預留位置"
                >
                  <span>PHOTO 01</span>
                </div>
                <div
                  class="about-collage__photo about-collage__photo--two"
                  role="img"
                  aria-label="品牌圖片預留位置"
                >
                  <span>PHOTO 02</span>
                </div>
                <span class="about-collage__tape" aria-hidden="true" />
                <span class="about-collage__scribble" aria-hidden="true"
                  >♡</span
                >
              </div>

              <p class="about__closing" data-reveal>
                See you on another lovely day!
              </p>
            </div>
          </section>

        </main>

        <footer class="footer">
          <img :src="fiveDayLogo" alt="" />
          <p>© 2026 5DAY. made for little happy moments.</p>
        </footer>
      </div>
    </div>

    <section class="image-marquee" aria-label="5DAY 圖片輪播">
      <div class="image-marquee__viewport">
        <div class="image-marquee__track">
          <ul class="image-marquee__group">
            <li
              v-for="item in marqueeItems"
              :key="`primary-${item.id}`"
              class="image-marquee__item"
              :style="{
                '--sway-delay': item.delay,
                '--vertical-offset': item.offset,
              }"
            >
              <img
                :src="item.src"
                :alt="`5DAY 圖片占位圖 ${item.id}`"
              />
            </li>
          </ul>
          <ul class="image-marquee__group" aria-hidden="true">
            <li
              v-for="item in marqueeItems"
              :key="`duplicate-${item.id}`"
              class="image-marquee__item"
              :style="{
                '--sway-delay': item.delay,
                '--vertical-offset': item.offset,
              }"
            >
              <img :src="item.src" alt="" />
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
