window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const cpf = params.get("cpf");

    if (!cpf) {
        console.warn("CPF não encontrado na URL.");
        return;
    }

    fetch(`http://localhost:8080/apiCliente/buscarporcpf/${cpf}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erro na requisição: ' + response.status);
            }
            return response.json();
        })
        .then((data) => {
            document.getElementById('nome').value = data.nome;
            clienteId = data.id;
    fetch(`http://localhost:8080/apiRenda/buscarPorClienteId/${clienteId}`)
     .then((response) => {
            if (!response.ok) {
                throw new Error('Erro na requisição: ' + response.status);
            }
            return response.json();
        })
        .then((data) => {
            document.getElementById('percentual').value = data.persentualRendaInvestimentos + "%";
            document.getElementById('total').value = "R$" + " " + data.rendaTotalInvestimentos;
        })
    })
});