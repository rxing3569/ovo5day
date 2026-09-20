<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { md5 } from "js-md5";
import fiveDayLogo from "./5day.png";
import heartImage from "./assets/images/heart.png";
import musicTrack from "./Nobody_else_in_my_heart.mp3";
import profileData from "./data/profile.json";

interface DatePlan {
  id: "A" | "B";
  label: string;
  title: string;
  tagline: string;
  time: string;
  place: string;
  itinerary: string[];
  dress: string;
  note: string;
  accent: string;
}

interface ProfileSection {
  title: string;
  icon: string;
  items: string[];
}

interface HeartMoment {
  id: number;
  text: string;
}

interface CalendarDay {
  date: Date;
  day: number;
  key: string;
  isPast: boolean;
  isToday: boolean;
  isUnavailable: boolean;
}

interface SavedDateInvitation {
  planId: "A" | "B";
  date: string;
  submittedAt: string;
}

const plans: DatePlan[] = [
  {
    id: "A",
    label: "PLAN A",
    title: "台北看展散步日",
    tagline: "來個輕鬆都市之旅。",
    time: "12:15 左右",
    place: "台北火車站",
    itinerary: [
      "在台北中山區吃飯（約 14:00-14:30 結束）",
      "在臺北市立美術館、對面圓山逛市集（約 16:30 - 17:00 結束）",
      "士林科教館 or 兒童新樂園散步、玩幾項設施（這是上述備案）",
      "最後去士林夜市吃晚餐與甜點（約 16:30 - 17:00 結束）",
    ],
    dress: "舒服、適合走一整天，也方便玩遊樂設施的穿著",
    note: "確認時間後，我會找餐廳我們一起來討論決定；第一次約會想讓妳在更熟悉、輕鬆的環境，建議選方案 B，由我來移動。",
    accent: "#f0b8bd",
  },
  {
    id: "B",
    label: "PLAN B",
    title: "基隆電影跑咖日",
    tagline: "看一場電影，再用幾杯咖啡慢慢交換最近的故事。",
    time: "12:00",
    place: "確定的餐廳集合",
    itinerary: ["吃飯～吃飯～", "先去看一場電影", "挑間咖啡店聊聊電影"],
    dress: "舒服、適合散步與長時間聊天的穿著",
    note: "我會找餐廳我們一起來討論決定；會在四天前確認電影時間，目前看到場次都約(15:00左右），電影想看暮然回首（描述兩位熱愛漫畫的少女藤野與京本，交織出長達 13 年的真摯青春與命運考驗。）",
    accent: "#9edaf0",
  },
];

const profileSections: ProfileSection[] = [
  {
    title: "興趣喜好",
    icon: "✦",
    items: [
      "看書、看展、散步遛狗、唱歌",
      "桌遊、密室逃脫、劇本殺，以及一切需要動腦的遊戲",
      "看電影、跑咖",
    ],
  },
  {
    title: "喜歡的事物",
    icon: "♡",
    items: ["蠟筆小新、可愛的事物（比如我？湊不要臉）", "五月天", "推理小說"],
  },
  {
    title: "雷點",
    icon: "!",
    items: [
      "刻意踩越界線、明知故犯、逃避溝通，以及讓事情一直沒有結論。",
      "不尊重彼此的時間與安排。",
      "擅動個人物品、未經同意就亂拍照。",
      "影響到她的生活",
    ],
  },
  {
    title: "喜歡吃的食物",
    icon: "♨",
    items: [
      "馬卡龍、甜甜圈、小蛋糕等甜食",
      "每天吃不膩的大陸餅（？）",
      "讓她開心到拍照的冬粉（？）",
      "蝦子等海鮮",
    ],
  },
  {
    title: "不喜吃的食物",
    icon: "×",
    items: [
      "鼻涕狀（蒸肉圓、酸辣湯）",
      "紅綠豆等豆類（但又喜歡味道）",
      "鱸魚（腥臭味）",
      "不喜歡傳統蛋糕、蜂蜜、雞蛋糕，那種海綿蛋糕類的",
    ],
  },
  { title: "過敏資訊", icon: "※", items: ["黃豆過敏"] },
  {
    title: "值得紀念",
    icon: "☆",
    items: [
      "09/09 初認識",
      "09/13 第一次通話",
      "09/15 第一次很認真稱讚我",
      "09/17 第一次送我東西，也表示說對我也有好感",
    ],
  },
];

