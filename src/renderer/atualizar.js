/* eslint-disable prettier/prettier */
const params = new URLSearchParams(window.location.search);
const aa1 = params.get("nome");
const aa2 = params.get("cpf");
const nome = document.getElementById('inputnome');
const cpf = document.getElementById('inputcpf');
const cargo = document.getElementById('inputcargo');
const username = document.getElementById("inputusername");
const email = document.getElementById("inputemail");
const dataNascimento1 = document.getElementById("inputdatanascimento");
const inputsenha1 = document.getElementById("senha1");
const inputsenha2 = document.getElementById("senha2");
let idUser;
let senhaOriginal;

document.getElementById("imglogin").addEventListener("click", () => {
  window.location.href = "index.html";
})

// Função para formatar o CPF no formato 111.111.111-11
function formatarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length <= 11) {
    cpf = cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  return cpf;
}

// Função para validar o CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0, resto;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
}

// Verifica duplicidade ignorando o próprio funcionário
function verificarDadosDuplicados(nome, email, username, funcionarios, idAtual) {
  for (const funcionario of funcionarios) {
    if (funcionario.id !== idAtual) {
      if (funcionario.nome === nome) {
        return { duplicado: true, campo: "nome" };
      }
      if (funcionario.email === email) {
        return { duplicado: true, campo: "email" };
      }
      if (funcionario.username === username) {
        return { duplicado: true, campo: "username" };
      }
    }
  }
  return { duplicado: false };
}

// Formatar CPF ao digitar
cpf.addEventListener('input', () => {
  cpf.value = formatarCPF(cpf.value);
});

// Carregar dados do funcionário atual
window.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:8080/apiFuncionario/todos')
    .then((response) => {
      if (!response.ok) throw new Error('Erro na requisição: ' + response.status);
      return response.json();
    })
    .then((funcionarios) => {
      const funcionario = funcionarios.find(f => f.username === aa1);
      if (funcionario) {
        nome.value = funcionario.nome;
        cpf.value = funcionario.cpf;
        cargo.value = funcionario.cargo;
        username.value = funcionario.username;
        email.value = funcionario.email;
        dataNascimento1.value = funcionario.dataNascimento1;
        idUser = funcionario.id;
        senhaOriginal = funcionario.senha;
      }
    })
    .catch(error => {
      console.error("Erro ao carregar os dados dos funcionários:", error);
    });
});

// Ação ao clicar no botão de salvar
document.getElementById("btnsave").addEventListener("click", () => {
  const mensagem = document.getElementById('pMessage');

  if (nome.value.trim() == "") {
    mensagem.textContent = "Por favor, preencha o nome!";
    mensagem.style.display = "block";
    mensagem.style.color = "red";
    return;
  }

  if (cargo.value.trim() == "") {
    mensagem.textContent = "Por favor, preencha o cargo!";
    mensagem.style.display = "block";
    mensagem.style.color = "red";
    return;
  }

  if (cpf.value.trim() == "") {
    mensagem.textContent = "Por favor, preencha o cpf!";
    mensagem.style.display = "block";
    mensagem.style.color = "red";
    return;
  }

  if (username.value.trim() == "") {
    mensagem.textContent = "Por favor, preencha o username!";
    mensagem.style.display = "block";
    mensagem.style.color = "red";
    return;
  }

  if (!inputsenha1.value && !inputsenha2.value) {
    mensagem.textContent = "Por favor, preencha as senhas!";
    mensagem.style.display = "block";
    mensagem.style.color = "red";
    return;
  }

  if (inputsenha1.value !== inputsenha2.value) {
    mensagem.textContent = "As senhas não coincidem!";
    mensagem.style.display = "block";
    mensagem.style.color = "red";
    return;
  }

  if (!validarCPF(cpf.value)) {
    mensagem.textContent = "CPF inválido!";
    mensagem.style.display = "block";
    mensagem.style.color = "red";
    return;
  }

  const dataNascimento = new Date(dataNascimento1.value);
  if (dataNascimento > new Date()) {
    mensagem.textContent = "A data de nascimento não pode ser maior que o dia de hoje!";
    mensagem.style.display = "block";
    mensagem.style.color = "red";
    return;
  }

  // Verifica duplicidade com exceção do próprio funcionário
  fetch('http://localhost:8080/apiFuncionario/todos')
    .then((response) => response.json())
    .then((funcionarios) => {
      const verificacao = verificarDadosDuplicados(nome.value, email.value, username.value, funcionarios, idUser);
      if (verificacao.duplicado) {
        const campo = verificacao.campo;
        mensagem.textContent = `O campo "${campo}" já está sendo usado por outro funcionário!`;
        mensagem.style.color = "red";
        return;
      }

      const senhaParaEnviar = inputsenha1.value ? inputsenha1.value : senhaOriginal;

      fetch('http://localhost:8080/apiFuncionario/atualizar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: idUser,
          nome: nome.value,
          cpf: cpf.value,
          cargo: cargo.value,
          username: username.value,
          dataNascimento1: dataNascimento1.value,
          email: email.value,
          senha: senhaParaEnviar
        })
      })
        .then(response => {
          if (!response.ok) throw new Error('Erro ao atualizar os dados: ' + response.status);

          mensagem.textContent = "Atualizado com sucesso";
          mensagem.style.color = "green";

          // Limpar campos de senha
          inputsenha1.value = "";
          inputsenha2.value = "";

          // Limpar mensagem após 5 segundos
          setTimeout(() => {
            mensagem.textContent = "";
          }, 5000);
        })
        .catch(error => {
          console.error("Erro na requisição de atualização:", error);
          alert("Erro ao atualizar os dados.");
        });
    })
    .catch(error => {
      console.error("Erro ao verificar duplicidade de dados:", error);
    });
});


document.getElementById("cancel").addEventListener("click", ()=>{
  const url = "ui.html?nome=" + encodeURIComponent(aa1) + 
  "&idade=" + encodeURIComponent(aa2);
window.location.href = url;
})
