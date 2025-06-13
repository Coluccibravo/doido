document.getElementById("fotohome").addEventListener("click", () => {
    window.location.href = "login.html"
})

window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const cpf = params.get("cpf");

    if (!cpf) {
        console.warn("CPF não encontrado na URL.");
        return;
    }

    document.getElementById('continuar').addEventListener('click', () => {
       window.location.href = `maiorIdade3.html?cpf=${cpf}`;
    });

    document.getElementById('voltar').addEventListener('click', () => {
        window.location.href = `maiorIdade1.html?cpf=${cpf}`;
    });

    let clienteId;

    fetch(`http://localhost:8080/apiCliente/buscarporcpf/${cpf}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erro na requisição: ' + response.status);
            }
            return response.json();
        })
        .then((data) => {
            document.getElementById('nome').value = data.nome;
            clienteId = data.id; // Aqui a variável recebe valor

            
            return fetch(`http://localhost:8080/apiRenda/buscarPorClienteId/${clienteId}`);
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erro na requisição: ' + response.status);
            }
            return response.json();
        })
        .then((data) => {
            
            
            document.getElementById('percentual').value = data.persentualRendaInvestimentos + "%";
            document.getElementById('total').value = "R$ " + data.rendaTotalInvestimentos;
            document.getElementById('adicionais').value = data.perfildoinvestidor;
            document.getElementById('agencia').value = data.agencia;
            document.getElementById('plano').value = data.plano;
            document.getElementById('tipo').value = data.tipo;
            document.getElementById('saldo').value = data.saldo;
            adicionarItem(); // ✅ Agora chamamos depois que clienteId está pronto
        })
        .catch((error) => {
            console.error('Erro ao buscar dados:', error);
        });

    function adicionarItem() {

        fetch(`http://localhost:8080/apiRenda/buscarPorClienteId/${clienteId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erro na requisição: ' + response.status);
                }
                return response.json();
            })
            .then((data) => {
                const lista = document.getElementById("minhaLista");

                if (data.acoes == 1) {
                    const li = document.createElement("li");
                    li.textContent = "Ações";
                    lista.appendChild(li);
                }
                if (data.fundoimobiliario == 1) {
                    const li = document.createElement("li");
                    li.textContent = "Fundos Imobiliários";
                    lista.appendChild(li);
                }
                if (data.poupanca == 1) {
                    const li = document.createElement("li");
                    li.textContent = "Poupança";
                    lista.appendChild(li);
                }
                if (data.criptomoedas == 1) {
                    const li = document.createElement("li");
                    li.textContent = "Criptomoedas";
                    lista.appendChild(li);
                }
            })
            .catch((error) => {
                console.error('Erro ao buscar dados:', error);
            });
    }
});
