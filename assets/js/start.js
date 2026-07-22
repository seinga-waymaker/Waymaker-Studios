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
      },
      note: '2-hour session included.',
    },
    videography: {
      label: 'Videography',
      tiers: {
        personal: { price: 450, deliverable: '3 short-form videos (30–60 sec)' },
      },
      note: '2-hour session included.',
    },
    social: {
      label: 'Social Media Content',
      tiers: {
        personal: { price: 250, deliverable: '4 campaign graphics', turnaround: '5–7 business day turnaround' },
      },
      shootDay: { personal: 275 },
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

  const TONE_OPTIONS = {
    bold: { name: 'Bold' },
    refined: { name: 'Refined' },
    organic: { name: 'Organic' },
  };

  const state = {
    step: 1,
    clientType: null,
    service: null,
    addons: { shootDay: false, singleGraphic: false, singleVideo: false, photoEditOnly: false, photoCleanup: false },
    extraGraphicsQty: '',
    extraShootHours: '',
    impactOption: null,
    brandingSubService: null,
    brandColors: '', brandFonts: '', assetNeeds: '', tone: null,
    submitting: false,
    submitted: false,
  };

  const $ = (id) => document.getElementById(id);
  const fieldVal = (id) => $(id).value.trim();

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function resetSelections() {
    state.addons = { shootDay: false, singleGraphic: false, singleVideo: false, photoEditOnly: false, photoCleanup: false };
    state.extraGraphicsQty = '';
    state.extraShootHours = '';
    state.impactOption = null;
    state.brandingSubService = null;
  }

  function getBasePrice() {
    const { clientType, service, impactOption } = state;
    if (!clientType || !service) return 0;
    if (service === 'impact') return impactOption ? SERVICES.impact.options[impactOption].price : 0;
    if (service === 'branding') return 0;
    const tier = SERVICES[service].tiers[clientType];
    return tier ? tier.price : 0;
  }

  function getAddonTotal() {
    const { service, clientType, addons, extraGraphicsQty, extraShootHours, impactOption } = state;
    const hours = parseInt(extraShootHours, 10) || 0;
    if (service === 'impact') return impactOption === 'shootday' ? hours * 55 : 0;
    if (!service) return 0;
    let total = 0;
    if (service === 'social') {
      if (addons.shootDay && clientType === 'personal') {
        total += SERVICES.social.shootDay.personal;
        total += hours * 55;
      }
      total += (parseInt(extraGraphicsQty, 10) || 0) * 50;
    }
    if (service === 'photography') {
      if (addons.photoEditOnly) total -= 300;
      if (addons.photoCleanup) total += 100;
      total += hours * 55;
    }
    if (service === 'videography') total += hours * 55;
    if (addons.singleGraphic) total += 75;
    if (addons.singleVideo) total += 125;
    return total;
  }

  function getBreakdownLines() {
    const { service, clientType, addons, impactOption, brandingSubService, extraGraphicsQty, extraShootHours } = state;
    const lines = [];
    if (!service || !clientType) return lines;
    const hours = parseInt(extraShootHours, 10) || 0;

    if (clientType === 'corporate') {
      const label = service === 'branding'
        ? (brandingSubService ? SERVICES.branding.subServices[brandingSubService].name : SERVICES.branding.label)
        : SERVICES[service].label;
      lines.push({ label, priceLabel: 'Custom Quote' });
      return lines;
    }
    if (service === 'impact') {
      if (impactOption) {
        const opt = SERVICES.impact.options[impactOption];
        lines.push({ label: opt.name, priceLabel: '$' + opt.price });
        if (impactOption === 'shootday' && hours > 0) lines.push({ label: 'Additional shoot hour (' + hours + ')', priceLabel: '+$' + (hours * 55) });
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
    if (tier) lines.push({ label: svc.label + ' · ' + CLIENT_TYPES[clientType].label, priceLabel: '$' + tier.price });
    if (service === 'social' && addons.shootDay) {
      lines.push({ label: 'Content Shoot Day', priceLabel: '+$' + SERVICES.social.shootDay[clientType] });
      if (hours > 0) lines.push({ label: 'Additional shoot hour (' + hours + ')', priceLabel: '+$' + (hours * 55) });
    }
    if (service === 'social') {
      const qty = parseInt(extraGraphicsQty, 10) || 0;
      if (qty > 0) lines.push({ label: 'Extra graphic add-on (' + qty + ')', priceLabel: '+$' + (qty * 50) });
    }
    if (service === 'photography' && addons.photoEditOnly) lines.push({ label: 'Photo Editing Only', priceLabel: '-$300' });
    if (service === 'photography' && addons.photoCleanup) lines.push({ label: 'Photo cleanup add-on', priceLabel: '+$100' });
    if ((service === 'photography' || service === 'videography') && hours > 0) lines.push({ label: 'Additional shoot hour (' + hours + ')', priceLabel: '+$' + (hours * 55) });
    if (addons.singleGraphic) lines.push({ label: 'Single graphic / flier', priceLabel: '+$75' });
    if (addons.singleVideo) lines.push({ label: 'Single short-form video', priceLabel: '+$125' });
    return lines;
  }

  function getTotalLabel() {
    const { service, clientType } = state;
    if (clientType === 'corporate') return 'Custom Quote';
    const addonTotal = getAddonTotal();
    if (service === 'branding') {
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

  function serviceLabel() {
    if (!state.service) return '';
    if (state.service === 'branding') {
      const sub = state.brandingSubService ? SERVICES.branding.subServices[state.brandingSubService] : null;
      return SERVICES.branding.label + (sub ? ' · ' + sub.name : '');
    }
    return SERVICES[state.service].label;
  }

  function goStep(n) {
    state.step = n;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function render() {
    // Rail
    document.querySelectorAll('.wizard2-rail-step').forEach((dot) => {
      const n = Number(dot.dataset.dot);
      const isActive = !state.submitted && n === state.step;
      const isDone = state.submitted || n < state.step;
      dot.classList.toggle('is-active', isActive);
      dot.classList.toggle('is-done', isDone && !isActive);
    });

    // Step panels
    document.querySelectorAll('.wizard-step-panel[data-step]').forEach((panel) => {
      const stepAttr = panel.getAttribute('data-step');
      if (stepAttr === 'success') {
        panel.hidden = !state.submitted;
      } else {
        panel.hidden = state.submitted || Number(stepAttr) !== state.step;
      }
    });

    // Step 1
    document.querySelectorAll('[data-client]').forEach((card) => {
      card.classList.toggle('is-selected', state.clientType === card.dataset.client);
    });
    $('corporate-note-1').hidden = state.clientType !== 'corporate';
    $('next1').hidden = state.clientType === 'corporate';
    $('next1').disabled = !state.clientType;

    // Step 2
    document.querySelectorAll('[data-service]').forEach((card) => {
      card.classList.toggle('is-selected', state.service === card.dataset.service);
    });
    $('card-impact').hidden = state.clientType !== 'personal';

    const showBrandingSub = state.service === 'branding';
    $('branding-suboptions').hidden = !showBrandingSub;
    document.querySelectorAll('[data-branding-sub]').forEach((card) => {
      card.classList.toggle('is-selected', state.brandingSubService === card.dataset.brandingSub);
    });
    $('next2').disabled = !state.service || (state.service === 'branding' && !state.brandingSubService);

    // Step 3
    const isCorporate = state.clientType === 'corporate';
    const showStandard = !!state.service && state.service !== 'impact' && !isCorporate;
    const showImpact = state.service === 'impact';

    $('corporate-note-3').hidden = !isCorporate;
    $('standard-package-block').hidden = !showStandard;
    $('impact-package-block').hidden = !showImpact;
    $('running-total-box').hidden = isCorporate;

    if (isCorporate) {
      const brandingSub = state.brandingSubService ? SERVICES.branding.subServices[state.brandingSubService] : null;
      const svcLabelForNote = state.service === 'branding'
        ? (brandingSub ? brandingSub.name : SERVICES.branding.label)
        : (state.service ? SERVICES[state.service].label : '');
      $('corporate-eyebrow-3').textContent = (svcLabelForNote ? svcLabelForNote + ' · ' : '') + 'Corporate & Enterprise';
    }

    if (showStandard) {
      const isBranding = state.service === 'branding';
      const svc = isBranding ? null : SERVICES[state.service];
      const tier = svc ? svc.tiers[state.clientType] : null;
      const brandingSub = state.brandingSubService ? SERVICES.branding.subServices[state.brandingSubService] : null;

      $('package-eyebrow').textContent = isBranding
        ? (brandingSub ? brandingSub.name : SERVICES.branding.label)
        : (svc.label + ' · ' + CLIENT_TYPES[state.clientType].label);
      $('package-price').textContent = isBranding ? 'Custom Quote' : (tier ? '$' + tier.price : '');
      $('package-deliverable').textContent = isBranding
        ? "Pricing scoped to your project — we'll follow up with a custom quote."
        : (tier ? ((svc.note ? svc.note + ' ' : '') + tier.deliverable) : '');

      const turnaroundEl = $('package-turnaround');
      if (tier && tier.turnaround) {
        turnaroundEl.textContent = tier.turnaround;
        turnaroundEl.hidden = false;
      } else {
        turnaroundEl.hidden = true;
      }

      $('addon-shootday').hidden = state.service !== 'social';
      if (state.service === 'social') {
        $('shootday-price').textContent = state.clientType === 'personal' ? ('+$' + SERVICES.social.shootDay.personal) : '';
      }
      $('shootday-subrow').hidden = !(state.service === 'social' && state.addons.shootDay);

      $('addon-singlegraphic').hidden = state.service === 'social';

      $('addon-photo-editonly').hidden = state.service !== 'photography';
      $('addon-photo-cleanup').hidden = state.service !== 'photography';
      $('addon-photo-hours').hidden = state.service !== 'photography';

      $('addon-video-hours').hidden = state.service !== 'videography';

      $('addon-extra-graphics').hidden = state.service !== 'social';
    }

    if (showImpact) {
      document.querySelectorAll('[data-impact]').forEach((card) => {
        card.classList.toggle('is-selected', state.impactOption === card.dataset.impact);
      });
      $('addon-impact-hours').hidden = state.impactOption !== 'shootday';
    }

    // Checkbox sync
    $('chk-shootday').checked = state.addons.shootDay;
    $('chk-graphic').checked = state.addons.singleGraphic;
    $('chk-video').checked = state.addons.singleVideo;
    $('chk-photo-editonly').checked = state.addons.photoEditOnly;
    $('chk-photo-cleanup').checked = state.addons.photoCleanup;
    $('chk-shootday-brief').checked = state.addons.shootDay;

    // Extra hours / graphics inputs (shared state, only one visible at a time)
    ['eh-social', 'eh-photo', 'eh-video', 'eh-impact'].forEach((id) => {
      const el = $(id);
      if (document.activeElement !== el) el.value = state.extraShootHours;
    });
    if (document.activeElement !== $('eg-qty')) $('eg-qty').value = state.extraGraphicsQty;

    // Tone cards
    document.querySelectorAll('[data-tone]').forEach((card) => {
      card.classList.toggle('is-selected', state.tone === card.dataset.tone);
    });

    const totalLabel = getTotalLabel();
    renderBreakdown($('breakdown-lines'));
    $('total-label-3').textContent = totalLabel;
    $('next3').disabled = state.service === 'impact' ? !state.impactOption : false;

    // Step 4
    $('social-brief').hidden = state.service !== 'social';
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

    $('social-brief-review').hidden = state.service !== 'social';
    if (state.service === 'social') {
      $('sum-brandcolors').textContent = fieldVal('f-brandcolors') || '—';
      $('sum-brandfonts').textContent = fieldVal('f-brandfonts') || '—';
      $('sum-assetneeds').textContent = fieldVal('f-assetneeds') || '—';
      $('sum-tone').textContent = state.tone ? TONE_OPTIONS[state.tone].name : '—';
    }

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
    formData.append('brandColors', fieldVal('f-brandcolors'));
    formData.append('brandFonts', fieldVal('f-brandfonts'));
    formData.append('assetNeeds', fieldVal('f-assetneeds'));
    formData.append('tone', state.tone ? TONE_OPTIONS[state.tone].name : '');
    formData.append('extraGraphics', state.extraGraphicsQty || '0');
    formData.append('extraShootHours', state.extraShootHours || '0');

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
      resetSelections();
      render();
    });
  });

  document.querySelectorAll('[data-service]').forEach((card) => {
    card.addEventListener('click', () => {
      if (card.hidden || state.service === card.dataset.service) return;
      state.service = card.dataset.service;
      resetSelections();
      render();
    });
  });

  document.querySelectorAll('[data-impact]').forEach((card) => {
    card.addEventListener('click', () => {
      state.impactOption = card.dataset.impact;
      state.extraShootHours = '';
      render();
    });
  });

  document.querySelectorAll('[data-branding-sub]').forEach((card) => {
    card.addEventListener('click', () => {
      state.brandingSubService = card.dataset.brandingSub;
      render();
    });
  });

  document.querySelectorAll('[data-tone]').forEach((card) => {
    card.addEventListener('click', () => {
      state.tone = card.dataset.tone;
      render();
    });
  });

  function bindAddonToggle(id, key) {
    $(id).addEventListener('change', (e) => { state.addons[key] = e.target.checked; render(); });
  }
  bindAddonToggle('chk-shootday', 'shootDay');
  bindAddonToggle('chk-graphic', 'singleGraphic');
  bindAddonToggle('chk-video', 'singleVideo');
  bindAddonToggle('chk-photo-editonly', 'photoEditOnly');
  bindAddonToggle('chk-photo-cleanup', 'photoCleanup');
  bindAddonToggle('chk-shootday-brief', 'shootDay');

  ['eh-social', 'eh-photo', 'eh-video', 'eh-impact'].forEach((id) => {
    $(id).addEventListener('input', (e) => { state.extraShootHours = e.target.value; render(); });
  });
  $('eg-qty').addEventListener('input', (e) => { state.extraGraphicsQty = e.target.value; render(); });

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
