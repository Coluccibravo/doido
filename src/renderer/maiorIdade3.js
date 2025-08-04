/* eslint-disable prettier/prettier */
document.getElementById("fotohome").addEventListener("click", () => {
    window.location.href = "login.html";
});

window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const cpf = params.get("cpf");

    if (!cpf) {
        console.warn("CPF não encontrado na URL.");
        return;
    }

    let cartoes = [];
    let clienteId = null;

    fetch(`http://localhost:8080/apiCliente/buscarporcpf/${cpf}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erro na requisição do cliente: ' + response.status);
            }
            return response.json();
        })
        .then((clienteData) => {
            clienteId = clienteData.id;

            // Buscar cartões
            return fetch(`http://localhost:8080/apiCartao/buscarPorClienteId/${clienteId}`);
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erro na requisição de cartões: ' + response.status);
            }
            return response.json();
        })
        .then((cartaoData) => { 
            cartoes = cartaoData;
            const select = document.getElementById('selectCard');
            select.innerHTML = '<option value="">Selecione um cartão</option>';

            cartaoData.forEach((element) => {
                let option = document.createElement("option");
                option.value = element.tipo;
                option.text = element.tipo;
                select.appendChild(option);
            });

            // Evento de seleção de cartão
            document.getElementById('selectCard').addEventListener('change', function () {
                const tipoSelecionado = this.value;
                const cartaoSelecionado = cartoes.find(c => c.tipo === tipoSelecionado);

                // eslint-disable-next-line prettier/prettier
                if (cartaoSelecionado) {
                    let validade = cartaoSelecionado.datavalidade || '';
                    if (validade.includes('/')) {
                        const partes = validade.split('/');
                        if (partes.length === 3) {
                            validade = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
                        }
                    }

;
                    document.getElementById('securityCode').value = cartaoSelecionado.cvv || '';
                    document.getElementById('validity').value = validade;
                    document.getElementById("cardNumber").value = cartaoSelecionado.numero || '';
                    document.getElementById("validadeCartao").value = cartaoSelecionado.validade || '';
                } else {
                    // Limpa os campos
                    document.getElementById('numero').value = '';
                    document.getElementById('securityCode').value = '';
                    document.getElementById('validity').value = '';
                    document.getElementById("numeroCartao").value = '';
                    document.getElementById("validadeCartao").value = '';
                }
            });

            // Agora busca a renda
            return fetch(`http://localhost:8080/apiRenda/buscarPorClienteId/${clienteId}`);
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erro na requisição da renda: ' + response.status);
            }
            return response.json();
        })
        .then((rendaData) => {
            
            document.getElementById('plans').value = rendaData.plano || '';
            document.getElementById('account').value = rendaData.tipo || '';
        })
        .catch((error) => {
            console.error('Erro geral na obtenção de dados:', error);
        });

    // Botões de navegação
    document.getElementById('continuar').addEventListener('click', () => {
        window.location.href = `maiorIdade4.html?cpf=${cpf}`;
    });

    document.getElementById('voltar').addEventListener('click', () => {
        window.location.href = `maiorIdade2.html?cpf=${cpf}`;
    });
});