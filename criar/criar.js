// Alterna a visibilidade da senha entre texto e asteriscos
function mostrarSenha() {
    const inputSenha = document.getElementById("senha");
    const iconeSenha = document.getElementById("iconeSenha");

    if (inputSenha.type === "password") {
        inputSenha.type = "text";
        iconeSenha.src = "../icons/eye.svg";
    } else {
        inputSenha.type = "password";
        iconeSenha.src = "../icons/eye-slash.svg";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.querySelector(".formulario");

    if (formulario) {
        formulario.addEventListener("submit", (event) => {
            event.preventDefault();

            const novoUsuario = {
                nome: document.getElementById("nome").value,
                email: document.getElementById("email").value,
                telefone: document.getElementById("telefone").value,
                interesse: document.getElementById("interesse").value,
                senha: document.getElementById("senha").value,
                sobre: "" // já deixamos o campo pronto pra ser editado depois no perfil
            };

            localStorage.setItem("usuarioBytehub", JSON.stringify(novoUsuario));

            alert("Conta criada com sucesso!");

            window.location.href = formulario.getAttribute("action");
        });
    }
});