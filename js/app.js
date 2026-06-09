// ===================== CONFIG =====================
const API = 'http://localhost:3000/api';

// ===================== STATE =====================
let state = {
  currentPage:      'home',
  isLoggedIn:       false,
  userType:         null,   // 'cliente' | 'profissional'
  currentUser:      null,
  selectedProfId:   null,
  selectedServiceId: null,
  appointments:     [],
  bookingStep:      1,
  bookingData:      {},
  // cache de dados da API
  professionals:    [],
  services:         [],
};

// ===================== API HELPER =====================
async function api(path, options = {}) {
  const token = localStorage.getItem('mhh_token');
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw { status: res.status, message: data.error || 'Erro desconhecido' };
  return data;
}

// ===================== ROUTER =====================
function navigate(page, params = {}) {
  state.currentPage = page;
  Object.assign(state, params);

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${page}`);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  renderPage(page);
}

function renderPage(page) {
  switch (page) {
    case 'home':         renderHome();         break;
    case 'professionals': renderProfessionals(); break;
    case 'services':     renderServices();      break;
    case 'prof-detail':  renderProfDetail();    break;
    case 'schedule':     renderSchedule();      break;
    case 'appointments': renderAppointments();  break;
    case 'dashboard':    renderDashboard();     break;
    case 'login':        renderLogin();         break;
    case 'register':     renderRegister();      break;
    case 'register-pro': renderRegisterPro();   break;
  }
}

// ===================== LOADING HELPER =====================
function setLoading(containerId, msg = 'Carregando...') {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `
    <div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
      <div style="font-size:2rem;margin-bottom:12px">⏳</div>
      <div>${msg}</div>
    </div>`;
}

function setError(containerId, msg = 'Erro ao carregar dados.') {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `
    <div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state-icon">⚠️</div>
      <div class="empty-state-title">${msg}</div>
      <div class="empty-state-desc">Verifique se o servidor está rodando</div>
    </div>`;
}

// ===================== RENDER HOME =====================
function renderHome() {
  updateNavbar();
}

// ===================== RENDER PROFESSIONALS =====================
async function renderProfessionals(filter = 'all', search = '') {
  const container = document.getElementById('professionals-grid');
  if (!container) return;

  setLoading('professionals-grid', 'Buscando profissionais...');

  try {
    const params = new URLSearchParams();
    if (search)                params.set('search', search);
    if (filter && filter !== 'all') params.set('especialidade', filter);

    const profs = await api(`/profissionais?${params}`);
    state.professionals = profs;

    if (!profs.length) {
      container.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">Nenhum profissional encontrado</div>
        <div class="empty-state-desc">Tente outros termos ou remova os filtros</div>
      </div>`;
      return;
    }

    container.innerHTML = profs.map((p, i) => `
      <div class="prof-card fade-in stagger-${Math.min(i+1,6)}" onclick="navigate('prof-detail', {selectedProfId: ${p.id}})">
        <div class="prof-card-cover ${p.coverVariant || ''}">
          <div class="prof-avatar">${p.initials}</div>
        </div>
        <div class="prof-card-body">
          <div class="prof-name">${p.name}</div>
          <div class="prof-specialty">${p.specialty || 'Educador(a) Físico(a)'}</div>
          <div class="prof-rating">
            <span class="stars">★★★★★</span>
            <strong>${parseFloat(p.rating).toFixed(1)}</strong>
            <span>(${p.reviews} avaliações)</span>
          </div>
          <div class="prof-tags">
            ${(p.tags || []).map(t => `<span class="badge badge-green">${t}</span>`).join('')}
          </div>
          <div class="prof-footer">
            <div class="prof-price">R$ ${p.price}<span>/sessão</span></div>
            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); navigate('schedule', {selectedProfId: ${p.id}})">Agendar</button>
          </div>
        </div>
      </div>
    `).join('');

  } catch (err) {
    setError('professionals-grid', 'Não foi possível carregar os profissionais');
    console.error(err);
  }
}

