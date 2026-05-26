
async function gravar(){

    var form = document.getElementById("form-cadastro");
    var dados = new FormData(form);
    if(dados.get("nome") === "" || dados.get("cpf") === "" || dados.get("senha") === ""){
        document.getElementById("msg").innerHTML = "Preencha todos os campos!";
        return;
    }

    const response = await fetch("php/gravar.php", {
        method: "post",
        body: dados
    });

    const result = await response.text();
    document.getElementById("msg").innerHTML = result;
}
