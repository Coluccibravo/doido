/* eslint-disable prettier/prettier */
document.getElementById("fotohome").addEventListener("click", () => {
    window.location.href = "login.html"
})

const params = new URLSearchParams(window.location.search);
const cpf = params.get("cpf");

window.addEventListener('DOMContentLoaded', () => {
    if (!cpf) {
        console.error('Parâmetro cpf não encontrado na URL.');
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
            function formatarCPF(cpf) {
                cpf = cpf.toString().padStart(11, '0');
                return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
            }

            function formatarRG(rg) {
                rg = rg.toString().padStart(9, '0');
                return rg.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
            }

            function converterParaInputDate(dataBr) {
                if (!dataBr || !dataBr.includes('/')) return "";
                const [dia, mes, ano] = dataBr.split('/');
                return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
            }

            document.getElementById("inputnome").value = data.nome;
            document.getElementById("inputcpf").value = formatarCPF(data.cpf);
            document.getElementById("inputrg").value = formatarRG(data.rg);
            document.getElementById("inputestado").value = data.estadoCivil;
            document.getElementById("inputdata").value = converterParaInputDate(data.datanascimento1); // ⬅️ Aqui foi alterado
            document.getElementById("inputsexo").value = data.sexo;
            document.getElementById("inputemail").value = data.email;
            document.getElementById("inputtelefone").value = data.telefone;
            document.getElementById("inputcelular").value = data.celular;
            clienteId = data.id;
            const cpfEncode = encodeURIComponent(data.cpf)
            document.getElementById("continuar").addEventListener('click', () => {
            window.location.href = `maiorIdade2.html?cpf=${cpfEncode}`;
})

            fetch(`http://localhost:8080/apiEndereco/buscarPorClienteId/${clienteId}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Erro na requisição: ' + response.status);
                    }
                    return response.json();
                })
                .then((data) => {
                    document.getElementById("inputcep").value = data.cep;
                    document.getElementById("inputnumero").value = data.numero;
                    document.getElementById("inputcomplemento").value = data.complemento;
                    document.getElementById("inputbairro").value = data.bairro;
                    document.getElementById("inputcidade").value = data.cidade;
                    document.getElementById("inputestado2").value = data.estado;
                    document.getElementById("inputrua").value = data.rua;
                })
                .catch((error) => {
                    console.error('Erro ao buscar dados do cliente:', error);
                })
            fetch(`http://localhost:8080/apiRenda/buscarPorClienteId/${clienteId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erro na requisição: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    document.getElementById("inputrenda").value = "R$:" + " " + data.rendaMensal;
                    document.getElementById("inputpessoas").value = data.pessoasDependentes;
                    document.getElementById("rendaTotalresidencial").value = "R$:" + " " +data.rendaTotalresidencial;
                })
                .catch(error => {
                    console.error('Erro ao buscar dados:', error);
                });


        });


});

document.getElementById("btnAtualizar").addEventListener("click", async () => {
    if (!clienteId) {
        console.error("ID do cliente não encontrado.");
        return;
    }

    const dataOriginal = document.getElementById("inputdata").value; // "1962-03-08"
    const [ano, mes, dia] = dataOriginal.split("-");
    const dataFormatada = `${dia}/${mes}/${ano}`;   

    const cliente = {
        id: clienteId,
        nome: document.getElementById("inputnome").value,
        cpf: document.getElementById("inputcpf").value.replace(/\D/g, ""),
        rg: document.getElementById("inputrg").value.replace(/\D/g, ""),
        estadoCivil: document.getElementById("inputestado").value,
        datanascimento1: dataFormatada,
        sexo: document.getElementById("inputsexo").value,
        email: document.getElementById("inputemail").value,
        telefone: document.getElementById("inputtelefone").value,
        celular: document.getElementById("inputcelular").value
    };

    const endereco = {
        cliente: { id: clienteId },
        cep: document.getElementById("inputcep").value,
        numero: document.getElementById("inputnumero").value,
        complemento: document.getElementById("inputcomplemento").value,
        bairro: document.getElementById("inputbairro").value,
        cidade: document.getElementById("inputcidade").value,
        estado: document.getElementById("inputestado2").value,
        rua: document.getElementById("inputrua").value
    };

    const renda = {
        cliente: { id: clienteId },
        rendaMensal: parseFloat(document.getElementById("inputrenda").value.replace(/[^\d,.-]/g, "").replace(",", ".")),
        pessoasDependentes: parseInt(document.getElementById("inputpessoas").value),
        rendaTotalresidencial: parseFloat(document.getElementById("rendaTotalresidencial").value.replace(/[^\d,.-]/g, "").replace(",", "."))
    };

    let mensagens = [];

    try {
        const resCliente = await fetch(`http://localhost:8080/apiCliente`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cliente)
        });

        if (resCliente.ok) mensagens.push("Cliente atualizado com sucesso.");
        else mensagens.push("Erro ao atualizar cliente.");
    } catch (err) {
        mensagens.push("Erro na requisição de cliente.");
    }

    try {
        const resEndereco = await fetch(`http://localhost:8080/apiEndereco`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(endereco)
        });

        if (resEndereco.ok) mensagens.push("Endereço atualizado com sucesso.");
        else mensagens.push("Erro ao atualizar endereço.");
    } catch (err) {
        mensagens.push("Erro na requisição de endereço.");
    }

    try {
        const resRenda = await fetch(`http://localhost:8080/apiRenda`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(renda)
        });

        if (resRenda.ok) mensagens.push("Renda atualizada com sucesso.");
        else mensagens.push("Erro ao atualizar renda.");
    } catch (err) {
        mensagens.push("Erro na requisição de renda.");
    }


    document.getElementById("msgSucesso").textContent = mensagens.join(" ");
    document.getElementById("msgSucesso").style.color = "green";
});
