/* eslint-disable prettier/prettier */
const params = new URLSearchParams(window.location.search);
const aa1 = params.get("nome"); 
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
  cpf = cpf.replace(/\D/g, '');  // Remove tudo que não for número
  if (cpf.length <= 11) {
    cpf = cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  return cpf;
}

// Função para validar o CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos
  if (cpf.length !== 11) return false;  // CPF deve ter exatamente 11 dígitos

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0, resto;

  // Validação do primeiro dígito verificador
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true; // CPF válido
}

// Função para verificar se o nome, email ou username já existem
function verificarDadosDuplicados(nome, email, username, funcionarios) {
  return funcionarios.some(funcionario => 
    funcionario.nome === nome || funcionario.email === email || funcionario.username === username
  );
}

// Adiciona o evento de input no campo de CPF
cpf.addEventListener('input', () => {
  cpf.value = formatarCPF(cpf.value);  // Formata o CPF sempre que o usuário digitar
});

// Carregar os dados dos funcionários
window.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:8080/apiFuncionario/todos')
    .then((response) => {
      if (!response.ok) throw new Error('Erro na requisição: ' + response.status);
      return response.json();  // Resposta é JSON com todos os funcionários
    })
    .then((funcionarios) => {
      // Buscar dados do usuário a partir do nome (ou outro identificador, como id)
      const funcionario = funcionarios.find(f => f.username === aa1); // Ajuste para a lógica que preferir
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

// Ao clicar no botão de salvar
document.getElementById("btnsave").addEventListener("click", () => {
  // Verifica se os campos de senha estão vazios
  if (!inputsenha1.value && !inputsenha2.value) {
    document.getElementById('pMessage').textContent = "Por favor, preencha as senhas!";
    document.getElementById('pMessage').style.color = "red";
    return;
  }

  // Verifica se as senhas são iguais
  if (inputsenha1.value !== inputsenha2.value) {
    document.getElementById('pMessage').textContent = "As senhas não coincidem!";
    document.getElementById('pMessage').style.color = "red";
    return;
  }

  // Verifica se o CPF é válido
  if (!validarCPF(cpf.value)) {
    document.getElementById('pMessage').textContent = "CPF inválido!";
    document.getElementById('pMessage').style.color = "red";
    return;
  }

  // Verifica se a data de nascimento é válida
  const dataNascimento = new Date(dataNascimento1.value);
  if (dataNascimento > new Date()) {
    document.getElementById('pMessage').textContent = "A data de nascimento não pode ser maior que o dia de hoje!";
    document.getElementById('pMessage').style.color = "red";
    return;
  }

  // Verifica se os dados (nome, email, username) estão duplicados
  fetch('http://localhost:8080/apiFuncionario/todos')
    .then((response) => response.json())
    .then((funcionarios) => {
      if (verificarDadosDuplicados(nome.value, email.value, username.value, funcionarios)) {
        document.getElementById('pMessage').textContent = "Nome, Email ou Username já estão cadastrados!";
        document.getElementById('pMessage').style.color = "red";
        return;
      }

      // Define qual senha será enviada (nova ou original)
      let senhaParaEnviar = inputsenha1.value ? inputsenha1.value : senhaOriginal;

      // Realiza a requisição para atualizar os dados
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
          dataNascimento1: dataNascimento1.value,  // Passa a data de nascimento editada
          email: email.value,
          senha: senhaParaEnviar
        })
      })
      .then(response => {
        if (!response.ok) throw new Error('Erro ao atualizar os dados: ' + response.status);
        document.getElementById('pMessage').textContent = "Atualizado com sucesso";
        document.getElementById('pMessage').style.color = "green";
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
