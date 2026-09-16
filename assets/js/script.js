/* ===== JAVASCRIPT - Funções e Eventos ===== */
document.addEventListener("DOMContentLoaded", () => {
    // ===== Seleção dos elementos do menu (mobile) e navegação =====
    const menuToggle = document.querySelector(".menu-toggle")
    const mainNav = document.querySelector(".main-nav")
    const navLinks = document.querySelectorAll(".nav-link")
    const sections = document.querySelectorAll("main section[id]")

    // ===== Botão de voltar ao topo =====
    const scrollTopButton = document.querySelector(".scroll-top")

    // ===== Filtros e cards de produto =====
    const filterButtons = document.querySelectorAll(".filter-button")
    const productCards = document.querySelectorAll(".product-card")

    // ===== Accordion (FAQ) =====
    const accordionItems = document.querySelectorAll(".accordion-item")

    // ===== Galeria e Lightbox =====
    const galleryItems = document.querySelectorAll(".gallery-item")
    const lightbox = document.querySelector(".lightbox")
    const lightboxImage = document.querySelector(".lightbox-image")
    const lightboxClose = document.querySelector(".lightbox-close")
    const lightboxPrev = document.querySelector(".lightbox-prev")
    const lightboxNext = document.querySelector(".lightbox-next")

    // Elementos do bloco de informações detalhadas dentro do lightbox (novo)
    const lightboxInfoName = document.querySelector(".lightbox-info-name")
    const lightboxInfoDescription = document.querySelector(".lightbox-info-description")

    // Ano atual exibido no rodapé
    const currentYear = document.querySelector("#current-year")

    let currentGalleryIndex = 0
    let lastFocusedElement = null

    // Atualiza automaticamente o ano no rodapé (evita precisar editar manualmente todo ano)
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear()
    }

    // ===== MENU MOBILE (não alterar sem necessidade — está funcionando) =====
    // Abre/fecha o menu, alterna classes, atualiza aria-expanded e troca o ícone (hamburguer/close)
    const setMenuState = isOpen => {
        if (!menuToggle || !mainNav) {
            return;
        }

        mainNav.classList.toggle("open", isOpen)
        document.body.classList.toggle("menu-open", isOpen)
        menuToggle.setAttribute("aria-expanded", String(isOpen))

        const menuIcon = menuToggle.querySelector("i")

        if (menuIcon) {
            menuIcon.classList.toggle("ri-menu-line", !isOpen)
            menuIcon.classList.toggle("ri-close-line", isOpen)
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            setMenuState(!mainNav.classList.contains("open"))
        })
    }

    // Fecha o menu mobile automaticamente ao clicar em qualquer link de navegação
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            setMenuState(false)
        })
    })

    // ===== NAV ATIVA DURANTE O SCROLL =====
    // Marca o link do menu correspondente à seção visível na tela (sem precisar clicar)
    const updateActiveNav = () => {
        const currentPosition = window.scrollY + 180 // offset para compensar o header fixo

        // Remove "active" de todos os links antes de verificar a section atual
        // (evita que o último link marcado "trave" ao passar da última section)
        navLinks.forEach(link => link.classList.remove("active"))

        sections.forEach(section => {
            const sectionTop = section.offsetTop
            const sectionBottom = sectionTop + section.offsetHeight
            const sectionId = section.id
            const relatedLink = document.querySelector(
                `.nav-link[href="#${sectionId}"]`
            )

            if (
                currentPosition >= sectionTop &&
                currentPosition < sectionBottom &&
                relatedLink
            ) {
                relatedLink.classList.add("active")
            }
        })
    }

    // ===== BOTÃO SCROLL-TO-TOP =====
    // Mostra/esconde o botão flutuante conforme a rolagem da página
    const updateScrollTopButton = () => {
        if (!scrollTopButton) {
            return
        }

        scrollTopButton.classList.toggle("visible", window.scrollY > 500)
    }

    // Listener único de scroll que atualiza nav ativa + visibilidade do botão de topo
    window.addEventListener("scroll", () => {
        updateActiveNav()
        updateScrollTopButton()
    })

    if (scrollTopButton) {
        scrollTopButton.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            })
        })
    }

    // ===== FILTRO DE PRODUTOS =====
    // Ao clicar em um filtro, marca o botão ativo e mostra/esconde os cards
    // conforme o atributo data-category de cada card bater com o data-filter do botão.
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const selectedFilter = button.dataset.filter

            filterButtons.forEach(filterButton => {
                filterButton.classList.toggle(
                    "active",
                    filterButton === button
                )
            })

            productCards.forEach(card => {
                const category = card.dataset.category
                const shouldShow =
                    selectedFilter === "all" ||
                    selectedFilter === category

                card.classList.toggle("hidden", !shouldShow)
            })
        })
    })

    // ===== ACCORDION (FAQ) =====
    // Abre um item por vez, fecha os demais e alterna o ícone entre "+" (fechado) e "-" (aberto)
    const updateAccordionState = (item, isOpen) => {
        const button = item.querySelector(".accordion-button")
        const icon = item.querySelector(".accordion-icon")

        item.classList.toggle("open", isOpen)

        if (button) {
            button.setAttribute("aria-expanded", String(isOpen))
        }

        if (icon) {
            icon.classList.toggle("ri-add-line", !isOpen)
            icon.classList.toggle("ri-subtract-line", isOpen)
        }
    }

    accordionItems.forEach(item => {
        const button = item.querySelector(".accordion-button")

        if (!button) {
            return
        }

        // Define o estado inicial do ícone com base na classe "open" já presente no HTML
        updateAccordionState(item, item.classList.contains("open"))

        button.addEventListener("click", () => {
            const wasOpen = item.classList.contains("open")

            // Fecha todos antes de abrir o clicado (comportamento tipo "sanfona exclusiva")
            accordionItems.forEach(otherItem => {
                updateAccordionState(otherItem, false)
            })

            if (!wasOpen) {
                updateAccordionState(item, true)
            }
        })
    })

    // ===== GALERIA + LIGHTBOX =====
    // Extrai imagem, texto alternativo, nome e descrição do item da galeria clicado.
    // data-name e data-description são novos atributos adicionados no HTML da galeria.
    const getGalleryImage = item => {
        const image = item.querySelector("img")

        return {
            source: item.dataset.image || image?.currentSrc || image?.src || "",
            alt: image?.alt || "Imagem da galeria Glow Magic",
            name: item.dataset.name || image?.alt || "Criação Glow Magic",
            description:
                item.dataset.description ||
                "Peça artesanal personalizada, feita com carinho e atenção aos detalhes."
        }
    }

    // Atualiza a imagem e as informações detalhadas exibidas dentro do lightbox
    const updateLightbox = () => {
        if (!lightboxImage || galleryItems.length === 0) {
            return
        }

        const galleryImage = getGalleryImage(galleryItems[currentGalleryIndex])

        lightboxImage.src = galleryImage.source
        lightboxImage.alt = galleryImage.alt

        // Preenche nome e descrição no bloco de informações do lightbox (novo)
        if (lightboxInfoName) {
            lightboxInfoName.textContent = galleryImage.name
        }

        if (lightboxInfoDescription) {
            lightboxInfoDescription.textContent = galleryImage.description
        }
    }

    // Abre o lightbox no índice clicado, salva o elemento com foco anterior (acessibilidade)
    // e move o foco para o botão de fechar
    const openLightbox = index => {
        if (!lightbox || galleryItems.length === 0) {
            return
        }

        lastFocusedElement = document.activeElement
        currentGalleryIndex = index
        updateLightbox()

        lightbox.classList.add("open")
        lightbox.setAttribute("aria-hidden", "false")
        document.body.classList.add("lightbox-open")

        lightboxClose?.focus()
    }

    // Fecha o lightbox, limpa a imagem e as informações, e devolve o foco ao elemento anterior
    const closeLightbox = () => {
        if (!lightbox) {
            return
        }

        lightbox.classList.remove("open")
        lightbox.setAttribute("aria-hidden", "true")
        document.body.classList.remove("lightbox-open")

        if (lightboxImage) {
            lightboxImage.src = ""
        }

        // Limpa também as informações detalhadas ao fechar (novo)
        if (lightboxInfoName) {
            lightboxInfoName.textContent = ""
        }

        if (lightboxInfoDescription) {
            lightboxInfoDescription.textContent = ""
        }

        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus()
        }
    }

    // Navegação circular: volta para a última imagem ao passar do início
    const showPreviousImage = () => {
        if (galleryItems.length === 0) {
            return
        }

        currentGalleryIndex =
            (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length

        updateLightbox()
    }

    // Navegação circular: volta para a primeira imagem ao passar do final
    const showNextImage = () => {
        if (galleryItems.length === 0) {
            return
        }

        currentGalleryIndex = (currentGalleryIndex + 1) % galleryItems.length

        updateLightbox()
    }

    // Cada item da galeria abre o lightbox no seu próprio índice
    galleryItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            openLightbox(index)
        })
    })

    lightboxClose?.addEventListener("click", closeLightbox)
    lightboxPrev?.addEventListener("click", showPreviousImage)
    lightboxNext?.addEventListener("click", showNextImage)

    // Fecha o lightbox ao clicar fora da imagem (no fundo escuro)
    lightbox?.addEventListener("click", event => {
        if (event.target === lightbox) {
            closeLightbox()
        }
    })

    // Atalhos de teclado: Esc fecha, setas navegam entre as imagens (só funciona com lightbox aberto)
    document.addEventListener("keydown", event => {
        if (!lightbox?.classList.contains("open")) {
            return
        }

        if (event.key === "Escape") {
            closeLightbox();
        }

        if (event.key === "ArrowLeft") {
            showPreviousImage();
        }

        if (event.key === "ArrowRight") {
            showNextImage();
        }
    })

    // ===== ESTADO INICIAL =====
    // Garante que a nav ativa e o botão de topo já iniciem no estado correto,
    // mesmo antes do primeiro evento de scroll do usuário.
    updateActiveNav()
    updateScrollTopButton()
})
