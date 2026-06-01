// RATE LIMITING BÁSICO
let ultimaRequisicao = 0;
const INTERVALO_MINIMO = 2000; // 2 segundos entre requisições

async function gravar() {
    const agora = Date.now();
    
    // Verificar se passou tempo suficiente desde a última requisição
    if (agora - ultimaRequisicao < INTERVALO_MINIMO) {
        document.getElementById("msg").innerHTML = "Aguarde alguns segundos antes de tentar novamente.";
        return;
    }
    
    ultimaRequisicao = agora;

    var form = document.getElementById("form-cadastro");
    var nome = document.getElementById("nome").value.trim();
    var cpf = document.getElementById("cpf").value.trim();
    var email = document.getElementById("email").value.trim();
    var senha = document.getElementById("senha").value;

    // Validar campos vazios
    if (!nome || !cpf || !email || !senha) {
        document.getElementById("msg").innerHTML = "Preencha todos os campos!";
        return;
    }

    // Criptografar senha (Base64)
    var senhaCriptografada = btoa(senha);

    // Preparar dados
    var dados = {
        nome: nome,
        cpf: cpf,
        email: email,
        senha: senhaCriptografada
    };

    try {
        const response = await fetch("php/gravar.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const result = await response.json();
        document.getElementById("msg").innerHTML = result.mensagem;

        if (result.sucesso) {
            limpar();
        }

    } catch (error) {
        console.error("Erro:", error);
        document.getElementById("msg").innerHTML = "Ocorreu um erro ao processar a requisição.";
    }
}

function limpar() {
    document.getElementById("form-cadastro").reset();
    document.getElementById("msg").innerHTML = "";
}