const SOUND_KEY = "mogu-log-sound-enabled-v2";
const CHROME_KEY = "mogu-log-chrome-hidden-v2";
const QUICK_NAV_KEY = "mogu-log-quick-nav-visible-v1";
const REMEMBER_LOGIN_KEY = "mogu-log-remember-login-v1";
const GUEST_LIKES_KEY = "mogu-log-guest-likes-v1";
const GUEST_BOOSTS_KEY = "mogu-log-guest-boosts-v1";
const SAVED_POSTS_KEY = "mogu-log-saved-posts-v2";
const AVATAR_KEY_PREFIX = "mogu-log-avatar-v1";

const config = window.MOGU_SUPABASE_CONFIG || {};
const hasSupabaseConfig = Boolean(config.url && config.anonKey);
const rememberLogin = localStorage.getItem(REMEMBER_LOGIN_KEY) !== "false";
const authStorage = {
  getItem(key) {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  },
  setItem(key, value) {
    const target = localStorage.getItem(REMEMBER_LOGIN_KEY) === "false" ? sessionStorage : localStorage;
    const other = target === localStorage ? sessionStorage : localStorage;
    target.setItem(key, value);
    other.removeItem(key);
  },
  removeItem(key) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};
const supabaseClient =
  hasSupabaseConfig && window.supabase
    ? window.supabase.createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: authStorage,
          storageKey: "mogu-log-auth-session",
        },
      })
    : null;
const storageBucket = config.storageBucket || "post-images";

const demoPosts = [
  {
    id: "demo-1",
    title: "焼き鮭とお味噌汁の朝ごはん",
    description: "あたたかいお味噌汁で一日がちゃんと始まる感じ。小鉢の漬物もよかったです。",
    image_url: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=900&q=80",
    author_name: "mogu",
    created_at: new Date().toISOString(),
    likes_count: 0,
    boosts_count: 0,
    shop_name: "いつもの食堂",
    comments: [{ body: "朝ごはんの空気まで伝わる一枚です。" }],
  },
  {
    id: "demo-2",
    title: "ふわふわ卵のオムライス",
    description: "ケチャップの酸味と卵の甘さがちょうどよくて、また食べたい一皿でした。",
    image_url: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c2?auto=format&fit=crop&w=900&q=80",
    author_name: "mogu",
    created_at: new Date().toISOString(),
    likes_count: 0,
    boosts_count: 0,
    comments: [{ body: "卵のふわっと感がいいですね。" }],
  },
  {
    id: "demo-3",
    title: "抹茶と季節の甘味",
    description: "食後にゆっくり味わいたい甘さ。写真を見返すだけで少し落ち着きます。",
    image_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=80",
    author_name: "mogu",
    created_at: new Date().toISOString(),
    likes_count: 0,
    boosts_count: 0,
    comments: [{ body: "保存して後で見返したくなる甘味です。" }],
  },
];

function getExamplePosts() {
  return demoPosts.map((post, index) => ({
    ...post,
    id: `example-${post.id}`,
    author_handle: "mogu_example",
    liked_by_me: false,
    boosted_by_me: false,
    likes_count: [12, 8, 23][index] || 0,
    boosts_count: [3, 1, 5][index] || 0,
    is_example: true,
  }));
}

const elements = {
  body: document.body,
  appNav: document.querySelector(".app-nav"),
  chromeToggle: document.querySelector("#chromeToggle"),
  chromeTogglePanel: document.querySelector("#chromeTogglePanel"),
  quickNavTogglePanel: document.querySelector("#quickNavTogglePanel"),
  rememberLoginTogglePanel: document.querySelector("#rememberLoginTogglePanel"),
  headerLoginButton: document.querySelector("#headerLoginButton"),
  introLoginButton: document.querySelector("#introLoginButton"),
  focusPostButton: document.querySelector("#focusPostButton"),
  focusDeleteButton: document.querySelector("#focusDeleteButton"),
  soundToggle: document.querySelector("#soundToggle"),
  soundTogglePanel: document.querySelector("#soundTogglePanel"),
  accountSection: document.querySelector("#accountSection"),
  accountStatus: document.querySelector("#accountStatus"),
  accountHint: document.querySelector("#accountHint"),
  currentAvatar: document.querySelector("#currentAvatar"),
  authForm: document.querySelector("#authForm"),
  googleSignInButton: document.querySelector("#googleSignInButton"),
  signOutButton: document.querySelector("#signOutButton"),
  postNotice: document.querySelector("#postNotice"),
  postForm: document.querySelector("#postForm"),
  photoInput: document.querySelector("#photoInput"),
  titleInput: document.querySelector("#titleInput"),
  descriptionInput: document.querySelector("#descriptionInput"),
  locationToggle: document.querySelector("#locationToggle"),
  locationFields: document.querySelector("#locationFields"),
  shopNameInput: document.querySelector("#shopNameInput"),
  getLocationButton: document.querySelector("#getLocationButton"),
  locationStatus: document.querySelector("#locationStatus"),
  placeFinder: document.querySelector("#placeFinder"),
  placeMapPreview: document.querySelector("#placeMapPreview"),
  placePredictions: document.querySelector("#placePredictions"),
  imageEditor: document.querySelector("#imageEditor"),
  previewCanvas: document.querySelector("#previewCanvas"),
  brightnessInput: document.querySelector("#brightnessInput"),
  contrastInput: document.querySelector("#contrastInput"),
  saturationInput: document.querySelector("#saturationInput"),
  warmthInput: document.querySelector("#warmthInput"),
  overlayTextInput: document.querySelector("#overlayTextInput"),
  stampSelect: document.querySelector("#stampSelect"),
  rotateButton: document.querySelector("#rotateButton"),
  resetImageButton: document.querySelector("#resetImageButton"),
  legalDialog: document.querySelector("#legalDialog"),
  legalDialogLabel: document.querySelector("#legalDialogLabel"),
  legalDialogTitle: document.querySelector("#legalDialogTitle"),
  legalDialogBody: document.querySelector("#legalDialogBody"),
  legalCloseButton: document.querySelector("#legalCloseButton"),
  searchInput: document.querySelector("#searchInput"),
  searchBox: document.querySelector("#searchBox"),
  feed: document.querySelector("#feed"),
  rankingFeed: document.querySelector("#rankingFeed"),
  rankingEmptyState: document.querySelector("#rankingEmptyState"),
  postTemplate: document.querySelector("#postTemplate"),
  postCount: document.querySelector("#postCount"),
  emptyState: document.querySelector("#emptyState"),
  avatarInput: document.querySelector("#avatarInput"),
};

document.addEventListener("click", handleNavigationClick, true);

let posts = demoPosts;
let currentUser = null;
let currentProfile = null;
let sourceImage = null;
let imageRotation = 0;
let selectedLocation = null;
let soundEnabled = localStorage.getItem(SOUND_KEY) !== "false";
let audioContext = null;
let guestLikes = new Set(JSON.parse(localStorage.getItem(GUEST_LIKES_KEY) || "[]"));
let guestBoosts = new Set(JSON.parse(localStorage.getItem(GUEST_BOOSTS_KEY) || "[]"));
let savedPostIds = JSON.parse(localStorage.getItem(SAVED_POSTS_KEY) || "[]");
let rankingMode = false;

