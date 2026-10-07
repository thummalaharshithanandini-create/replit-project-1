import { COPY, INGREDIENT_LABELS, LANGUAGES, ingredientName } from "./i18n.js";
import { RECIPES, SAMPLE_PANTRY } from "./recipes.js";
import { GroceryMapController, POPULAR_NATIVE_PLACES, GROCERY_STORES } from "./maps.js";

const STORAGE = {
  language: "rasoi-language",
  ingredients: "rasoi-ingredients",
  saved: "rasoi-saved-recipes",
  deviceId: "rasoi-device-id",
};

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getDeviceId() {
  let id = localStorage.getItem(STORAGE.deviceId);
  if (!id) {
    id = globalThis.crypto?.randomUUID?.() ||
      "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
        const random = Math.random() * 16 | 0;
        return (character === "x" ? random : (random & 3 | 8)).toString(16);
      });
    localStorage.setItem(STORAGE.deviceId, id);
  }
  return id;
}

const storedIngredients = readStored(STORAGE.ingredients, null);
const initialLanguage = readStored(STORAGE.language, "en");
const state = {
  language: LANGUAGES.some(({ code }) => code === initialLanguage) ? initialLanguage : "en",
  ingredients: Array.isArray(storedIngredients) ? storedIngredients.slice(0, 20) : [],
  isDemo: false,
  ingredientQuery: "",
  saved: new Set(Array.isArray(readStored(STORAGE.saved, [])) ? readStored(STORAGE.saved, []) : []),
  view: "explore",
  selectedRecipe: null,
  guideVisible: false,
  guideIndex: 0,
  guidePlaying: false,
  promptVisible: false,
  currentPrompt: "",
  isSpeaking: false,
  cloudEnabled: false,
  cloudSynced: false,
  syncWarningShown: false,
};

let mapController = null;

const $ = (selector) => document.querySelector(selector);
const copy = () => COPY[state.language] || COPY.en;
let toastTimer;
let guideTimer;
let syncTimer;

function t(key, values = {}) {
  const template = copy()[key] ?? COPY.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ""));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function recipeText(recipe) {
  return recipe.text[state.language] || recipe.text.en;
}

function getRecipeMatch(recipe) {
  const available = recipe.ingredients.filter((item) => state.ingredients.includes(item));
  const missing = recipe.ingredients.filter((item) => !state.ingredients.includes(item));
  return {
    available,
    missing,
    percent: recipe.ingredients.length ? Math.round(available.length / recipe.ingredients.length * 100) : 0,
  };
}

function setLanguage(language, announce = true) {
  if (!LANGUAGES.some(({ code }) => code === language)) return;
  state.language = language;
  state.ingredientQuery = "";
  persist();
  render();
  if (announce) {
    const languageName = LANGUAGES.find(({ code }) => code === language)?.native || language;
    showToast(t("toastLanguage", { language: languageName }));
  }
}

function persist(sync = true) {
  try {
    localStorage.setItem(STORAGE.language, JSON.stringify(state.language));
    localStorage.setItem(STORAGE.ingredients, JSON.stringify(state.ingredients));
    localStorage.setItem(STORAGE.saved, JSON.stringify([...state.saved]));
  } catch {
    showToast(t("toastSync"));
  }
  if (sync && state.cloudEnabled) {
    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(syncPreferences, 450);
  }
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2800);
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

// AI Speech synthesis narration
function speakStep(textToSpeak) {
  if (!("speechSynthesis" in window)) {
    showToast("AI voice narration is not supported in this browser.");
    return;
  }
  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  const langMap = {
    en: "en-IN",
    te: "te-IN",
    hi: "hi-IN",
    ta: "ta-IN",
    kn: "kn-IN",
    ml: "ml-IN",
  };
  utterance.lang = langMap[state.language] || "en-US";
  utterance.rate = 0.92;
  utterance.pitch = 1.0;

  utterance.onend = () => {
    state.isSpeaking = false;
    renderDetails();
  };
  utterance.onerror = () => {
    state.isSpeaking = false;
    renderDetails();
  };

  state.isSpeaking = true;
  window.speechSynthesis.speak(utterance);
  showToast("🔊 AI Chef speaking...");
  renderDetails();
}

function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  state.isSpeaking = false;
  renderDetails();
}

function renderLanguageOptions() {
  const select = $("#languageSelect");
  select.innerHTML = LANGUAGES.map(({ code, native, name }) =>
    `<option value="${code}">${escapeHtml(native)} · ${escapeHtml(name)}</option>`
  ).join("");
  select.value = state.language;
  select.setAttribute("aria-label", t("language"));
  $("#languageLabel").textContent = t("language");
}

