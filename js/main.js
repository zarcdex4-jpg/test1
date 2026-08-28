/**
 * Baitul Jannah Jame Masjid Cheektowaga Islamic Center - Main Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initPrayerTimes();
  initAnnouncementsFilter();
  initZakatCalculator();
  initDonationPicker();
  initMobileMenu();
  initModals();
  initCopyToClipboard();
});

// Daily Prayer Schedule Baseline (Cheektowaga, NY approximate timings)
const PRAYER_SCHEDULE = [
  { id: 'fajr', name: 'Fajr', arabic: 'الفجر', adhan: '04:45 AM', iqamah: '05:15 AM', minutesFromMidnight: 285 },
  { id: 'dhuhr', name: 'Dhuhr', arabic: 'الظهر', adhan: '01:15 PM', iqamah: '01:30 PM', minutesFromMidnight: 795 },
  { id: 'asr', name: 'Asr', arabic: 'العصر', adhan: '05:10 PM', iqamah: '05:30 PM', minutesFromMidnight: 1030 },
  { id: 'maghrib', name: 'Maghrib', arabic: 'المغرب', adhan: '08:15 PM', iqamah: '08:20 PM', minutesFromMidnight: 1215 },
  { id: 'isha', name: 'Isha', arabic: 'العشاء', adhan: '09:45 PM', iqamah: '10:00 PM', minutesFromMidnight: 1185 }
];

function initPrayerTimes() {
  updatePrayerStatus();
  // Refresh status & countdown every second
  setInterval(updatePrayerStatus, 1000);
}

function updatePrayerStatus() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = now.getSeconds();

  let activeIndex = -1;
  let nextPrayer = PRAYER_SCHEDULE[0];
  let targetMinutes = nextPrayer.minutesFromMidnight;

  for (let i = 0; i < PRAYER_SCHEDULE.length; i++) {
    const p = PRAYER_SCHEDULE[i];
    const nextP = PRAYER_SCHEDULE[(i + 1) % PRAYER_SCHEDULE.length];
    
    if (currentMinutes >= p.minutesFromMidnight && (i === PRAYER_SCHEDULE.length - 1 || currentMinutes < nextP.minutesFromMidnight)) {
      activeIndex = i;
      nextPrayer = nextP;
      targetMinutes = nextP.minutesFromMidnight;
      if (i === PRAYER_SCHEDULE.length - 1) {
        // Next prayer is tomorrow's Fajr
        targetMinutes += 24 * 60;
      }
      break;
    }
  }

  if (activeIndex === -1) {
    // Before Fajr today
    nextPrayer = PRAYER_SCHEDULE[0];
    targetMinutes = nextPrayer.minutesFromMidnight;
  }

  // Update Prayer Cards UI
  PRAYER_SCHEDULE.forEach((p, idx) => {
    const card = document.getElementById(`card-${p.id}`);
    if (card) {
      if (idx === activeIndex) {
        card.classList.add('active-prayer');
        if (!card.querySelector('.active-badge')) {
          const badge = document.createElement('div');
          badge.className = 'active-badge';
          badge.textContent = 'Current';
          card.appendChild(badge);
        }
      } else {
        card.classList.remove('active-prayer');
        const badge = card.querySelector('.active-badge');
        if (badge) badge.remove();
      }
    }
  });

  // Update Hero Widget
  const heroPrayerName = document.getElementById('hero-next-prayer-name');
  const heroPrayerTime = document.getElementById('hero-next-prayer-time');
  
  if (heroPrayerName && heroPrayerTime) {
    heroPrayerName.textContent = nextPrayer.name;
    heroPrayerTime.textContent = `Iqamah: ${nextPrayer.iqamah}`;
  }

  // Calculate Countdown
  let totalTargetSeconds = targetMinutes * 60;
  let totalCurrentSeconds = currentMinutes * 60 + currentSeconds;
  let diffSeconds = totalTargetSeconds - totalCurrentSeconds;

  if (diffSeconds < 0) diffSeconds += 24 * 3600;

  const hours = Math.floor(diffSeconds / 3600);
  const mins = Math.floor((diffSeconds % 3600) / 60);
  const secs = diffSeconds % 60;

  const cdHours = document.getElementById('cd-hours');
  const cdMins = document.getElementById('cd-mins');
  const cdSecs = document.getElementById('cd-secs');

  if (cdHours && cdMins && cdSecs) {
    cdHours.textContent = String(hours).padStart(2, '0');
    cdMins.textContent = String(mins).padStart(2, '0');
    cdSecs.textContent = String(secs).padStart(2, '0');
  }
}

// Announcements Filter Logic
function initAnnouncementsFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const announcementCards = document.querySelectorAll('.announcement-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      announcementCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// Zakat Calculator Logic
function initZakatCalculator() {
  const cashInput = document.getElementById('zakat-cash');
  const goldInput = document.getElementById('zakat-gold');
  const investInput = document.getElementById('zakat-invest');
  const calcBtn = document.getElementById('btn-calc-zakat');
  const resultDisplay = document.getElementById('zakat-result');

  if (calcBtn && resultDisplay) {
    calcBtn.addEventListener('click', () => {
      const cash = parseFloat(cashInput?.value || 0);
      const gold = parseFloat(goldInput?.value || 0);
      const invest = parseFloat(investInput?.value || 0);

      const totalWealth = cash + gold + invest;
      const zakatDue = totalWealth * 0.025; // 2.5%

      resultDisplay.innerHTML = `
        <div style="text-align: center; margin-top: 1rem;">
          <p style="font-size: 0.9rem; color: var(--text-muted);">Total Wealth Assessed: <strong>$${totalWealth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></p>
          <p style="font-size: 1.2rem; color: var(--primary-emerald); font-weight: 700; margin-top: 0.3rem;">Estimated Zakat Payable (2.5%): <span style="color: var(--accent-gold-dark); font-size: 1.5rem;">$${zakatDue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></p>
        </div>
      `;
    });
  }
}

// Donation Selector
function initDonationPicker() {
  const amountBtns = document.querySelectorAll('.amount-btn');
  const customInput = document.getElementById('custom-donation');
  const donateSubmitBtn = document.getElementById('submit-donation');

  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (customInput) {
        customInput.value = btn.dataset.amount;
      }
    });
  });

  if (donateSubmitBtn) {
    donateSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const amount = customInput?.value || '50';
      showToast(`JazakAllah Khair! Thank you for your generous contribution of $${amount}. May Allah bless you.`);
    });
  }
}

// Mobile Drawer Menu
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Close menu when link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }
}

// Modal View System
function initModals() {
  const openScheduleModalBtn = document.getElementById('open-monthly-schedule');
  const modalOverlay = document.getElementById('schedule-modal');
  const closeBtn = document.getElementById('close-modal-btn');

  if (openScheduleModalBtn && modalOverlay && closeBtn) {
    openScheduleModalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modalOverlay.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }
}

// Copy to Clipboard Utility
function initCopyToClipboard() {
  const copyElements = document.querySelectorAll('[data-copy]');
  copyElements.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = el.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied to clipboard: "${textToCopy}"`);
        }).catch(() => {
          showToast(`Address: ${textToCopy}`);
        });
      }
    });
  });
}

// Toast Helper
function showToast(message) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
