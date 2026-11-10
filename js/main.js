const WHATSAPP = "558193118769";

const menu = document.querySelector("[data-menu]");
const menuBtn = document.querySelector("[data-menu-btn]");
const header = document.querySelector("[data-header]");

function fecharMenu() {
  menu.classList.remove("is-open");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.querySelector(".sr-only").textContent = "Abrir menu";
  document.body.classList.remove("menu-open");
}

menuBtn.addEventListener("click", () => {
  const aberto = menu.classList.toggle("is-open");
  menuBtn.setAttribute("aria-expanded", String(aberto));
  menuBtn.querySelector(".sr-only").textContent = aberto ? "Fechar menu" : "Abrir menu";
  document.body.classList.toggle("menu-open", aberto);
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") fecharMenu();
});

menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", fecharMenu);
});

function linkWhatsApp(tratamento) {
  let texto = "Olá, Dra. Thaís! Gostaria de agendar uma consulta.";
  if (tratamento) {
    texto = "Olá, Dra. Thaís! Gostaria de agendar: " + tratamento + ".";
  }
  return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto);
}

document.querySelectorAll(".js-agendar").forEach((botao) => {
  botao.href = linkWhatsApp(botao.dataset.tratamento);
  botao.setAttribute("target", "_blank");
  botao.setAttribute("rel", "noopener");
});

window.addEventListener("scroll", () => {
  header.classList.toggle("is-stuck", window.scrollY > 8);
}, { passive: true });

document.querySelectorAll(".faq details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq details").forEach((outro) => {
      if (outro !== item) outro.open = false;
    });
  });
});

const navLinks = [...menu.querySelectorAll("a[href^='#']")];
const secoes = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function marcarMenu() {
  navLinks.forEach((link) => link.classList.remove("is-active"));
  const ponto = window.scrollY + 150;
  const primeira = secoes[0];
  if (!primeira || ponto < primeira.offsetTop) return;

  let atual = null;
  secoes.forEach((secao) => {
    if (secao.offsetTop <= ponto) atual = secao;
  });
  if (!atual) return;

  const ativo = navLinks.find((link) => link.getAttribute("href") === "#" + atual.id);
  if (ativo) ativo.classList.add("is-active");
}

window.addEventListener("scroll", marcarMenu, { passive: true });
marcarMenu();

const dock = document.querySelector("[data-dock]");
const contato = document.querySelector("#contato");
if (dock && contato && "IntersectionObserver" in window) {
  const verContato = new IntersectionObserver(([entry]) => {
    dock.classList.toggle("is-hidden", entry.isIntersecting);
  }, { threshold: 0.25 });
  verContato.observe(contato);
}

function iniciarComparador(root) {
  const frame = root.querySelector("[data-frame]");
  const beforeWrap = root.querySelector("[data-before]");
  const beforeImg = beforeWrap.querySelector("img");
  const range = root.querySelector("[data-range]");
  let arrastando = false;

  function tamanhoImagem() {
    beforeImg.style.width = frame.offsetWidth + "px";
    beforeImg.style.height = frame.offsetHeight + "px";
  }

  function setPos(pct) {
    const p = Math.min(100, Math.max(0, pct));
    root.style.setProperty("--pos", p + "%");
    range.value = String(Math.round(p));
  }

  function posDoEvento(evento) {
    const ponto = evento.touches ? evento.touches[0] : evento;
    const rect = frame.getBoundingClientRect();
    setPos(((ponto.clientX - rect.left) / rect.width) * 100);
  }

  frame.addEventListener("pointerdown", (evento) => {
    arrastando = true;
    frame.setPointerCapture(evento.pointerId);
    posDoEvento(evento);
  });

  frame.addEventListener("pointermove", (evento) => {
    if (arrastando) posDoEvento(evento);
  });

  frame.addEventListener("pointerup", () => { arrastando = false; });
  frame.addEventListener("pointercancel", () => { arrastando = false; });

  range.addEventListener("input", () => setPos(Number(range.value)));
  window.addEventListener("resize", tamanhoImagem);
  if (beforeImg.complete) tamanhoImagem();
  else beforeImg.addEventListener("load", tamanhoImagem);
  window.addEventListener("load", tamanhoImagem);
  setPos(50);
}

document.querySelectorAll("[data-compare]").forEach(iniciarComparador);

function iniciarCasos(root) {
  const faixa = root.querySelector("[data-casos-faixa]");
  const prev = root.querySelector("[data-casos-prev]");
  const next = root.querySelector("[data-casos-next]");
  if (!faixa || !prev || !next) return;

  const originais = [...faixa.querySelectorAll(".caso:not(.is-clone)")];
  if (originais.length < 2) return;

  if (!faixa.dataset.loop) {
    const primeiro = originais[0].cloneNode(true);
    const ultimo = originais[originais.length - 1].cloneNode(true);
    primeiro.classList.add("is-clone");
    ultimo.classList.add("is-clone");
    faixa.prepend(ultimo);
    faixa.append(primeiro);
    faixa.dataset.loop = "1";
  }

  function mobile() {
    return window.matchMedia("(max-width: 980px)").matches;
  }

  function passoPx() {
    const card = faixa.querySelector(".caso");
    const gap = parseFloat(getComputedStyle(faixa).gap) || 12;
    return card.offsetWidth + gap;
  }

  function ir(indice, suave) {
    faixa.scrollTo({ left: indice * passoPx(), behavior: suave ? "smooth" : "auto" });
  }

  function ajeitar() {
    if (!mobile()) return;
    const n = originais.length;
    const i = Math.round(faixa.scrollLeft / passoPx());
    if (i <= 0) ir(n, false);
    else if (i >= n + 1) ir(1, false);
  }

  function passo(direcao) {
    if (!mobile()) return;
    const n = originais.length;
    let i = Math.round(faixa.scrollLeft / passoPx()) + direcao;
    ir(i, true);
    window.setTimeout(ajeitar, 380);
  }

  prev.addEventListener("click", () => { passo(-1); andar(); });
  next.addEventListener("click", () => { passo(1); andar(); });

  faixa.addEventListener("scrollend", ajeitar);
  faixa.addEventListener("touchend", () => window.setTimeout(ajeitar, 380), { passive: true });

  let timer = null;
  let visivel = true;

  function parar() {
    window.clearInterval(timer);
    timer = null;
  }

  function andar() {
    parar();
    if (!mobile() || !visivel) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = window.setInterval(() => passo(1), 7000);
  }

  root.addEventListener("mouseenter", parar);
  root.addEventListener("mouseleave", andar);
  root.addEventListener("touchstart", parar, { passive: true });
  root.addEventListener("touchend", () => window.setTimeout(andar, 800), { passive: true });

  if ("IntersectionObserver" in window) {
    const ver = new IntersectionObserver(([entry]) => {
      visivel = entry.isIntersecting;
      if (visivel) andar();
      else parar();
    }, { threshold: 0.2 });
    ver.observe(root);
  }

  requestAnimationFrame(() => {
    if (mobile()) ir(1, false);
    andar();
  });
}

document.querySelectorAll("[data-casos]").forEach(iniciarCasos);