function renderStaticCopy() {
  const values = {
    brandTag: "brandTag",
    navExplore: "navExplore",
    navSavedText: "navSaved",
    navMapsText: "navMaps",
    heroKicker: "heroKicker",
    heroTitle: "heroTitle",
    heroDescription: "heroDescription",
    heroLink: "heroLink",
    heroSticker: "heroSticker",
    pantryEyebrow: "pantryEyebrow",
    pantryTitle: "pantryTitle",
    pantryDescription: "pantryDescription",
    ingredientLabel: "ingredientLabel",
    ingredientOptionsLabel: "ingredientOptionsLabel",
    sampleButtonText: "sampleButton",
    pantryListLabel: "pantryListLabel",
    recipeEyebrow: "recipeEyebrow",
    recipeHeading: state.view === "saved" ? "favoritesHeading" : "recipeTitle",
    recipeDescription: "recipeDescription",
    emptyTitle: state.view === "saved" ? "emptyFavoritesTitle" : "emptyTitle",
    emptyDescription: state.view === "saved" ? "emptyFavoritesDescription" : "emptyDescription",
    emptySampleButton: "loadSample",
    footerCopy: "footerCopy",
    footerNote: "footerNote",
    mapsEyebrow: "mapsEyebrow",
    mapsTitle: "mapsTitle",
    mapsDescription: "mapsDescription",
    popularCitiesLabel: "popularCitiesLabel",
    useGpsText: "useGps",
  };
  for (const [id, key] of Object.entries(values)) setText(id, t(key));

  $("#ingredientSearch").placeholder = t("ingredientPlaceholder");
  $("#ingredientSearch").value = state.ingredientQuery;
  $("#mapCitySearch").placeholder = t("searchPlacePlaceholder");
  $("#clearButton").textContent = t("clear");
  $("#findRecipesText").textContent = t("findRecipes");
  $("#syncLabel").textContent = state.cloudSynced ? t("syncCloud") : t("syncLocal");
  $("#recipeGrid").setAttribute("aria-label", t(state.view === "saved" ? "favoritesHeading" : "recipeTitle"));

  $("#navExplore").classList.toggle("active", state.view === "explore");
  $("#navSaved").classList.toggle("active", state.view === "saved");
  $("#navMaps").classList.toggle("active", state.view === "maps");
  $("#navExplore").setAttribute("aria-pressed", String(state.view === "explore"));
  $("#navSaved").setAttribute("aria-pressed", String(state.view === "saved"));
  $("#navMaps").setAttribute("aria-pressed", String(state.view === "maps"));

  $("#savedCount").textContent = String(state.saved.size);
  $("#savedCount").setAttribute("aria-label", t("navSaved"));
  $("#emptySampleButton").hidden = state.view === "saved";

  document.documentElement.lang = state.language;
  document.title = `Rasoi · ${t(state.view === "saved" ? "favoritesHeading" : state.view === "maps" ? "navMaps" : "recipeTitle")}`;
}

function renderPicker() {
  const picker = $("#ingredientPicker");
  const previousScrollTop = picker.scrollTop;
  const options = Object.keys(INGREDIENT_LABELS);
  const query = state.ingredientQuery.trim().toLocaleLowerCase();
  const filtered = options.filter((key) => {
    if (!query) return true;
    const item = INGREDIENT_LABELS[key];
    return ingredientName(key, state.language).toLocaleLowerCase().includes(query) ||
      item.en.toLocaleLowerCase().includes(query) ||
      item.aliases.some((alias) => alias.toLocaleLowerCase().includes(query));
  });

  picker.setAttribute("aria-label", t("ingredientOptionsLabel"));
  $("#ingredientOptionCount").textContent = t("ingredientOptionCount", { count: options.length });
  $("#pickerEmpty").textContent = t("pickerNoResults");
  $("#pickerEmpty").hidden = filtered.length > 0;
  picker.innerHTML = filtered.map((key) => {
    const selected = state.ingredients.includes(key);
    return `<button class="ingredient-option${selected ? " is-selected" : ""}" type="button"
      data-action="toggle-ingredient" data-value="${key}" aria-pressed="${selected}">
      <span class="option-indicator" aria-hidden="true">
        ${selected
          ? '<svg viewBox="0 0 16 16" fill="none"><path d="m3.5 8.3 2.7 2.7 6.3-6.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          : '<svg viewBox="0 0 16 16" fill="none"><path d="M8 3.5v9M3.5 8h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'}
      </span>
      <span>${escapeHtml(ingredientName(key, state.language))}</span>
    </button>`;
  }).join("");
  picker.scrollTop = previousScrollTop;
}

function renderPantry() {
  $("#pantryCount").textContent = t("pantryCount", { count: state.ingredients.length });
  $("#demoNote").textContent = state.isDemo ? t("sampleBadge") : "";
  $("#ingredientChips").innerHTML = state.ingredients.length
    ? state.ingredients.map((item) => {
      const label = ingredientName(item, state.language);
      return `<span class="ingredient-chip">
        <span>${escapeHtml(label)}</span>
        <button class="chip-remove" type="button" data-action="remove-ingredient" data-value="${escapeHtml(item)}" aria-label="${escapeHtml(t("toastRemoved", { ingredient: label }))}">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4.5 4.5 7 7m0-7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </span>`;
    }).join("")
    : `<p class="pantry-empty">${escapeHtml(t("pantryEmpty"))}</p>`;
}

