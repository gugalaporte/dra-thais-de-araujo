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

const blocos = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  blocos.forEach((bloco) => observer.observe(bloco));
} else {
  blocos.forEach((bloco) => bloco.classList.add("is-in"));
}

document.querySelectorAll(".faq details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq details").forEach((outro) => {
      if (outro !== item) outro.open = false;
    });
  });
});

const navLinks = menu.querySelectorAll("a[href^='#']");
const secoes = [...navLinks]
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function marcarMenu() {
  const ponto = window.scrollY + 140;
  let atual = secoes[0];
  secoes.forEach((secao) => {
    if (secao.offsetTop <= ponto) atual = secao;
  });
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === "#" + atual.id);
  });
}

window.addEventListener("scroll", marcarMenu, { passive: true });
marcarMenu();

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
