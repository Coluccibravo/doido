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

            Promise.all([
                fetch(`http://localhost:8080/apiExtrato/clienteEnvio/${clienteId}`).then(res => res.json()),
                fetch(`http://localhost:8080/apiExtrato/clienteRecebido/${clienteId}`).then(res => res.json())
            ])
                .then(([envios, recebidos]) => {
                    const tbody = document.querySelector("#extrato tbody");
                    tbody.innerHTML = ""; // Limpa antes de renderizar

                    const transacoes = [
                        ...envios.map(item => ({ ...item, tipo: "envio" })),
                        ...recebidos.map(item => ({ ...item, tipo: "recebido" }))
                    ];

                    function parseData(dataStr) {
                        const [data, hora] = dataStr.split(" ");
                        const [dia, mes, ano] = data.split("/");
                        const [horaStr, minutoStr] = hora.split(":");
                        return new Date(ano, mes - 1, dia, horaStr, minutoStr);
                    }

                    // Ordenar por data (mais recente primeiro)
                    transacoes.sort((a, b) => parseData(b.data) - parseData(a.data));

                    // Calcular saldo atual
                    let saldo = 0;
                    transacoes.forEach(item => {
                        const valor = parseFloat(item.valor);
                        saldo += item.tipo === "recebido" ? valor : -valor;
                    });

                    // Exibir saldo no input
                    document.getElementById("saldo").value = `R$: ${saldo.toFixed(2)}`;

                    // Exibir última movimentação (opcional)
                    if (transacoes.length > 0) {
                        const ultima = transacoes[0];
                        const sinal = ultima.tipo === "envio" ? "-" : "+";
                        document.getElementById("lastMoviment").value = `R$: ${sinal}${ultima.valor}`;
                    }

                    // Exibir transações
                    transacoes.forEach(item => {
                        const tr = document.createElement("tr");
                        tr.style.backgroundColor = item.tipo === "envio" ? "#ffcccc" : "#ccffcc";
                        const sinal = item.tipo === "envio" ? "-" : "+";
                        tr.innerHTML = `
            <td>${item.data}</td>
            <td>R$: ${sinal}${item.valor}</td>
        `;
                        tbody.appendChild(tr);
                    });
                })
                .catch(error => {
                    console.error('Erro ao carregar transações:', error);
                });

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
