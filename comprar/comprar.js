/**
 * comprar.js — página de finalização de compra do Bytehub
 *
 * O que este arquivo faz:
 *  1. Preenche nome, e-mail e WhatsApp com os dados do cadastro (localStorage)
 *  2. Preenche o resumo do pedido com os dados que vêm na URL
 *     (comprar.html?titulo=...&preco=...&imagem=...&vendas=...)
 *  3. Alterna as abas de pagamento (cartão, pix, boleto)
 *  4. Valida e finaliza a compra ao enviar o formulário
 */

// Para mandar o cliente para outra página depois da compra,
// coloque o caminho aqui (ex: "../pages/meus-cursos.html").
// Deixando vazio, ele permanece na página.
const PAGINA_APOS_COMPRA = "";

const TEXTOS_BOTAO = {
    cartao: "Comprar agora",
    pix: "Confirmar compra",
    boleto: "Gerar Boleto bancário"
};

const MENSAGENS_SUCESSO = {
    cartao: "Compra aprovada! Você já tem acesso ao curso.",
    pix: "Pedido confirmado! Pague com o QR Code Pix para liberar o acesso.",
    boleto: "Boleto gerado! Ele vence em 3 dias úteis."
};

document.addEventListener("DOMContentLoaded", () => {
    preencherDadosDoCliente();
    preencherResumoDoProduto();
    configurarAbasDePagamento();
    configurarEnvioDoFormulario();
});

/* ------------------------------------------------------------------ */
/* 1. Dados do cliente (vindos do cadastro)                            */
/* ------------------------------------------------------------------ */
function preencherDadosDoCliente() {
    let usuario = null;

    try {
        usuario = JSON.parse(localStorage.getItem("usuarioBytehub"));
    } catch (erro) {
        return; // dado corrompido: o cliente preenche manualmente
    }

    if (!usuario) return; // sem cadastro: o cliente preenche manualmente

    const campos = {
        "campo-nome": usuario.nome,
        "campo-email": usuario.email,
        "campo-whats": usuario.telefone
    };

    Object.entries(campos).forEach(([id, valor]) => {
        const campo = document.getElementById(id);
        if (!campo || !valor) return;

        campo.value = valor;

        // Dispara o "oninput" do campo para a máscara do WhatsApp formatar o número
        campo.dispatchEvent(new Event("input"));
    });
}

/* ------------------------------------------------------------------ */
/* 2. Resumo do pedido (vindo da URL)                                  */
/* ------------------------------------------------------------------ */
function preencherResumoDoProduto() {
    const params = new URLSearchParams(window.location.search);

    const titulo = params.get("titulo");
    const preco = params.get("preco");
    const imagem = params.get("imagem");
    const vendas = params.get("vendas");

    const elTitulo = document.getElementById("titulo-produto");
    const elImagem = document.getElementById("img-produto");
    const elPreco = document.getElementById("preco-produto");
    const elProvaSocial = document.getElementById("prova-social-produto");
    const elParcelas = document.getElementById("campo-parcelas");

    if (titulo) {
        elTitulo.textContent = titulo;
        document.title = "Finalizar compra — " + titulo;
    }

    if (imagem) {
        elImagem.src = imagem;
        elImagem.alt = titulo || "Curso";
    }

    if (preco) {
        elPreco.textContent = "R$ " + preco;
    }

    if (vendas) {
        elProvaSocial.textContent = vendas + " alunos já se matricularam";
    }

    // Recalcula as parcelas com base no preço recebido
    if (preco && elParcelas) {
        const precoNumerico = parseFloat(
            preco.replace(/\./g, "").replace(",", ".")
        );

        if (!isNaN(precoNumerico)) {
            elParcelas.innerHTML = "";

            for (let i = 1; i <= 6; i++) {
                const valorParcela = (precoNumerico / i).toFixed(2).replace(".", ",");
                const option = document.createElement("option");
                option.value = i;
                option.textContent = i === 1
                    ? `1x de R$ ${valorParcela} (À vista)`
                    : `${i}x de R$ ${valorParcela} sem juros`;
                elParcelas.appendChild(option);
            }
        }
    }
}

/* ------------------------------------------------------------------ */
/* 3. Abas de pagamento                                                */
/* ------------------------------------------------------------------ */
function configurarAbasDePagamento() {
    const abas = document.querySelectorAll(".aba-pg");
    const paineis = document.querySelectorAll(".painel-pagamento");
    const textoBotao = document.getElementById("texto-botao-finalizar");

    abas.forEach((aba) => {
        aba.addEventListener("click", () => {
            const tipo = aba.dataset.pg;

            abas.forEach((a) => a.classList.toggle("ativa", a === aba));

            paineis.forEach((painel) => {
                const ativo = painel.dataset.painel === tipo;
                painel.classList.toggle("ativa", ativo);
                painel.hidden = !ativo; // o HTML usa o atributo "hidden" nos painéis de pix e boleto
            });

            textoBotao.textContent = TEXTOS_BOTAO[tipo] || "Comprar agora";
        });
    });
}

