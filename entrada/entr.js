
// Alterna a visibilidade da senha entre texto e asteriscos
function mostrarSenha() {
    const inputSenha = document.getElementById("senha");
    const iconeSenha = document.getElementById("iconeSenha");

    if (inputSenha.type === "password") {
        inputSenha.type = "text";
        iconeSenha.style.opacity = "1";
    } else {
        inputSenha.type = "password";
        iconeSenha.style.opacity = "0.7";
    }
}
function mostrarSenha() {
    const inputSenha = document.getElementById("senha");
    const iconeSenha = document.getElementById("iconeSenha");

    if (inputSenha.type === "password") {
        inputSenha.type = "text";
        iconeSenha.style.opacity = "1";
    } else {
        inputSenha.type = "password";
        iconeSenha.style.opacity = "0.7";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById("formLogin");

    if (formLogin) {
        formLogin.addEventListener("submit", (event) => {
            // Bloqueia o recarregamento/redirecionamento padrão da tela
            event.preventDefault();

            const emailInput = document.getElementById("email").value.trim();
            const senhaInput = document.getElementById("senha").value.trim();

            // Busca os dados salvos no cadastro
            const usuarioSalvo = localStorage.getItem("usuarioBytehub");

            if (!usuarioSalvo) {
                alert("Nenhuma conta cadastrada encontrada! Crie uma conta primeiro.");
                return;
            }

            // Converte o texto do localStorage para objeto JS
            const usuario = JSON.parse(usuarioSalvo);

            // Validação estrita
            if (emailInput === usuario.email && senhaInput === usuario.senha) {
                alert(`Login realizado com sucesso! Bem-vindo, ${usuario.nome}.`);
                // Redireciona APENAS se os dados estiverem corretos
                window.location.href = "../menu/index.html";
            } else {
                alert("E-mail ou senha incorretos!");
            }
        });
    }
});