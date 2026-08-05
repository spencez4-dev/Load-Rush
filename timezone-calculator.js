'use strict';

(() => {
  const API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
  const RECENTS_KEY = 'loadRushTimezoneRecentV1';
  const MAX_RECENTS = 5;

  const escapeHtml = value =>
    String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));

  function getRecents() {
    try {
      const parsed = JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENTS) : [];
    } catch {
      return [];
    }
  }

  function saveRecent(place) {
    const current = getRecents().filter(item =>
      !(item.name === place.name &&
        item.country === place.country &&
        item.timezone === place.timezone)
    );

    current.unshift({
      name: place.name,
      admin1: place.admin1 || '',
      country: place.country || '',
      timezone: place.timezone
    });

    localStorage.setItem(RECENTS_KEY, JSON.stringify(current.slice(0, MAX_RECENTS)));
  }

  function utcOffsetMinutes(timeZone, date = new Date()) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    });

    const parts = Object.fromEntries(
      formatter.formatToParts(date)
        .filter(part => part.type !== 'literal')
        .map(part => [part.type, part.value])
    );

    const representedAsUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );

    return Math.round((representedAsUtc - date.getTime()) / 60000);
  }

  function formatOffset(minutes) {
    const sign = minutes >= 0 ? '+' : '−';
    const absolute = Math.abs(minutes);
    const hours = Math.floor(absolute / 60);
    const mins = absolute % 60;
    return `UTC${sign}${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  function differenceCopy(targetMinutes, localMinutes) {
    const difference = targetMinutes - localMinutes;
    if (difference === 0) return 'Same time as you';

    const absolute = Math.abs(difference);
    const hours = Math.floor(absolute / 60);
    const minutes = absolute % 60;
    const amount = [
      hours ? `${hours} hr${hours === 1 ? '' : 's'}` : '',
      minutes ? `${minutes} min` : ''
    ].filter(Boolean).join(' ');

    return `${amount} ${difference > 0 ? 'ahead of you' : 'behind you'}`;
  }

  function injectStyles() {
    if (document.getElementById('timezoneTabStyles')) return;

    const style = document.createElement('style');
    style.id = 'timezoneTabStyles';
    style.textContent = `
      .timezone-nav-button {
        border: 1px solid var(--border, rgba(116, 88, 255, .22));
        background: var(--glass, rgba(255,255,255,.72));
        color: inherit;
        min-height: 42px;
        padding: 0 14px;
        border-radius: 14px;
        font: inherit;
        font-weight: 800;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(48, 36, 90, .08);
        transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
      }

      .timezone-nav-button:hover {
        transform: translateY(-1px);
        border-color: rgba(116, 88, 255, .5);
        box-shadow: 0 12px 28px rgba(48, 36, 90, .13);
      }

      .timezone-nav-button.active {
        color: white;
        background: linear-gradient(135deg, #7458ff, #9a7cff);
        border-color: transparent;
      }

      .timezone-page {
        display: none;
        animation: timezoneFade .22s ease;
      }

      .timezone-page.active {
        display: block;
      }

      .timezone-hidden {
        display: none !important;
      }

      .timezone-shell {
        margin-top: 22px;
        padding: clamp(20px, 4vw, 36px);
        overflow: hidden;
        position: relative;
      }

      .timezone-shell::before {
        content: '';
        position: absolute;
        width: 290px;
        height: 290px;
        right: -120px;
        top: -130px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(116,88,255,.25), transparent 70%);
        pointer-events: none;
      }

      .timezone-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 26px;
        position: relative;
        z-index: 1;
      }

      .timezone-header h2 {
        font-size: clamp(2rem, 6vw, 4.5rem);
        line-height: .95;
        margin: 5px 0 10px;
        letter-spacing: -.06em;
      }

      .timezone-header p {
        margin: 0;
        max-width: 620px;
        color: var(--muted, #6b6480);
        line-height: 1.6;
      }

      .timezone-back-button {
        flex: 0 0 auto;
      }

      .timezone-search {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 12px;
        position: relative;
        z-index: 1;
      }

      .timezone-search input {
        width: 100%;
        min-height: 56px;
        border: 1px solid var(--border, rgba(116, 88, 255, .22));
        border-radius: 16px;
        background: var(--input, rgba(255,255,255,.75));
        color: inherit;
        padding: 0 18px;
        font: inherit;
        font-size: 1rem;
        outline: none;
      }

      .timezone-search input:focus {
        border-color: #7458ff;
        box-shadow: 0 0 0 4px rgba(116,88,255,.13);
      }

      .timezone-search button {
        min-width: 124px;
      }

      .timezone-status {
        min-height: 24px;
        margin: 12px 2px 0;
        color: var(--muted, #6b6480);
        position: relative;
        z-index: 1;
      }

      .timezone-status.error {
        color: #dc2626;
      }

      .timezone-results {
        display: grid;
        grid-template-columns: minmax(0, 1.5fr) minmax(260px, .7fr);
        gap: 18px;
        margin-top: 22px;
        position: relative;
        z-index: 1;
      }

      .timezone-clock-card,
      .timezone-detail-card,
      .timezone-recents {
        border: 1px solid var(--border, rgba(116, 88, 255, .18));
        background: rgba(255,255,255,.38);
        border-radius: 22px;
      }

      body.dark .timezone-clock-card,
      body.dark .timezone-detail-card,
      body.dark .timezone-recents {
        background: rgba(17, 18, 30, .42);
      }

      .timezone-clock-card {
        padding: clamp(22px, 5vw, 42px);
      }

      .timezone-location {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 18px;
      }

      .timezone-location-icon {
        width: 48px;
        height: 48px;
        border-radius: 15px;
        display: grid;
        place-items: center;
        font-size: 1.35rem;
        background: linear-gradient(135deg, rgba(116,88,255,.16), rgba(116,88,255,.05));
      }

      .timezone-location strong {
        display: block;
        font-size: 1.15rem;
      }

      .timezone-location span {
        display: block;
        margin-top: 3px;
        color: var(--muted, #6b6480);
      }

      .timezone-live-time {
        font-size: clamp(3rem, 11vw, 7rem);
        font-weight: 950;
        line-height: .95;
        letter-spacing: -.07em;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }

      .timezone-live-date {
        margin-top: 13px;
        color: var(--muted, #6b6480);
        font-weight: 700;
      }

      .timezone-detail-card {
        padding: 22px;
        display: grid;
        gap: 12px;
        align-content: start;
      }

      .timezone-detail {
        padding: 15px;
        border-radius: 16px;
        background: rgba(116,88,255,.075);
      }

      .timezone-detail span {
        display: block;
        color: var(--muted, #6b6480);
        font-size: .78rem;
        font-weight: 850;
        letter-spacing: .08em;
        text-transform: uppercase;
        margin-bottom: 6px;
      }

      .timezone-detail strong {
        display: block;
        overflow-wrap: anywhere;
      }

      .timezone-detail small {
        display: block;
        margin-top: 7px;
        color: var(--muted, #6b6480);
        line-height: 1.4;
      }

      .timezone-detention {
        background: linear-gradient(135deg, rgba(116,88,255,.18), rgba(116,88,255,.07));
        border: 1px solid rgba(116,88,255,.24);
      }

      .timezone-detention strong {
        font-size: clamp(1.65rem, 4vw, 2.35rem);
        letter-spacing: -.035em;
        color: #7458ff;
      }

      body.dark .timezone-detention strong,
      [data-theme="dark"] .timezone-detention strong {
        color: #b7a8ff;
      }

      .timezone-detention-button {
        width: 100%;
        color: inherit;
        text-align: left;
        font: inherit;
        cursor: pointer;
      }

      .timezone-detention-button:hover {
        border-color: rgba(116,88,255,.55);
        transform: translateY(-1px);
      }

      .timezone-custom-detention {
        display: grid;
        gap: 10px;
      }

      .timezone-arrival-row {
        display: grid;
        grid-template-columns: minmax(0,1fr) auto;
        gap: 9px;
      }

      .timezone-arrival-row input {
        min-width: 0;
        min-height: 44px;
        border: 1px solid var(--border, rgba(116,88,255,.22));
        border-radius: 12px;
        background: var(--input, rgba(255,255,255,.7));
        color: inherit;
        padding: 0 12px;
        font: inherit;
        font-weight: 800;
      }

      .timezone-arrival-row button {
        min-height: 44px;
        padding: 0 13px;
        white-space: nowrap;
      }

      .timezone-custom-result {
        font-size: 1.55rem;
        color: #7458ff;
        letter-spacing: -.025em;
      }

      .timezone-recents {
        margin-top: 18px;
        padding: 20px;
        position: relative;
        z-index: 1;
      }

      .timezone-recents-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
      }

      .timezone-recents-list {
        display: flex;
        flex-wrap: wrap;
        gap: 9px;
      }

      .timezone-recent-chip {
        border: 1px solid var(--border, rgba(116,88,255,.2));
        background: transparent;
        color: inherit;
        border-radius: 999px;
        padding: 9px 12px;
        font: inherit;
        font-weight: 750;
        cursor: pointer;
      }

      .timezone-recent-chip:hover {
        border-color: #7458ff;
        background: rgba(116,88,255,.08);
      }

      .timezone-empty {
        padding: 44px 18px;
        text-align: center;
        color: var(--muted, #6b6480);
        border: 1px dashed var(--border, rgba(116,88,255,.24));
        border-radius: 22px;
        margin-top: 22px;
        position: relative;
        z-index: 1;
      }

      @keyframes timezoneFade {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 760px) {
        .timezone-nav-button span:last-child {
          display: none;
        }

        .timezone-search {
          grid-template-columns: 1fr;
        }

        .timezone-results {
          grid-template-columns: 1fr;
        }

        .timezone-live-time {
          white-space: normal;
        }

        .timezone-header {
          display: block;
        }

        .timezone-arrival-row {
          grid-template-columns: 1fr;
        }

        .timezone-back-button {
          margin-top: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createPage() {
    const app = document.querySelector('main.app');
    const topActions = document.querySelector('.top-actions');
    if (!app || !topActions || document.getElementById('timezonePage')) return null;

    const navButton = document.createElement('button');
    navButton.id = 'timezoneNavBtn';
    navButton.className = 'timezone-nav-button';
    navButton.type = 'button';
    navButton.innerHTML = '<span aria-hidden="true">🌎</span><span>Time Zone Calculator</span>';
    navButton.setAttribute('aria-controls', 'timezonePage');
    navButton.setAttribute('aria-expanded', 'false');
    topActions.insertBefore(navButton, topActions.firstChild);

    const page = document.createElement('section');
    page.id = 'timezonePage';
    page.className = 'timezone-page';
    page.innerHTML = `
      <div class="timezone-shell glass">
        <div class="timezone-header">
          <div>
            <span class="section-kicker">GLOBAL DISPATCH</span>
            <h2>Time Zone Calculator</h2>
            <p>Search any U.S. city to see its live local time, time zone, and detention check-call time.</p>
          </div>
          <button id="timezoneBackBtn" class="secondary-button timezone-back-button" type="button">← Load Rush</button>
        </div>

        <form id="timezoneSearchForm" class="timezone-search">
          <label class="sr-only" for="timezoneCityInput">Search for a city</label>
          <input id="timezoneCityInput" type="search" placeholder="Try Miami, Phoenix, or Denver…" autocomplete="off" required>
          <button id="timezoneSearchBtn" class="primary-button" type="submit">Check Time</button>
        </form>

        <div id="timezoneStatus" class="timezone-status" aria-live="polite"></div>
        <div id="timezoneContent">
          <div class="timezone-empty">
            <div style="font-size:2rem;margin-bottom:8px">🛰️</div>
            Enter a U.S. city and we’ll locate the clock.
          </div>
        </div>

        <section id="timezoneRecents" class="timezone-recents" hidden>
          <div class="timezone-recents-header">
            <strong>Recent cities</strong>
            <button id="timezoneClearRecents" class="secondary-button" type="button">Clear</button>
          </div>
          <div id="timezoneRecentsList" class="timezone-recents-list"></div>
        </section>
      </div>
    `;
    app.appendChild(page);

    return { app, topActions, navButton, page };
  }

  function init() {
    injectStyles();
    const created = createPage();
    if (!created) return;

    const { app, navButton, page } = created;
    const normalSections = [...app.children].filter(child =>
      child !== page && !child.classList.contains('topbar')
    );

    const searchForm = document.getElementById('timezoneSearchForm');
    const cityInput = document.getElementById('timezoneCityInput');
    const searchButton = document.getElementById('timezoneSearchBtn');
    const status = document.getElementById('timezoneStatus');
    const content = document.getElementById('timezoneContent');
    const backButton = document.getElementById('timezoneBackBtn');
    const recentsSection = document.getElementById('timezoneRecents');
    const recentsList = document.getElementById('timezoneRecentsList');
    const clearRecents = document.getElementById('timezoneClearRecents');

    let activePlace = null;
    let clockTimer = null;
    let arrivalTimeValue = '';
    let customDetentionValue = '';

    function showTimezone() {
      normalSections.forEach(section => section.classList.add('timezone-hidden'));
      page.classList.add('active');
      navButton.classList.add('active');
      navButton.setAttribute('aria-expanded', 'true');
      document.body.dataset.loadRushView = 'timezone';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => cityInput.focus(), 150);
    }

    function showLoadRush() {
      normalSections.forEach(section => section.classList.remove('timezone-hidden'));
      page.classList.remove('active');
      navButton.classList.remove('active');
      navButton.setAttribute('aria-expanded', 'false');
      document.body.dataset.loadRushView = 'dashboard';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function renderRecents() {
      const recents = getRecents();
      recentsSection.hidden = recents.length === 0;
      recentsList.innerHTML = recents.map((place, index) => `
        <button class="timezone-recent-chip" type="button" data-index="${index}">
          ${escapeHtml(place.name)}${place.country ? `, ${escapeHtml(place.country)}` : ''}
        </button>
      `).join('');

      recentsList.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
          const place = getRecents()[Number(button.dataset.index)];
          if (!place) return;
          activePlace = place;
          renderPlace();
          cityInput.value = place.name;
          status.textContent = '';
        });
      });
    }

    function renderPlace() {
      if (!activePlace) return;
      const now = new Date();
      const targetOffset = utcOffsetMinutes(activePlace.timezone, now);
      const localOffset = -now.getTimezoneOffset();

      const time = new Intl.DateTimeFormat('en-US', {
        timeZone: activePlace.timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(now);

      const date = new Intl.DateTimeFormat('en-US', {
        timeZone: activePlace.timezone,
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }).format(now);

      const detentionCheckAt = new Date(now.getTime() + 90 * 60 * 1000);
      const detentionTime = new Intl.DateTimeFormat('en-US', {
        timeZone: activePlace.timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(detentionCheckAt);

      const normalizeMilitaryTime = value => String(value || '').replace(/\D/g, '').slice(0, 4);
      const isValidMilitaryTime = value => {
        if (!/^\d{4}$/.test(value)) return false;
        const hours = Number(value.slice(0, 2));
        const minutes = Number(value.slice(2));
        return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
      };
      const addDetentionWindow = value => {
        if (!isValidMilitaryTime(value)) return '';
        const hours = Number(value.slice(0, 2));
        const minutes = Number(value.slice(2));
        const totalMinutes = (hours * 60 + minutes + 90) % 1440;
        return `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}${String(totalMinutes % 60).padStart(2, '0')}`;
      };

      const placeLine = [activePlace.admin1, activePlace.country].filter(Boolean).join(', ');

      content.innerHTML = `
        <div class="timezone-results">
          <article class="timezone-clock-card">
            <div class="timezone-location">
              <div class="timezone-location-icon">📍</div>
              <div>
                <strong>${escapeHtml(activePlace.name)}</strong>
                <span>${escapeHtml(placeLine || activePlace.timezone)}</span>
              </div>
            </div>
            <div class="timezone-live-time">${escapeHtml(time)}</div>
            <div class="timezone-live-date">${escapeHtml(date)}</div>
          </article>

          <aside class="timezone-detail-card">
            <button id="timezoneLiveDetention" class="timezone-detail timezone-detention timezone-detention-button" type="button">
              <span>Approaching Detention Check Call</span>
              <strong>${escapeHtml(detentionTime)}</strong>
              <small>Current local time + 1 hour 30 minutes · Tap to use an arrival time</small>
            </button>
            <div class="timezone-detail timezone-custom-detention">
              <span>Calculate from driver arrival</span>
              <div class="timezone-arrival-row">
                <input id="timezoneArrivalTime" type="text" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" placeholder="1030" aria-label="Driver arrival time in 24-hour military format" value="${escapeHtml(arrivalTimeValue)}">
                <button id="timezoneArrivalCalculate" class="primary-button" type="button">Add 0130</button>
              </div>
              <strong id="timezoneCustomResult" class="timezone-custom-result">${customDetentionValue ? escapeHtml(customDetentionValue) : 'Enter 4-digit time'}</strong>
              <small>Enter four digits in 24-hour time, such as 1030 or 2215.</small>
            </div>
            <div class="timezone-detail">
              <span>Time zone</span>
              <strong>${escapeHtml(activePlace.timezone)}</strong>
            </div>
            <div class="timezone-detail">
              <span>UTC offset</span>
              <strong>${formatOffset(targetOffset)}</strong>
            </div>
          </aside>
        </div>
      `;

      const arrivalInput = document.getElementById('timezoneArrivalTime');
      const calculateButton = document.getElementById('timezoneArrivalCalculate');
      const liveDetentionButton = document.getElementById('timezoneLiveDetention');

      const calculateArrival = () => {
        const value = normalizeMilitaryTime(arrivalInput?.value);
        arrivalTimeValue = value;
        if (arrivalInput) arrivalInput.value = value;
        const result = document.getElementById('timezoneCustomResult');
        if (!isValidMilitaryTime(value)) {
          customDetentionValue = '';
          if (result) result.textContent = value.length === 4 ? 'Invalid time' : 'Enter 4-digit time';
          return;
        }
        customDetentionValue = addDetentionWindow(value);
        if (result) result.textContent = customDetentionValue;
      };

      arrivalInput?.addEventListener('input', () => {
        arrivalInput.value = normalizeMilitaryTime(arrivalInput.value);
        calculateArrival();
      });
      arrivalInput?.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
          event.preventDefault();
          calculateArrival();
        }
      });
      calculateButton?.addEventListener('click', calculateArrival);
      liveDetentionButton?.addEventListener('click', () => arrivalInput?.focus());
    }

    async function findCity(query) {
      const url = new URL(API_URL);
      url.searchParams.set('name', query);
      url.searchParams.set('count', '10');
      url.searchParams.set('countryCode', 'US');
      url.searchParams.set('language', 'en');
      url.searchParams.set('format', 'json');

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`Search failed (${response.status})`);

      const data = await response.json();
      const result = data.results?.find(item => item.country_code === 'US' && item.timezone);
      if (!result?.timezone) throw new Error('No matching U.S. city found. Try adding the state.');

      return {
        name: result.name,
        admin1: result.admin1 || '',
        country: result.country || '',
        timezone: result.timezone
      };
    }

    searchForm.addEventListener('submit', async event => {
      event.preventDefault();
      const query = cityInput.value.trim();
      if (!query) return;

      searchButton.disabled = true;
      searchButton.textContent = 'Searching…';
      status.classList.remove('error');
      status.textContent = `Locating ${query}…`;

      try {
        activePlace = await findCity(query);
        saveRecent(activePlace);
        renderPlace();
        renderRecents();
        status.textContent = `Live time loaded for ${activePlace.name}.`;
      } catch (error) {
        console.error(error);
        activePlace = null;
        content.innerHTML = `
          <div class="timezone-empty">
            <div style="font-size:2rem;margin-bottom:8px">🗺️</div>
            We couldn’t find that U.S. city. Try adding the state abbreviation.
          </div>
        `;
        status.classList.add('error');
        status.textContent = error.message || 'Could not load that city.';
      } finally {
        searchButton.disabled = false;
        searchButton.textContent = 'Check Time';
      }
    });

    navButton.addEventListener('click', () => {
      if (page.classList.contains('active')) showLoadRush();
      else showTimezone();
    });

    backButton.addEventListener('click', showLoadRush);

    clearRecents.addEventListener('click', () => {
      localStorage.removeItem(RECENTS_KEY);
      renderRecents();
    });

    renderRecents();
    clockTimer = window.setInterval(() => {
      if (activePlace && page.classList.contains('active')) renderPlace();
    }, 1000);

    window.addEventListener('beforeunload', () => {
      if (clockTimer) window.clearInterval(clockTimer);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
