/* ==========================================================================
   Onda Artist Kit — Core
   release.js — página de release (release.html)

   Hidrata a página a partir de data/band.json, data/links.json,
   data/release.json e (opcional) data/repertoire.json — repertório de
   bandas tributo; oculta seções sem dados; sincroniza metadados de
   SEO e conecta o botão de impressão (Ctrl+P → Salvar como PDF).
   Requer content.js carregado antes. Sem HTTP, o fallback estático
   de demonstração permanece.
   ========================================================================== */

(() => {
  "use strict";

  const {
    loadJSON,
    escapeHTML,
    setTextAll,
    setParagraphs,
    renderList,
    setArtwork,
    renderDiscography,
    renderSongList,
    renderLinks,
    renderMembers
  } = window.OndaContent;

  /* Junta itens em português: "A, B e C". */
  const joinPT = (items) =>
    items.length > 1 ? `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}` : items.join("");

  /* Oculta uma seção inteira quando não há dados configurados. */
  const hideSection = (sectionId, hasData) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.hidden = !hasData;
    }
  };

  /* Atualiza metadados existentes no <head> (SEO básico da página). */
  const setMeta = (selector, value) => {
    const element = document.querySelector(selector);
    if (element && value) {
      element.setAttribute("content", value);
    }
  };

  const hydrate = async () => {
    const [band, linksData, releaseData] = await Promise.all([
      loadJSON("data/band.json"),
      loadJSON("data/links.json"),
      loadJSON("data/release.json")
    ]);

    /* Cabeçalho e destaque */
    setTextAll("[data-band-name]", band.name);
    setTextAll("[data-release-eyebrow]", `Release · ${band.city}, ${band.state} · ${band.genre}`);
    setTextAll("[data-band-tagline]", band.tagline);
    setTextAll("[data-release-headline]", releaseData.headline);
    setTextAll("[data-release-description]", releaseData.description);

    /* Imagens: foto principal e logotipo (fallback quando não configuradas) */
    setArtwork("[data-photo]", "[data-photo-wrap]", band.photo, band.photoAlt);
    const logoImg = document.querySelector("[data-logo-img]");
    const logoFallback = document.querySelector("[data-logo-fallback]");
    if (logoImg && logoFallback && band.logo) {
      logoImg.src = band.logo;
      logoImg.alt = band.logoAlt ?? "";
      logoImg.hidden = false;
      logoFallback.hidden = true;
    }

    /* Apresentação, biografia e identidade musical */
    setParagraphs("[data-presentation]", [releaseData.presentation]);
    setParagraphs("[data-biography]", releaseData.biography);
    setTextAll("[data-identity]", band.musicalIdentity);
    renderList(
      "[data-genres]",
      (band.genres ?? []).map((genre) => `<li class="badge">${escapeHTML(genre)}</li>`)
    );

    /* Integrantes */
    renderMembers("[data-members]", band.members);
    hideSection("integrantes", (band.members ?? []).length > 0);

    /* Discografia (bandas autorais; omitida quando não há lançamentos) */
    renderDiscography("[data-discography]", releaseData.discography);
    hideSection("discografia", (releaseData.discography ?? []).length > 0);

    /* Repertório completo (bandas tributo — opcional).
       Sem data/repertoire.json, o conteúdo estático da página permanece. */
    let hasRepertoire = true;
    try {
      const repertoire = await loadJSON("data/repertoire.json");
      setParagraphs("[data-repertoire-intro]", repertoire.intro);
      renderSongList("[data-repertoire]", repertoire.songs);
      setTextAll("[data-repertoire-note]", repertoire.note);
      const repertoireList = document.querySelector("[data-repertoire]");
      hasRepertoire = Boolean(repertoireList && !repertoireList.hidden);
      hideSection("repertorio", hasRepertoire);
    } catch (error) {
      console.warn("[Onda] Sem data/repertoire.json — mantendo o repertório estático do HTML.", error);
    }

    /* Destaques e experiência */
    renderList(
      "[data-highlights]",
      (releaseData.highlights ?? []).map((item) => `<li>${escapeHTML(item)}</li>`)
    );
    hideSection("destaques", (releaseData.highlights ?? []).length > 0);
    setTextAll("[data-experience]", releaseData.experience);
    hideSection("experiencia", Boolean(releaseData.experience));

    /* Contratação: não exibir informações vazias */
    const booking = releaseData.booking ?? {};
    setTextAll("[data-booking-description]", booking.description);
    const emailLink = document.querySelector("[data-booking-email]");
    if (emailLink) {
      if (booking.email) {
        emailLink.href = `mailto:${booking.email}`;
        emailLink.textContent = booking.email;
        emailLink.hidden = false;
      } else {
        emailLink.hidden = true;
      }
    }
    const phoneLink = document.querySelector("[data-booking-phone]");
    if (phoneLink) {
      if (booking.phone) {
        phoneLink.href = `tel:${String(booking.phone).replace(/\s+/g, "")}`;
        phoneLink.textContent = booking.phone;
        phoneLink.hidden = false;
      } else {
        phoneLink.hidden = true;
      }
    }

    /* Redes e links (reutiliza data/links.json) */
    renderLinks("[data-links]", linksData.links);
    hideSection("redes", (linksData.links ?? []).length > 0);

    /* Próximas apresentações (usa a camada de dados, sem duplicar o sistema) */
    try {
      const { events } = await window.OndaData.getAgenda();
      const { upcoming } = window.OndaShows.classifyShows(events);
      const nextShows = upcoming.filter((show) => show.status !== "cancelled").slice(0, 3);
      const list = document.querySelector("[data-next-dates]");
      const emptyMessage = document.querySelector("[data-next-dates-empty]");
      if (list) {
        list.innerHTML = nextShows
          .map((show) => `<li><strong>${escapeHTML(window.OndaShows.formatShortDate(show.date))}</strong> · ${escapeHTML([show.city, show.state].filter(Boolean).join(", "))}${show.title ? ` — ${escapeHTML(show.title)}` : ""}</li>`)
          .join("");
        list.hidden = nextShows.length === 0;
      }
      if (emptyMessage) {
        emptyMessage.hidden = nextShows.length > 0;
      }
      /* Sem mensagem de estado vazio na página, mantém o comportamento
         original: a seção some quando não há datas. */
      hideSection("proximas", nextShows.length > 0 || Boolean(emptyMessage));
    } catch (error) {
      console.warn("[Onda] Agenda indisponível para o release.", error);
    }

    /* SEO básico: sincroniza <title> e metadados com os dados */
    document.title = `${band.name} — Release · ${band.genre} · ${band.city}, ${band.state}`;
    const topics = ["biografia", "integrantes"];
    if (hasRepertoire) {
      topics.push("repertório");
    }
    if ((releaseData.discography ?? []).length > 0) {
      topics.push("discografia");
    }
    topics.push("destaques", "contratação");
    const description = `${band.name} — ${releaseData.headline}: ${joinPT(topics)}.`;
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', `${band.name} — Release`);
    setMeta('meta[property="og:description"]', description);
    if (band.photo) {
      setMeta('meta[property="og:image"]', band.photo);
    }

    /* Impressão / exportação para PDF pelo navegador */
    document
      .querySelector("[data-print-release]")
      ?.addEventListener("click", () => window.print());
  };

  hydrate().catch((error) => {
    console.warn("[Onda] Conteúdo JSON indisponível — exibindo release de demonstração estático.", error);
  });
})();