// ===================== RENDER SERVICES =====================
async function renderServices(filter = 'all', search = '') {
  const container = document.getElementById('services-grid');
  if (!container) return;

  setLoading('services-grid', 'Buscando serviços...');

  try {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filter && filter !== 'all') params.set('categoria', filter);

    const svcs = await api(`/servicos?${params}`);
    state.services = svcs;

    const iconMap = { musculacao:'🏋️', emagrecimento:'🔥', pilates:'🧘', funcional:'⚡', crossfit:'🏃', cardio:'👟', 'alta performance':'🏅', 'bem-estar':'🌿', avaliação:'📊' };
    const colorMap = { musculacao:'green', emagrecimento:'orange', pilates:'blue', funcional:'orange', crossfit:'blue', cardio:'green', 'alta performance':'purple', 'bem-estar':'green', avaliação:'purple' };

    container.innerHTML = svcs.map((s, i) => {
      const cat = (s.categoria || '').toLowerCase();
      const icon = iconMap[cat] || '💪';
      const color = colorMap[cat] || 'green';
      return `
        <div class="service-card fade-in stagger-${Math.min(i+1,6)}" onclick="navigate('schedule', {selectedServiceId: ${s.id_servico}})">
          <div class="service-icon ${color}">${icon}</div>
          <div class="service-name">${s.titulo}</div>
          <div class="service-desc">${s.descricao || ''}</div>
          <div class="service-footer">
            <span class="badge badge-gray">⏱ ${s.tipo || '60'} min</span>
            <div class="prof-price">R$ ${s.preco}<span>/sessão</span></div>
          </div>
          <button class="btn btn-outline btn-sm btn-full"
            onclick="event.stopPropagation(); navigate('schedule', {selectedServiceId: ${s.id_servico}})">
            Ver Profissionais
          </button>
        </div>`;
    }).join('');

  } catch (err) {
    setError('services-grid', 'Não foi possível carregar os serviços');
    console.error(err);
  }
}

