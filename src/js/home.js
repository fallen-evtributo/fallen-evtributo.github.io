/* ==========================================================================
   Onda Artist Kit — Core
   home.js — hidratação da página inicial a partir de data/*.json

   Requer content.js carregado antes deste arquivo. Em caso de falha
   (ex.: aberto via file://), o conteúdo estático de demonstração permanece.
   ========================================================================== */

(() => {
  "use strict";

  const {
    loadJSON,
    setTextAll,
    setParagraphs,
    renderDiscography,
    renderSongCards,
    renderLinks
  } = window.OndaContent;

  /* Oculta a seção que contém um container quando não há conteúdo. */
  const toggleSectionOf = (container, hasContent) => {
    const section = container?.closest("section");
    if (section) {
      section.hidden = !hasContent;
    }
  };

  const hydrate = async () => {
    const [band, linksData, releaseData] = await Promise.all([
      loadJSON("data/band.json"),
      loadJSON("data/links.json"),
      loadJSON("data/release.json")
    ]);

    /* Hero e marca */
    setTextAll("[data-band-name]", band.name);
    setTextAll("[data-hero-eyebrow]", `${band.city}, ${band.state} · ${band.genre}`);
    setTextAll("[data-band-tagline]", band.tagline);
    setTextAll("[data-hero-lead]", band.lead);

    /* Logotipo (opcional; sem ele, a marca padrão do Core permanece) */
    const logoImg = document.querySelector("[data-logo-img]");
    const logoFallback = document.querySelector("[data-logo-fallback]");
    if (logoImg && logoFallback && band.logo) {
      logoImg.src = band.logo;
      logoImg.alt = band.logoAlt ?? "";
      logoImg.hidden = false;
      logoFallback.hidden = true;
    }

    /* Sobre */
    setParagraphs("[data-about-text]", band.about);
    const ficha = {
      origem: `${band.city}, ${band.state}`,
      regiao: band.region,
      genero: band.genre,
      desde: band.founded,
      formacao: `${(band.members ?? []).length} integrantes`
    };
    Object.entries(ficha).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        setTextAll(`[data-ficha="${key}"]`, String(value));
      }
    });

    /* Música (discografia compartilhada com o release; bandas autorais) */
    renderDiscography("[data-discography]", releaseData.discography, { showDescription: false });

    /* Músicas em destaque (repertório de bandas tributo — opcional).
       Sem data/repertoire.json, o conteúdo estático da página permanece. */
    try {
      const repertoire = await loadJSON("data/repertoire.json");
      const highlights = document.querySelector("[data-song-highlights]");
      if (highlights) {
        renderSongCards("[data-song-highlights]", repertoire.highlights);
        toggleSectionOf(highlights, !highlights.hidden);
      }
    } catch (error) {
      console.warn("[Onda] Sem data/repertoire.json — mantendo a seção de músicas em destaque do HTML.", error);
    }

    /* Contato para contratação */
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

    /* Redes e links */
    renderLinks("[data-links]", linksData.links);

    /* Próximo show (usa a fonte de dados — local ou Google Calendar) */
    if (window.OndaData && window.OndaShowCard) {
      const { events } = await window.OndaData.getAgenda();
      const { upcoming } = window.OndaShows.classifyShows(events);
      const nextShow = upcoming.find((show) => show.status !== "cancelled");
      const container = document.querySelector("[data-next-show]");
      const emptyMessage = document.querySelector("[data-next-show-empty]");
      if (container) {
        if (nextShow) {
          container.hidden = false;
          container.innerHTML = window.OndaShowCard.render(nextShow);
          if (emptyMessage) {
            emptyMessage.hidden = true;
          }
        } else {
          container.hidden = true;
          if (emptyMessage) {
            emptyMessage.hidden = false;
          }
        }
      }
    }
  };

  hydrate().catch((error) => {
    console.warn("[Onda] Conteúdo JSON indisponível — exibindo conteúdo de demonstração estático.", error);
  });
})();