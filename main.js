/**
 * learnTECH Books - Core Engine v4.1
 * Ajuste: Correção de renderização e Case Sensitivity
 */

document.addEventListener("DOMContentLoaded", () => {
  
  // [INÍCIO] 1. ESTADO GLOBAL
  const state = {
    biblioteca: [],
    filtros: {
      texto: "",
      categoria: "Todos",
    },
  };
  // [FIM] 1. ESTADO GLOBAL

  // [INÍCIO] 2. SELETORES DE DOM
  const dom = {
    carrosselDestaque: document.getElementById("carrossel-destaque"),
    gridMaisVendidos: document.getElementById("grid-mais-vendidos"),
    gridCatalogo: document.getElementById("grid-livros"),
    contadorResultados: document.getElementById("contador-resultados"),
    inputBusca: document.getElementById("input-busca"),
    botoesFiltro: document.querySelectorAll(".filter-btn"),
    modal: document.getElementById("modal-livro"),
    modalDetalhes: document.getElementById("modal-detalhes"),
    navbar: document.querySelector(".navbar"),
  };
  // [FIM] 2. SELETORES DE DOM

  // [INÍCIO] 3. UTILS & FORMATADORES
  const formatarPreco = (valor) => {
    if (typeof valor !== 'number') return "0<span>,00</span>";
    const [inteiro, centavos] = valor.toFixed(2).split(".");
    return `${inteiro}<span>,${centavos}</span>`;
  };
  // [FIM] 3. UTILS & FORMATADORES

  // [INÍCIO] 4. RENDERIZADORES
  
  const renderDestaques = () => {
    const destaques = state.biblioteca.filter(l => l.destaque);
    if (dom.carrosselDestaque) {
        dom.carrosselDestaque.innerHTML = destaques.map(livro => `
            <div class="destaque-card-premium">
                <div class="destaque-content">
                    <span class="destaque-tag">${livro.categoria}</span>
                    <h3>${livro.titulo}</h3>
                    <p>${livro.sinopse.substring(0, 90)}...</p>
                    <button class="btn-destaque" onclick="abrirModal(${livro.id})">Ver Detalhes</button>
                </div>
                <div class="destaque-image-wrapper">
                    <img src="${livro.capa_url}" alt="${livro.titulo}">
                </div>
            </div>
        `).join("");
    }
  };

  const renderMaisVendidos = () => {
    const tops = state.biblioteca.filter(l => l.top_seller).slice(0, 6);
    if (dom.gridMaisVendidos) {
        dom.gridMaisVendidos.innerHTML = tops.map((livro, index) => `
            <article class="card-mais-vendido" onclick="abrirModal(${livro.id})">
                <div class="rank-badge">${index + 1}</div>
                <img src="${livro.capa_url}" alt="${livro.titulo}">
                <div class="book-info">
                    <h3 class="livro-titulo-sm">${livro.titulo}</h3>
                    <p class="valor-promo">R$ ${formatarPreco(livro.preco_promocional)}</p>
                </div>
            </article>
        `).join("");
    }
  };

  const renderCatalogo = (lista) => {
    if (!dom.gridCatalogo) return;

    dom.contadorResultados.innerText = `${lista.length} de ${state.biblioteca.length} livros`;

    if (lista.length === 0) {
      dom.gridCatalogo.innerHTML = `<div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">Nenhum livro encontrado para esta categoria ou busca.</div>`;
      return;
    }

    dom.gridCatalogo.innerHTML = lista.map((livro, index) => `
        <article class="livro-card" style="animation-delay: ${index * 0.05}s; opacity: 1;" onclick="abrirModal(${livro.id})">
            ${livro.top_seller ? '<span class="badge-top">Top Seller</span>' : ""}
            <img src="${livro.capa_url}" alt="${livro.titulo}" loading="lazy">
            <div class="preco-container">
                <p class="valor-original">R$ ${livro.preco_original.toFixed(2)}</p>
                <p class="valor-promo">R$ ${formatarPreco(livro.preco_promocional)}</p>
            </div>
            <h3 class="livro-titulo">${livro.titulo}</h3>
            <div class="amazon-rating">
                ${"★".repeat(Math.floor(livro.estrelas))}${"☆".repeat(5 - Math.floor(livro.estrelas))}
                <span>(${livro.avaliacoes.toLocaleString()})</span>
            </div>
        </article>
    `).join("");
  };
  // [FIM] 4. RENDERIZADORES

  // [INÍCIO] 5. LÓGICA DE FILTRAGEM (Correção de Case Sensitivity)
  const applyFilters = () => {
    const buscaTexto = state.filtros.texto.toLowerCase();
    const buscaCat = state.filtros.categoria;

    const filtrados = state.biblioteca.filter((livro) => {
      const matchTexto = 
        livro.titulo.toLowerCase().includes(buscaTexto) || 
        livro.autor.toLowerCase().includes(buscaTexto);
      
      const matchCat = (buscaCat === "Todos") || (livro.categoria === buscaCat);
      
      return matchTexto && matchCat;
    });

    renderCatalogo(filtrados);
  };
  // [FIM] 5. LÓGICA DE FILTRAGEM

  // [INÍCIO] 6. SISTEMA DE MODAL & NAV
  window.abrirModal = (id) => {
    const livro = state.biblioteca.find(l => l.id === id);
    if (!livro) return;

    dom.modalDetalhes.innerHTML = `
        <div class="modal-body-grid">
            <div class="modal-img-container">
                <img src="${livro.capa_url}" alt="${livro.titulo}" style="width:100%; border-radius:15px; box-shadow: 20px 20px 40px rgba(0,0,0,0.2);">
            </div>
            <div class="modal-text-content">
                <span class="destaque-tag">${livro.categoria}</span>
                <h2 style="font-size: 2.2rem; margin-bottom: 10px;">${livro.titulo}</h2>
                <p style="color: #666; margin-bottom: 20px;">Por <strong>${livro.autor}</strong></p>
                <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 30px;">${livro.sinopse}</p>
                <div class="modal-pricing" style="margin-bottom: 20px;">
                   <span class="valor-promo" style="font-size: 1.8rem;">R$ ${formatarPreco(livro.preco_promocional)}</span>
                </div>
                <button class="btn-cta-hero" onclick="confirmarReserva(${livro.id})">Reservar Agora</button>
            </div>
        </div>
    `;
    dom.modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  };

  window.fecharModal = () => {
    dom.modal.style.display = "none";
    document.body.style.overflow = "auto";
  };

  window.confirmarReserva = (id) => {
    const btn = document.querySelector(".modal-text-content .btn-cta-hero");
    if(btn) {
        btn.innerHTML = "✓ RESERVADO";
        btn.style.background = "#27ae60";
        setTimeout(fecharModal, 1200);
    }
  };

  window.scrollCarousel = (direction) => {
    const track = dom.carrosselDestaque;
    const firstCard = track.querySelector(".destaque-card-premium");
    if (firstCard) {
      const moveStep = firstCard.offsetWidth + 24;
      track.scrollBy({ left: direction * moveStep, behavior: 'smooth' });
    }
  };
  // [FIM] 6. SISTEMA DE MODAL

  // [INÍCIO] 7. EVENT LISTENERS
  const setupEventListeners = () => {
    if (dom.inputBusca) {
        let timer;
        dom.inputBusca.addEventListener("input", (e) => {
          clearTimeout(timer);
          state.filtros.texto = e.target.value;
          timer = setTimeout(applyFilters, 300);
        });
    }

    dom.botoesFiltro.forEach((btn) => {
      btn.addEventListener("click", () => {
        dom.botoesFiltro.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.filtros.categoria = btn.dataset.categoria;
        applyFilters();
      });
    });

    window.addEventListener("click", (e) => {
      if (e.target === dom.modal) fecharModal();
    });

    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        dom.navbar.classList.add("navbar-scrolled");
      } else {
        dom.navbar.classList.remove("navbar-scrolled");
      }
    });
  };
  // [FIM] 7. EVENT LISTENERS

  // [INÍCIO] 8. INICIALIZAÇÃO
  const init = async () => {
    try {
      // Ajuste o caminho se necessário (ex: biblioteca.json na raiz ou na pasta data)
      const response = await fetch("data/biblioteca.json"); 
      if (!response.ok) throw new Error("Não foi possível carregar o JSON.");
      
      state.biblioteca = await response.json();

      // Ordem de execução
      renderDestaques();
      renderMaisVendidos();
      applyFilters(); // Renderiza o catálogo inicial
      setupEventListeners();

    } catch (error) {
      console.error("Erro Crítico:", error);
      if (dom.gridCatalogo) {
        dom.gridCatalogo.innerHTML = `<p class="error" style="grid-column: 1/-1; text-align: center;">Erro ao conectar com o acervo. Verifique se o arquivo biblioteca.json está no local correto.</p>`;
      }
    }
  };

  init();
});