// ===================== RENDER PROF DETAIL =====================
async function renderProfDetail() {
  const container = document.getElementById('prof-detail-content');
  if (!container) return;

  setLoading('prof-detail-content', 'Carregando perfil...');

  try {
    const prof = await api(`/profissionais/${state.selectedProfId}`);

    container.innerHTML = `
      <div class="profile-hero">
        <div class="profile-hero-inner">
          <div class="avatar-lg">${prof.initials}</div>
          <div>
            <h1 style="font-family:var(--font-display);font-size:1.6rem;font-weight:800;margin-bottom:4px">${prof.name}</h1>
            <p style="opacity:0.85;margin-bottom:10px">${prof.cref}</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${(prof.tags || []).map(t => `<span style="background:rgba(255,255,255,0.18);padding:3px 10px;border-radius:999px;font-size:0.78rem;font-weight:600">${t}</span>`).join('')}
            </div>
          </div>
          <div style="margin-left:auto;text-align:right">
            <div style="font-size:2rem;font-weight:800;font-family:var(--font-display)">★ ${prof.rating}</div>
            <div style="opacity:0.75;font-size:0.82rem">${prof.reviews} avaliações</div>
          </div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:28px">
        <div class="card"><div class="card-body">
          <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:12px">Sobre o Profissional</h3>
          <p style="color:var(--text-muted);line-height:1.7;font-size:0.93rem">${prof.bio || 'Sem descrição cadastrada.'}</p>
          ${prof.metodologia ? `<p style="color:var(--text-muted);line-height:1.7;font-size:0.93rem;margin-top:8px"><strong>Metodologia:</strong> ${prof.metodologia}</p>` : ''}
        </div></div>
        <div class="card"><div class="card-body">
          <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:14px">Informações</h3>
          <div style="display:flex;flex-direction:column;gap:12px;font-size:0.9rem">
            <div style="display:flex;align-items:center;gap:10px"><span>📋</span><span style="color:var(--text-muted)">${prof.cref}</span></div>
            ${prof.formacao ? `<div style="display:flex;align-items:center;gap:10px"><span>🎓</span><span style="color:var(--text-muted)">${prof.formacao}</span></div>` : ''}
          </div>
          <button class="btn btn-primary btn-full" style="margin-top:20px" onclick="navigate('schedule', {selectedProfId: ${prof.id}})">
            📅 Agendar Consulta
          </button>
        </div></div>
      </div>

      ${prof.services?.length ? `
      <div class="card" style="margin-bottom:28px"><div class="card-body">
        <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:18px">Serviços Oferecidos</h3>
        <div class="grid-3" style="gap:14px">
          ${prof.services.map(s => `
            <div class="service-card" onclick="navigate('schedule', {selectedProfId: ${prof.id}, selectedServiceId: ${s.id_servico}})">
              <div class="service-icon green">💪</div>
              <div class="service-name">${s.titulo}</div>
              <div class="service-footer">
                <span class="badge badge-gray">R$ ${s.preco}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div></div>` : ''}

      ${prof.avaliacoes?.length ? `
      <div class="card"><div class="card-body">
        <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:18px">Avaliações</h3>
        ${prof.avaliacoes.map(r => `
          <div style="padding:14px 0;border-bottom:1px solid var(--border)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:32px;height:32px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;color:var(--primary-dark)">${r.cliente[0]}</div>
                <strong style="font-size:0.9rem">${r.cliente}</strong>
              </div>
              <span style="color:#F59E0B">${'★'.repeat(r.nota)}</span>
            </div>
            <p style="font-size:0.88rem;color:var(--text-muted);margin-left:40px">${r.comentario || ''}</p>
          </div>
        `).join('')}
      </div></div>` : ''}
    `;

  } catch (err) {
    setError('prof-detail-content', 'Não foi possível carregar o perfil');
    console.error(err);
  }
}

// ===================== RENDER SCHEDULE =====================
async function renderSchedule() {
  const container = document.getElementById('schedule-content');
  if (!container) return;

  setLoading('schedule-content', 'Preparando agendamento...');

  try {
    let prof = null;
    let service = null;

    if (state.selectedProfId) {
      prof = await api(`/profissionais/${state.selectedProfId}`);
    }

    const svcs = state.selectedProfId
      ? (prof?.services || [])
      : await api('/servicos');

    state.bookingStep = 1;
    state.bookingData = {
      profId:    prof?.id,
      serviceId: state.selectedServiceId || null,
    };

    renderBookingStep(prof, svcs);
  } catch (err) {
    setError('schedule-content', 'Erro ao carregar agendamento');
    console.error(err);
  }
}

function renderBookingStep(prof, services = []) {
  const container = document.getElementById('schedule-content');
  const step = state.bookingStep;
  const stepLabels = ['Serviço', 'Data & Hora', 'Confirmar'];

  const stepsHTML = `
    <div class="step-indicator">
      ${stepLabels.map((label, i) => {
        const idx = i + 1;
        const cls = idx < step ? 'done' : idx === step ? 'active' : '';
        return `
          <div class="step ${cls}">
            <div class="step-num">${idx < step ? '✓' : idx}</div>
            <div class="step-label">${label}</div>
          </div>
          ${i < stepLabels.length - 1 ? `<div class="step-line ${idx < step ? 'done' : ''}"></div>` : ''}
        `;
      }).join('')}
    </div>`;

  let stepContent = '';

  if (step === 1) {
    stepContent = `
      <h2 style="font-family:var(--font-display);font-weight:700;margin-bottom:6px">Escolha o Serviço</h2>
      <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:22px">Selecione o tipo de atendimento</p>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${services.map(s => {
          const sid = s.id_servico || s.id;
          return `
          <div class="service-card" id="svc-${sid}" style="flex-direction:row;align-items:center;gap:14px;padding:16px 20px" onclick="selectService(${sid})">
            <div class="service-icon green" style="width:44px;height:44px;flex-shrink:0">💪</div>
            <div style="flex:1">
              <div class="service-name" style="margin-bottom:2px">${s.titulo || s.name}</div>
              <div style="font-size:0.8rem;color:var(--text-muted)">${s.descricao || s.desc || ''}</div>
            </div>
            <div style="font-weight:700;color:var(--primary);font-family:var(--font-display)">R$ ${s.preco || s.price}</div>
            <div class="svc-check" id="check-${sid}" style="width:22px;height:22px;border-radius:50%;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;transition:var(--transition)"></div>
          </div>`;
        }).join('')}
      </div>
      <div style="margin-top:24px;display:flex;justify-content:flex-end">
        <button class="btn btn-primary btn-lg" onclick="goBookingStep(2)">Próximo →</button>
      </div>`;
  }

  if (step === 2) {
    const svcId = state.bookingData.serviceId;
    const svc = services.find(s => (s.id_servico || s.id) === svcId);
    const times = ["07:00","08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];
    // horários bloqueados viriam da API — aqui fica vazio por padrão
    const unavail = [];

    stepContent = `
      <h2 style="font-family:var(--font-display);font-weight:700;margin-bottom:6px">Escolha a Data e Horário</h2>
      <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:22px">Selecione quando deseja realizar o atendimento</p>
      ${svc ? `<div style="background:var(--primary-light);border-radius:var(--radius-md);padding:14px;margin-bottom:20px;display:flex;gap:12px;align-items:center">
        <span style="font-size:1.3rem">💪</span>
        <div>
          <div style="font-weight:600;font-size:0.9rem">${svc.titulo || svc.name}</div>
          <div style="font-size:0.8rem;color:var(--text-muted)">R$ ${svc.preco || svc.price}</div>
        </div>
      </div>` : ''}
      <div class="form-group">
        <label>Data do Agendamento</label>
        <input type="date" id="booking-date" min="${new Date().toISOString().split('T')[0]}" value="${getNextWeekday()}" onchange="state.bookingData.date = this.value">
      </div>
      <div class="form-group">
        <label>Horário Disponível</label>
        <div class="time-slots">
          ${times.map(t => `
            <div class="time-slot ${unavail.includes(t) ? 'unavailable' : ''}"
              onclick="${unavail.includes(t) ? '' : `selectTime('${t}')`}"
              data-time="${t}">${t}</div>
          `).join('')}
        </div>
      </div>
      <div style="margin-top:24px;display:flex;justify-content:space-between">
        <button class="btn btn-ghost" onclick="goBookingStep(1)">← Voltar</button>
        <button class="btn btn-primary btn-lg" onclick="goBookingStep(3)">Revisar Pedido →</button>
      </div>`;
  }

  if (step === 3) {
    const svcId = state.bookingData.serviceId;
    const svc = services.find(s => (s.id_servico || s.id) === svcId);
    const date = state.bookingData.date || getNextWeekday();
    const time = state.bookingData.time || '09:00';
    const dateFormatted = new Date(date + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    stepContent = `
      <h2 style="font-family:var(--font-display);font-weight:700;margin-bottom:6px">Confirmar Agendamento</h2>
      <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:22px">Revise os dados antes de finalizar</p>
      <div class="card" style="margin-bottom:16px"><div class="card-body">
        <div style="display:flex;gap:14px;align-items:center;margin-bottom:16px">
          <div class="prof-avatar" style="width:54px;height:54px;font-size:1rem;border:3px solid var(--primary-mid);flex-shrink:0">${prof?.initials || '?'}</div>
          <div>
            <div style="font-weight:700">${prof?.name || 'Profissional'}</div>
            <div style="font-size:0.83rem;color:var(--primary)">${prof?.cref || ''}</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;font-size:0.9rem">
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Serviço</span><strong>${svc?.titulo || svc?.name || '-'}</strong></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Data</span><strong style="text-transform:capitalize">${dateFormatted}</strong></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Horário</span><strong>${time}</strong></div>
          <div style="border-top:1px solid var(--border);padding-top:10px;display:flex;justify-content:space-between">
            <span style="color:var(--text-muted)">Total</span>
            <strong style="color:var(--primary);font-size:1.1rem">R$ ${svc?.preco || svc?.price || '–'}</strong>
          </div>
        </div>
      </div></div>
      <div class="form-group">
        <label>Forma de Pagamento</label>
        <select id="booking-payment" onchange="state.bookingData.payment = this.value">
          <option value="pix">Pix</option>
          <option value="cartao">Cartão</option>
          <option value="dinheiro">Dinheiro</option>
        </select>
      </div>
      <div class="form-group">
        <label>Observações (opcional)</label>
        <textarea placeholder="Ex: Sou iniciante, tenho problema no joelho..." rows="3" oninput="state.bookingData.notes = this.value"></textarea>
      </div>
      <div style="margin-top:24px;display:flex;justify-content:space-between;gap:12px">
        <button class="btn btn-ghost" onclick="goBookingStep(2)">← Voltar</button>
        <button class="btn btn-primary btn-lg" id="btn-confirm-booking" onclick="confirmBooking()">✓ Confirmar Agendamento</button>
      </div>`;
  }

  container.innerHTML = `
    <div class="container">
      <div style="max-width:700px;margin:0 auto">
        ${prof ? `<div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">
          <div class="prof-avatar" style="width:50px;height:50px;font-size:1rem;border:3px solid var(--primary-mid);flex-shrink:0">${prof.initials}</div>
          <div><div style="font-weight:700">${prof.name}</div><div style="font-size:0.83rem;color:var(--text-muted)">${prof.cref || ''}</div></div>
          <button class="btn btn-ghost btn-sm" style="margin-left:auto" onclick="navigate('professionals')">Trocar profissional</button>
        </div>` : ''}
        ${stepsHTML}
        ${stepContent}
      </div>
    </div>`;

  if (step === 1 && state.bookingData.serviceId) {
    selectService(state.bookingData.serviceId, false);
  }
}

function selectService(id, advance = true) {
  document.querySelectorAll('[id^="svc-"]').forEach(el => {
    el.style.borderColor = 'var(--border)';
    el.style.background  = 'white';
  });
  document.querySelectorAll('[id^="check-"]').forEach(el => {
    el.style.background = 'white';
    el.style.borderColor = 'var(--border)';
    el.innerHTML = '';
  });
  const el    = document.getElementById(`svc-${id}`);
  const check = document.getElementById(`check-${id}`);
  if (el)    { el.style.borderColor = 'var(--primary)'; el.style.background = 'var(--primary-light)'; }
  if (check) { check.style.background = 'var(--primary)'; check.style.borderColor = 'var(--primary)'; check.innerHTML = '<span style="color:white;font-size:0.7rem">✓</span>'; }
  state.bookingData.serviceId = id;
}

function selectTime(time) {
  document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
  const el = document.querySelector(`[data-time="${time}"]`);
  if (el) el.classList.add('selected');
  state.bookingData.time = time;
}

function getNextWeekday() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
}

async function goBookingStep(step) {
  if (step === 2 && !state.bookingData.serviceId) {
    showToast('Selecione um serviço para continuar', 'error');
    return;
  }
  if (step === 3 && !state.bookingData.time) {
    state.bookingData.time = '09:00';
  }
  state.bookingStep = step;

  let prof = null;
  let services = [];

  if (state.selectedProfId) {
    try { prof = await api(`/profissionais/${state.selectedProfId}`); services = prof.services || []; }
    catch {}
  } else {
    try { services = await api('/servicos'); } catch {}
  }

  renderBookingStep(prof, services);
}

async function confirmBooking() {
  if (!state.isLoggedIn) {
    showToast('Faça login para confirmar o agendamento', 'info');
    setTimeout(() => navigate('login'), 1200);
    return;
  }

  const btn = document.getElementById('btn-confirm-booking');
  if (btn) { btn.disabled = true; btn.textContent = 'Confirmando...'; }

  try {
    const date     = state.bookingData.date || getNextWeekday();
    const time     = state.bookingData.time || '09:00';
    const data_hora = `${date}T${time}:00`;

    await api('/agendamentos', {
      method: 'POST',
      body: JSON.stringify({
        id_servico:     state.bookingData.serviceId,
        data_hora,
        duracao:        60,
        observacoes:    state.bookingData.notes   || null,
        forma_pagamento: state.bookingData.payment || 'pix',
      }),
    });

    showToast('✅ Agendamento confirmado com sucesso!', 'success');
    setTimeout(() => navigate('appointments'), 1400);
  } catch (err) {
    showToast(err.message || 'Erro ao confirmar agendamento', 'error');
    if (btn) { btn.disabled = false; btn.textContent = '✓ Confirmar Agendamento'; }
  }
}

// ===================== RENDER APPOINTMENTS =====================
async function renderAppointments() {
  const container = document.getElementById('appointments-content');
  if (!container) return;

  if (!state.isLoggedIn) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">🔒</div>
      <div class="empty-state-title">Faça login para ver seus agendamentos</div>
      <button class="btn btn-primary" style="margin-top:20px" onclick="navigate('login')">Entrar</button>
    </div>`;
    return;
  }

  setLoading('appointments-content', 'Carregando agendamentos...');

  try {
    const appts = await api('/agendamentos');
    state.appointments = appts;

    const upcoming = appts.filter(a => a.status === 'confirmado' || a.status === 'pendente');
    const past     = appts.filter(a => a.status === 'concluido' || a.status === 'cancelado');

    container.innerHTML = `
      <div class="tabs">
        <button class="tab-btn active" onclick="switchApptTab(this, 'upcoming')">Próximos (${upcoming.length})</button>
        <button class="tab-btn" onclick="switchApptTab(this, 'past')">Histórico (${past.length})</button>
      </div>
      <div id="appt-tab-upcoming">
        ${upcoming.length ? upcoming.map(a => renderApptCard(a)).join('') : `
          <div class="empty-state">
            <div class="empty-state-icon">📅</div>
            <div class="empty-state-title">Nenhum agendamento próximo</div>
            <button class="btn btn-primary" style="margin-top:16px" onclick="navigate('professionals')">Ver Profissionais</button>
          </div>`}
      </div>
      <div id="appt-tab-past" class="hidden">
        ${past.length ? past.map(a => renderApptCard(a)).join('') : '<div class="empty-state"><div class="empty-state-title">Nenhum histórico</div></div>'}
      </div>`;

  } catch (err) {
    setError('appointments-content', 'Erro ao carregar agendamentos');
  }
}

