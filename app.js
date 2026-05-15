const SOUND_KEY = "mogu-log-sound-enabled-v2";
const CHROME_KEY = "mogu-log-chrome-hidden-v2";
const GUEST_LIKES_KEY = "mogu-log-guest-likes-v1";
const GUEST_BOOSTS_KEY = "mogu-log-guest-boosts-v1";
const SAVED_POSTS_KEY = "mogu-log-saved-posts-v2";

const config = window.MOGU_SUPABASE_CONFIG || {};
const hasSupabaseConfig = Boolean(config.url && config.anonKey);
const supabaseClient =
  hasSupabaseConfig && window.supabase ? window.supabase.createClient(config.url, config.anonKey) : null;
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
    shop_name: "いつもの食卓",
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
  },
];

const elements = {
  body: document.body,
  chromeToggle: document.querySelector("#chromeToggle"),
  chromeTogglePanel: document.querySelector("#chromeTogglePanel"),
  focusPostButton: document.querySelector("#focusPostButton"),
  focusDeleteButton: document.querySelector("#focusDeleteButton"),
  soundToggle: document.querySelector("#soundToggle"),
  soundTogglePanel: document.querySelector("#soundTogglePanel"),
  accountSection: document.querySelector("#accountSection"),
  accountStatus: document.querySelector("#accountStatus"),
  accountHint: document.querySelector("#accountHint"),
  currentAvatar: document.querySelector("#currentAvatar"),
  authForm: document.querySelector("#authForm"),
  displayNameInput: document.querySelector("#displayNameInput"),
  emailInput: document.querySelector("#emailInput"),
  passwordInput: document.querySelector("#passwordInput"),
  termsInput: document.querySelector("#termsInput"),
  signUpButton: document.querySelector("#signUpButton"),
  signInButton: document.querySelector("#signInButton"),
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
  imageEditor: document.querySelector("#imageEditor"),
  previewCanvas: document.querySelector("#previewCanvas"),
  brightnessInput: document.querySelector("#brightnessInput"),
  contrastInput: document.querySelector("#contrastInput"),
  saturationInput: document.querySelector("#saturationInput"),
  warmthInput: document.querySelector("#warmthInput"),
  rotateButton: document.querySelector("#rotateButton"),
  resetImageButton: document.querySelector("#resetImageButton"),
  searchInput: document.querySelector("#searchInput"),
  searchBox: document.querySelector("#searchBox"),
  feed: document.querySelector("#feed"),
  postTemplate: document.querySelector("#postTemplate"),
  postCount: document.querySelector("#postCount"),
  emptyState: document.querySelector("#emptyState"),
};

let posts = demoPosts;
let currentUser = null;
let currentProfile = null;
let sourceImage = null;
let imageRotation = 0;
let selectedLocation = null;
let soundEnabled = localStorage.getItem(SOUND_KEY) === "true";
let audioContext = null;
let guestLikes = new Set(JSON.parse(localStorage.getItem(GUEST_LIKES_KEY) || "[]"));
let guestBoosts = new Set(JSON.parse(localStorage.getItem(GUEST_BOOSTS_KEY) || "[]"));
let savedPostIds = JSON.parse(localStorage.getItem(SAVED_POSTS_KEY) || "[]");
let rankingMode = false;

function isLoggedIn() {
  return Boolean(currentUser);
}

function isEmailVerified() {
  return Boolean(currentUser?.email_confirmed_at || currentUser?.confirmed_at);
}