function renderRecipes() {
  const ranked = RECIPES
    .filter((recipe) => state.view !== "saved" || state.saved.has(recipe.id))
    .map((recipe) => ({ recipe, match: getRecipeMatch(recipe) }))
    .sort((a, b) => b.match.available.length - a.match.available.length || b.match.percent - a.match.percent);

  const shown = state.view === "saved"
    ? ranked
    : state.ingredients.length
      ? ranked
      : [];

  $("#recipeHeading").textContent = t(state.view === "saved" ? "favoritesHeading" : "recipeTitle");
  $("#resultsNote").textContent = t("resultsNote", { count: shown.length });
  $("#emptyState").hidden = shown.length > 0;
  $("#recipeGrid").hidden = shown.length === 0;

  if (!shown.length) return;

  $("#recipeGrid").innerHTML = shown.map(({ recipe, match }) => {
    const text = recipeText(recipe);
    const isSaved = state.saved.has(recipe.id);
    const ingredientPills = match.available.slice(0, 4).map((item) =>
      `<span class="mini-ingredient">${escapeHtml(ingredientName(item, state.language))}</span>`
    ).join("");
    const moreCount = Math.max(0, match.available.length - 4);
    const missingText = match.missing.length
      ? `${escapeHtml(t("missingLabel"))}: ${escapeHtml(match.missing.slice(0, 2).map((item) => ingredientName(item, state.language)).join(", "))}${match.missing.length > 2 ? "…" : ""}`
      : escapeHtml(t("availableLabel"));

    return `<article class="recipe-card ${isSaved ? "is-favorite-card" : ""}">
      <div class="recipe-image-wrap">
        <img class="recipe-image" src="${recipe.image}" alt="${escapeHtml(text.name)}" loading="lazy" />
        <span class="match-badge"><span class="match-dot"></span>${match.percent}% ${escapeHtml(t("match"))}</span>
        <button class="save-button${isSaved ? " is-saved" : ""}" type="button" data-action="toggle-save" data-value="${recipe.id}" aria-label="${escapeHtml(t(isSaved ? "unsave" : "save"))}" aria-pressed="${isSaved}">
          <svg viewBox="0 0 24 24" fill="${isSaved ? "#d47648" : "none"}" stroke="${isSaved ? "#d47648" : "currentColor"}" aria-hidden="true"><path d="M12 20.2s-7.5-4.4-9.2-9.1C1.1 6.3 7.2 3.1 12 8c4.8-4.9 10.9-1.7 9.2 3.1-1.7 4.7-9.2 9.1-9.2 9.1Z" stroke-width="1.6" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <div class="recipe-card-body">
        <div class="recipe-meta">
          <span>${escapeHtml(text.cuisine)}</span>
          <span class="meta-dot">·</span>
          <span>${recipe.minutes} ${escapeHtml(t("minutes"))}</span>
          ${recipe.videoEmbed ? `<span class="video-pill-mini">🎥 Video</span>` : ""}
        </div>
        <h3>${escapeHtml(text.name)}</h3>
        <p class="recipe-description">${escapeHtml(text.description)}</p>
        <div class="recipe-match-row">${ingredientPills}${moreCount ? `<span class="mini-ingredient more-count">+${moreCount}</span>` : ""}</div>
        <p class="missing-note">${missingText}</p>
        <div class="recipe-card-actions">
          <button class="open-recipe-button" type="button" data-action="open-recipe" data-value="${recipe.id}">
            <span>${escapeHtml(t("detail"))}</span>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          ${match.missing.length > 0 ? `
            <button class="card-map-btn" type="button" data-action="locate-missing-stores" data-value="${recipe.id}" title="${escapeHtml(t("locateMissingStores"))}">
              🗺️ Find Missing
            </button>
          ` : ""}
        </div>
      </div>
    </article>`;
  }).join("");
}

