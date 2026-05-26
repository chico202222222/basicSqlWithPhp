<?php

$nome = $_POST["nome"];
$cpf = $_POST["cpf"];
$senha = $_POST["senha"];

$con = mysqli_connect("localhost", "root", "PUC@1234", "aula11");

if (!$con) {
    echo "<p>Erro ao conectar ao banco de dados: " . mysqli_connect_error() . "</p>";
    exit;
}

$query = "INSERT INTO cadastro (nome, cpf, senha) VALUES (?, ?, ?)";
$stmt = mysqli_prepare($con, $query);

if ($stmt) {
    mysqli_stmt_bind_param($stmt, "sss", $nome, $cpf, $senha);

    if (mysqli_stmt_execute($stmt)) {
        echo "<p>Dados gravados com sucesso!</p>";
    } else {
        echo "<p>Erro ao gravar dados: " . mysqli_stmt_error($stmt) . "</p>";
    }

    mysqli_stmt_close($stmt);
} else {
    echo "<p>Erro ao preparar a consulta: " . mysqli_error($con) . "</p>";
}

mysqli_close($con);
?>