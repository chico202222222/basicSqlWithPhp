let ultimaRequisicao = 0;
let tentativas = 0;
const LIMITE_TENTATIVAS = 5;
const TEMPO_BLOQUEIO = 30000; // 30 segundos
let bloqueadoAte = 0;

// Sanitizar entrada: remove tags HTML e caracteres perigosos
function sanitizar(valor) {
    return valor
        .trim()
        .replace(/</g, "")
        .replace(/>/g, "")
        .replace(/"/g, "")
        .replace(/'/g, "")
        .replace(/;/g, "");
}

// Validar email básico
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validar CPF básico (só formato)
function validarCPF(cpf) {
    return cpf.replace(/\D/g, "").length === 11;
}

async function gravar() {
    // Verificar bloqueio por excesso de tentativas
    if (Date.now() < bloqueadoAte) {
        const segundosRestantes = Math.ceil((bloqueadoAte - Date.now()) / 1000);
        mostrarMensagem("Muitas tentativas. Aguarde " + segundosRestantes + " segundos.", "erro");
        return;
    }

    // Rate limit: 3 segundos entre requisições
    if (Date.now() - ultimaRequisicao < 3000) {
        mostrarMensagem("Aguarde 3 segundos antes de tentar novamente.", "erro");
        return;
    }
    ultimaRequisicao = Date.now();

    var nome = sanitizar(document.getElementById("nome").value);
    var cpf = sanitizar(document.getElementById("cpf").value);
    var email = sanitizar(document.getElementById("email").value);
    var senha = document.getElementById("senha").value; // senha não sanitiza para não alterar o valor

    // Validar campos vazios
    if (!nome || !cpf || !email || !senha) {
        mostrarMensagem("Preencha todos os campos!", "erro");
        return;
    }

    // Validar email
    if (!validarEmail(email)) {
        mostrarMensagem("Email inválido!", "erro");
        return;
    }

    // Validar CPF
    if (!validarCPF(cpf)) {
        mostrarMensagem("CPF inválido! Digite os 11 dígitos.", "erro");
        return;
    }

    // Validar tamanho dos campos para evitar payloads gigantes
    if (nome.length > 100 || cpf.length > 14 || email.length > 100 || senha.length > 100) {
        mostrarMensagem("Dados inválidos!", "erro");
        return;
    }

    var senha_criptografada = btoa(senha);

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // Timeout de 8 segundos

        const response = await fetch("php/gravar.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome: nome,
                cpf: cpf,
                email: email,
                senha: senha_criptografada
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        // Verificar se a resposta é válida
        if (!response.ok) {
            throw new Error("Erro HTTP: " + response.status);
        }

        const result = await response.json();

        if (result.sucesso) {
            tentativas = 0; // Resetar tentativas em caso de sucesso
            mostrarMensagem(result.mensagem, "sucesso");
            limpar();
        } else {
            // Contar tentativas falhas
            tentativas++;
            if (tentativas >= LIMITE_TENTATIVAS) {
                bloqueadoAte = Date.now() + TEMPO_BLOQUEIO;
                tentativas = 0;
                mostrarMensagem("Muitas tentativas falhas. Aguarde 30 segundos.", "erro");
                return;
            }
            mostrarMensagem(result.mensagem, "erro");
        }

    } catch (error) {
        if (error.name === "AbortError") {
            mostrarMensagem("A requisição demorou muito. Tente novamente.", "erro");
        } else {
            mostrarMensagem("Erro na requisição.", "erro");
        }
        console.error(error);
    }
}

function limpar() {
    document.getElementById("form-cadastro").reset();
    document.getElementById("msg").innerHTML = "";
    document.getElementById("msg").className = "msg";
}

function mostrarMensagem(texto, tipo) {
    var msgElement = document.getElementById("msg");
    msgElement.innerHTML = texto;
    msgElement.className = "msg " + tipo;
}