function renderGuide(recipe) {
  const text = recipeText(recipe);
  const match = getRecipeMatch(recipe);
  const steps = text.steps;
  const safeIndex = Math.min(state.guideIndex, steps.length - 1);
  const currentStep = steps[safeIndex];
  const prompt = buildVideoPrompt(recipe, match);
  state.currentPrompt = prompt;

  const currentStepText = `${currentStep[0]}. ${currentStep[1]}`;

  return `<section class="video-feature" aria-labelledby="guideHeading">
    <div class="video-intro">
      <div class="video-media-panel">
        ${recipe.videoEmbed ? `
          <div class="video-embed-container">
            <iframe
              src="${recipe.videoEmbed}?rel=0&modestbranding=1"
              title="${escapeHtml(recipe.videoTitle || text.name)}"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              class="video-iframe">
            </iframe>
          </div>
        ` : `
          <div class="video-poster">
            <img src="${recipe.image}" alt="" />
            <div class="poster-shade"></div>
            <span class="poster-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="m9 6 10 6-10 6V6Z" fill="currentColor"/></svg>
            </span>
            <span class="poster-label">${escapeHtml(t("aiVideoBadge"))}</span>
            <span class="poster-duration">${recipe.minutes} ${escapeHtml(t("minutes"))}</span>
          </div>
        `}
      </div>

      <div class="video-copy">
        <div class="video-badge-header">
          <span class="ai-sparkle-pill">✨ AI Video Assistant</span>
          <span class="duration-badge">⏱️ ${recipe.minutes} ${escapeHtml(t("minutes"))}</span>
        </div>
        <h3 id="guideHeading">${escapeHtml(recipe.videoTitle || text.name)}</h3>
        <p class="video-fallback-copy">${escapeHtml(text.description)}</p>

        <!-- AI Chef Secret Tip Box -->
        ${recipe.aiTip ? `
          <div class="ai-chef-tip-card">
            <span class="tip-spark">💡</span>
            <div class="tip-text">
              <strong>${escapeHtml(t("aiChefTip"))}:</strong>
              <span>${escapeHtml(recipe.aiTip)}</span>
            </div>
          </div>
        ` : ""}

        <div class="video-actions">
          <button class="primary-button" type="button" data-action="watch-video">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m7 4.5 9 5.5-9 5.5v-11Z" fill="currentColor"/></svg>
            <span>Interactive Cooking Guide</span>
          </button>
          
          <button class="secondary-button voice-action-btn ${state.isSpeaking ? "speaking-active" : ""}" type="button" data-action="${state.isSpeaking ? "stop-voice" : "speak-step"}" data-text="${escapeHtml(currentStepText)}">
            <span>${state.isSpeaking ? "⏹ " + escapeHtml(t("aiVoiceStop")) : "🔊 " + escapeHtml(t("aiVoiceListen"))}</span>
          </button>

          ${match.missing.length > 0 ? `
            <button class="secondary-button find-store-action-btn" type="button" data-action="locate-missing-stores" data-value="${recipe.id}">
              <span>${escapeHtml(t("locateMissingStores"))}</span>
            </button>
          ` : ""}
        </div>
      </div>
    </div>

    <!-- Step Navigation Frame -->
    ${state.guideVisible ? `
      <div class="guide-player" id="guidePlayer">
        <div class="guide-screen">
          <img src="${recipe.image}" alt="" />
          <div class="guide-overlay"></div>
          <div class="guide-screen-top">
            <span>${escapeHtml(text.name)}</span>
            <div class="screen-btn-group">
              <button class="screen-speech-btn ${state.isSpeaking ? "is-talking" : ""}" type="button" data-action="${state.isSpeaking ? "stop-voice" : "speak-step"}" data-text="${escapeHtml(currentStepText)}">
                ${state.isSpeaking ? "⏹ Stop" : "🔊 Speak"}
              </button>
              <button type="button" data-action="fullscreen" aria-label="${escapeHtml(t("fullscreen"))}" title="${escapeHtml(t("fullscreen"))}">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M7 3H3v4m10-4h4v4M3 13v4h4m10-4v4h-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </div>
          <span class="guide-step-count">${escapeHtml(t("step"))} ${safeIndex + 1} ${escapeHtml(t("of"))} ${steps.length}</span>
          <div class="guide-step-copy">
            <span class="step-kicker">${escapeHtml(t("videoStepPrep"))} · ${String(safeIndex + 1).padStart(2, "0")}</span>
            <h4>${escapeHtml(currentStep[0])}</h4>
            <p>${escapeHtml(currentStep[1])}</p>
          </div>
          <div class="guide-progress"><span style="width:${((safeIndex + 1) / steps.length) * 100}%"></span></div>
        </div>
        <div class="guide-controls">
          <button class="guide-play-button" type="button" data-action="toggle-guide" aria-label="${escapeHtml(t(state.guidePlaying ? "pauseGuide" : "startGuide"))}">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">${state.guidePlaying ? '<path d="M7 5v10m6-10v10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' : '<path d="m7 4.5 9 5.5-9 5.5v-11Z" fill="currentColor"/>'}</svg>
          </button>
          <div class="guide-step-label">${escapeHtml(currentStep[0])}<span>${safeIndex + 1} / ${steps.length}</span></div>
          <div class="guide-step-buttons">
            <button class="circle-button" type="button" data-action="guide-prev" aria-label="${escapeHtml(t("previousStep"))}" ${safeIndex === 0 ? "disabled" : ""}>
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M16 10H5m4 4-4-4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="circle-button" type="button" data-action="guide-next" aria-label="${escapeHtml(t("nextStep"))}" ${safeIndex === steps.length - 1 ? "disabled" : ""}>
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    ` : ""}

    ${state.promptVisible ? `
      <div class="prompt-panel">
        <div class="prompt-heading">
          <div><h4>${escapeHtml(t("promptTitle"))}</h4><p>${escapeHtml(t("promptDescription"))}</p></div>
          <button class="copy-button" type="button" data-action="copy-prompt">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" stroke="currentColor" stroke-width="1.4"/></svg>
            <span>${escapeHtml(t("copyPrompt"))}</span>
          </button>
        </div>
        <textarea class="prompt-text" id="promptText" readonly rows="5" aria-label="${escapeHtml(t("promptTitle"))}">${escapeHtml(prompt)}</textarea>
      </div>
    ` : ""}
  </section>`;
}