function renderApptCard(appt) {
  const d     = new Date((appt.date || appt.data_hora) + 'T12:00');
  const day   = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.','');
  const statusMap   = { confirmado: 'badge-green', pendente: 'badge-gray', concluido: 'badge-blue', cancelado: 'badge-gray' };
  const statusLabel = { confirmado: '✓ Confirmado', pendente: '⏳ Pendente', concluido: '★ Concluído', cancelado: 'Cancelado' };

  const name = appt.service || appt.service_name || '-';
  const prof = appt.profName || appt.clientName || '-';

  return `
    <div class="appt-card fade-in" style="margin-bottom:10px">
      <div class="appt-date-box">
        <div class="appt-day">${day}</div>
        <div class="appt-month">${month}</div>
      </div>
      <div class="appt-info">
        <div class="appt-name">${name}</div>
        <div class="appt-detail">👤 ${prof} • 🕐 ${appt.time || ''}</div>
      </div>
      <div class="appt-status">
        <span class="badge ${statusMap[appt.status] || 'badge-gray'}">${statusLabel[appt.status] || appt.status}</span>
        ${(appt.status === 'confirmado' || appt.status === 'pendente') ? `
          <div style="margin-top:6px">
            <button class="btn btn-sm btn-ghost" onclick="cancelAppt(${appt.id})">Cancelar</button>
          </div>` : ''}
      </div>
    </div>`;
}