function isAdmin() {
  return currentProfile?.role === "admin";
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
  updateAccountView();

  supabaseClient.auth.onAuthStateChange(async (_event, sessionValue) => {
    currentUser = sessionValue?.user || null;
    await loadProfile();
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

  const fallbackName = currentUser.email?.split("@")[0] || "mogu";
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
  elements.signInButton.hidden = Boolean(currentUser);
  elements.signUpButton.hidden = Boolean(currentUser);
  elements.authForm.classList.toggle("is-logged-in", Boolean(currentUser));

  if (!configured) {
    elements.accountStatus.textContent = "ゲスト利用中";
    elements.accountHint.textContent =
      "SupabaseのURLとanon keyを supabase-config.js に入れると、本物のメール認証と共有投稿が有効になります。";
    elements.currentAvatar.textContent = "G";
    elements.postNotice.textContent = "現在はゲストモードです。閲覧・検索・画像プレビュー・いいね演出を試せます。";
    return;
  }

  if (!currentUser) {
    elements.accountStatus.textContent = "ゲスト利用中";
    elements.accountHint.textContent = "ログインすると、全員共有の投稿・写真保存・もぐもぐが使えます。";
    elements.currentAvatar.textContent = "G";
    elements.postNotice.textContent = "共有投稿にはメール認証済みアカウントが必要です。";
    return;
  }

  const name = currentProfile?.display_name || currentUser.email?.split("@")[0] || "mogu";
  elements.accountStatus.textContent = `${name} / ${isAdmin() ? "管理者" : "ユーザー"}`;
  elements.accountHint.textContent = isEmailVerified()
    ? `${currentUser.email} でログイン中です。`
    : "確認メールを開くと投稿できるようになります。";
  elements.currentAvatar.textContent = name.slice(0, 2).toUpperCase();
  elements.postNotice.textContent = isEmailVerified()
    ? "写真を選んで、共有タイムラインへ投稿できます。"
    : "メール認証が完了すると投稿できます。";
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
}

function resetImageControls() {
  elements.brightnessInput.value = "100";
  elements.contrastInput.value = "105";
  elements.saturationInput.value = "110";
  elements.warmthInput.value = "10";
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
    alert("投稿するにはログインしてください。");
    elements.accountSection.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (!isEmailVerified()) {
    alert("投稿するにはメール認証を完了してください。");
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
    document.querySelector("#feedSection").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    console.warn(error);
    alert("投稿に失敗しました。Supabaseのテーブル、Storage bucket、RLS設定を確認してください。");
  }
}

async function signUp() {
  if (!supabaseClient) {
    alert("supabase-config.js にSupabaseのURLとanon keyを設定してください。");
    return;
  }

  if (!elements.termsInput.checked) {
    alert("登録には利用規約とプライバシーポリシーへの同意が必要です。");
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email: elements.emailInput.value.trim(),
    password: elements.passwordInput.value,
    options: {
      data: {
        display_name: elements.displayNameInput.value.trim(),
      },
    },
  });

  if (error) {
    alert(error.message);
    return;
  }

  currentUser = data.session?.user || null;

  if (currentUser) {
    await upsertProfile(elements.displayNameInput.value.trim());
  }

  updateAccountView();
  alert("確認メールを送信しました。メール内のリンクを開いて認証してください。");
}

async function signIn(event) {
  event.preventDefault();

  if (!supabaseClient) {
    alert("supabase-config.js にSupabaseのURLとanon keyを設定してください。");
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: elements.emailInput.value.trim(),
    password: elements.passwordInput.value,
  });

  if (error) {
    alert(error.message);
    return;
  }

  currentUser = data.user;
  await upsertProfile(elements.displayNameInput.value.trim());
  updateAccountView();
  await loadPosts();
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

  for (let index = 0; index < 8; index += 1) {
    const heart = document.createElement("span");
    heart.className = "float-heart";
    heart.textContent = index % 2 ? "♥" : "♡";
    heart.style.left = `${rect.left + rect.width / 2 + (index - 3.5) * 9}px`;
    heart.style.top = `${rect.top + 3}px`;
    heart.style.animationDelay = `${index * 24}ms`;
    document.body.append(heart);
    heart.addEventListener("animationend", () => heart.remove());
  }
}

function setChromeHidden(hidden) {
  elements.body.classList.toggle("chrome-hidden", hidden);
  elements.chromeToggle.textContent = hidden ? "上の画面を表示" : "上の画面を隠す";
  elements.chromeToggle.setAttribute("aria-expanded", String(!hidden));
  localStorage.setItem(CHROME_KEY, String(hidden));
}

function syncNavigation(targetId) {
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.jump === targetId);
  });
}

function jumpTo(targetId) {
  const target =
    targetId === "feed"
      ? document.querySelector("#feedSection")
      : targetId === "search"
        ? elements.searchBox
        : targetId === "settings"
          ? document.querySelector("#settingsSection")
          : targetId === "account"
            ? elements.accountSection
            : document.querySelector("#composer");

  syncNavigation(targetId);
  target.scrollIntoView({ behavior: "smooth", block: "start" });

  if (targetId === "search") {
    elements.searchInput.focus();
  }

  playSound("tap");
}

elements.authForm.addEventListener("submit", signIn);
elements.signUpButton.addEventListener("click", signUp);
elements.signOutButton.addEventListener("click", signOut);
elements.postForm.addEventListener("submit", createPost);

elements.photoInput.addEventListener("change", () => {
  const file = elements.photoInput.files[0];

  if (file) {
    readImageFile(file);
  }
});

[elements.brightnessInput, elements.contrastInput, elements.saturationInput, elements.warmthInput].forEach((input) => {
  input.addEventListener("input", drawPreview);
});

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

  const fallbackName = currentUser.email?.split("@")[0] || "mogu";
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

  if (rankingMode) {
    visiblePosts = [...visiblePosts].sort((a, b) => (b.likes_count || 0) + (b.boosts_count || 0) - ((a.likes_count || 0) + (a.boosts_count || 0)));
  }

  return visiblePosts;
}