function buildVideoPrompt(recipe, match) {
  const text = recipeText(recipe);
  const available = match.available.length
    ? match.available.map((item) => ingredientName(item, state.language)).join(", ")
    : t("pantryEmpty");
  const missing = match.missing.map((item) => ingredientName(item, state.language)).join(", ");
  const stepTitles = text.steps.map(([title], index) => `${index + 1}. ${title}`).join("; ");
  const language = LANGUAGES.find(({ code }) => code === state.language)?.native || "English";
  return [
    t("promptRecipe", { recipe: text.name }),
    t("promptLanguage", { language }),
    t("promptAvailable", { ingredients: available }),
    missing ? t("promptMissing", { ingredients: missing }) : t("promptNoMissing"),
    t("promptContext", { cuisine: text.cuisine, method: text.method }),
    t("promptSteps", { steps: stepTitles }),
    t("promptPlating"),
  ].join(" ");
}

function renderDetails() {
  const section = $("#recipeDetails");
  const recipe = RECIPES.find(({ id }) => id === state.selectedRecipe);
  if (!recipe) {
    section.hidden = true;
    section.innerHTML = "";
    return;
  }

  section.hidden = false;
  const text = recipeText(recipe);
  const match = getRecipeMatch(recipe);
  const isSaved = state.saved.has(recipe.id);
  const ingredientsHtml = recipe.ingredients.map((item) => {
    const available = state.ingredients.includes(item);
    return `<li class="${available ? "is-available" : "is-missing"}">
      <span class="ingredient-check" aria-hidden="true">${available ? "✓" : "+"}</span>
      <span>${escapeHtml(ingredientName(item, state.language))}</span>
      <span class="ingredient-state">${escapeHtml(available ? t("availableLabel") : t("missingLabel"))}</span>
    </li>`;
  }).join("");

  const stepsHtml = text.steps.map(([title, description], index) =>
    `<li class="instruction-step">
      <span class="instruction-number">${String(index + 1).padStart(2, "0")}</span>
      <div><h4>${escapeHtml(title)}</h4><p>${escapeHtml(description)}</p></div>
    </li>`
  ).join("");

  section.innerHTML = `<div class="detail-topline">
      <p class="eyebrow">${escapeHtml(t("recipeEyebrow"))}</p>
      <button class="close-detail" type="button" data-action="close-recipe">
        <span>${escapeHtml(t("closeDetail"))}</span><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
    </div>
    <div class="detail-heading">
      <div><h2>${escapeHtml(text.name)}</h2><p>${escapeHtml(text.description)}</p></div>
      <div class="detail-action-buttons">
        <button class="secondary-button detail-save${isSaved ? " saved" : ""}" type="button" data-action="toggle-save" data-value="${recipe.id}" aria-pressed="${isSaved}">
          <svg viewBox="0 0 20 20" fill="${isSaved ? "currentColor" : "none"}" aria-hidden="true"><path d="M10 17s-6.3-3.7-7.7-7.6C.9 5.5 6 2.8 10 6.9c4-4.1 9.1-1.4 7.7 2.5C16.3 13.3 10 17 10 17Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
          <span>${escapeHtml(t(isSaved ? "unsave" : "save"))}</span>
        </button>
      </div>
    </div>
    <div class="detail-facts">
      <span>${escapeHtml(text.cuisine)}</span><span>${escapeHtml(text.method)}</span><span>${recipe.minutes} ${escapeHtml(t("minutes"))}</span><span>${escapeHtml(t("servings"))}</span>
    </div>
    <div class="detail-layout">
      <div class="detail-main">
        <section class="detail-block">
          <div class="detail-block-heading">
            <h3>${escapeHtml(t("ingredients"))}</h3>
            <span>${match.available.length}/${recipe.ingredients.length} in pantry</span>
          </div>
          <ul class="detail-ingredients">${ingredientsHtml}</ul>
          ${match.missing.length > 0 ? `
            <div class="missing-store-cta">
              <button class="primary-button map-cta-btn" type="button" data-action="locate-missing-stores" data-value="${recipe.id}">
                🗺️ Find Missing (${match.missing.map((m) => ingredientName(m, state.language)).join(", ")}) on Map
              </button>
            </div>
          ` : ""}
        </section>
        <section class="detail-block instructions-block">
          <div class="detail-block-heading"><h3>${escapeHtml(t("steps"))}</h3><span>${text.steps.length} ${escapeHtml(t("step"))}</span></div>
          <ol class="instruction-list">${stepsHtml}</ol>
        </section>
      </div>
      <aside class="detail-aside">
        <img class="detail-image" src="${recipe.image}" alt="${escapeHtml(text.name)}" />
        <div class="detail-aside-copy">
          <span class="aside-kicker">${escapeHtml(t("method"))}</span>
          <h3>${escapeHtml(text.method)}</h3>
          <p>${recipe.minutes} ${escapeHtml(t("minutes"))} · ${escapeHtml(t("servings"))}</p>
        </div>
      </aside>
    </div>
    ${renderGuide(recipe)}
  `;
}