/* ------------------------------------------------------------------ */
/* 4. Envio do formulário                                              */
/* ------------------------------------------------------------------ */
function configurarEnvioDoFormulario() {
    const formulario = document.getElementById("form-compra");
    if (!formulario) return;

    formulario.addEventListener("submit", (event) => {
        event.preventDefault(); // evita recarregar a página

        const abaAtiva = document.querySelector(".aba-pg.ativa");
        const tipo = abaAtiva ? abaAtiva.dataset.pg : "cartao";

        // CPF
        const cpf = document.getElementById("campo-cpf").value.replace(/\D/g, "");
        if (cpf.length !== 11) {
            avisar("Digite um CPF com 11 números.", "campo-cpf");
            return;
        }

        // Cartão: os campos não são "required" no HTML (porque pix e boleto não usam),
        // então a validação é feita aqui, só quando a aba de cartão está ativa
        if (tipo === "cartao") {
            const numero = document.getElementById("campo-num-cartao").value;
            const validade = document.getElementById("campo-validade").value;
            const cvv = document.getElementById("campo-cvv").value;

            if (numero.length < 13) {
                avisar("Digite o número completo do cartão.", "campo-num-cartao");
                return;
            }

            if (!validadeEhValida(validade)) {
                avisar("Cartão vencido ou validade inválida (use MM/AA).", "campo-validade");
                return;
            }

            if (cvv.length !== 3) {
                avisar("Digite o CVV com 3 números.", "campo-cvv");
                return;
            }
        }

        salvarPedido(tipo);

        alert(MENSAGENS_SUCESSO[tipo]);

        if (PAGINA_APOS_COMPRA) {
            window.location.href = PAGINA_APOS_COMPRA;
        }
    });
}

function avisar(mensagem, idCampo) {
    alert(mensagem);
    const campo = document.getElementById(idCampo);
    if (campo) campo.focus();
}

// Aceita "MM/AA" com mês de 01 a 12 e que ainda não tenha vencido
function validadeEhValida(valor) {
    const partes = valor.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    if (!partes) return false;

    const mes = parseInt(partes[1], 10);
    const ano = 2000 + parseInt(partes[2], 10);

    // O cartão vale até o fim do mês informado
    const primeiroDiaDoMesSeguinte = new Date(ano, mes, 1);
    return primeiroDiaDoMesSeguinte > new Date();
}

// Guarda o pedido no navegador (por enquanto, sem backend).
// Dados do cartão NUNCA são salvos.
function salvarPedido(tipo) {
    let compras = [];

    try {
        compras = JSON.parse(localStorage.getItem("comprasBytehub")) || [];
    } catch (erro) {
        compras = [];
    }

    compras.push({
        produto: document.getElementById("titulo-produto").textContent,
        preco: document.getElementById("preco-produto").textContent,
        pagamento: tipo,
        parcelas: tipo === "cartao"
            ? document.getElementById("campo-parcelas").value
            : "1",
        data: new Date().toISOString()
    });

    localStorage.setItem("comprasBytehub", JSON.stringify(compras));
}
/* ------------------------------------------------------------------ */
/* 4. Envio do formulário                                             */
/* ------------------------------------------------------------------ */
function configurarEnvioDoFormulario() {
    const formulario = document.getElementById("form-compra");
    if (!formulario) return;

    formulario.addEventListener("submit", (event) => {
        event.preventDefault(); // evita recarregar a página

        const abaAtiva = document.querySelector(".aba-pg.ativa");
        const tipo = abaAtiva ? abaAtiva.dataset.pg : "cartao";

        // Validação do CPF
        const cpf = document.getElementById("campo-cpf").value.replace(/\D/g, "");
        if (cpf.length !== 11) {
            avisar("Digite um CPF com 11 números.", "campo-cpf");
            return;
        }

        // Validação do Cartão
        if (tipo === "cartao") {
            const numero = document.getElementById("campo-num-cartao").value;
            const validade = document.getElementById("campo-validade").value;
            const cvv = document.getElementById("campo-cvv").value;

            if (numero.length < 13) {
                avisar("Digite o número completo do cartão.", "campo-num-cartao");
                return;
            }

            if (!validadeEhValida(validade)) {
                avisar("Cartão vencido ou validade inválida (use MM/AA).", "campo-validade");
                return;
            }

            if (cvv.length !== 3) {
                avisar("Digite o CVV com 3 números.", "campo-cvv");
                return;
            }
        }

        salvarPedido(tipo);

        // Ao invés de alert() e redirecionamento direto, chama o Pop-up
        exibirPopupSucesso(MENSAGENS_SUCESSO[tipo]);
    });
}

function exibirPopupSucesso(mensagem) {
    const popup = document.getElementById("popup-sucesso");
    const elTexto = document.getElementById("texto-popup");
    const elContador = document.getElementById("contador-popup");
    
    // Atualiza a mensagem com base no método de pagamento
    elTexto.textContent = mensagem;
    
    // Remove a classe 'hidden' para exibir o modal na tela
    popup.classList.remove("hidden");

    // Inicia a contagem de 5 segundos
    let segundosRestantes = 5;
    elContador.textContent = segundosRestantes;

    const intervalo = setInterval(() => {
        segundosRestantes--;
        elContador.textContent = segundosRestantes;

        // Quando zerar, redireciona para index.html
        if (segundosRestantes <= 0) {
            clearInterval(intervalo);
            window.location.href = "../menu/index.html";
        }
    }, 1000);
}