const heartMomentSamples = [
  "09/09 發現她會分享東西，也會真誠的回應。",
  "09/10 發現她是第一個互動起來這麼相對的人，有認真聽我推薦的東西。",
  "09/12 發現她很善良、體貼。",
  "09/13 發現她是第一個讓我通宵講電話的人。",
  "09/13 發現她笑點很低。",
  "09/13 發現她還會模仿蠟筆小新。",
  "09/13 發現她笑起來很可愛的感覺。",
  "09/14 發現她唱歌很好聽。",
  "09/15 發現她比我還電視兒童。",
  "09/15 發現她喜歡周星馳電影與港劇。",
  "09/15 她稱讚我是溫暖的人。",
  "09/15 她跑去忙之後，會跟我說剛剛在幹麻。",
  "09/15 聊了戀愛人格，聊了她自己很多的心理。",
  "09/15 她會聽 ONE OK ROCK 且跟我最喜歡的歌一樣。",
  "09/16 她稱讚我很會拍照。",
  "09/16 她傳一張超！級！可！愛！的照片，只因為冬粉是她的愛。",
  "09/16 她會一直分享以前故事跟給我看歷史照片。",
  "09/16 發現她是真的不在意我外表的人。",
  "09/16 她跟我講了月老故事，發現緣分是一個超級可怕的事情。",
  "09/17 她送我小新主題，我笑得跟白癡沒兩樣。",
  "09/17 喔耶～她說對我也有好感。",
  "09/17 她下班已經很累了，還是跟我講電話。",
  "09/18 她跟我分享沒有跟朋友講的，她家裡以前的故事。",
  "09/18 她跟我說為了我，調整自己洗頭的頻率。",
  "09/18 她 IG 便利貼放了「整個世界只有你連上了我」，是跟我說吧？",
  "09/19 她忙了一天很累，還是打給我。",
  "09/20 湊不要臉，各種犯規等級的撩我。",
];
const heartMoments: HeartMoment[] = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  text: heartMomentSamples[index] ?? "",
}));
const MOMENTS_PER_PAGE = 5;
const MOMENTS_PAGE_COUNT = 20;
const easterStorageKey = "fiveDay.sticker11HintSeen";
const profileUnlockedStorageKey = "fiveDay.sticker11ProfileUnlocked";
const dateInvitationStorageKey = "fiveDay.dateInvitationSubmitted";
const accessAnswerHash = "de4c4aca3f982a1312cc8925ef3bd26d";
const runtimeConfig = useRuntimeConfig();
const route = useRoute();
const isWallpaperPage = computed(() => route.path === "/wallpaper");

const orbitText =
  "MAYDAY • EVERYDAY • HAPPYDAY • GOODDAY • MAYDAY • EVERYDAY • HAPPYDAY • GOODDAY • ";
const orbitCharacters = Array.from(orbitText);
const stickerImages = import.meta.glob<string>(
  "./assets/images/sticker/*.{png,jpg,jpeg,webp,gif,avif}",
  { eager: true, import: "default" },
);
const stickerOffsets = [-18, 12, -6, 20, -12, 5, -20, 14, -4, 18, -15, 8, -10];
const marqueeItems = Object.entries(stickerImages)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, src], index) => ({
    id:
      path
        .split("/")
        .at(-1)
        ?.replace(/\.[^.]+$/, "") ?? String(index + 1),
    src,
    delay: `${index * -0.17}s`,
    offset: `${stickerOffsets[index % stickerOffsets.length]}px`,
  }));

const pageHeight = ref<string>();
const isAccessGranted = ref(false);
const accessAnswer = ref("");
const accessError = ref("");
const accessInput = ref<HTMLInputElement>();
const sheetTransform = ref<string>();
const sheet = ref<HTMLElement>();
const dialog = ref<HTMLElement>();
const easterDialog = ref<HTMLElement>();
const musicPlayer = ref<HTMLAudioElement>();
const runawayButton = ref<HTMLButtonElement>();
const activePlan = ref<DatePlan>();
const easterView = ref<
  "hint" | "reveal" | "profile" | "spotlight" | "music" | undefined
>();
const momentsPage = ref(0);
const momentsSlideDirection = ref<"forward" | "backward">("forward");
const musicHasStarted = ref(false);
const isMusicPlaying = ref(false);
const musicError = ref(false);
const accepted = ref(false);
const selectedDate = ref("");
const dateSubmitted = ref(false);
const savedDateInvitation = ref<SavedDateInvitation>();
const isSubmittingDate = ref(false);
const dateSubmitError = ref("");
const showRejectEaster = ref(false);
const calendarCursor = ref(
  new Date(new Date().getFullYear(), new Date().getMonth(), 1),
);
const isShattering = ref(false);
const hasRunaway = ref(false);
const runawayCanAnimate = ref(false);
const runawayPosition = ref({ left: "12px", top: "10px" });
let frameId = 0;
let observer: IntersectionObserver | undefined;
let desktopQuery: MediaQueryList | undefined;
let previousFocus: HTMLElement | null = null;
let previousBodyOverflow = "";