function renderMapsSection() {
  if (!mapController) {
    mapController = new GroceryMapController("storeMap", {
      onSelectStore: (store) => {
        const storeCard = document.getElementById(`store-card-${store.id}`);
        if (storeCard) {
          storeCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
          storeCard.classList.add("highlighted-store");
          setTimeout(() => storeCard.classList.remove("highlighted-store"), 1800);
        }
      },
    });
  }

  // Quick native place chips
  const chipsContainer = $("#quickCityChips");
  if (chipsContainer) {
    chipsContainer.innerHTML = POPULAR_NATIVE_PLACES.map((place) =>
      `<button class="city-chip ${mapController.cityName === place.name ? "active" : ""}" type="button" data-action="select-city" data-lat="${place.lat}" data-lng="${place.lng}" data-name="${escapeHtml(place.name)}">
        📍 ${escapeHtml(place.name)}
      </button>`
    ).join("");
  }

  renderStoreCards();

  setTimeout(() => {
    mapController.init();
    $("#activeCityBadge").textContent = `📍 ${mapController.cityName}`;
  }, 120);
}

function renderStoreCards() {
  if (!mapController) return;
  const stores = mapController.getFilteredStores();
  const listContainer = $("#storeCardsList");
  if (!listContainer) return;

  $("#storesCountBadge").textContent = `${stores.length} stores near ${mapController.cityName}`;

  if (!stores.length) {
    listContainer.innerHTML = `<p class="empty-stores-note">No stores found near ${escapeHtml(mapController.cityName)} for this filter.</p>`;
    return;
  }

  listContainer.innerHTML = stores.map((store) => {
    const iconEmoji = store.type === "indian" ? "🇮🇳" : store.type === "fresh" ? "🥬" : "🛒";
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;
    return `<article class="store-card" id="store-card-${store.id}">
      <div class="store-card-header">
        <span class="store-card-badge store-badge-${store.type}">${iconEmoji} ${escapeHtml(store.typeLabel)}</span>
        <span class="store-dist-tag">${store.distance} km</span>
      </div>
      <h4>${escapeHtml(store.name)}</h4>
      <p class="store-address">📍 ${escapeHtml(store.address)}</p>
      <p class="store-hours">🕒 ${escapeHtml(store.hours)} · ★ ${store.rating}</p>
      <div class="store-specialties">
        ${store.specialties.map((s) => `<span class="specialty-pill">${escapeHtml(s)}</span>`).join("")}
      </div>
      <div class="store-actions-row">
        <button class="secondary-button view-on-map-btn" type="button" data-action="pan-to-store" data-lat="${store.lat}" data-lng="${store.lng}">
          Center on Map
        </button>
        <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="primary-button gmaps-direct-btn">
          Directions 🧭
        </a>
      </div>
    </article>`;
  }).join("");
}

function render() {
  renderLanguageOptions();
  renderStaticCopy();

  const isMaps = state.view === "maps";
  $("#pantry").hidden = isMaps;
  $("#mapsSection").hidden = !isMaps;

  if (isMaps) {
    renderMapsSection();
  } else {
    renderPicker();
    renderPantry();
    renderRecipes();
  }
  renderDetails();
}

function toggleIngredient(ingredient) {
  const restoreFocus = document.activeElement?.closest?.(".ingredient-option")?.dataset.value;
  if (state.ingredients.includes(ingredient)) {
    state.ingredients = state.ingredients.filter((item) => item !== ingredient);
    state.isDemo = false;
    persist();
    render();
    if (restoreFocus) requestAnimationFrame(() => $(`#ingredientPicker [data-value="${restoreFocus}"]`)?.focus({ preventScroll: true }));
    showToast(t("toastRemoved", { ingredient: ingredientName(ingredient, state.language) }));
    return;
  }
  if (state.ingredients.length >= 20) {
    showToast(t("toastLimit"));
    return;
  }
  state.ingredients.push(ingredient);
  state.isDemo = false;
  state.view = "explore";
  persist();
  render();
  if (restoreFocus) requestAnimationFrame(() => $(`#ingredientPicker [data-value="${restoreFocus}"]`)?.focus({ preventScroll: true }));
  showToast(t("toastAdded", { ingredient: ingredientName(ingredient, state.language) }));
}

function loadSamplePantry() {
  state.ingredients = [...SAMPLE_PANTRY];
  state.isDemo = true;
  state.view = "explore";
  persist();
  render();
  showToast(t("toastSample"));
}