const placePredictionTypes = [
  "レストラン",
  "ラーメン",
  "カフェ",
  "寿司",
  "焼肉",
  "定食",
];

const legalDocuments = {
  terms: {
    label: "Terms",
    title: "もぐログ 利用規約",
    sections: [
      ["サービスについて", "もぐログは、料理・飲み物・食事体験に関する写真や文章を記録し共有するサービスです。利用者は、本サービスを利用した時点で本規約に同意したものとします。"],
      ["投稿できる内容", "投稿できるのは、利用者本人が撮影・作成した画像や文章、または権利者から必要な許可を得た内容です。料理や飲食と無関係な投稿、他人の著作物の無断利用、個人情報が写り込んだ投稿はできません。"],
      ["禁止事項", "権利侵害、なりすまし、嫌がらせ、差別的・暴力的・性的な内容、違法行為を助長する内容、スパム、過度な宣伝、サービスの妨害、通報機能の悪用は禁止します。"],
      ["著作権と利用許諾", "投稿内容の著作権は投稿者に残ります。ただし投稿者は、投稿の表示、保存、共有、改善、通報対応、不正利用防止に必要な範囲で、運営者が投稿内容を利用することを許可します。"],
      ["通報と削除", "運営者は、通報、権利侵害のおそれ、規約違反、法令違反、サービス運営上の必要がある場合、投稿の非表示・削除、アカウントの制限を行うことがあります。"],
      ["免責", "本サービスは、投稿内容の正確性、保存の永続性、サービスの中断がないことを保証しません。利用者間または第三者とのトラブルについて、運営者は法令上必要な範囲を除き責任を負いません。"],
    ],
  },
  privacy: {
    label: "Privacy",
    title: "もぐログ プライバシーポリシー",
    sections: [
      ["取得する情報", "本サービスは、メールアドレス、表示名、プロフィール、投稿したタイトル・本文・写真、いいね・mog・保存・コメント・通報の操作情報、任意で入力した場所名、許可された場合の位置情報を取得することがあります。"],
      ["利用目的", "取得した情報は、ログイン、投稿表示、画像保存、リアクション表示、コメント、通報・権利侵害対応、不正利用防止、サービス改善のために利用します。"],
      ["画像と個人情報", "写真に顔、住所、伝票、電話番号、学校名、勤務先、支払い情報などが写り込まないよう注意してください。必要に応じて投稿前にトリミングや加工を行ってください。"],
      ["第三者提供と外部サービス", "法令に基づく場合、権利侵害や安全上の対応が必要な場合を除き、利用者情報を目的外に第三者提供しません。認証・データ保存・ホスティングに外部サービスを利用する場合があります。"],
      ["削除依頼", "投稿やアカウント情報の削除を希望する場合は、運営者へ連絡してください。本人確認のうえ、合理的な範囲で対応します。"],
      ["変更", "本ポリシーは必要に応じて変更されます。重要な変更がある場合は、サービス上で分かりやすく告知します。"],
    ],
  },
};

function isLoggedIn() {
  return Boolean(currentUser);
}

function isEmailVerified() {
  return Boolean(currentUser?.email_confirmed_at || currentUser?.confirmed_at || currentUser?.app_metadata?.provider === "google");
}

function isAdmin() {
  return currentProfile?.role === "admin";
}

function getAvatarStorageKey() {
  return `${AVATAR_KEY_PREFIX}-${currentUser?.id || "guest"}`;
}

function getStoredAvatar() {
  return localStorage.getItem(getAvatarStorageKey()) || "";
}

function applyAvatar(element, fallbackText) {
  if (!element) {
    return;
  }

  const avatarUrl = getStoredAvatar();
  element.textContent = avatarUrl ? "" : fallbackText;
  element.style.backgroundImage = avatarUrl ? `url("${avatarUrl}")` : "";
  element.classList.toggle("has-image", Boolean(avatarUrl));
}

function updateAvatarViews(name = "M") {
  const fallback = (name || "M").slice(0, 2).toUpperCase();
  applyAvatar(elements.currentAvatar, fallback);
  applyAvatar(document.querySelector("#profileAvatar"), fallback.slice(0, 1));
}

function readAvatarFile(file) {
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    localStorage.setItem(getAvatarStorageKey(), reader.result);
    const name = currentProfile?.display_name || currentProfile?.handle || currentUser?.email?.split("@")[0] || "mogu";
    updateAvatarViews(name);
    playSound("tap");
  });
  reader.readAsDataURL(file);
}

function saveGuestReactions() {
  localStorage.setItem(GUEST_LIKES_KEY, JSON.stringify([...guestLikes]));
  localStorage.setItem(GUEST_BOOSTS_KEY, JSON.stringify([...guestBoosts]));
}

