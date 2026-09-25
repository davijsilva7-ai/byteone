// Redireciona para a página de checkout (../comprar/comprar.html) com os parâmetros do produto
function irParaComprar(produto) {
  const params = new URLSearchParams({
    titulo: produto.titulo,
    preco: produto.preco,
    imagem: produto.imagem,
    vendas: produto.vendas
  });
  window.location.href = '../comprar/comprar.html?' + params.toString();
}

document.addEventListener('DOMContentLoaded', function () {

  // ==========================================
  // 1. TROCA DE ABAS E NAVEGAÇÃO
  // ==========================================
  var links = document.querySelectorAll('.abas a[data-alvo]');
  var secoes = document.querySelectorAll('.secao');
  var titulo = document.getElementById('titulo-pagina');
  var subtitulo = document.getElementById('subtitulo-pagina');

  var textos = {
    dashboard: ['Dashboard', 'Um resumo das suas vendas e do desempenho dos seus cursos.'],
    vendas: ['Vendas', 'Acompanhe cada venda dos seus cursos em um só lugar.'],
    produtos: ['Produtos', 'Gerencie os cursos que você vende na ByteHub.'],
    marketing: ['Marketing', 'Conteúdos prontos para divulgar seus cursos nas redes.'],
    financeiro: ['Financeiro', 'Seu saldo, sua chave PIX e o histórico de saques.'],
    perfil: ['Perfil', 'Suas informações pessoais e de contato.'],
    ajuda: ['Central de ajuda', 'Tire dúvidas rápidas ou fale com o nosso suporte.']
  };

  links.forEach(function (link) {
    link.addEventListener('click', function (evento) {
      evento.preventDefault();
      var alvo = link.getAttribute('data-alvo');

      secoes.forEach(function (secao) {
        secao.classList.toggle('ativa', secao.id === alvo);
      });

      links.forEach(function (l) {
        l.classList.toggle('selecionada', l.getAttribute('data-alvo') === alvo);
      });

      if (textos[alvo] && titulo && subtitulo) {
        titulo.textContent = textos[alvo][0];
        subtitulo.textContent = textos[alvo][1];
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // ==========================================
  // 2. FILTROS DA TELA DE VENDAS
  // ==========================================
  var pilulas = document.querySelectorAll('.pilula[data-filtro]');
  pilulas.forEach(function (pilula) {
    pilula.addEventListener('click', function () {
      pilulas.forEach(function (p) { p.classList.remove('pilula--ativa'); });
      pilula.classList.add('pilula--ativa');
    });
  });

  // ==========================================
  // 3. BOTÃO DE COPIAR LINK DE AFILIADO
  // ==========================================
  var botaoCopiar = document.querySelector('.campo-copia .botao--fantasma');
  if (botaoCopiar) {
    botaoCopiar.addEventListener('click', function () {
      var input = botaoCopiar.previousElementSibling;
      if (!input) return;
      input.select();
      var textoOriginal = botaoCopiar.textContent;
      try {
        navigator.clipboard.writeText(input.value);
      } catch (erro) {
        /* fallback para navegadores sem suporte */
      }
      botaoCopiar.textContent = 'Copiado!';
      setTimeout(function () { botaoCopiar.textContent = textoOriginal; }, 1500);
    });
  }

  // ==========================================
  // 4. GERENCIAMENTO DO PERFIL (LOCALSTORAGE)
  // ==========================================
  const campoNome = document.getElementById("perfil-nome");
  const campoEmail = document.getElementById("perfil-email");
  const campoTelefone = document.getElementById("perfil-telefone");
  const campoSobre = document.getElementById("perfil-sobre");
  const btnSalvar = document.getElementById("btn-salvar-perfil");
  const avatar = document.querySelector(".avatar--grande");

  // Atualiza as iniciais exibidas no avatar
  function atualizarAvatar(nome) {
    if (avatar && nome) {
      const iniciais = nome
        .trim()
        .split(" ")
        .filter(Boolean)
        .map(p => p[0].toUpperCase())
        .slice(0, 2)
        .join("");
      if (iniciais) avatar.textContent = iniciais;
    }
  }

  // Carrega os dados salvos no localStorage
  function carregarPerfil() {
    const dadosSalvos = localStorage.getItem("usuarioBytehub");

    if (dadosSalvos) {
      const dados = JSON.parse(dadosSalvos);

      if (campoNome && dados.nome !== undefined) campoNome.value = dados.nome;
      if (campoEmail && dados.email !== undefined) campoEmail.value = dados.email;
      if (campoTelefone && dados.telefone !== undefined) campoTelefone.value = dados.telefone;
      if (campoSobre && dados.sobre !== undefined) campoSobre.value = dados.sobre;

      atualizarAvatar(dados.nome);
    }
  }

  // Salva as alterações feitas no perfil
  if (btnSalvar) {
    btnSalvar.addEventListener("click", function (evento) {
      evento.preventDefault();

      const perfilAtualizado = {
        nome: campoNome ? campoNome.value : "",
        email: campoEmail ? campoEmail.value : "",
        telefone: campoTelefone ? campoTelefone.value : "",
        sobre: campoSobre ? campoSobre.value : ""
      };

      localStorage.setItem("usuarioBytehub", JSON.stringify(perfilAtualizado));
      atualizarAvatar(perfilAtualizado.nome);
      alert("Alterações salvas com sucesso!");
    });
  }

  // Executa o carregamento dos dados do perfil ao iniciar
  carregarPerfil();

});