async function cancelAppt(id) {
  try {
    await api(`/agendamentos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelado' }),
    });
    showToast('Agendamento cancelado', 'info');
    renderAppointments();
  } catch (err) {
    showToast(err.message || 'Erro ao cancelar', 'error');
  }
}

function switchApptTab(btn, tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  ['upcoming','past'].forEach(t => {
    const el = document.getElementById(`appt-tab-${t}`);
    if (el) el.classList.toggle('hidden', t !== tab);
  });
}

// ===================== RENDER DASHBOARD =====================
async function renderDashboard() {
  const container = document.getElementById('dashboard-content');
  if (!container) return;

  if (!state.isLoggedIn || state.userType !== 'profissional') {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">🔒</div>
      <div class="empty-state-title">Área exclusiva para profissionais</div>
      <button class="btn btn-primary" style="margin-top:16px" onclick="navigate('register-pro')">Cadastrar como Profissional</button>
    </div>`;
    return;
  }

  setLoading('dashboard-content', 'Carregando dashboard...');

  try {
    const [appts, svcs] = await Promise.all([
      api('/agendamentos'),
      api('/servicos'),
    ]);

    const upcoming = appts.filter(a => a.status === 'confirmado' || a.status === 'pendente');
    const totalReceita = appts
      .filter(a => a.status === 'concluido')
      .reduce((acc, a) => acc + parseFloat(a.preco || 0), 0);

    const clientesUnicos = [...new Set(appts.map(a => a.clientId).filter(Boolean))].length;

    container.innerHTML = `
      <div class="grid-4" style="margin-bottom:28px">
        ${[
          { icon: '📅', label: 'Agendamentos', value: upcoming.length, bg: 'var(--primary-light)', color: 'var(--primary)' },
          { icon: '👥', label: 'Clientes Ativos', value: clientesUnicos, bg: 'var(--accent-light)', color: 'var(--accent)' },
          { icon: '💰', label: 'Receita do Mês', value: `R$ ${totalReceita.toFixed(2)}`, bg: '#F5F3FF', color: '#7C3AED' },
          { icon: '🏃', label: 'Serviços', value: svcs.length, bg: '#FFF7ED', color: '#C2410C' },
        ].map(s => `
          <div class="stat-card">
            <div class="stat-icon" style="background:${s.bg}">${s.icon}</div>
            <div>
              <div class="stat-value" style="color:${s.color}">${s.value}</div>
              <div class="stat-label">${s.label}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="grid-2">
        <div class="card"><div class="card-body">
          <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:16px">Próximos Atendimentos</h3>
          ${upcoming.length ? upcoming.slice(0,5).map(a => `
            <div style="display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
              <div style="background:var(--primary-light);color:var(--primary);padding:6px 10px;border-radius:var(--radius-sm);font-size:0.8rem;font-weight:700;min-width:52px;text-align:center">${a.time || '--:--'}</div>
              <div style="flex:1">
                <div style="font-weight:600;font-size:0.9rem">${a.clientName || 'Cliente'}</div>
                <div style="font-size:0.78rem;color:var(--text-muted)">${a.service}</div>
              </div>
              <span class="badge badge-green">${a.status}</span>
            </div>
          `).join('') : '<p style="color:var(--text-muted);font-size:0.9rem">Nenhum agendamento próximo</p>'}
        </div></div>

        <div class="card"><div class="card-body">
          <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:16px">Meus Serviços</h3>
          ${svcs.slice(0,4).map(s => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
              <div class="service-icon green" style="width:38px;height:38px;font-size:1rem">💪</div>
              <div style="flex:1">
                <div style="font-weight:600;font-size:0.9rem">${s.titulo}</div>
                <div style="font-size:0.78rem;color:var(--text-muted)">R$ ${s.preco}/sessão</div>
              </div>
            </div>
          `).join('')}
          <button class="btn btn-outline btn-full" style="margin-top:14px" onclick="showToast('Em breve!', 'info')">+ Adicionar Serviço</button>
        </div></div>
      </div>`;

  } catch (err) {
    setError('dashboard-content', 'Erro ao carregar dashboard');
  }
}

// ===================== AUTH =====================
function renderLogin()      { updateNavbar(); }
function renderRegister()   { updateNavbar(); }
function renderRegisterPro() { updateNavbar(); }

async function handleLogin(e) {
  e && e.preventDefault();
  const email  = document.getElementById('login-email')?.value;
  const senha  = document.getElementById('login-password')?.value;

  if (!email || !senha) { showToast('Preencha todos os campos', 'error'); return; }

  const btn = e?.submitter || document.querySelector('#login-form button[type=submit]');
  if (btn) { btn.disabled = true; btn.textContent = 'Entrando...'; }

  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });

    localStorage.setItem('mhh_token', data.token);
    state.isLoggedIn  = true;
    state.userType    = data.user.tipo_usuario;
    state.currentUser = { ...data.user, initials: data.user.initials };

    updateNavbar();
    showToast(`✅ Bem-vindo, ${data.user.nome}!`, 'success');
    setTimeout(() => navigate(data.user.tipo_usuario === 'profissional' ? 'dashboard' : 'professionals'), 900);
  } catch (err) {
    showToast(err.message || 'Credenciais inválidas', 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
  }
}

async function handleRegister(e) {
  e && e.preventDefault();

  const payload = {
    nome:            document.getElementById('reg-name')?.value,
    email:           document.getElementById('reg-email')?.value,
    senha:           document.getElementById('reg-password')?.value,
    telefone:        document.getElementById('reg-phone')?.value,
    data_nascimento: document.getElementById('reg-birth')?.value,
    cpf:             document.getElementById('reg-cpf')?.value,
    tipo_usuario:    'cliente',
  };

  if (Object.values(payload).some(v => !v)) {
    showToast('Preencha todos os campos', 'error'); return;
  }

  try {
    const data = await api('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    localStorage.setItem('mhh_token', data.token);
    state.isLoggedIn  = true;
    state.userType    = 'cliente';
    state.currentUser = { ...data.user, initials: data.user.nome.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() };
    updateNavbar();
    showToast('✅ Cadastro realizado!', 'success');
    setTimeout(() => navigate('professionals'), 900);
  } catch (err) {
    showToast(err.message || 'Erro no cadastro', 'error');
  }
}

async function handleRegisterPro(e) {
  e && e.preventDefault();

  const payload = {
    nome:            document.getElementById('pro-name')?.value,
    email:           document.getElementById('pro-email')?.value,
    senha:           document.getElementById('pro-password')?.value,
    telefone:        document.getElementById('pro-phone')?.value,
    data_nascimento: document.getElementById('pro-birth')?.value,
    cpf:             document.getElementById('pro-cpf')?.value,
    cref:            document.getElementById('pro-cref')?.value,
    tipo_usuario:    'profissional',
  };

  if (!payload.nome || !payload.email || !payload.senha || !payload.cref) {
    showToast('Preencha todos os campos obrigatórios', 'error'); return;
  }

  try {
    const data = await api('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    localStorage.setItem('mhh_token', data.token);
    state.isLoggedIn  = true;
    state.userType    = 'profissional';
    state.currentUser = { ...data.user, initials: data.user.nome.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() };
    updateNavbar();
    showToast('✅ Perfil profissional criado!', 'success');
    setTimeout(() => navigate('dashboard'), 900);
  } catch (err) {
    showToast(err.message || 'Erro no cadastro', 'error');
  }
}

function handleLogout() {
  localStorage.removeItem('mhh_token');
  state.isLoggedIn  = false;
  state.userType    = null;
  state.currentUser = null;
  updateNavbar();
  showToast('Até logo!', 'info');
  navigate('home');
}

// ─── Revalidar token ao carregar a página ─────────────────────
async function restoreSession() {
  const token = localStorage.getItem('mhh_token');
  if (!token) return;

  try {
    const user = await api('/auth/me');
    state.isLoggedIn  = true;
    state.userType    = user.tipo_usuario;
    state.currentUser = {
      id:       user.id_usuario,
      nome:     user.nome,
      email:    user.email,
      tipo_usuario: user.tipo_usuario,
      initials: user.nome.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase(),
    };
    updateNavbar();
  } catch {
    // Token expirado
    localStorage.removeItem('mhh_token');
  }
}

// ===================== NAVBAR =====================
function updateNavbar() {
  const guestArea    = document.getElementById('nav-guest');
  const userArea     = document.getElementById('nav-user');
  const userInitials = document.getElementById('nav-user-initials');
  const userName     = document.getElementById('nav-user-name');

  if (state.isLoggedIn) {
    guestArea?.classList.add('hidden');
    userArea?.classList.remove('hidden');
    if (userInitials) userInitials.textContent = state.currentUser?.initials || 'U';
    if (userName)     userName.textContent     = state.currentUser?.nome?.split(' ')[0] || 'Usuário';
  } else {
    guestArea?.classList.remove('hidden');
    userArea?.classList.add('hidden');
  }
}

// ===================== TOAST =====================
function showToast(msg, type = 'success') {
  const icons     = { success: '✅', error: '❌', info: 'ℹ️' };
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-msg">${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = '0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===================== SEARCH =====================
function setupProfSearch() {
  const input = document.getElementById('prof-search');
  if (input) input.addEventListener('input', (e) => renderProfessionals('all', e.target.value));
}

function setupSvcSearch() {
  const input = document.getElementById('svc-search');
  if (input) input.addEventListener('input', (e) => renderServices('all', e.target.value));
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', async () => {
  await restoreSession();
  navigate('home');

  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(el.dataset.page);
    });
  });
});