function openRecipe(id) {
  state.selectedRecipe = id;
  state.guideVisible = false;
  state.promptVisible = false;
  state.guidePlaying = false;
  state.guideIndex = 0;
  stopSpeaking();
  window.clearInterval(guideTimer);
  renderDetails();
  $("#recipeDetails").scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleSave(id) {
  if (state.saved.has(id)) {
    state.saved.delete(id);
    showToast(t("toastUnsaved"));
  } else {
    state.saved.add(id);
    showToast("❤️ " + t("toastSaved"));
  }
  persist(false);
  render();
}

function toggleGuidePlayback() {
  const recipe = RECIPES.find(({ id }) => id === state.selectedRecipe);
  if (!recipe) return;
  if (state.guidePlaying) {
    state.guidePlaying = false;
    window.clearInterval(guideTimer);
    renderDetails();
    return;
  }
  if (state.guideIndex >= recipeText(recipe).steps.length - 1) state.guideIndex = 0;
  state.guidePlaying = true;
  renderDetails();
  guideTimer = window.setInterval(() => {
    const current = RECIPES.find(({ id }) => id === state.selectedRecipe);
    if (!current) {
      window.clearInterval(guideTimer);
      return;
    }
    if (state.guideIndex >= recipeText(current).steps.length - 1) {
      state.guidePlaying = false;
      window.clearInterval(guideTimer);
    } else {
      state.guideIndex += 1;
    }
    renderDetails();
  }, 4200);
}

function moveGuide(amount) {
  const recipe = RECIPES.find(({ id }) => id === state.selectedRecipe);
  if (!recipe) return;
  window.clearInterval(guideTimer);
  state.guidePlaying = false;
  state.guideIndex = Math.max(0, Math.min(recipeText(recipe).steps.length - 1, state.guideIndex + amount));
  renderDetails();
}

async function copyPrompt() {
  const prompt = $("#promptText")?.value || state.currentPrompt;
  try {
    await navigator.clipboard.writeText(prompt);
    showToast(t("toastCopied"));
  } catch {
    const textarea = $("#promptText");
    textarea?.select();
    const copied = document.execCommand?.("copy");
    showToast(copied ? t("toastCopied") : t("toastCopyError"));
  }
}

// Global click event dispatcher
document.addEventListener("click", async (event) => {
  const actionButton = event.target.closest("[data-action], [data-view], [data-filter]");
  if (!actionButton) return;

  if (actionButton.dataset.view) {
    state.view = actionButton.dataset.view;
    render();
    if (state.view === "maps") {
      $("#mapsSection").scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      $("#recipeHeading").scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }

  if (actionButton.dataset.filter && actionButton.closest("#storeFilterGroup")) {
    const filter = actionButton.dataset.filter;
    document.querySelectorAll("#storeFilterGroup .filter-chip").forEach((btn) => btn.classList.remove("active"));
    actionButton.classList.add("active");
    if (mapController) {
      mapController.setFilter(filter);
      renderStoreCards();
    }
    return;
  }

  const { action, value, lat, lng, name, text } = actionButton.dataset;
  switch (action) {
    case "remove-ingredient": {
      state.ingredients = state.ingredients.filter((item) => item !== value);
      state.isDemo = false;
      persist();
      render();
      showToast(t("toastRemoved", { ingredient: ingredientName(value, state.language) }));
      break;
    }
    case "toggle-ingredient":
      toggleIngredient(value);
      break;
    case "sample":
      loadSamplePantry();
      break;
    case "clear":
      state.ingredients = [];
      state.isDemo = false;
      persist();
      render();
      showToast(t("toastCleared"));
      break;
    case "open-recipe":
      openRecipe(value);
      break;
    case "toggle-save":
      toggleSave(value);
      break;
    case "close-recipe":
      stopSpeaking();
      state.selectedRecipe = null;
      state.guideVisible = false;
      state.promptVisible = false;
      state.guidePlaying = false;
      window.clearInterval(guideTimer);
      render();
      $("#pantry").scrollIntoView({ behavior: "smooth", block: "start" });
      break;
    case "watch-video":
      state.guideVisible = true;
      state.guideIndex = 0;
      state.guidePlaying = false;
      renderDetails();
      $("#guidePlayer")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      break;
    case "generate-video":
      state.guideVisible = true;
      state.guideIndex = 0;
      state.guidePlaying = false;
      state.promptVisible = true;
      renderDetails();
      $("#promptText")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      break;
    case "speak-step":
      speakStep(text);
      break;
    case "stop-voice":
      stopSpeaking();
      break;
    case "locate-missing-stores": {
      const targetRecipe = RECIPES.find(({ id }) => id === value);
      if (targetRecipe) {
        const match = getRecipeMatch(targetRecipe);
        state.view = "maps";
        render();
        const notice = $("#mapIngredientNotice");
        if (notice) {
          notice.hidden = false;
          $("#mapNoticeIngredients").textContent = match.missing.map((m) => ingredientName(m, state.language)).join(", ");
        }
        $("#mapsSection").scrollIntoView({ behavior: "smooth", block: "start" });
        showToast(`Locating stores with ${match.missing.slice(0, 2).map((m) => ingredientName(m, state.language)).join(", ")}`);
      }
      break;
    }
    case "select-city": {
      if (mapController && lat && lng) {
        mapController.setLocation(parseFloat(lat), parseFloat(lng), name);
        renderStoreCards();
        document.querySelectorAll("#quickCityChips .city-chip").forEach((c) => c.classList.remove("active"));
        actionButton.classList.add("active");
        showToast(`Centered on ${name}`);
      }
      break;
    }
    case "pan-to-store": {
      if (mapController && lat && lng) {
        mapController.map?.setView([parseFloat(lat), parseFloat(lng)], 15);
        $("#storeMap").scrollIntoView({ behavior: "smooth", block: "center" });
      }
      break;
    }
    case "toggle-guide":
      toggleGuidePlayback();
      break;
    case "guide-prev":
      moveGuide(-1);
      break;
    case "guide-next":
      moveGuide(1);
      break;
    case "copy-prompt":
      await copyPrompt();
      break;
    case "fullscreen": {
      const screen = $(".guide-screen");
      if (screen?.requestFullscreen) {
        try {
          await screen.requestFullscreen();
        } catch {
          screen.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      break;
    }
  }
});

// City search in maps
async function handleCitySearch() {
  const query = $("#mapCitySearch")?.value?.trim();
  if (!query) return;
  showToast(`Searching for "${query}"...`);
  if (mapController) {
    const geo = await mapController.geocodeCity(query);
    if (geo) {
      mapController.setLocation(geo.lat, geo.lng, geo.name);
      renderStoreCards();
      showToast(`Found ${geo.name}!`);
    } else {
      showToast(`Could not find "${query}". Trying closest region.`);
    }
  }
}

$("#mapSearchBtn")?.addEventListener("click", handleCitySearch);
$("#mapCitySearch")?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleCitySearch();
  }
});

// GPS Button
$("#mapGpsBtn")?.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showToast("Geolocation is not supported by your browser.");
    return;
  }
  showToast("Fetching your current location...");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      if (mapController) {
        mapController.setLocation(latitude, longitude, "Your Current Location");
        renderStoreCards();
        showToast("📍 Located your position!");
      }
    },
    () => {
      showToast("Could not access location. Please check browser permissions.");
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
});

