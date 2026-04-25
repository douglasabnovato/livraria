/**
 * learnTECH Books - Core Engine v3.0
 * Arquitetura: Funcional e Event-Driven
 */

document.addEventListener("DOMContentLoaded", () => {
  let bibliotecaCompleta = [];

  // Configurações de UI
  const gridCatalogo = document.getElementById("grid-livros");
  const gridMaisVendidos = document.getElementById("grid-mais-vendidos");
  const carrosselDestaque = document.getElementById("carrossel-destaque");
  const inputBusca = document.getElementById("input-busca");
  const botoesFiltro = document.querySelectorAll(".filter-btn");

  /**
   * 1. DATA ENGINE: Carregamento dos dados
   */
  const carregarDados = async () => {
    try {
      const response = await fetch("biblioteca.json");
      if (!response.ok) throw new Error("Erro ao carregar banco de dados.");

      bibliotecaCompleta = await response.json();

      // Inicializa as seções
      renderizarDestaques();
      renderizarMaisVendidos();
      renderizarCatalogo(bibliotecaCompleta);
      configurarFiltros();
    } catch (error) {
      console.error("Erro crítico learnTECH:", error);
      gridCatalogo.innerHTML = `<p class="erro">Ops! Tivemos um problema ao carregar o acervo. Tente novamente mais tarde.</p>`;
    }
  };

  /**
   * 2. RENDERERS: Geradores de Interface
   */

  // Formata preço estilo Amazon (Centavos menores via CSS)
  const formatarMoeda = (valor) => {
    const [inteiro, centavos] = valor.toFixed(2).split(".");
    return `${inteiro}<span>,${centavos}</span>`;
  };

  const renderizarDestaques = () => {
    const destaques = bibliotecaCompleta
      .filter((livro) => livro.destaque)
      .slice(0, 4);
    carrosselDestaque.innerHTML = destaques
      .map(
        (livro) => `
            <div class="destaque-card" onclick="abrirModal(${livro.id})">
                <img src="${livro.capa_url}" alt="${livro.titulo}" fetchpriority="high">
            </div>
        `,
      )
      .join("");
  };

  const renderizarMaisVendidos = () => {
    const tops = bibliotecaCompleta
      .filter((livro) => livro.top_seller)
      .slice(0, 6);
    gridMaisVendidos.innerHTML = tops
      .map(
        (livro) => `
            <article class="card-mais-vendido" onclick="abrirModal(${livro.id})">
                <img src="${livro.capa_url}" alt="${livro.titulo}" loading="lazy">
                <div class="book-info">
                    <h3 class="livro-titulo">${livro.titulo}</h3>
                    <p class="valor-promo">R$ ${formatarMoeda(livro.preco_promocional)}</p>
                </div>
            </article>
        `,
      )
      .join("");
  };

  const renderizarCatalogo = (lista) => {
    if (lista.length === 0) {
      gridCatalogo.innerHTML = `<p class="no-results">Nenhum livro encontrado para sua busca.</p>`;
      return;
    }

    gridCatalogo.innerHTML = lista
      .map(
        (livro) => `
            <article class="livro-card" onclick="abrirModal(${livro.id})">
                <img src="${livro.capa_url}" alt="${livro.titulo}" loading="lazy">
                <div class="preco-container">
                    <p class="valor-promo">R$ ${formatarMoeda(livro.preco_promocional)}</p>
                    <p class="valor-original">R$ ${livro.preco_original.toFixed(2)}</p>
                </div>
                <h3 class="livro-titulo">${livro.titulo}</h3>
                <p class="livro-autor">${livro.autor}</p>
                <div class="amazon-rating">
                    ${"★".repeat(Math.floor(livro.estrelas))}${"☆".repeat(5 - Math.floor(livro.estrelas))}
                    <span>(${livro.avaliacoes})</span>
                </div>
            </article>
        `,
      )
      .join("");
  };

  /**
   * 3. FILTER LOGIC: Busca e Filtros Instantâneos
   */
  const filtrarLivros = () => {
    const termo = inputBusca.value.toLowerCase();
    const categoriaAtiva =
      document.querySelector(".filter-btn.active").dataset.categoria;

    const resultado = bibliotecaCompleta.filter((livro) => {
      const matchesTexto =
        livro.titulo.toLowerCase().includes(termo) ||
        livro.autor.toLowerCase().includes(termo);
      const matchesCategoria =
        categoriaAtiva === "Todos" || livro.categoria === categoriaAtiva;

      return matchesTexto && matchesCategoria;
    });

    renderizarCatalogo(resultado);
  };

  const configurarFiltros = () => {
    inputBusca.addEventListener("input", filtrarLivros);

    botoesFiltro.forEach((botao) => {
      botao.addEventListener("click", () => {
        botoesFiltro.forEach((b) => b.classList.remove("active"));
        botao.classList.add("active");
        filtrarLivros();
      });
    });
  };

  /**
   * 4. UI ENHANCERS: Modal e Interações
   */
  window.abrirModal = (id) => {
    const livro = bibliotecaCompleta.find((l) => l.id === id);
    const modal = document.getElementById("modal-livro");
    const detalhes = document.getElementById("modal-detalhes");

    detalhes.innerHTML = `
            <div class="modal-grid">
                <img src="${livro.capa_url}" alt="${livro.titulo}">
                <div class="modal-info">
                    <h2>${livro.titulo}</h2>
                    <p class="autor-modal">Por: ${livro.autor}</p>
                    <div class="preco-modal">
                        <span class="promo">R$ ${livro.preco_promocional.toFixed(2)}</span>
                        <span class="original">R$ ${livro.preco_original.toFixed(2)}</span>
                    </div>
                    <p class="sinopse">${livro.sinopse || "Uma obra selecionada pela curadoria learnTECH para impulsionar sua jornada."}</p>
                    <button class="btn-cta-hero" style="width: 100%">Reservar Exemplar</button>
                </div>
            </div>
        `;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden"; // Trava o scroll do fundo
  };

  // Fechar Modal
  document.querySelector(".close-btn").addEventListener("click", () => {
    document.getElementById("modal-livro").style.display = "none";
    document.body.style.overflow = "auto";
  });

  window.onclick = (event) => {
    const modal = document.getElementById("modal-livro");
    if (event.target == modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  };

  // Início
  carregarDados();
});