const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
const unavailableDateKeys = new Set([
  "2026-10-03",
  "2026-10-18",
]);
const formSubmitEmail = computed(() =>
  String(runtimeConfig.public.formSubmitEmail ?? "").trim(),
);
const formatDateKey = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
const today = new Date();
today.setHours(0, 0, 0, 0);
const todayKey = formatDateKey(today);
const calendarTitle = computed(() =>
  new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "long",
  }).format(calendarCursor.value),
);
const calendarDays = computed<(CalendarDay | null)[]>(() => {
  const year = calendarCursor.value.getFullYear();
  const month = calendarCursor.value.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (CalendarDay | null)[] = Array.from(
    { length: firstWeekday },
    () => null,
  );
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const key = formatDateKey(date);
    days.push({
      date,
      day,
      key,
      isPast: date < today,
      isToday: key === todayKey,
      isUnavailable: unavailableDateKeys.has(key),
    });
  }
  return days;
});
const canShowPreviousMonth = computed(() => {
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return calendarCursor.value > currentMonth;
});
const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return "尚未選擇日期";
  const [year, month, day] = selectedDate.value.split("-").map(Number);
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(year!, month! - 1, day));
});
const readSavedDateInvitation = () => {
  try {
    const saved = localStorage.getItem(dateInvitationStorageKey);
    if (!saved) return undefined;
    const parsed = JSON.parse(saved) as Partial<SavedDateInvitation>;
    if (
      (parsed.planId !== "A" && parsed.planId !== "B") ||
      typeof parsed.date !== "string" ||
      typeof parsed.submittedAt !== "string"
    ) {
      return undefined;
    }
    return parsed as SavedDateInvitation;
  } catch {
    return undefined;
  }
};
const changeCalendarMonth = (amount: number) => {
  if (amount < 0 && !canShowPreviousMonth.value) return;
  calendarCursor.value = new Date(
    calendarCursor.value.getFullYear(),
    calendarCursor.value.getMonth() + amount,
    1,
  );
};
const visibleHeartMoments = computed(() => {
  const start = momentsPage.value * MOMENTS_PER_PAGE;
  return heartMoments.slice(start, start + MOMENTS_PER_PAGE);
});
const momentsTransitionName = computed(() =>
  momentsSlideDirection.value === "forward"
    ? "moments-slide-forward"
    : "moments-slide-backward",
);
const showNextMomentsPage = () => {
  momentsSlideDirection.value = "forward";
  momentsPage.value = (momentsPage.value + 1) % MOMENTS_PAGE_COUNT;
};
const showPreviousMomentsPage = () => {
  momentsSlideDirection.value = "backward";
  momentsPage.value =
    (momentsPage.value - 1 + MOMENTS_PAGE_COUNT) % MOMENTS_PAGE_COUNT;
};

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
const observeRevealItems = () => {
  document
    .querySelectorAll<HTMLElement>("[data-reveal]")
    .forEach((item) => observer?.observe(item));
};
const verifyAccessAnswer = async () => {
  if (md5(accessAnswer.value.trim()) !== accessAnswerHash) {
    accessError.value = "答案好像不太對，再想一下 ♡";
    accessAnswer.value = "";
    await nextTick();
    accessInput.value?.focus();
    return;
  }
  isAccessGranted.value = true;
  accessError.value = "";
  document.body.style.overflow = previousBodyOverflow;
  await nextTick();
  observeRevealItems();
  requestSync();
};

