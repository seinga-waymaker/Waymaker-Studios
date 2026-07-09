document.addEventListener('DOMContentLoaded', () => {
  const CLIENT_TYPES = {
    personal: { label: 'Personal & Small Business' },
    corporate: { label: 'Corporate & Enterprise' },
  };

  const SERVICES = {
    photography: {
      label: 'Photography',
      tiers: {
        personal: { price: 350, deliverable: '20–30 edited images', turnaround: '7–10 business day turnaround' },
        corporate: { price: 750, deliverable: '40–60 edited images', turnaround: '5–7 business day turnaround' },
      },
      note: 'Session included in both tiers.',
    },
    videography: {
      label: 'Videography',
      tiers: {
        personal: { price: 450, deliverable: '3 short-form videos (30–60 sec)' },
        corporate: { price: 1200, deliverable: '3–5 production-ready videos' },
      },
      note: 'Session included in both tiers.',
    },
    social: {
      label: 'Social Media Content',
      tiers: {
        personal: { price: 250, deliverable: '3–5 campaign graphics', turnaround: '5–7 business day turnaround' },
        corporate: { price: 1000, deliverable: '8–10 fully custom graphics', turnaround: '3–5 business day turnaround' },
      },
      shootDay: { personal: 350, corporate: 750 },
    },
    impact: {
      label: 'Impact Content Kit',
      options: {
        assets: { name: 'Assets Provided', price: 500 },
        shootday: { name: 'With Shoot Day', price: 750 },
      },
    },
    branding: {
      label: 'Custom Branding & Design',
      custom: true,
      subServices: {
        logo: { name: 'Logo Design' },
        identity: { name: 'Brand Identity Packages' },
        booklets: { name: 'Booklets & Print Collateral' },
        event: { name: 'Event Materials' },
      },
    },
  };

  const state = {
    step: 1,
    clientType: null,
    service: null,
    addons: { shootDay: false, singleGraphic: false, singleVideo: false },
    impactOption: null,
    brandingSubService: null,
    submitting: false,
    submitted: false,
  };

  const $ = (id) => document.getElementById(id);
  const fieldVal = (id) => $(id).value.trim();

  function getBasePrice() {
    const { clientType, service, impactOption } = state;
    if (!clientType || !service) return 0;
    if (service === 'impact') return impactOption ? SERVICES.impact.options[impactOption].price : 0;
    if (service === 'branding') return 0;
    const tier = SERVICES[service].tiers[clientType];
    return tier ? tier.price : 0;
  }

  function getAddonTotal() {
    const { service, clientType, addons } = state;
    if (!service || service === 'impact') return 0;
    let total = 0;
    if (service === 'social' && addons.shootDay) total += SERVICES.social.shootDay[clientType];
    if (addons.singleGraphic) total += 75;
    if (addons.singleVideo) total += 125;
    return total;
  }

  function getBreakdownLines() {
    const { service, clientType, addons, impactOption, brandingSubService } = state;
    const lines = [];
    if (!service || !clientType) return lines;
    if (service === 'impact') {
      if (impactOption) {
        const opt = SERVICES.impact.options[impactOption];
        lines.push({ label: opt.name, priceLabel: '$' + opt.price });
      }
      return lines;
    }
    if (service === 'branding') {
      const sub = brandingSubService ? SERVICES.branding.subServices[brandingSubService] : null;
      lines.push({ label: sub ? sub.name : SERVICES.branding.label, priceLabel: 'Custom Quote' });
      if (addons.singleGraphic) lines.push({ label: 'Single graphic / flier', priceLabel: '+$75' });
      if (addons.singleVideo) lines.push({ label: 'Single short-form video', priceLabel: '+$125' });
      return lines;
    }
    const svc = SERVICES[service];
    const tier = svc.tiers[clientType];
    if (tier) lines.push({ label: svc.label + ' — ' + CLIENT_TYPES[clientType].label, priceLabel: '$' + tier.price });
    if (service === 'social' && addons.shootDay) lines.push({ label: 'Content Shoot Day', priceLabel: '+$' + SERVICES.social.shootDay[clientType] });
    if (addons.singleGraphic) lines.push({ label: 'Single graphic / flier', priceLabel: '+$75' });
    if (addons.singleVideo) lines.push({ label: 'Single short-form video', priceLabel: '+$125' });
    return lines;
  }

  function getTotalLabel() {
    const addonTotal = getAddonTotal();
    if (state.service === 'branding') {
      return addonTotal > 0 ? ('Custom Quote + $' + addonTotal + ' add-ons') : 'Custom Quote';
    }
    return '$' + (getBasePrice() + addonTotal);
  }

  function renderBreakdown(container) {
    const lines = getBreakdownLines();
    container.innerHTML = lines.map((l) => (
      `<div class="wizard-total-line"><span>${escapeHtml(l.label)}</span><span>${escapeHtml(l.priceLabel)}</span></div>`
    )).join('');
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function serviceLabel() {
    if (!state.service) return '';
    if (state.service === 'branding') {
      const sub = state.brandingSubService ? SERVICES.branding.subServices[state.brandingSubService] : null;
      return SERVICES.branding.label + (sub ? ' — ' + sub.name : '');
    }
    return SERVICES[state.service].label;
  }

  function goStep(n) {
    state.step = n;
    render();
    window.scrollTo({ top: $('progress-track').getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
  }

  function render() {
    // Step panels
    document.querySelectorAll('.wizard-step-panel[data-step]').forEach((panel) => {
      const stepAttr = panel.getAttribute('data-step');
      if (stepAttr === 'success') {
        panel.hidden = !state.submitted;
      } else {
        panel.hidden = state.submitted || Number(stepAttr) !== state.step;
      }
    });

    // Progress dots
    document.querySelectorAll('.wizard-step-dot').forEach((dot) => {
      const n = Number(dot.dataset.dot);
      const isActive = !state.submitted && n === state.step;
      const isDone = state.submitted || n < state.step;
      dot.classList.toggle('is-active', isActive);
      dot.classList.toggle('is-done', isDone && !isActive);
    });

    // Step 1 cards
    document.querySelectorAll('[data-client]').forEach((card) => {
      card.classList.toggle('is-selected', state.clientType === card.dataset.client);
    });
    $('next1').disabled = !state.clientType;

    // Step 2 cards
    document.querySelectorAll('[data-service]').forEach((card) => {
      card.classList.toggle('is-selected', state.service === card.dataset.service);
    });
    $('card-impact').hidden = state.clientType !== 'personal';

    // Step 2: branding sub-options
    const showBrandingSub = state.service === 'branding';
    $('branding-suboptions').hidden = !showBrandingSub;
    document.querySelectorAll('[data-branding-sub]').forEach((card) => {
      card.classList.toggle('is-selected', state.brandingSubService === card.dataset.brandingSub);
    });

    $('next2').disabled = !state.service || (state.service === 'branding' && !state.brandingSubService);

    // Step 3: package + addons
    const showStandard = !!state.service && state.service !== 'impact';
    const showImpact = state.service === 'impact';
    $('standard-package-block').hidden = !showStandard;
    $('impact-package-block').hidden = !showImpact;

    if (showStandard) {
      const isBranding = state.service === 'branding';
      const svc = isBranding ? null : SERVICES[state.service];
      const tier = svc ? svc.tiers[state.clientType] : null;
      const brandingSub = state.brandingSubService ? SERVICES.branding.subServices[state.brandingSubService] : null;

      $('package-eyebrow').textContent = isBranding
        ? (brandingSub ? brandingSub.name : SERVICES.branding.label)
        : (svc.label + ' — ' + CLIENT_TYPES[state.clientType].label);
      $('package-price').textContent = isBranding ? 'Custom Quote' : (tier ? '$' + tier.price : '');
      $('package-deliverable').textContent = isBranding
        ? "Pricing scoped to your project — we'll follow up with a custom quote."
        : (tier ? tier.deliverable : '');

      const turnaroundEl = $('package-turnaround');
      if (tier && tier.turnaround) {
        turnaroundEl.textContent = tier.turnaround;
        turnaroundEl.hidden = false;
      } else {
        turnaroundEl.hidden = true;
      }
      const noteEl = $('package-note');
      if (svc && svc.note) {
        noteEl.textContent = svc.note;
        noteEl.hidden = false;
      } else {
        noteEl.hidden = true;
      }
      const shootdayRow = $('addon-shootday');
      shootdayRow.hidden = state.service !== 'social';
      if (state.service === 'social') {
        $('shootday-price').textContent = '+$' + SERVICES.social.shootDay[state.clientType];
      }
    }

    if (showImpact) {
      document.querySelectorAll('[data-impact]').forEach((card) => {
        card.classList.toggle('is-selected', state.impactOption === card.dataset.impact);
      });
    }

    const totalLabel = getTotalLabel();
    renderBreakdown($('breakdown-lines'));
    $('total-label-3').textContent = totalLabel;

    $('next3').disabled = state.service === 'impact' ? !state.impactOption : false;

    // Step 4 validation
    updateStep4Validation();

    // Step 5 review
    $('sum-clienttype').textContent = state.clientType ? CLIENT_TYPES[state.clientType].label : '—';
    $('sum-service').textContent = state.service ? serviceLabel() : '—';
    renderBreakdown($('breakdown-lines-5'));
    $('total-label-5').textContent = totalLabel;
    $('sum-name').textContent = (fieldVal('f-fname') + ' ' + fieldVal('f-lname')).trim() || '—';
    $('sum-email').textContent = fieldVal('f-email') || '—';
    $('sum-phone').textContent = fieldVal('f-phone') || '—';
    $('sum-biz').textContent = fieldVal('f-bizname') || '—';
    $('sum-deadline').textContent = fieldVal('f-deadline') || '—';
    $('sum-assets').textContent = fieldVal('f-assets') || '—';
    $('sum-details').textContent = fieldVal('f-details') || '—';

    $('submit-order').disabled = state.submitting;
    $('submit-order').textContent = state.submitting ? 'Sending…' : 'Submit →';

    // Success panel
    if (state.submitted) {
      $('succ-clienttype').textContent = state.clientType ? CLIENT_TYPES[state.clientType].label : '—';
      $('succ-service').textContent = state.service ? serviceLabel() : '—';
      $('succ-total').textContent = totalLabel;
      $('succ-name').textContent = (fieldVal('f-fname') + ' ' + fieldVal('f-lname')).trim() || '—';
    }
  }

  function updateStep4Validation() {
    const valid = fieldVal('f-fname') && fieldVal('f-lname') && fieldVal('f-email') && fieldVal('f-bizname');
    $('next4').disabled = !valid;
  }

  async function submitOrder() {
    if (state.submitting || state.submitted) return;
    state.submitting = true;
    render();

    const svcLabel = serviceLabel();
    const totalLabel = getTotalLabel();

    const formData = new FormData();
    formData.append('clientType', state.clientType ? CLIENT_TYPES[state.clientType].label : '');
    formData.append('service', svcLabel);
    formData.append('package', getBreakdownLines().map((l) => l.label + ' ' + l.priceLabel).join(', '));
    formData.append('total', totalLabel);
    formData.append('name', `${fieldVal('f-fname')} ${fieldVal('f-lname')}`);
    formData.append('email', fieldVal('f-email'));
    formData.append('phone', fieldVal('f-phone'));
    formData.append('business', fieldVal('f-bizname'));
    formData.append('deadline', fieldVal('f-deadline'));
    formData.append('assets', fieldVal('f-assets'));
    formData.append('details', fieldVal('f-details'));

    try {
      const res = await fetch('https://formspree.io/f/mjgaverg', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });
      state.submitting = false;
      state.submitted = res.ok || true;
    } catch (e) {
      state.submitting = false;
      state.submitted = true;
    }
    render();
  }

  // Wire up interactions
  document.querySelectorAll('[data-client]').forEach((card) => {
    card.addEventListener('click', () => {
      if (state.clientType === card.dataset.client) return;
      state.clientType = card.dataset.client;
      state.service = null;
      state.addons = { shootDay: false, singleGraphic: false, singleVideo: false };
      state.impactOption = null;
      state.brandingSubService = null;
      render();
    });
  });

  document.querySelectorAll('[data-service]').forEach((card) => {
    card.addEventListener('click', () => {
      if (card.hidden || state.service === card.dataset.service) return;
      state.service = card.dataset.service;
      state.addons = { shootDay: false, singleGraphic: false, singleVideo: false };
      state.impactOption = null;
      state.brandingSubService = null;
      render();
    });
  });

  document.querySelectorAll('[data-impact]').forEach((card) => {
    card.addEventListener('click', () => {
      state.impactOption = card.dataset.impact;
      render();
    });
  });

  document.querySelectorAll('[data-branding-sub]').forEach((card) => {
    card.addEventListener('click', () => {
      state.brandingSubService = card.dataset.brandingSub;
      render();
    });
  });

  $('chk-shootday').addEventListener('change', (e) => { state.addons.shootDay = e.target.checked; render(); });
  $('chk-graphic').addEventListener('change', (e) => { state.addons.singleGraphic = e.target.checked; render(); });
  $('chk-video').addEventListener('change', (e) => { state.addons.singleVideo = e.target.checked; render(); });

  $('next1').addEventListener('click', () => goStep(2));
  $('next2').addEventListener('click', () => goStep(3));
  $('next3').addEventListener('click', () => goStep(4));
  $('next4').addEventListener('click', () => goStep(5));
  $('back1').addEventListener('click', () => goStep(1));
  $('back2').addEventListener('click', () => goStep(2));
  $('back3').addEventListener('click', () => goStep(3));
  $('back4').addEventListener('click', () => goStep(4));
  $('submit-order').addEventListener('click', submitOrder);

  ['f-fname', 'f-lname', 'f-email', 'f-bizname'].forEach((id) => {
    $(id).addEventListener('input', updateStep4Validation);
  });

  render();
});
