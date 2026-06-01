<?php
header("Content-Type: application/json");

// RATE LIMITING BÁSICO
session_start();
$ip = $_SERVER['REMOTE_ADDR'];
$chave = "req_" . $ip;

if (!isset($_SESSION[$chave])) {
    $_SESSION[$chave] = array();
}

// Remover requisições antigas (mais de 1 minuto)
$_SESSION[$chave] = array_filter($_SESSION[$chave], function($t) {
    return (time() - $t) < 60;
});

// Se ultrapassou 10 requisições em 1 minuto, rejeitar
if (count($_SESSION[$chave]) >= 10) {
    http_response_code(429);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Limite de requisições excedido. Tente mais tarde."
    ]);
    exit;
}

// Adicionar requisição atual ao histórico
$_SESSION[$chave][] = time();

// Receber dados
$dados = json_decode(file_get_contents("php://input"), true);

if (!$dados) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Dados inválidos"
    ]);
    exit;
}

$nome = trim($dados["nome"] ?? "");
$cpf = trim($dados["cpf"] ?? "");
$email = trim($dados["email"] ?? "");
$senha = $dados["senha"] ?? "";

// Validar campos
if (empty($nome) || empty($cpf) || empty($email) || empty($senha)) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Preencha todos os campos!"
    ]);
    exit;
}

// Descriptografar senha
$senhaDescriptografada = base64_decode($senha);

// Gerar hash da senha
$senhaHash = password_hash($senhaDescriptografada, PASSWORD_BCRYPT);

// Conectar ao banco de dados
$con = mysqli_connect("localhost", "root", "PUC@1234", "aula11");

if (!$con) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao conectar ao banco de dados"
    ]);
    exit;
}

// Prepared statement para evitar SQL injection
$query = "INSERT INTO cadastro (nome, cpf, email, senha) VALUES (?, ?, ?, ?)";
$stmt = mysqli_prepare($con, $query);

if (!$stmt) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao preparar a consulta"
    ]);
    mysqli_close($con);
    exit;
}

// Bind dos parâmetros
mysqli_stmt_bind_param($stmt, "ssss", $nome, $cpf, $email, $senhaHash);

// Executar
if (mysqli_stmt_execute($stmt)) {
    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Cadastro realizado com sucesso!"
    ]);
} else {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao gravar dados: " . mysqli_stmt_error($stmt)
    ]);
}

// Fechar conexões
mysqli_stmt_close($stmt);
mysqli_close($con);
?>