const openPlan = async (plan: DatePlan, event: MouseEvent) => {
  previousFocus = event.currentTarget as HTMLElement;
  activePlan.value = plan;
  accepted.value = false;
  showRejectEaster.value = false;
  selectedDate.value = "";
  dateSubmitted.value = false;
  dateSubmitError.value = "";
  isShattering.value = false;
  hasRunaway.value = false;
  runawayCanAnimate.value = false;
  runawayPosition.value = { left: "12px", top: "10px" };
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  await nextTick();
  dialog.value?.querySelector<HTMLElement>("[data-dialog-close]")?.focus();
};
const closePlan = () => {
  activePlan.value = undefined;
  accepted.value = false;
  showRejectEaster.value = false;
  document.body.style.overflow = previousBodyOverflow;
  nextTick(() => previousFocus?.focus());
};
const openEasterEgg = async (stickerId: string, event: MouseEvent) => {
  previousFocus = event.currentTarget as HTMLElement;
  if (stickerId === "02") {
    easterView.value = "music";
    musicError.value = false;
  } else if (stickerId === "14") {
    easterView.value = "spotlight";
  } else {
    const hasSeenHint = sessionStorage.getItem(easterStorageKey) === "1";
    const hasUnlockedProfile =
      sessionStorage.getItem(profileUnlockedStorageKey) === "1";
    easterView.value = !hasSeenHint
      ? "hint"
      : hasUnlockedProfile
        ? "profile"
        : "reveal";
  }
  momentsPage.value = 0;
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  await nextTick();
  easterDialog.value
    ?.querySelector<HTMLElement>("[data-easter-primary], [data-easter-close]")
    ?.focus();
};
const closeEasterEgg = () => {
  easterView.value = undefined;
  document.body.style.overflow = previousBodyOverflow;
  nextTick(() => previousFocus?.focus());
};
const confirmEasterHint = () => {
  sessionStorage.setItem(easterStorageKey, "1");
  closeEasterEgg();
};
const revealProfile = async () => {
  sessionStorage.setItem(profileUnlockedStorageKey, "1");
  easterView.value = "profile";
  momentsPage.value = 0;
  await nextTick();
  easterDialog.value
    ?.querySelector<HTMLElement>("[data-easter-close]")
    ?.focus();
};
const startMusic = async () => {
  if (!musicPlayer.value) return;
  musicError.value = false;
  try {
    await musicPlayer.value.play();
    musicHasStarted.value = true;
    closeEasterEgg();
  } catch {
    musicError.value = true;
  }
};
const toggleMusic = async () => {
  if (!musicPlayer.value) return;
  if (musicPlayer.value.paused) {
    try {
      await musicPlayer.value.play();
      musicHasStarted.value = true;
    } catch {
      musicError.value = true;
    }
  } else {
    musicPlayer.value.pause();
  }
};
const acceptPlan = () => {
  accepted.value = true;
  const saved = readSavedDateInvitation();
  savedDateInvitation.value = saved;
  selectedDate.value = saved?.date ?? "";
  dateSubmitted.value = Boolean(saved);
  if (saved) {
    activePlan.value = plans.find((plan) => plan.id === saved.planId);
  }
  dateSubmitError.value = "";
  calendarCursor.value = new Date(today.getFullYear(), today.getMonth(), 1);
  nextTick(() =>
    dialog.value?.querySelector<HTMLElement>("[data-calendar-focus]")?.focus(),
  );
};
const submitDateSelection = async () => {
  if (!activePlan.value || !selectedDate.value || isSubmittingDate.value)
    return;
  const existingSubmission = readSavedDateInvitation();
  if (existingSubmission) {
    savedDateInvitation.value = existingSubmission;
    selectedDate.value = existingSubmission.date;
    activePlan.value = plans.find(
      (plan) => plan.id === existingSubmission.planId,
    );
    dateSubmitted.value = true;
    return;
  }
  if (unavailableDateKeys.has(selectedDate.value)) {
    selectedDate.value = "";
    dateSubmitError.value = "這一天目前無法選擇，請挑選其他日期。";
    return;
  }
  if (!formSubmitEmail.value) {
    dateSubmitError.value = "收件信箱尚未設定，請先完成 FormSubmit 設定。";
    return;
  }
  isSubmittingDate.value = true;
  dateSubmitError.value = "";
  try {
    const response = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(formSubmitEmail.value)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          約會方案: activePlan.value.label,
          約會內容: activePlan.value.title,
          約會日期: selectedDate.value,
          _subject: `5DAY 約會成立｜${activePlan.value.label}`,
          _template: "table",
        }),
      },
    );
    const result = (await response.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
    } | null;
    if (!response.ok || result?.success === false) {
      throw new Error(result?.message || "submit failed");
    }
    const savedInvitation: SavedDateInvitation = {
      planId: activePlan.value.id,
      date: selectedDate.value,
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem(
      dateInvitationStorageKey,
      JSON.stringify(savedInvitation),
    );
    savedDateInvitation.value = savedInvitation;
    dateSubmitted.value = true;
    await nextTick();
    dialog.value?.querySelector<HTMLElement>("[data-success-close]")?.focus();
  } catch {
    dateSubmitError.value = "送出失敗了，請稍後再試一次。";
  } finally {
    isSubmittingDate.value = false;
  }
};
const shatterReject = () => {
  if (isShattering.value) return;
  isShattering.value = true;
};
const openRejectEaster = async () => {
  showRejectEaster.value = true;
  await nextTick();
  dialog.value?.querySelector<HTMLElement>("[data-wallpaper-link]")?.focus();
};
const moveRunawayButton = async (event?: Event) => {
  event?.preventDefault();
  const button = runawayButton.value;
  const modal = dialog.value;
  if (!button || !modal) return;
  const current = button.getBoundingClientRect();

  if (!hasRunaway.value) {
    runawayPosition.value = {
      left: `${Math.round(current.left)}px`,
      top: `${Math.round(current.top)}px`,
    };
    hasRunaway.value = true;
    await nextTick();
    await new Promise<void>((resolve) =>
      window.requestAnimationFrame(() => resolve()),
    );
    await new Promise<void>((resolve) =>
      window.requestAnimationFrame(() => resolve()),
    );
    runawayCanAnimate.value = true;
    await nextTick();
  }

  const margin = 18;
  const modalBounds = modal.getBoundingClientRect();
  const minLeft = Math.max(margin, modalBounds.left - 12);
  const maxLeft = Math.min(
    window.innerWidth - button.offsetWidth - margin,
    modalBounds.right - button.offsetWidth + 12,
  );
  const minTop = Math.max(margin, modalBounds.top + 42);
  const maxTop = Math.min(
    window.innerHeight - button.offsetHeight - margin,
    modalBounds.bottom - button.offsetHeight - 12,
  );
  const horizontalStep = button.offsetWidth + 22 + Math.random() * 34;
  const verticalStep = button.offsetHeight + 18 + Math.random() * 28;
  const candidates = [
    { left: current.left + horizontalStep, top: current.top + verticalStep },
    { left: current.left + horizontalStep, top: current.top - verticalStep },
    { left: current.left - horizontalStep, top: current.top + verticalStep },
    { left: current.left - horizontalStep, top: current.top - verticalStep },
  ]
    .map((candidate) => ({
      left: Math.min(maxLeft, Math.max(minLeft, candidate.left)),
      top: Math.min(maxTop, Math.max(minTop, candidate.top)),
    }))
    .filter(
      (candidate) =>
        Math.abs(candidate.left - current.left) > button.offsetWidth &&
        Math.abs(candidate.top - current.top) > button.offsetHeight,
    );
  const target = candidates[Math.floor(Math.random() * candidates.length)] ?? {
    left: current.left < (minLeft + maxLeft) / 2 ? maxLeft : minLeft,
    top: current.top < (minTop + maxTop) / 2 ? maxTop : minTop,
  };
  runawayPosition.value = {
    left: `${Math.round(target.left)}px`,
    top: `${Math.round(target.top)}px`,
  };
};
const handleDialogKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closePlan();
    return;
  }
  if (event.key !== "Tab" || !dialog.value) return;
  const focusable = Array.from(
    dialog.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((item) => item.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
};

const handleEasterKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeEasterEgg();
    return;
  }
  if (event.key !== "Tab" || !easterDialog.value) return;
  const focusable = Array.from(
    easterDialog.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((item) => item.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
};

onMounted(() => {
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  nextTick(() => accessInput.value?.focus());
  savedDateInvitation.value = readSavedDateInvitation();
  if (musicPlayer.value) musicPlayer.value.volume = 0.35;
  if (!isWallpaperPage.value && easterView.value) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    nextTick(() =>
      easterDialog.value
        ?.querySelector<HTMLElement>("[data-easter-close]")
        ?.focus(),
    );
  }
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
  observeRevealItems();
  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync);
  window.addEventListener("load", requestSync);
  desktopQuery.addEventListener("change", requestSync);
  requestSync();
});
watch(isWallpaperPage, async (isWallpaper) => {
  if (!import.meta.client) return;
  if (isWallpaper) {
    document.body.style.overflow = previousBodyOverflow;
    return;
  }
  await nextTick();
  observeRevealItems();
  requestSync();
  if (easterView.value) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    await nextTick();
    easterDialog.value
      ?.querySelector<HTMLElement>("[data-easter-close]")
      ?.focus();
  }
});
onBeforeUnmount(() => {
  observer?.disconnect();
  window.removeEventListener("scroll", requestSync);
  window.removeEventListener("resize", requestSync);
  window.removeEventListener("load", requestSync);
  desktopQuery?.removeEventListener("change", requestSync);
  if (frameId) window.cancelAnimationFrame(frameId);
  musicPlayer.value?.pause();
  document.body.style.overflow = previousBodyOverflow;
});
</script>