function formatTime(value) {
  if (!value) {
    return "いま";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "いま";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

async function initAuth() {
  if (!supabaseClient) {
    updateAccountView();
    renderPosts();
    return;
  }

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  currentUser = session?.user || null;
  await loadProfile();
  if (currentUser && !currentProfile) {
    await upsertProfile(currentUser.user_metadata?.full_name || "");
  }
  updateAccountView();

  supabaseClient.auth.onAuthStateChange(async (_event, sessionValue) => {
    currentUser = sessionValue?.user || null;
    await loadProfile();
    if (currentUser && !currentProfile) {
      await upsertProfile(currentUser.user_metadata?.full_name || "");
    }
    updateAccountView();
    await loadPosts();
  });
}

async function loadProfile() {
  currentProfile = null;

  if (!supabaseClient || !currentUser) {
    return;
  }

  const { data } = await supabaseClient.from("profiles").select("*").eq("id", currentUser.id).maybeSingle();
  currentProfile = data || null;
}

async function upsertProfile(displayName = "") {
  if (!supabaseClient || !currentUser) {
    return;
  }

  const fallbackName = currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "mogu";
  await supabaseClient.from("profiles").upsert(
    {
      id: currentUser.id,
      email: currentUser.email,
      display_name: displayName || currentProfile?.display_name || fallbackName,
    },
    { onConflict: "id" },
  );
  await loadProfile();
}

function updateAccountView() {
  const configured = hasSupabaseConfig;
  elements.signOutButton.hidden = !currentUser;
  elements.googleSignInButton.hidden = Boolean(currentUser);
  elements.authForm.classList.toggle("is-logged-in", Boolean(currentUser));

  if (!configured) {
    elements.accountStatus.textContent = "ゲスト利用中";
    elements.accountHint.textContent = "supabase-config.js にSupabaseのURLとanon keyを入れると、Googleログインが使えます。";
    updateAvatarViews("G");
    elements.postNotice.textContent = "現在はゲストモードです。共有投稿にはGoogleログインが必要です。";
    return;
  }

  if (!currentUser) {
    elements.accountStatus.textContent = "ゲスト利用中";
    elements.accountHint.textContent = "Googleでログインすると、投稿・保存・コメントが使えます。次回からもログイン状態が保存されます。";
    updateAvatarViews("G");
    elements.postNotice.textContent = "共有投稿にはGoogleログインが必要です。";
    return;
  }

  const name = currentProfile?.display_name || currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "mogu";
  elements.accountStatus.textContent = `${name} / ${isAdmin() ? "管理者" : "Googleログイン中"}`;
  elements.accountHint.textContent = `${currentUser.email || "Googleアカウント"} でログイン中です。次回もこのブラウザではログイン状態が続きます。`;
  updateAvatarViews(name);
  elements.postNotice.textContent = "写真を選んで、共有タイムラインへ投稿できます。";
}

function mapSupabasePost(post, likes = [], boosts = []) {
  const postLikes = likes.filter((item) => item.post_id === post.id);
  const postBoosts = boosts.filter((item) => item.post_id === post.id);

  return {
    ...post,
    image_url: post.image_url || post.image_path || "",
    author_name: post.profiles?.display_name || post.profiles?.email?.split("@")[0] || "mogu",
    likes_count: postLikes.length,
    boosts_count: postBoosts.length,
    liked_by_me: Boolean(currentUser && postLikes.some((item) => item.user_id === currentUser.id)),
    boosted_by_me: Boolean(currentUser && postBoosts.some((item) => item.user_id === currentUser.id)),
  };
}

async function loadPosts() {
  if (!supabaseClient) {
    posts = demoPosts.map((post) => ({
      ...post,
      liked_by_me: guestLikes.has(post.id),
      boosted_by_me: guestBoosts.has(post.id),
      likes_count: guestLikes.has(post.id) ? 1 : 0,
      boosts_count: guestBoosts.has(post.id) ? 1 : 0,
    }));
    renderPosts();
    return;
  }

  const [{ data: postRows, error: postError }, { data: likeRows }, { data: boostRows }] = await Promise.all([
    supabaseClient
      .from("posts")
      .select("*, profiles(display_name,email)")
      .order("created_at", { ascending: false }),
    supabaseClient.from("post_likes").select("post_id,user_id"),
    supabaseClient.from("post_boosts").select("post_id,user_id"),
  ]);

  if (postError) {
    console.warn("投稿の取得に失敗しました。デモ投稿を表示します。", postError);
    posts = demoPosts;
  } else {
    posts = (postRows || []).map((post) => mapSupabasePost(post, likeRows || [], boostRows || []));
  }

  renderPosts();
}

function getFilteredPosts() {
  const keyword = elements.searchInput.value.trim().toLowerCase();

  if (!keyword) {
    return posts;
  }

  return posts.filter((post) => {
    const text = `${post.title} ${post.description} ${post.author_name} ${post.shop_name || ""}`.toLowerCase();
    return text.includes(keyword);
  });
}

function renderPosts() {
  const visiblePosts = getFilteredPosts();

  elements.feed.innerHTML = "";
  elements.postCount.textContent = posts.length;
  elements.emptyState.hidden = visiblePosts.length > 0;

  visiblePosts.forEach((post) => {
    const card = elements.postTemplate.content.firstElementChild.cloneNode(true);
    const image = card.querySelector(".post-image");
    const title = card.querySelector("h3");
    const description = card.querySelector("p");
    const author = card.querySelector(".author");
    const time = card.querySelector(".time");
    const likeButton = card.querySelector(".like-button");
    const heart = card.querySelector(".heart");
    const likeCount = card.querySelector(".like-count");
    const boostButton = card.querySelector(".boost-button");
    const boostCount = card.querySelector(".boost-count");
    const shareButton = card.querySelector(".share-button");
    const deleteButton = card.querySelector(".delete-button");
    const locationBox = card.querySelector(".post-location");
    const shopName = card.querySelector(".shop-name");
    const mapLink = card.querySelector(".map-link");
    const canDelete = currentUser && (post.user_id === currentUser.id || isAdmin());

    image.src = post.image_url;
    image.alt = `${post.title}の写真`;
    title.textContent = post.title;
    description.textContent = post.description;
    author.textContent = `@${post.author_name || "mogu"}`;
    time.textContent = formatTime(post.created_at);
    heart.textContent = post.liked_by_me ? "♥" : "♡";
    likeCount.textContent = post.likes_count || 0;
    likeButton.classList.toggle("is-liked", Boolean(post.liked_by_me));
    boostCount.textContent = post.boosts_count || 0;
    boostButton.classList.toggle("is-boosted", Boolean(post.boosted_by_me));
    deleteButton.hidden = !canDelete && supabaseClient;

    if (post.shop_name || post.latitude) {
      locationBox.hidden = false;
      shopName.textContent = post.shop_name || "位置情報つき投稿";

      if (post.latitude && post.longitude) {
        mapLink.hidden = false;
        mapLink.href = `https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`;
      } else {
        mapLink.hidden = true;
      }
    }

    likeButton.addEventListener("click", () => toggleLike(post.id, likeButton));
    boostButton.addEventListener("click", () => toggleBoost(post.id, boostButton));
    shareButton.addEventListener("click", () => sharePost(post));
    deleteButton.addEventListener("click", () => deletePost(post.id));

    elements.feed.append(card);
  });
}

async function toggleLike(postId, button) {
  showLikeBurst(button);
  playSound("like");

  if (!supabaseClient || !currentUser) {
    guestLikes.has(postId) ? guestLikes.delete(postId) : guestLikes.add(postId);
    saveGuestReactions();
    await loadPosts();
    return;
  }

  const post = posts.find((item) => item.id === postId);

  if (post?.liked_by_me) {
    await supabaseClient.from("post_likes").delete().eq("post_id", postId).eq("user_id", currentUser.id);
  } else {
    await supabaseClient.from("post_likes").insert({ post_id: postId, user_id: currentUser.id });
  }

  await loadPosts();
}

async function toggleBoost(postId, button) {
  button.classList.add("is-popping");
  setTimeout(() => button.classList.remove("is-popping"), 380);
  playSound("boost");

  if (!supabaseClient || !currentUser) {
    guestBoosts.has(postId) ? guestBoosts.delete(postId) : guestBoosts.add(postId);
    saveGuestReactions();
    await loadPosts();
    return;
  }

  const post = posts.find((item) => item.id === postId);

  if (post?.boosted_by_me) {
    await supabaseClient.from("post_boosts").delete().eq("post_id", postId).eq("user_id", currentUser.id);
  } else {
    await supabaseClient.from("post_boosts").insert({ post_id: postId, user_id: currentUser.id });
  }

  await loadPosts();
}

async function sharePost(post) {
  const text = `もぐログ: ${post.title}`;
  const url = location.href.split("#")[0];

  playSound("tap");

  if (navigator.share) {
    await navigator.share({ title: post.title, text, url });
    return;
  }

  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    alert("共有用の文章をコピーしました。");
  } catch {
    alert(`${text}\n${url}`);
  }
}

async function deletePost(postId) {
  if (!confirm("この投稿を削除しますか？")) {
    return;
  }

  if (!supabaseClient) {
    posts = posts.filter((post) => post.id !== postId);
    renderPosts();
    return;
  }

  const { error } = await supabaseClient.from("posts").delete().eq("id", postId);

  if (error) {
    alert("削除できませんでした。本人の投稿、または管理者だけが削除できます。");
    return;
  }

  playSound("delete");
  await loadPosts();
}

function getPostLocation() {
  if (!elements.locationToggle.checked) {
    return {};
  }

  return {
    shop_name: elements.shopNameInput.value.trim() || null,
    latitude: selectedLocation?.latitude || null,
    longitude: selectedLocation?.longitude || null,
  };
}

function resetLocationForm() {
  selectedLocation = null;
  elements.locationToggle.checked = false;
  elements.locationFields.hidden = true;
  elements.shopNameInput.value = "";
  elements.locationStatus.textContent = "位置情報はまだ取得していません。";
  elements.placeFinder.hidden = true;
  elements.placePredictions.innerHTML = "";
  elements.placeMapPreview.removeAttribute("src");
}

function getGoogleMapsSearchUrl(query, latitude, longitude) {
  const encodedQuery = encodeURIComponent(`${query} ${latitude},${longitude}`);
  return `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
}

function renderPlacePredictions(latitude, longitude) {
  elements.placeFinder.hidden = false;
  elements.placeMapPreview.src = `https://www.google.com/maps?q=${latitude},${longitude}&z=17&output=embed`;
  elements.placePredictions.innerHTML = "";

  placePredictionTypes.forEach((type) => {
    const button = document.createElement("button");
    const link = document.createElement("a");
    button.type = "button";
    button.className = "place-prediction";
    button.innerHTML = `<strong>${type}</strong><span>現在地周辺の${type}を候補にする</span>`;
    button.addEventListener("click", () => {
      elements.shopNameInput.value = `現在地周辺の${type}`;
      elements.locationStatus.textContent = `${type}候補を選択しました。Googleマップで実際のお店名を確認できます。`;
      playSound("tap");
    });

    link.href = getGoogleMapsSearchUrl(type, latitude, longitude);
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "Googleマップで開く";
    link.className = "place-map-link";

    const item = document.createElement("div");
    item.className = "place-prediction-row";
    item.append(button, link);
    elements.placePredictions.append(item);
  });
}

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(",");
  const mimeType = header.match(/data:(.*);base64/)?.[1] || "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

async function uploadImage(dataUrl) {
  const blob = dataUrlToBlob(dataUrl);
  const path = `${currentUser.id}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabaseClient.storage.from(storageBucket).upload(path, blob, {
    contentType: "image/jpeg",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabaseClient.storage.from(storageBucket).getPublicUrl(path);
  return { image_path: path, image_url: data.publicUrl };
}

function drawPreview() {
  if (!sourceImage) {
    return;
  }

  const canvas = elements.previewCanvas;
  const context = canvas.getContext("2d");
  const rotated = imageRotation % 180 !== 0;
  const sourceWidth = rotated ? sourceImage.height : sourceImage.width;
  const sourceHeight = rotated ? sourceImage.width : sourceImage.height;
  const scale = Math.max(canvas.width / sourceWidth, canvas.height / sourceHeight);
  const drawWidth = sourceImage.width * scale;
  const drawHeight = sourceImage.height * scale;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((imageRotation * Math.PI) / 180);
  context.filter = `brightness(${elements.brightnessInput.value}%) contrast(${elements.contrastInput.value}%) saturate(${elements.saturationInput.value}%)`;
  context.drawImage(sourceImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  context.filter = "none";

  const warmth = Number(elements.warmthInput.value) / 100;
  if (warmth > 0) {
    context.globalCompositeOperation = "soft-light";
    context.fillStyle = `rgba(255, 169, 86, ${warmth})`;
    context.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
  }

  context.restore();
  drawOverlayDecorations(context, canvas);
}

function drawRoundedRect(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function wrapOverlayText(context, text, maxWidth) {
  const words = text.trim().split(/\s+/);
  const lines = [];
  let line = "";

  words.flatMap((word) => {
    if (context.measureText(word).width <= maxWidth) {
      return [word];
    }

    const chunks = [];
    let chunk = "";
    [...word].forEach((character) => {
      const testChunk = `${chunk}${character}`;
      if (context.measureText(testChunk).width <= maxWidth) {
        chunk = testChunk;
        return;
      }
      if (chunk) chunks.push(chunk);
      chunk = character;
    });
    if (chunk) chunks.push(chunk);
    return chunks;
  }).forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width <= maxWidth) {
      line = testLine;
      return;
    }

    if (line) lines.push(line);
    line = word;
  });

  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function drawOverlayDecorations(context, canvas) {
  const overlayText = elements.overlayTextInput?.value.trim() || "";
  const stamp = elements.stampSelect?.value || "";

  context.save();

  if (stamp) {
    const stampText = {
      spark: "Spark",
      heart: "Heart",
      hot: "Hot",
      mog: "mog",
    }[stamp];
    const stampColor = {
      spark: "#d9a842",
      heart: "#cb594a",
      hot: "#d98655",
      mog: "#496b55",
    }[stamp] || "#496b55";

    context.translate(canvas.width - 124, 92);
    context.rotate(-0.12);
    context.shadowColor = "rgba(36, 32, 28, 0.24)";
    context.shadowBlur = 18;
    context.shadowOffsetY = 8;
    context.fillStyle = "rgba(255, 252, 246, 0.92)";
    drawRoundedRect(context, -78, -38, 156, 76, 24);
    context.fill();
    context.shadowBlur = 0;
    context.lineWidth = 4;
    context.strokeStyle = stampColor;
    context.stroke();
    context.fillStyle = stampColor;
    context.font = "900 28px system-ui, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(stampText, 0, 1);
    context.setTransform(1, 0, 0, 1, 0, 0);
  }

  if (overlayText) {
    const maxWidth = canvas.width - 120;
    context.font = "900 46px system-ui, sans-serif";
    let lines = wrapOverlayText(context, overlayText, maxWidth);

    if (lines.some((line) => context.measureText(line).width > maxWidth)) {
      context.font = "900 38px system-ui, sans-serif";
      lines = wrapOverlayText(context, overlayText, maxWidth);
    }

    const lineHeight = 54;
    const boxWidth = Math.min(maxWidth + 42, Math.max(...lines.map((line) => context.measureText(line).width), 0) + 56);
    const boxHeight = lines.length * lineHeight + 32;
    const x = 32;
    const y = canvas.height - boxHeight - 34;

    context.shadowColor = "rgba(36, 32, 28, 0.3)";
    context.shadowBlur = 22;
    context.shadowOffsetY = 10;
    context.fillStyle = "rgba(36, 32, 28, 0.62)";
    drawRoundedRect(context, x, y, boxWidth, boxHeight, 22);
    context.fill();
    context.shadowBlur = 0;
    context.fillStyle = "#fffaf2";
    context.textAlign = "left";
    context.textBaseline = "top";
    lines.forEach((line, index) => {
      context.fillText(line, x + 28, y + 18 + index * lineHeight);
    });
  }

  context.restore();
}

function resetImageControls() {
  elements.brightnessInput.value = "100";
  elements.contrastInput.value = "105";
  elements.saturationInput.value = "110";
  elements.warmthInput.value = "10";
  elements.overlayTextInput.value = "";
  elements.stampSelect.value = "";
  imageRotation = 0;
  drawPreview();
}

function getPostImageDataUrl() {
  if (!sourceImage) {
    return "";
  }

  drawPreview();
  return elements.previewCanvas.toDataURL("image/jpeg", 0.9);
}

function readImageFile(file) {
  const reader = new FileReader();

  reader.addEventListener("load", () => {
    const image = new Image();
    image.addEventListener("load", () => {
      sourceImage = image;
      elements.imageEditor.hidden = false;
      resetImageControls();
      playSound("tap");
    });
    image.src = reader.result;
  });

  reader.readAsDataURL(file);
}

async function createPost(event) {
  event.preventDefault();

  if (!supabaseClient) {
    alert("共有投稿を使うには、supabase-config.js にSupabaseのURLとanon keyを設定してください。");
    return;
  }

  if (!currentUser) {
    alert("投稿するにはGoogleログインしてください。");
    jumpTo("account");
    return;
  }

  if (!isEmailVerified()) {
    alert("投稿するにはGoogleログインしてください。");
    return;
  }

  const dataUrl = getPostImageDataUrl();

  if (!dataUrl) {
    alert("投稿する写真を選んでください。");
    return;
  }

  try {
    const image = await uploadImage(dataUrl);
    const { error } = await supabaseClient.from("posts").insert({
      user_id: currentUser.id,
      title: elements.titleInput.value.trim(),
      description: elements.descriptionInput.value.trim(),
      ...image,
      ...getPostLocation(),
    });

    if (error) {
      throw error;
    }

    elements.postForm.reset();
    sourceImage = null;
    imageRotation = 0;
    elements.imageEditor.hidden = true;
    resetLocationForm();
    playSound("post");
    await loadPosts();
    jumpTo("feed");
  } catch (error) {
    console.warn(error);
    alert("投稿に失敗しました。Supabaseのテーブル、Storage bucket、RLS設定を確認してください。");
  }
}

async function signInWithGoogle() {
  if (!supabaseClient) {
    alert("supabase-config.js にSupabaseのURLとanon keyを設定してください。");
    return;
  }

  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: location.origin + location.pathname,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error) {
    alert(error.message);
  }
}

async function signOut() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }

  currentUser = null;
  currentProfile = null;
  updateAccountView();
  await loadPosts();
}

function setSoundEnabled(enabled) {
  soundEnabled = enabled;
  localStorage.setItem(SOUND_KEY, String(enabled));
  elements.soundToggle.checked = enabled;
  elements.soundTogglePanel.checked = enabled;

  if (enabled) {
    playSound("tap");
  }
}

function playSound(type) {
  if (!soundEnabled) {
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  audioContext ||= new AudioContextClass();
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const frequencies = {
    tap: [520, 620],
    like: [680, 920],
    boost: [420, 760],
    post: [520, 760],
    delete: [260, 180],
  }[type] || [440, 520];

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequencies[0], now);
  oscillator.frequency.exponentialRampToValueAtTime(frequencies[1], now + 0.08);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.09, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.17);
}

function showLikeBurst(anchor) {
  const rect = anchor.getBoundingClientRect();
  anchor.classList.add("is-popping");
  setTimeout(() => anchor.classList.remove("is-popping"), 380);

  const heart = document.createElement("span");
  heart.className = "float-heart";
  heart.textContent = "♥";
  heart.style.left = `${rect.left + rect.width / 2}px`;
  heart.style.top = `${rect.top + 3}px`;
  document.body.append(heart);
  heart.addEventListener("animationend", () => heart.remove());
}

function setChromeHidden(hidden) {
  elements.body.classList.toggle("chrome-hidden", hidden);
  elements.chromeToggle.textContent = hidden ? "上の画面を表示" : "上の画面を隠す";
  elements.chromeToggle.setAttribute("aria-expanded", String(!hidden));
  localStorage.setItem(CHROME_KEY, String(hidden));
}

function setQuickNavVisible(visible, animate = true) {
  elements.body.classList.toggle("quick-nav-hidden", !visible);
  localStorage.setItem(QUICK_NAV_KEY, String(visible));

  if (elements.quickNavTogglePanel) {
    elements.quickNavTogglePanel.checked = visible;
  }

  if (visible && animate && elements.appNav) {
    elements.appNav.classList.remove("is-showing");
    void elements.appNav.offsetWidth;
    elements.appNav.classList.add("is-showing");
  }
}

function setRememberLogin(enabled) {
  localStorage.setItem(REMEMBER_LOGIN_KEY, String(enabled));
  const sessionValue = localStorage.getItem("mogu-log-auth-session") || sessionStorage.getItem("mogu-log-auth-session");

  if (sessionValue) {
    const target = enabled ? localStorage : sessionStorage;
    const other = enabled ? sessionStorage : localStorage;
    target.setItem("mogu-log-auth-session", sessionValue);
    other.removeItem("mogu-log-auth-session");
  }

  if (elements.rememberLoginTogglePanel) {
    elements.rememberLoginTogglePanel.checked = enabled;
  }
}

function syncNavigation(targetId) {
  document.querySelectorAll(".nav-button").forEach((button) => {
    const active = button.dataset.jump === targetId;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

elements.googleSignInButton.addEventListener("click", signInWithGoogle);
elements.signOutButton.addEventListener("click", signOut);
elements.postForm.addEventListener("submit", createPost);

elements.photoInput.addEventListener("change", () => {
  const file = elements.photoInput.files[0];

  if (file) {
    readImageFile(file);
  }
});

[elements.brightnessInput, elements.contrastInput, elements.saturationInput, elements.warmthInput, elements.overlayTextInput, elements.stampSelect].forEach((input) => {
  input.addEventListener("input", drawPreview);
});
elements.stampSelect.addEventListener("change", drawPreview);

elements.rotateButton.addEventListener("click", () => {
  imageRotation = (imageRotation + 90) % 360;
  drawPreview();
  playSound("tap");
});

elements.resetImageButton.addEventListener("click", () => {
  resetImageControls();
  playSound("tap");
});

elements.locationToggle.addEventListener("change", () => {
  elements.locationFields.hidden = !elements.locationToggle.checked;

  if (!elements.locationToggle.checked) {
    resetLocationForm();
  }
});

elements.getLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    elements.locationStatus.textContent = "このブラウザでは現在地を取得できません。";
    return;
  }

  elements.locationStatus.textContent = "現在地を取得しています...";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      selectedLocation = {
        latitude: Number(position.coords.latitude.toFixed(6)),
        longitude: Number(position.coords.longitude.toFixed(6)),
      };
      elements.locationStatus.textContent = `取得しました: ${selectedLocation.latitude}, ${selectedLocation.longitude}`;
      renderPlacePredictions(selectedLocation.latitude, selectedLocation.longitude);
      playSound("tap");
    },
    () => {
      selectedLocation = null;
      elements.locationStatus.textContent = "現在地を取得できませんでした。ブラウザの許可設定を確認してください。";
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    },
  );
});

elements.searchInput.addEventListener("input", renderPosts);
elements.headerLoginButton?.addEventListener("click", () => jumpTo("account"));
elements.introLoginButton?.addEventListener("click", () => jumpTo("account"));
elements.focusPostButton.addEventListener("click", () => jumpTo("composer"));
elements.focusDeleteButton.addEventListener("click", () => jumpTo("feed"));

elements.chromeToggle.addEventListener("click", () => {
  setChromeHidden(!elements.body.classList.contains("chrome-hidden"));
  playSound("tap");
});

elements.chromeTogglePanel.addEventListener("click", () => {
  setChromeHidden(!elements.body.classList.contains("chrome-hidden"));
  playSound("tap");
});

elements.soundToggle.addEventListener("change", () => setSoundEnabled(elements.soundToggle.checked));
elements.soundTogglePanel.addEventListener("change", () => setSoundEnabled(elements.soundTogglePanel.checked));
elements.quickNavTogglePanel?.addEventListener("change", () => {
  setQuickNavVisible(elements.quickNavTogglePanel.checked);
  playSound("tap");
});
elements.rememberLoginTogglePanel?.addEventListener("change", () => {
  setRememberLogin(elements.rememberLoginTogglePanel.checked);
  playSound("tap");
});
elements.avatarInput?.addEventListener("change", () => {
  readAvatarFile(elements.avatarInput.files?.[0]);
});

document.querySelectorAll("[data-benefit-jump]").forEach((button) => {
  button.addEventListener("click", () => jumpTo(button.dataset.benefitJump));
});

function openLegalDialog(type) {
  const documentData = legalDocuments[type];
  if (!documentData || !elements.legalDialog) {
    return;
  }

  elements.legalDialogLabel.textContent = documentData.label;
  elements.legalDialogTitle.textContent = documentData.title;
  elements.legalDialogBody.innerHTML = documentData.sections
    .map(([heading, body]) => `<section><h3>${heading}</h3><p>${body}</p></section>`)
    .join("");
  elements.legalDialog.showModal();
  playSound("tap");
}

document.querySelectorAll("[data-legal]").forEach((button) => {
  button.addEventListener("click", () => openLegalDialog(button.dataset.legal));
});

elements.legalCloseButton?.addEventListener("click", () => {
  elements.legalDialog.close();
  playSound("tap");
});

elements.legalDialog?.addEventListener("click", (event) => {
  if (event.target === elements.legalDialog) {
    elements.legalDialog.close();
  }
});

function getExtraProfile() {
  return {
    handle: currentProfile?.handle || currentProfile?.display_name || currentUser?.email?.split("@")[0] || "mogu",
    bio: currentProfile?.bio || "おいしかったものを気軽に残しています。",
    area: currentProfile?.area || "",
    favorite_food: currentProfile?.favorite_food || "",
  };
}

async function upsertProfile(displayName = "") {
  if (!supabaseClient || !currentUser) {
    return;
  }

  const fallbackName = currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "mogu";
  const extra = getExtraProfile();
  await supabaseClient.from("profiles").upsert(
    {
      id: currentUser.id,
      email: currentUser.email,
      display_name: displayName || currentProfile?.display_name || fallbackName,
      handle: extra.handle,
      bio: extra.bio,
      area: extra.area,
      favorite_food: extra.favorite_food,
    },
    { onConflict: "id" },
  );
  await loadProfile();
}

function mapSupabasePost(post, likes = [], boosts = [], comments = [], reports = []) {
  const postLikes = likes.filter((item) => item.post_id === post.id);
  const postBoosts = boosts.filter((item) => item.post_id === post.id);
  const postComments = comments.filter((item) => item.post_id === post.id);
  const postReports = reports.filter((item) => item.post_id === post.id);

  return {
    ...post,
    image_url: post.image_url || post.image_path || "",
    author_name: post.profiles?.display_name || post.profiles?.email?.split("@")[0] || "mogu",
    author_handle: post.profiles?.handle || post.profiles?.display_name || "mogu",
    likes_count: postLikes.length,
    boosts_count: postBoosts.length,
    liked_by_me: Boolean(currentUser && postLikes.some((item) => item.user_id === currentUser.id)),
    boosted_by_me: Boolean(currentUser && postBoosts.some((item) => item.user_id === currentUser.id)),
    comments: postComments,
    reports_count: postReports.length,
    reported_by_me: Boolean(currentUser && postReports.some((item) => item.user_id === currentUser.id)),
  };
}

async function loadPosts() {
  if (!supabaseClient) {
    posts = demoPosts.map((post) => ({
      ...post,
      liked_by_me: guestLikes.has(post.id),
      boosted_by_me: guestBoosts.has(post.id),
      likes_count: guestLikes.has(post.id) ? 1 : 0,
      boosts_count: guestBoosts.has(post.id) ? 1 : 0,
      comments: [],
      reports_count: 0,
      reported_by_me: false,
    }));
    renderPosts();
    return;
  }

  const [{ data: postRows, error: postError }, { data: likeRows }, { data: boostRows }, { data: commentRows }, { data: reportRows }] =
    await Promise.all([
      supabaseClient.from("posts").select("*, profiles(display_name,email,handle)").order("created_at", { ascending: false }),
      supabaseClient.from("post_likes").select("post_id,user_id"),
      supabaseClient.from("post_boosts").select("post_id,user_id"),
      supabaseClient.from("post_comments").select("id,post_id,user_id,body,created_at,profiles(display_name,handle)").order("created_at", { ascending: true }),
      supabaseClient.from("post_reports").select("post_id,user_id"),
    ]);

  if (postError) {
    console.warn("投稿の取得に失敗しました。デモ投稿を表示します。", postError);
    posts = demoPosts;
  } else {
    posts = (postRows || []).map((post) => mapSupabasePost(post, likeRows || [], boostRows || [], commentRows || [], reportRows || []));
  }

  renderPosts();
}

function getFilteredPosts() {
  const keyword = elements.searchInput.value.trim().toLowerCase();
  let visiblePosts = posts.filter((post) => (post.reports_count || 0) < 3);

  if (keyword) {
    visiblePosts = visiblePosts.filter((post) => {
      const text = `${post.title} ${post.description} ${post.author_name} ${post.shop_name || ""}`.toLowerCase();
      return text.includes(keyword);
    });
  }

  return visiblePosts;
}

function getRankedPosts() {
  const sourcePosts = posts.length > 0 ? posts.filter((post) => (post.reports_count || 0) < 3) : getExamplePosts();
  return [...sourcePosts].sort((a, b) => (b.likes_count || 0) + (b.boosts_count || 0) - ((a.likes_count || 0) + (a.boosts_count || 0)));
}

function getCrownProgress(likesCount) {
  const level = Math.floor(likesCount / 10);
  const currentLevelStart = level * 10;
  const nextLevelAt = currentLevelStart + 10;
  const progressLikes = likesCount - currentLevelStart;
  const progressPercent = Math.min((progressLikes / 10) * 100, 100);

  return {
    level,
    nextLevel: level + 1,
    nextLevelAt,
    progressLikes,
    progressPercent,
  };
}

function getPostForJump(postId) {
  return posts.find((item) => item.id === postId) || getExamplePosts().find((item) => item.id === postId);
}

function jumpToPost(postId) {
  const post = getPostForJump(postId);
  if (!post) {
    return;
  }

  rankingMode = false;
  elements.searchInput.value = "";
  renderPosts();
  showPage("feed");
  syncNavigation("feed");
  window.setTimeout(() => {
    const escapeSelector = window.CSS?.escape || ((value) => String(value).replace(/"/g, '\\"'));
    const card = elements.feed.querySelector(`[data-post-id="${escapeSelector(String(postId))}"]`);
    if (!card) {
      return;
    }

    card.classList.add("is-target-post");
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => card.classList.remove("is-target-post"), 1600);
  }, 0);
  playSound("tap");
}

function renderProfilePanels() {
  const profileSection = document.querySelector("#profileSection");
  if (!profileSection) {
    return;
  }

  const extra = getExtraProfile();
  const examples = getExamplePosts();
  const myPosts = currentUser ? posts.filter((post) => post.user_id === currentUser.id) : [];
  const savedPosts = savedPostIds.map((id) => posts.find((post) => post.id === id)).filter(Boolean);
  const savedExamples = savedPosts.length > 0 ? [] : (posts.length > 0 ? posts.slice(0, 2) : examples.slice(0, 2)).map((post) => ({ ...post, is_example: true }));
  const myPostExamples = myPosts.length > 0 ? [] : examples.slice(1, 3);
  const totalLikes = myPosts.reduce((sum, post) => sum + (post.likes_count || 0), 0);
  const totalBoosts = myPosts.reduce((sum, post) => sum + (post.boosts_count || 0), 0);
  const crown = getCrownProgress(totalLikes);

  document.querySelector("#profileNamePreview").textContent = `${currentProfile?.display_name || extra.handle} / @${extra.handle}`;
  document.querySelector("#profileBioPreview").textContent = extra.bio;
  document.querySelector("#profileAreaTag").textContent = extra.area ? `エリア: ${extra.area}` : "エリア未設定";
  document.querySelector("#profileFoodTag").textContent = extra.favorite_food ? `好き: ${extra.favorite_food}` : "ジャンル未設定";
  document.querySelector("#profileStats").textContent = `自分の投稿 ${myPosts.length}件 / もらったいいね ${totalLikes}件 / mog ${totalBoosts}件 / 保存 ${savedPostIds.length}件`;
  updateAvatarViews(currentProfile?.display_name || extra.handle || "M");

  document.querySelector("#profileRoyalBadge").textContent =
    crown.level > 0 ? `王冠 Lv.${crown.level}` : `王冠Lv.1まであと ${10 - crown.progressLikes}いいね`;
  document.querySelector("#noticeCrownLevel").textContent = `Crown Lv.${crown.level}`;
  document.querySelector("#noticeCrownText").textContent = `${totalLikes} / ${crown.nextLevelAt} likes`;
  document.querySelector("#noticeCrownGauge").style.width = `${crown.progressPercent}%`;
  document.querySelector("#noticeCrownHint").textContent =
    crown.level > 0
      ? `次の王冠Lv.${crown.nextLevel}まであと ${crown.nextLevelAt - totalLikes}いいねです。`
      : `最初の王冠まであと ${10 - totalLikes}いいねです。`;
  document.querySelector("#noticeCrownDetail").innerHTML = [1, 2, 3]
    .map((offset) => {
      const level = crown.level + offset;
      return `<span>Lv.${level}: ${level * 10}いいね</span>`;
    })
    .join("");

  const savedBox = document.querySelector("#savedPosts");
  const myBox = document.querySelector("#myPosts");
  savedBox.innerHTML = "";
  myBox.innerHTML = "";
  document.querySelector("#savedPostsEmpty").hidden = savedPosts.length > 0 || savedExamples.length > 0;
  document.querySelector("#myPostsEmpty").hidden = myPosts.length > 0 || myPostExamples.length > 0;
  savedPosts.forEach((post) => savedBox.append(createPostCard(post, true)));
  savedExamples.forEach((post) => savedBox.append(createPostCard(post, true)));
  myPosts.forEach((post) => myBox.append(createPostCard(post, true)));
  myPostExamples.forEach((post) => myBox.append(createPostCard(post, true)));

  const noticeList = document.querySelector("#noticeList");
  noticeList.innerHTML = "";
  const noticeSourcePosts = posts.some((post) => (post.comments || []).length > 0) ? posts : examples;
  noticeSourcePosts
    .flatMap((post) => (post.comments || []).slice(-2).map((comment) => ({ post, comment })))
    .forEach(({ post, comment }) => {
      const item = document.createElement("button");
      const title = document.createElement("strong");
      const body = document.createElement("span");
      item.className = "notice-item";
      item.type = "button";
      title.textContent = post.title;
      body.textContent = comment.body;
      item.append(title, body);
      item.addEventListener("click", () => jumpToPost(post.id));
      noticeList.append(item);
    });
}

function createPostCard(post, compact = false) {
  const card = elements.postTemplate.content.firstElementChild.cloneNode(true);
  const image = card.querySelector(".post-image");
  const title = card.querySelector("h3");
  const description = card.querySelector("p");
  const author = card.querySelector(".author");
  const time = card.querySelector(".time");
  const likeButton = card.querySelector(".like-button");
  const heart = card.querySelector(".heart");
  const likeCount = card.querySelector(".like-count");
  const boostButton = card.querySelector(".boost-button");
  const boostCount = card.querySelector(".boost-count");
  const shareButton = card.querySelector(".share-button");
  const saveButton = card.querySelector(".save-button");
  const reportButton = card.querySelector(".report-button");
  const deleteButton = card.querySelector(".delete-button");
  const commentList = card.querySelector(".comment-list");
  const commentForm = card.querySelector(".comment-form");
  const commentInput = card.querySelector(".comment-input");
  const locationBox = card.querySelector(".post-location");
  const shopName = card.querySelector(".shop-name");
  const mapLink = card.querySelector(".map-link");
  const canDelete = currentUser && (post.user_id === currentUser.id || isAdmin());
  const saved = savedPostIds.includes(post.id);

  card.classList.toggle("is-compact", compact);
  card.classList.toggle("is-example-post", Boolean(post.is_example));
  card.dataset.postId = post.id;
  if (compact) {
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `${post.title}の投稿へ移動`);
    card.addEventListener("click", (event) => {
      if (event.target.closest("button, input, textarea, a, form")) {
        return;
      }
      jumpToPost(post.id);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        jumpToPost(post.id);
      }
    });
  }
  image.src = post.image_url;
  image.alt = `${post.title}の写真`;
  title.textContent = post.title;
  description.textContent = post.description;
  author.textContent = `@${post.author_handle || post.author_name || "mogu"}`;
  time.textContent = formatTime(post.created_at);
  heart.textContent = post.liked_by_me ? "♥" : "♡";
  likeCount.textContent = post.likes_count || 0;
  likeButton.classList.toggle("is-liked", Boolean(post.liked_by_me));
  boostCount.textContent = post.boosts_count || 0;
  boostButton.classList.toggle("is-boosted", Boolean(post.boosted_by_me));
  saveButton.classList.toggle("is-saved", saved);
  saveButton.querySelector(".save-label").textContent = saved ? "保存済み" : "保存";
  reportButton.querySelector(".report-label").textContent = post.reported_by_me ? `通報済み ${post.reports_count || 0}` : `通報 ${post.reports_count || 0}`;
  reportButton.disabled = Boolean(post.reported_by_me);
  deleteButton.hidden = !canDelete && supabaseClient;

  if (post.shop_name || post.latitude) {
    locationBox.hidden = false;
    shopName.textContent = post.shop_name || "位置情報つき投稿";
    mapLink.hidden = !(post.latitude && post.longitude);
    mapLink.href = `https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`;
  }

  if (post.is_example) {
    const badge = card.querySelector(".post-royal-badge");
    badge.hidden = false;
    badge.textContent = "表示例";
  }

  (post.comments || []).slice(-3).forEach((comment) => {
    const item = document.createElement("div");
    item.className = "comment-item";
    item.textContent = `${comment.profiles?.handle || comment.profiles?.display_name || "mogu"}: ${comment.body}`;
    commentList.append(item);
  });

  likeButton.addEventListener("click", () => toggleLike(post.id, likeButton));
  boostButton.addEventListener("click", () => toggleBoost(post.id, boostButton));
  shareButton.addEventListener("click", () => sharePost(post));
  saveButton.addEventListener("click", () => toggleSave(post.id));
  reportButton.addEventListener("click", () => reportPost(post.id));
  deleteButton.addEventListener("click", () => deletePost(post.id));
  commentForm.addEventListener("submit", (event) => addComment(event, post.id, commentInput));
  return card;
}

function renderPosts() {
  const visiblePosts = getFilteredPosts();
  const showingExamples = posts.length === 0 && !elements.searchInput.value.trim();
  const displayPosts = showingExamples ? getExamplePosts() : visiblePosts;
  const feedModeLabel = document.querySelector("#feedModeLabel");
  const feedTitle = document.querySelector("#feedTitle");

  elements.feed.innerHTML = "";
  elements.postCount.textContent = posts.length;
  elements.emptyState.hidden = displayPosts.length > 0;
  elements.emptyState.textContent = showingExamples ? "投稿例を表示しています。" : "表示できる投稿がまだありません。";
  if (feedModeLabel) feedModeLabel.textContent = "Timeline";
  if (feedTitle) feedTitle.textContent = "投稿一覧";
  displayPosts.forEach((post) => elements.feed.append(createPostCard(post)));
  renderRankingPosts();
  renderProfilePanels();
}

function renderRankingPosts() {
  if (!elements.rankingFeed) {
    return;
  }

  const rankedPosts = getRankedPosts();
  elements.rankingFeed.innerHTML = "";
  elements.rankingEmptyState.hidden = rankedPosts.length > 0;
  rankedPosts.forEach((post, index) => {
    const card = createPostCard({ ...post, ranking_order: index + 1 });
    const badge = card.querySelector(".post-royal-badge");
    badge.hidden = false;
    badge.textContent = `No.${index + 1}`;
    elements.rankingFeed.append(card);
  });
}

function toggleSave(postId) {
  savedPostIds = savedPostIds.includes(postId) ? savedPostIds.filter((id) => id !== postId) : [postId, ...savedPostIds];
  localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(savedPostIds));
  renderPosts();
}

async function addComment(event, postId, input) {
  event.preventDefault();
  const body = input.value.trim();
  if (!body) return;
  if (!supabaseClient || !currentUser) {
    alert("コメントにはログインとSupabase設定が必要です。");
    return;
  }
  await supabaseClient.from("post_comments").insert({ post_id: postId, user_id: currentUser.id, body });
  input.value = "";
  await loadPosts();
}

async function reportPost(postId) {
  if (!supabaseClient || !currentUser) {
    alert("通報にはログインとSupabase設定が必要です。");
    return;
  }
  await supabaseClient.from("post_reports").insert({ post_id: postId, user_id: currentUser.id });
  await loadPosts();
}

async function updateProfile(event) {
  event.preventDefault();
  if (!supabaseClient || !currentUser) {
    alert("プロフィール保存にはログインとSupabase設定が必要です。");
    return;
  }
  await supabaseClient.from("profiles").upsert(
    {
      id: currentUser.id,
      email: currentUser.email,
      display_name: document.querySelector("#profileNameInput").value.trim() || currentUser.email?.split("@")[0] || "mogu",
      handle: document.querySelector("#profileHandleInput").value.trim().replace(/^@/, "") || "mogu",
      bio: document.querySelector("#profileBioInput").value.trim() || "おいしかったものを気軽に残しています。",
      area: document.querySelector("#profileAreaInput").value.trim(),
      favorite_food: document.querySelector("#profileFoodInput").value.trim(),
    },
    { onConflict: "id" },
  );
  await loadProfile();
  renderPosts();
}

function showPage(targetId) {
  const pageMap = {
    feed: [".intro", "#feedSection"],
    search: ["#feedSection"],
    ranking: ["#rankingSection"],
    composer: ["#composer"],
    account: ["#accountSection"],
    notifications: ["#notificationsSection"],
    profile: ["#profileSection"],
    settings: ["#settingsSection"],
  };
  const visibleSelectors = pageMap[targetId] || pageMap.feed;

  document.querySelectorAll(".shell > section").forEach((section) => {
    section.classList.add("is-hidden-page");
  });
  visibleSelectors.forEach((selector) => {
    document.querySelector(selector)?.classList.remove("is-hidden-page");
  });
}

function jumpTo(targetId) {
  const targetMap = {
    feed: document.querySelector("#feedSection"),
    search: elements.searchBox,
    ranking: document.querySelector("#rankingSection"),
    settings: document.querySelector("#settingsSection"),
    account: elements.accountSection,
    notifications: document.querySelector("#notificationsSection"),
    profile: document.querySelector("#profileSection"),
    composer: document.querySelector("#composer"),
  };

  const nextTargetId = targetMap[targetId] ? targetId : "feed";
  showPage(nextTargetId);
  syncNavigation(nextTargetId);
  targetMap[nextTargetId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (nextTargetId === "search") elements.searchInput.focus();
  playSound("tap");
}

document.querySelector("#categoryToggle")?.addEventListener("click", () => {
  const menu = document.querySelector("#categoryMenu");
  const open = menu.hidden;
  menu.hidden = !open;
  document.querySelector("#categoryToggle").setAttribute("aria-expanded", String(open));
});

document.querySelectorAll("#categoryMenu [data-category]").forEach((button) => {
  button.addEventListener("click", () => {
    elements.searchInput.value = button.dataset.category;
    document.querySelector("#categoryMenu").hidden = true;
    rankingMode = false;
    renderPosts();
    jumpTo("search");
  });
});

document.querySelector("#rankingButton")?.addEventListener("click", () => {
  renderRankingPosts();
  jumpTo("ranking");
});

document.querySelector("#timelineButton")?.addEventListener("click", () => {
  jumpTo("feed");
});

document.querySelector("#profileForm")?.addEventListener("submit", updateProfile);

function handleNavigationClick(event) {
  const navButton = event.target.closest(".nav-button[data-jump]");
  if (!navButton) {
    return;
  }

  event.preventDefault();
  jumpTo(navButton.dataset.jump);
}

function subscribeRealtimeUpdates() {
  if (!supabaseClient) {
    return;
  }

  supabaseClient
    .channel("mogu-log-live-posts")
    .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, loadPosts)
    .on("postgres_changes", { event: "*", schema: "public", table: "post_likes" }, loadPosts)
    .on("postgres_changes", { event: "*", schema: "public", table: "post_boosts" }, loadPosts)
    .on("postgres_changes", { event: "*", schema: "public", table: "post_comments" }, loadPosts)
    .subscribe();
  window.setInterval(loadPosts, 30000);
}

elements.soundToggle.checked = soundEnabled;
elements.soundTogglePanel.checked = soundEnabled;
setRememberLogin(rememberLogin);
setChromeHidden(localStorage.getItem(CHROME_KEY) === "true");
setQuickNavVisible(localStorage.getItem(QUICK_NAV_KEY) !== "false", false);
showPage("feed");
initAuth().then(async () => {
  await loadPosts();
  subscribeRealtimeUpdates();
});

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("service-worker.js").catch((error) => {
    console.warn("Service Workerの登録に失敗しました。", error);
  });
}
