document.getElementById("fotohome").addEventListener("click", () => {
    window.location.href = "login.html"
})
window.addEventListener('DOMContentLoaded', () => {
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
            const clienteId = data.id;

            // Buscar renda
            return fetch(`http://localhost:8080/apiRenda/buscarPorClienteId/${clienteId}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Erro na requisição: ' + response.status);
                    }
                    return response.json();
                })
                .then((rendaData) => {
                    document.getElementById('plans').value = rendaData.plano;
                    document.getElementById('account').value = rendaData.tipo;


                    return fetch(`http://localhost:8080/apiCartao/buscarPorClienteId/${clienteId}`);
                })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Erro na requisição do cartão: ' + response.status);
                    }
                    return response.json();
                })
                .then((cartaoData) => {
                    let tipo1 = "";
                    let tipo2 = "";
                    if (cartaoData.debito == 1) {
                        tipo1 = "Débito";

                    }
                    if (cartaoData.credito == 1) {
                        tipo2 = "Crédito";
                    }
                    let validade = cartaoData.datavalidade || '';
                    if (validade) {
                        const partes = validade.split('/');
                        if (partes.length === 3) {
                            validade = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
                        }
                    }
                    document.getElementById('selectCard').value = tipo1 + " " + "e" + " " + tipo2;
                    document.getElementById('securityCode').value = cartaoData.cvv || '';
                    document.getElementById('validity').value = validade;
                    document.getElementById('cardNumber').value = cartaoData.numero || '';
                });
        })
        .catch((error) => {
            console.error('Erro ao buscar dados:', error);
        });
    document.getElementById('continuar').addEventListener('click', () => {
        window.location.href = `maiorIdade4.html?cpf=${cpf}`;
    });
    document.getElementById('voltar').addEventListener('click', () => {
        window.location.href = `maiorIdade2.html?cpf=${cpf}`;
    });
});