<template>
  <Teleport to="body">
    <div v-if="!isAccessGranted" class="access-gate" role="presentation">
      <section
        class="access-gate__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="access-gate-title"
      >
        <span class="access-gate__tape" aria-hidden="true" />
        <p class="access-gate__eyebrow">A LITTLE QUESTION FOR YOU</p>
        <h1 id="access-gate-title">請問妳幫我取的綽號是什麼？</h1>
        <form @submit.prevent="verifyAccessAnswer">
          <label for="access-answer">把答案寫在這裡</label>
          <input
            id="access-answer"
            ref="accessInput"
            v-model="accessAnswer"
            type="text"
            autocomplete="off"
            enterkeyhint="done"
            :aria-invalid="Boolean(accessError)"
            :aria-describedby="accessError ? 'access-error' : undefined"
            @input="accessError = ''"
          />
          <p v-if="accessError" id="access-error" role="alert">
            {{ accessError }}
          </p>
          <button type="submit" :disabled="!accessAnswer.trim()">
            開啟邀請
          </button>
        </form>
      </section>
    </div>
  </Teleport>
  <WallpaperPage v-if="isWallpaperPage" />
  <template v-else>
    <div class="site-canvas" :style="{ height: pageHeight }">
      <div class="desktop-doodles desktop-doodles--left" aria-hidden="true">
        <span class="doodle-flower">✿</span>
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
      </div>
      <p class="desktop-tagline" aria-label="every day, a little lovely">
        every day,<br />a little lovely<span
          class="desktop-tagline__star"
          aria-hidden="true"
          >✦</span
        >
      </p>

      <div class="phone-frame">
        <div
          ref="sheet"
          class="paper-sheet"
          :style="{ transform: sheetTransform }"
        >
          <main class="invite-page">
            <section class="invite-hero" aria-labelledby="invite-title">
              <div class="invite-hero__kicker" data-reveal>
                YOU HAVE A DATE INVITATION!
              </div>
              <h1 id="invite-title" data-reveal>邀請妳<em>蹉跎一天</em></h1>
              <div class="invite-letter" data-reveal>
                <span class="invite-letter__tape" aria-hidden="true" />
                <img class="invite-letter__heart" :src="heartImage" alt="" />
                <p>
                  <br />本來平凡的日子，和特別的妳一起時， 就好像變得值得期待。
                  <br />
                  <br />想挑一天，與妳一起吃個飯、吃甜食、走走～
                </p>
                <strong>所以想請妳把一天留給我。</strong>
              </div>
              <div class="date-plans" aria-label="選擇約會方案" data-reveal>
                <p class="date-plans__prompt">CHOOSE OUR DAY</p>
                <div class="date-plans__grid">
                  <button
                    v-for="plan in plans"
                    :key="plan.id"
                    type="button"
                    class="plan-choice"
                    :class="`plan-choice--${plan.id.toLowerCase()}`"
                    :style="{ '--plan-accent': plan.accent }"
                    @click="openPlan(plan, $event)"
                  >
                    <span>{{ plan.label }}</span>
                    <strong>方案 {{ plan.id }}</strong>
                    <small>點擊查看</small>
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      <section class="image-marquee" aria-label="5DAY 圖片輪播">
        <div class="image-marquee__viewport">
          <div class="image-marquee__track">
            <ul
              v-for="group in 2"
              :key="group"
              class="image-marquee__group"
              :aria-hidden="group === 2"
            >
              <li
                v-for="item in marqueeItems"
                :key="`${group}-${item.id}`"
                class="image-marquee__item"
                :style="{
                  '--sway-delay': item.delay,
                  '--vertical-offset': item.offset,
                }"
              >
                <button
                  v-if="
                    item.id === '02' || item.id === '11' || item.id === '14'
                  "
                  type="button"
                  class="image-marquee__sticker image-marquee__sticker--easter"
                  :tabindex="group === 1 ? 0 : -1"
                  :aria-label="
                    group === 1 ? `查看 sticker ${item.id}` : undefined
                  "
                  @click="openEasterEgg(item.id, $event)"
                >
                  <img
                    :src="item.src"
                    :alt="group === 1 ? `5DAY 貼圖 ${item.id}` : ''"
                  />
                  <div
                    v-if="item.id === '11'"
                    class="sticker-hearts"
                    aria-hidden="true"
                  >
                    <img
                      class="sticker-hearts__large"
                      :src="heartImage"
                      alt=""
                    /><img
                      class="sticker-hearts__small"
                      :src="heartImage"
                      alt=""
                    />
                  </div>
                </button>
                <div v-else class="image-marquee__sticker">
                  <img
                    :src="item.src"
                    :alt="group === 1 ? `5DAY 貼圖 ${item.id}` : ''"
                  />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>

    <Teleport to="body">
      <div
        v-if="activePlan"
        class="date-modal"
        role="presentation"
        @click.self="closePlan"
      >
        <section
          ref="dialog"
          class="date-dialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="
            showRejectEaster
              ? 'reject-easter-title'
              : accepted
                ? 'success-title'
                : 'dialog-title'
          "
          @keydown="handleDialogKeydown"
        >
          <button
            type="button"
            class="date-dialog__close"
            aria-label="關閉約會資訊"
            data-dialog-close
            @click="closePlan"
          >
            ×
          </button>
          <div v-if="showRejectEaster" class="date-reject-easter">
            <span aria-hidden="true">♡</span>
            <p>ONE MORE SURPRISE</p>
            <h2 id="reject-easter-title">
              好難過喔～竟然真的無情拒絕，不過我人很好，還是我送給妳一個彩蛋～
            </h2>
            <NuxtLink to="/wallpaper" data-wallpaper-link @click="closePlan">
              拿取彩蛋
            </NuxtLink>
          </div>
          <div v-else-if="!accepted" class="date-dialog__content">
            <div class="date-dialog__badges">
              <span class="date-dialog__plan">{{ activePlan.label }}</span>
            </div>
            <div class="date-dialog__title-row">
              <span
                v-if="activePlan.id === 'B'"
                class="date-dialog__recommended"
              >
                主打推薦
              </span>
              <h2 id="dialog-title">{{ activePlan.title }}</h2>
            </div>
            <p class="date-dialog__tagline">{{ activePlan.tagline }}</p>
            <dl class="date-details">
              <div>
                <dt>時間</dt>
                <dd>{{ activePlan.time }}</dd>
              </div>
              <div>
                <dt>集合</dt>
                <dd>{{ activePlan.place }}</dd>
              </div>
              <div>
                <dt>行程</dt>
                <dd>
                  <ol>
                    <li v-for="step in activePlan.itinerary" :key="step">
                      {{ step }}
                    </li>
                  </ol>
                </dd>
              </div>
              <div>
                <dt>穿著</dt>
                <dd>{{ activePlan.dress }}</dd>
              </div>
            </dl>
            <p class="date-dialog__note">{{ activePlan.note }}</p>
            <div v-if="activePlan.id === 'A'" class="modal-actions">
              <div
                class="shatter-wrap"
                :class="{ 'is-shattering': isShattering }"
              >
                <button
                  type="button"
                  class="modal-button modal-button--reject shatter-button"
                  aria-disabled="true"
                  @mouseenter="shatterReject"
                  @focus="shatterReject"
                  @click.prevent="openRejectEaster"
                >
                  無情拒絕
                </button>
                <span
                  v-for="fragment in 8"
                  :key="fragment"
                  class="shatter-fragment"
                  >無情拒絕</span
                >
              </div>
              <button
                type="button"
                class="modal-button modal-button--accept"
                @click="acceptPlan"
              >
                開心前往
              </button>
            </div>
            <div v-else class="modal-actions">
              <div class="runaway-slot">
                <button
                  ref="runawayButton"
                  type="button"
                  class="modal-button modal-button--reject runaway-button"
                  :class="{
                    'is-running': hasRunaway,
                    'can-animate': runawayCanAnimate,
                  }"
                  :style="runawayPosition"
                  aria-disabled="true"
                  @mouseenter="moveRunawayButton"
                  @focus="moveRunawayButton"
                  @touchstart.prevent="moveRunawayButton"
                  @click.prevent="moveRunawayButton"
                >
                  無情拒絕
                </button>
              </div>
              <button
                type="button"
                class="modal-button modal-button--accept"
                @click="acceptPlan"
              >
                開心前往
              </button>
            </div>
          </div>
          <div v-else class="date-success">
            <template v-if="!dateSubmitted">
              <span>CHOOSE OUR DATE</span>
              <h2 id="success-title">選一個約會日 ♡</h2>
              <p>
                妳選擇了「{{
                  activePlan.title
                }}」<br />再挑一天，把約會正式寫進日曆。
              </p>

              <form
                class="date-picker-form"
                @submit.prevent="submitDateSelection"
              >
                <div class="date-picker" aria-label="選擇約會日期">
                  <div class="date-picker__header">
                    <button
                      type="button"
                      class="date-picker__month-button"
                      :disabled="!canShowPreviousMonth"
                      aria-label="上個月"
                      @click="changeCalendarMonth(-1)"
                    >
                      ←
                    </button>
                    <strong>{{ calendarTitle }}</strong>
                    <button
                      type="button"
                      class="date-picker__month-button"
                      aria-label="下個月"
                      @click="changeCalendarMonth(1)"
                    >
                      →
                    </button>
                  </div>
                  <div class="date-picker__weekdays" aria-hidden="true">
                    <span v-for="weekday in weekdays" :key="weekday">{{
                      weekday
                    }}</span>
                  </div>
                  <div class="date-picker__days">
                    <template
                      v-for="(day, index) in calendarDays"
                      :key="day?.key ?? `blank-${index}`"
                    >
                      <span v-if="!day" class="date-picker__blank" />
                      <button
                        v-else
                        type="button"
                        class="date-picker__day"
                        :class="{
                          'is-today': day.isToday,
                          'is-selected': selectedDate === day.key,
                        }"
                        :disabled="day.isPast || day.isUnavailable"
                        :aria-label="`${day.key}${day.isToday ? '，今天' : ''}${day.isUnavailable ? '，無法選擇' : ''}`"
                        :aria-pressed="selectedDate === day.key"
                        :data-calendar-focus="day.isToday ? '' : undefined"
                        @click="selectedDate = day.key"
                      >
                        {{ day.day }}
                      </button>
                    </template>
                  </div>
                </div>

                <p class="date-picker__selection">{{ selectedDateLabel }}</p>
                <p v-if="!formSubmitEmail" class="date-picker__config-note">
                  收件信箱尚未設定
                </p>
                <p
                  v-if="dateSubmitError"
                  class="date-picker__error"
                  role="alert"
                >
                  {{ dateSubmitError }}
                </p>
                <button
                  type="submit"
                  class="date-picker__submit"
                  :disabled="
                    !selectedDate || !formSubmitEmail || isSubmittingDate
                  "
                >
                  {{ isSubmittingDate ? "正在送出⋯" : "確認這一天" }}
                </button>
              </form>
            </template>

            <template v-else>
              <img :src="heartImage" alt="" /><span>IT'S A DATE!</span>
              <h2 id="success-title">太好了，約會成立 ♡</h2>
              <p>{{ selectedDateLabel }}<br />我會帶著好心情準時出現。</p>
              <button type="button" data-success-close @click="closePlan">
                收下邀請
              </button>
            </template>
          </div>
        </section>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="easterView"
        class="easter-modal"
        role="presentation"
        @click.self="closeEasterEgg"
      >
        <section
          ref="easterDialog"
          class="easter-dialog"
          :class="{ 'easter-dialog--profile': easterView === 'profile' }"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="
            easterView === 'profile'
              ? 'profile-title'
              : easterView === 'reveal'
                ? 'easter-reveal-title'
                : easterView === 'music'
                  ? 'music-title'
                  : easterView === 'spotlight'
                    ? 'spotlight-title'
                    : 'easter-hint-title'
          "
          @keydown="handleEasterKeydown"
        >
          <button
            type="button"
            class="easter-dialog__close"
            aria-label="關閉視窗"
            data-easter-close
            @click="closeEasterEgg"
          >
            ×
          </button>

          <div v-if="easterView === 'hint'" class="easter-hint">
            <span aria-hidden="true">✦</span>
            <p class="easter-hint__eyebrow">NOT QUITE YET...</p>
            <h2 id="easter-hint-title">
              很可惜，差一點就找到小彩蛋了，再努力找找
            </h2>
            <button
              type="button"
              data-easter-primary
              @click="confirmEasterHint"
            >
              好，我再找找
            </button>
          </div>

          <div v-else-if="easterView === 'reveal'" class="easter-hint">
            <span aria-hidden="true">♡</span>
            <p class="easter-hint__eyebrow">YOU FOUND IT!</p>
            <h2 id="easter-reveal-title">哇～恭喜妳找到最大彩蛋了</h2>
            <button type="button" data-easter-primary @click="revealProfile">
              我要看
            </button>
          </div>

          <div v-else-if="easterView === 'spotlight'" class="easter-hint">
            <span aria-hidden="true">♡</span>
            <p class="easter-hint__eyebrow">JUST KIDDING!</p>
            <h2 id="spotlight-title">
              喵～我不是彩蛋喔～我只是來搶鏡頭的啦！但我有偷看到，要給妳的彩蛋有三個喔～～
            </h2>
            <button type="button" data-easter-primary @click="closeEasterEgg">
              好啦，被妳搶到了
            </button>
          </div>

          <div
            v-else-if="easterView === 'music'"
            class="easter-hint music-invite"
          >
            <span aria-hidden="true">♫</span>
            <p class="easter-hint__eyebrow">A SONG FOR YOU</p>
            <h2 id="music-title">
              恭喜妳找到一個彩蛋～這邊藏有一首歌，妳想要聽嗎？
            </h2>
            <p v-if="musicError" class="music-invite__error" role="alert">
              播放失敗了，請再試一次。
            </p>
            <button type="button" data-easter-primary @click="startMusic">
              我想聽 ♫
            </button>
          </div>

          <div v-else class="profile-page">
            <header class="profile-header">
              <div>
                <p>JOURNAL ABOUT YOU</p>
                <h2 id="profile-title">觀芯札記</h2>
                <span>31Y・LEO・INTJ</span>
              </div>
              <div class="profile-avatar">
                <img :src="fiveDayLogo" alt="5DAY Logo" />
                <div class="profile-avatar__hearts" aria-hidden="true">
                  <img :src="heartImage" alt="" />
                  <img :src="heartImage" alt="" />
                  <img :src="heartImage" alt="" />
                </div>
              </div>
            </header>

            <section class="mood-journal" aria-labelledby="mood-journal-title">
              <span class="mood-journal__tape" aria-hidden="true" />
              <div class="mood-journal__heading">
                <div>
                  <p>A LITTLE SECRET</p>
                  <h3 id="mood-journal-title">我想偷偷跟妳說...</h3>
                </div>
              </div>
              <div class="mood-journal__content">
                <p v-for="message in profileData.secretMessage" :key="message">
                  {{ message }}
                </p>
              </div>
            </section>

            <div class="profile-sections">
              <article
                v-for="section in profileSections"
                :key="section.title"
                class="profile-card"
              >
                <h3>
                  <span aria-hidden="true">{{ section.icon }}</span
                  >{{ section.title }}
                </h3>
                <ul>
                  <li v-for="item in section.items" :key="item">{{ item }}</li>
                </ul>
              </article>
            </div>

            <section
              class="heart-moments"
              aria-labelledby="heart-moments-title"
            >
              <div class="heart-moments__heading">
                <div>
                  <p>100 LITTLE MEMORIES</p>
                  <h3 id="heart-moments-title">芯動時分</h3>
                </div>
                <span aria-live="polite"
                  >{{ momentsPage + 1 }} / {{ MOMENTS_PAGE_COUNT }}</span
                >
              </div>
              <Transition :name="momentsTransitionName" mode="out-in">
                <ol
                  :key="momentsPage"
                  class="heart-moments__list"
                  :start="momentsPage * MOMENTS_PER_PAGE + 1"
                >
                  <li v-for="moment in visibleHeartMoments" :key="moment.id">
                    <span>{{ String(moment.id).padStart(3, "0") }}</span>
                    <p :class="{ 'is-empty': !moment.text }">
                      {{ moment.text || "未完待續..." }}
                    </p>
                  </li>
                </ol>
              </Transition>
              <div class="heart-moments__pagination">
                <button
                  type="button"
                  aria-label="上一頁"
                  @click="showPreviousMomentsPage"
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="下一頁"
                  @click="showNextMomentsPage"
                >
                  →
                </button>
              </div>
            </section>
          </div>
        </section>
      </div>
    </Teleport>

    <audio
      ref="musicPlayer"
      :src="musicTrack"
      preload="metadata"
      @play="isMusicPlaying = true"
      @pause="isMusicPlaying = false"
      @ended="isMusicPlaying = false"
    />
    <button
      v-if="musicHasStarted"
      type="button"
      class="floating-music-control"
      :class="{ 'is-playing': isMusicPlaying }"
      :aria-label="isMusicPlaying ? '暫停歌曲' : '播放歌曲'"
      :title="isMusicPlaying ? '暫停歌曲' : '播放歌曲'"
      @click="toggleMusic"
    >
      <span aria-hidden="true">{{ isMusicPlaying ? "Ⅱ" : "▶" }}</span>
      <small>五月天<br />心中無別人</small>
    </button>
  </template>
</template>
