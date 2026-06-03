import { supabase } from './supabase.js';

const TABLE = 'newsletter_subscribers';

export function initNewsletter() {
  const toggleBtn = document.getElementById('nlToggle');
  const formWrap  = document.getElementById('nlFormWrap');
  const form      = document.getElementById('nlFormEl');
  const emailInput = document.getElementById('nlEmail');
  const msgEl     = document.getElementById('nlMsg');

  if (!toggleBtn || !form) return;

  toggleBtn.addEventListener('click', () => {
    const isHidden = formWrap.style.display === 'none';
    formWrap.style.display = isHidden ? 'block' : 'none';
    if (isHidden) emailInput?.focus();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email     = emailInput.value.trim().toLowerCase();
    const submitBtn = form.querySelector('button[type="submit"]');

    submitBtn.textContent = 'Inscription…';
    submitBtn.disabled    = true;
    msgEl.style.display   = 'none';

    const { error } = await supabase
      .from(TABLE)
      .insert([{ email }]);

    submitBtn.textContent = 'S\'inscrire →';
    submitBtn.disabled    = false;

    if (error) {
      if (error.code === '23505') {
        showNlMsg(msgEl, 'Cette adresse est déjà inscrite ✓', 'var(--gold)');
      } else {
        showNlMsg(msgEl, 'Une erreur est survenue. Réessayez.', 'var(--red)');
      }
      return;
    }

    showNlMsg(msgEl, 'Merci ! Vous êtes inscrit(e) à notre newsletter ✓', '#2d6a4f');
    form.reset();
    setTimeout(() => {
      formWrap.style.display = 'none';
      msgEl.style.display    = 'none';
    }, 3500);
  });
}

function showNlMsg(el, text, color) {
  el.textContent    = text;
  el.style.color    = color;
  el.style.display  = 'block';
}
