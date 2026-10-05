<script setup lang="ts">
useHead({ title: "5DAY｜約會後的小回饋" });
const config = useRuntimeConfig();
const form = ref<HTMLFormElement>();
const successHeading = ref<HTMLElement>();
const sending = ref(false);
const sent = ref(false);
const error = ref("");
const answers = reactive({ rating: 0, favorite: "", wishes: "", message: "" });
const hoveredRating = ref(0);
const displayedRating = computed(() => hoveredRating.value || answers.rating);

async function submitFeedback() {
  if (sending.value || sent.value || !form.value?.reportValidity()) return;
  if (![answers.favorite, answers.wishes, answers.message].every((answer) => answer.trim())) {
    error.value = "請填寫第 2、3、4 題，內容不能只有空白。";
    return;
  }
  const email = String(config.public.formSubmitEmail ?? "").trim();
  if (!email) {
    error.value = "收件信箱尚未設定，請稍後再試。";
    return;
  }
  sending.value = true;
  error.value = "";
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        "妳滿意今天的約會嗎？": `${answers.rating} / 5 顆愛心`,
        "妳覺得今天最喜歡（浪漫）的環節？": answers.favorite.trim() || "未填寫",
        想建議或許願的內容: answers.wishes.trim() || "未填寫",
        對今日服務員有什麼想說的話: answers.message.trim() || "未填寫",
        _subject: "5DAY 約會後回饋",
        _template: "table",
      }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || (result?.success !== true && result?.success !== "true")) throw new Error("submit failed");
    sent.value = true;
    await nextTick();
    successHeading.value?.focus();
  } catch {
    error.value = "送出失敗了，妳填寫的內容還在，請稍後再試一次。";
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <main class="feedback-page">
    <section class="feedback-card" aria-labelledby="feedback-title">
      <span class="access-gate__tape" aria-hidden="true" />
      <header>
        <h1 id="feedback-title">約會後的小回饋</h1>
      </header>
      <div v-if="sent" class="feedback-success" role="status">
        <h2 ref="successHeading" tabindex="-1">收到妳的小心意了 ♡</h2>
        <p>回饋已送出，我會好好讀完每一句話。<br />謝謝妳願意跟我分享。</p>
        <NuxtLink to="/" class="modal-button modal-button--accept feedback-submit">回到首頁</NuxtLink>
      </div>
      <form v-else ref="form" @submit.prevent="submitFeedback">
        <p class="feedback-required">四題皆為必填，請完成後再送出。</p>
        <fieldset :disabled="sending">
          <fieldset class="feedback-rating">
            <legend>1. 妳滿意今天的約會嗎？ ＊</legend>
            <div class="feedback-hearts" @mouseleave="hoveredRating = 0">
              <label v-for="rating in 5" :key="rating" class="feedback-heart" @mouseenter="hoveredRating = rating">
                <input v-model="answers.rating" type="radio" name="rating" :value="rating" :aria-label="`${rating} 顆愛心，滿分 5 顆`" required />
                <span :class="{ 'is-filled': rating <= displayedRating }" aria-hidden="true">{{ rating <= displayedRating ? '♥' : '♡' }}</span>
              </label>
            </div>
            <p class="feedback-rating-note" aria-live="polite">{{ answers.rating ? `已選擇 ${answers.rating} / 5 顆愛心` : '點選愛心評分，1 顆到 5 顆' }}</p>
          </fieldset>

          <label for="feedback-favorite">2. 妳覺得今天最喜歡（浪漫）的環節？ ＊</label>
          <textarea id="feedback-favorite" v-model="answers.favorite" rows="4" maxlength="2000" required placeholder="把今天最喜歡的時刻寫在這裡⋯" />

          <label for="feedback-wishes">3. 想建議或許願的內容 ＊</label>
          <textarea id="feedback-wishes" v-model="answers.wishes" rows="4" maxlength="2000" required placeholder="想調整的地方、想一起做的事，都可以許願。" />

          <label for="feedback-message">4. 對今日服務員有什麼想說的話 ＊</label>
          <textarea id="feedback-message" v-model="answers.message" rows="4" maxlength="2000" required placeholder="今日服務員準備好聽妳說了⋯" />
        </fieldset>
        <p class="feedback-note">送出後，回饋會寄到我的信箱。</p>
        <p v-if="error" class="feedback-error" role="alert">{{ error }}</p>
        <button type="submit" class="modal-button modal-button--accept feedback-submit" :disabled="sending">{{ sending ? "正在寄出妳的回饋⋯" : "送出回饋" }}</button>
      </form>
    </section>
  </main>
</template>

<style scoped>
.feedback-page {
  min-height: 100vh;
  padding: 60px 20px;
  background-color: var(--blue-paper);
  background-image: linear-gradient(var(--blue-grid) 1px, transparent 1px), linear-gradient(90deg, var(--blue-grid) 1px, transparent 1px);
  background-size: 25px 25px;
}
.feedback-card {
  position: relative;
  max-width: 650px;
  margin: auto;
  padding: 40px;
  border: 2px solid var(--teal);
  border-radius: 24px 17px 26px 19px;
  background: #fffdf7;
  box-shadow: 9px 11px 0 rgb(88 178 220 / 25%);
}
header { text-align: center; }
h1 { margin: 12px 0; font-size: clamp(24px, 5vw, 32px); letter-spacing: .05em; }
form { margin-top: 28px; }
.feedback-required, .feedback-note, .feedback-rating-note { color: var(--pencil); font-size: 12px; line-height: 1.8; }
fieldset { min-width: 0; margin: 0; padding: 0; border: 0; }
fieldset > label, legend { display: block; margin: 26px 0 10px; color: var(--pencil); font-size: 15px; font-weight: 800; line-height: 1.7; }
textarea {
  display: block;
  width: 100%;
  min-width: 0;
  padding: 14px;
  color: var(--ink);
  background: rgb(255 255 255 / 78%);
  border: 2px dashed var(--teal);
  border-radius: 16px 11px 18px 13px;
  box-shadow: 4px 5px 0 rgb(88 178 220 / 12%);
  font: inherit;
  font-size: 16px;
  line-height: 1.8;
  resize: vertical;
}
textarea::placeholder { color: #7c898e; font-size: 14px; }
.feedback-hearts { display: flex; gap: 8px; width: fit-content; max-width: 100%; }
.feedback-heart { position: relative; display: grid; place-items: center; width: 44px; height: 48px; cursor: pointer; }
.feedback-heart input { position: absolute; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; }
.feedback-heart span { color: var(--pink); font-size: 40px; line-height: 1; pointer-events: none; transition: color .15s, transform .15s; }
.feedback-heart span.is-filled { color: var(--red); }
.feedback-heart:hover span { transform: scale(1.1); }
.feedback-heart:has(input:focus-visible) { outline: 3px solid var(--teal); outline-offset: 3px; border-radius: 13px; }
.feedback-heart:has(input:disabled) { opacity: .6; cursor: wait; }
.feedback-rating-note { margin-top: 8px; }
.feedback-note { margin-top: 24px; }
.feedback-submit { display: flex; align-items: center; justify-content: center; width: 100%; height: auto; min-height: 48px; margin-top: 18px; font-family: inherit; text-decoration: none; transition: transform .15s, box-shadow .15s; }
.feedback-submit:active:not(:disabled) { transform: translateY(3px); box-shadow: 0 1px 0 #b63138; }
.feedback-submit:disabled { opacity: .6; box-shadow: none; cursor: wait; }
:is(textarea, button, a):focus-visible { outline: 3px solid var(--teal); outline-offset: 3px; }
.feedback-error { margin-top: 12px; color: var(--red); font-size: 14px; }
.feedback-success { padding: 35px 0 10px; text-align: center; }
.feedback-success h2 { margin-bottom: 15px; font-size: 23px; }
.feedback-success p { color: var(--pencil); font-size: 14px; line-height: 1.9; }
@media (max-width: 480px) { .feedback-page { padding: 35px 14px; } .feedback-card { padding: 32px 20px; } }
@media (prefers-reduced-motion: reduce) { .feedback-heart span, .feedback-submit { transition: none; } }
</style>