$("#clearMapNotice")?.addEventListener("click", () => {
  const notice = $("#mapIngredientNotice");
  if (notice) notice.hidden = true;
});

$("#languageSelect").addEventListener("change", (event) => setLanguage(event.target.value));

$("#ingredientSearch").addEventListener("input", (event) => {
  state.ingredientQuery = event.target.value;
  renderPicker();
});

$("#sampleButton").addEventListener("click", loadSamplePantry);
$("#emptySampleButton").addEventListener("click", loadSamplePantry);
$("#clearButton").addEventListener("click", () => {
  state.ingredients = [];
  state.isDemo = false;
  persist();
  render();
  showToast(t("toastCleared"));
});

$("#findRecipesButton").addEventListener("click", () => {
  if (!state.ingredients.length) {
    showToast(t("toastNoResults"));
    return;
  }
  state.view = "explore";
  render();
  $("#recipeHeading").scrollIntoView({ behavior: "smooth", block: "start" });
});

async function syncPreferences() {
  try {
    const response = await fetch(`/api/preferences?deviceId=${encodeURIComponent(getDeviceId())}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ language: state.language, ingredients: state.ingredients }),
    });
    if (!response.ok) throw new Error("Sync failed");
    state.cloudSynced = true;
    $("#syncLabel").textContent = t("syncCloud");
  } catch {
    state.cloudEnabled = false;
    state.cloudSynced = false;
    $("#syncLabel").textContent = t("syncLocal");
    if (!state.syncWarningShown) {
      state.syncWarningShown = true;
      showToast(t("toastSync"));
    }
  }
}

async function initializeCloudSync() {
  try {
    const configResponse = await fetch("/api/config", { cache: "no-store" });
    const config = await configResponse.json();
    if (!configResponse.ok || !config.supabaseEnabled) return;
    state.cloudEnabled = true;

    const response = await fetch(`/api/preferences?deviceId=${encodeURIComponent(getDeviceId())}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load preferences");
    const result = await response.json();
    const preferences = result.preferences;
    if (preferences && LANGUAGES.some(({ code }) => code === preferences.language) && Array.isArray(preferences.ingredients)) {
      state.language = preferences.language;
      state.ingredients = preferences.ingredients
        .filter((item) => typeof item === "string")
        .slice(0, 20);
      state.isDemo = false;
      state.cloudSynced = true;
      persist(false);
      render();
      $("#syncLabel").textContent = t("syncCloud");
    } else {
      await syncPreferences();
    }
  } catch {
    state.cloudEnabled = false;
    state.cloudSynced = false;
    $("#syncLabel").textContent = t("syncLocal");
  }
}

render();
initializeCloudSync();