function renderProfilePanels() {
  const profileSection = document.querySelector("#profileSection");
  if (!profileSection) {
    return;
  }

  const extra = getExtraProfile();
  const myPosts = currentUser ? posts.filter((post) => post.user_id === currentUser.id) : [];
  const savedPosts = savedPostIds.map((id) => posts.find((post) => post.id === id)).filter(Boolean);
  const totalLikes = myPosts.reduce((sum, post) => sum + (post.likes_count || 0), 0);
  const totalBoosts = myPosts.reduce((sum, post) => sum + (post.boosts_count || 0), 0);

  document.querySelector("#profileNamePreview").textContent = `${currentProfile?.display_name || extra.handle} / @${extra.handle}`;
  document.querySelector("#profileBioPreview").textContent = extra.bio;
  document.querySelector("#profileAreaTag").textContent = extra.area ? `エリア: ${extra.area}` : "エリア未設定";
  document.querySelector("#profileFoodTag").textContent = extra.favorite_food ? `好き: ${extra.favorite_food}` : "ジャンル未設定";
  document.querySelector("#profileStats").textContent = `自分の投稿 ${myPosts.length}件 / もらったいいね ${totalLikes}件 / リツイート ${totalBoosts}件 / 保存 ${savedPostIds.length}件`;
  document.querySelector("#profileAvatar").textContent = (currentProfile?.display_name || extra.handle || "M").slice(0, 1).toUpperCase();

  const crownValue = Math.min(totalLikes + totalBoosts, 10);
  document.querySelector("#profileRoyalBadge").textContent = crownValue >= 10 ? "王冠ユーザー" : `王冠まで ${10 - crownValue}`;
  document.querySelector("#noticeCrownText").textContent = `${crownValue} / 10`;
  document.querySelector("#noticeCrownGauge").style.width = `${crownValue * 10}%`;

  const savedBox = document.querySelector("#savedPosts");
  const myBox = document.querySelector("#myPosts");
  savedBox.innerHTML = "";
  myBox.innerHTML = "";
  document.querySelector("#savedPostsEmpty").hidden = savedPosts.length > 0;
  document.querySelector("#myPostsEmpty").hidden = myPosts.length > 0;
  savedPosts.forEach((post) => savedBox.append(createPostCard(post, true)));
  myPosts.forEach((post) => myBox.append(createPostCard(post, true)));

  document.querySelector("#noticeList").innerHTML = posts
    .flatMap((post) => (post.comments || []).slice(-2).map((comment) => `<div class="notice-item"><strong>${post.title}</strong><span>${comment.body}</span></div>`))
    .join("");
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
  image.src = post.image_url;
  image.alt = `${post.title}の写真`;
  title.textContent = post.title;
  description.textContent = post.description;
  author.textContent = `@${post.author_handle || post.author_name || "mogu"}`;
  time.textContent = formatTime(post.created_at);
  heart.textContent = post.liked_by_me ? "笙･" : "笙｡";
  likeCount.textContent = post.likes_count || 0;
  likeButton.classList.toggle("is-liked", Boolean(post.liked_by_me));
  boostCount.textContent = post.boosts_count || 0;
  boostButton.classList.toggle("is-boosted", Boolean(post.boosted_by_me));
  saveButton.textContent = saved ? "保存済み" : "保存";
  reportButton.textContent = post.reported_by_me ? `通報済み ${post.reports_count || 0}` : `通報 ${post.reports_count || 0}`;
  reportButton.disabled = Boolean(post.reported_by_me);
  deleteButton.hidden = !canDelete && supabaseClient;

  if (post.shop_name || post.latitude) {
    locationBox.hidden = false;
    shopName.textContent = post.shop_name || "位置情報つき投稿";
    mapLink.hidden = !(post.latitude && post.longitude);
    mapLink.href = `https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`;
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
  const feedModeLabel = document.querySelector("#feedModeLabel");
  const feedTitle = document.querySelector("#feedTitle");
  const rankingButton = document.querySelector("#rankingButton");

  elements.feed.innerHTML = "";
  elements.postCount.textContent = posts.length;
  elements.emptyState.hidden = visiblePosts.length > 0;
  if (feedModeLabel) feedModeLabel.textContent = rankingMode ? "Ranking" : "Timeline";
  if (feedTitle) feedTitle.textContent = rankingMode ? "いいねランキング" : "投稿一覧";
  if (rankingButton) rankingButton.classList.toggle("is-active", rankingMode);
  visiblePosts.forEach((post) => elements.feed.append(createPostCard(post)));
  renderProfilePanels();
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

function jumpTo(targetId) {
  const targetMap = {
    feed: document.querySelector("#feedSection"),
    search: elements.searchBox,
    settings: document.querySelector("#settingsSection"),
    account: elements.accountSection,
    notifications: document.querySelector("#notificationsSection"),
    profile: document.querySelector("#profileSection"),
    composer: document.querySelector("#composer"),
  };
  syncNavigation(targetId);
  targetMap[targetId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (targetId === "search") elements.searchInput.focus();
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
  rankingMode = true;
  renderPosts();
  jumpTo("feed");
});

document.querySelector("#timelineButton")?.addEventListener("click", () => {
  rankingMode = false;
  renderPosts();
  jumpTo("feed");
});

document.querySelector("#profileForm")?.addEventListener("submit", updateProfile);

document.querySelectorAll(".nav-button").forEach((button) => {
  button.addEventListener("click", () => jumpTo(button.dataset.jump));
});

elements.soundToggle.checked = soundEnabled;
elements.soundTogglePanel.checked = soundEnabled;
setChromeHidden(localStorage.getItem(CHROME_KEY) === "true");
initAuth().then(loadPosts);

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("service-worker.js").catch((error) => {
    console.warn("アプリ化用のService Worker登録に失敗しました。", error);
  });
}
