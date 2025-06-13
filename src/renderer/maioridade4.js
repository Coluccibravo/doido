

window.addEventListener("DOMContentLoaded", () => {
    const cpf = 57724411085;
    let cliente = null;  // Variável para guardar os dados do cliente

    fetch(`http://localhost:8080/apiCliente/buscarporcpf/${cpf}`)
        .then(response => {
            if (!response.ok) throw new Error("Erro na requisição: " + response.status);
            return response.json();
        })
        .then(data => {
            cliente = data; // Guarda os dados na variável externa

            document.getElementById("nomeCompleto").value = data.nome || "";
            document.getElementById("nivelSuporte").value = data.nivelSuporte || "";
            document.getElementById("comorbidade").value = data.comorbidade || "";
            document.getElementById("categoria1").value = data.categoriaIniciada || "";
            document.getElementById("categoria2").value = data.categoriaFinalizada || "";
            document.getElementById("meta").value = data.meta || "";
            document.getElementById("corFavorita").value = data.cor || "";
        })
        .catch(error => {
            console.error("Erro ao buscar dados:", error);
        });

    document.getElementById("btnAtualizar").addEventListener("click", () => {

        const clienteAtualizado = {
            ...cliente,
            id: cliente.id,  // importante mandar o id para atualizar
            nome: document.getElementById("nomeCompleto").value,
            nivelSuporte: document.getElementById("nivelSuporte").value,
            comorbidade: document.getElementById("comorbidade").value,
            categoriaIniciada: document.getElementById("categoria1").value,
            categoriaFinalizada: document.getElementById("categoria2").value,
            meta: document.getElementById("meta").value,
            cor: document.getElementById("corFavorita").value
        };

        fetch("http://localhost:8080/apiCliente/atualizar", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(clienteAtualizado)
})
        .then(response => {
            if (!response.ok) throw new Error("Erro ao atualizar: " + response.status);
            alert("Dados atualizados com sucesso!");
        })
        .catch(error => {
            console.error("Erro ao atualizar cliente:", error);
            alert("Erro ao atualizar os dados.");
        });
    });
});
