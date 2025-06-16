/* eslint-disable prettier/prettier */

const params = new URLSearchParams(window.location.search);
const aa1 = params.get("nome"); 

const nome = document.getElementById('inputnome');
const cpf = document.getElementById('inputcpf');
const cargo = document.getElementById('inputcargo');
const username = document.getElementById("inputusername");
const email = document.getElementById("inputemail");
const dataNascimento = document.getElementById("inputdatanascimento");
const senha1 = document.getElementById("senha1");
const senha2 = document.getElementById("senha2");

const pUsername = document.getElementById('pusername');
const pCpf = document.getElementById('pcpf');
const pEmail = document.getElementById('pemail');
const pMessage = document.getElementById('pMessage');
const pdata = document.getElementById('pdata');
const psenha = document.getElementById('psenha');
const pnome = document.getElementById('pnome');
const pcargo = document.getElementById('pcargo');

let idUser;
let senhaOriginal;

function formatarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length <= 11) {
    cpf = cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  return cpf;
}

function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0, resto;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf.charAt(10));
}

function limparMensagens() {
  [pnome, pcargo, pUsername, pCpf, pEmail, pMessage, pdata, psenha].forEach(p => {
    if (p) p.textContent = "";
  });
}

function getValorSeguro(input) {
  return input?.value?.trim() || "";
}

async function isDuplicado(res) {
  if (res.status === 404) return false;
  try {
    const data = await res.json();
    return !!data && Object.keys(data).length > 0 && data.id !== idUser;
  } catch {
    return true;
  }
}

cpf.addEventListener('input', () => {
  cpf.value = formatarCPF(cpf.value);
});

document.getElementById("imglogin").addEventListener("click", () => {
  window.location.href = "index.html";
});

window.addEventListener('DOMContentLoaded', () => {
  // Adiciona required em todos os inputs para garantir que não sejam nulos/vazios
  [nome, cpf, cargo, username, email, dataNascimento, senha1, senha2].forEach(input => {
    if (input) input.setAttribute('required', 'required');
  });

  fetch('http://localhost:8080/apiFuncionario/todos')
    .then(res => res.json())
    .then(funcionarios => {
      const funcionario = funcionarios.find(f => f.username === aa1);
      if (funcionario) {
        nome.value = funcionario.nome || "";
        cpf.value = formatarCPF(funcionario.cpf || "");
        cargo.value = funcionario.cargo || "";
        username.value = funcionario.username || "";
        email.value = funcionario.email || "";
        dataNascimento.value = funcionario.dataNascimento || "";
        idUser = funcionario.id;
        senhaOriginal = funcionario.senha;
      }
    })
    .catch(error => console.error("Erro ao carregar funcionário:", error));
});

document.getElementById('btnsave').addEventListener('click', async (e) => {
  let erro = false;
  limparMensagens();

  // Impede submit se algum campo estiver vazio (nulo ou só espaços)
  [nome, cpf, cargo, username, email, dataNascimento, senha1, senha2].forEach(input => {
    if (!getValorSeguro(input)) {
      input.focus();
      erro = true;
    }
  });
  if (erro) {
    pMessage.textContent = "Preencha todos os campos obrigatórios!";
    pMessage.style.color = "red";
    return;
  }

  if (!getValorSeguro(nome)) {
    pnome.textContent = "Nome não pode ser vazio!";
    pnome.style.color = "red";
    erro = true;
  }

  if (!getValorSeguro(cargo)) {
    pcargo.textContent = "Cargo não pode ser vazio!";
    pcargo.style.color = "red";
    erro = true;
  }

  if (!getValorSeguro(username)) {
    pUsername.textContent = "Username não pode ser vazio!";
    pUsername.style.color = "red";
    erro = true;
  }

  if (!getValorSeguro(email)) {
    pEmail.textContent = "Email não pode ser vazio!";
    pEmail.style.color = "red";
    erro = true;
  }

  if (!getValorSeguro(senha1) || !getValorSeguro(senha2)) {
    psenha.textContent = "As senhas não podem ser vazias!";
    psenha.style.color = "red";
    erro = true;
  }

  if (!getValorSeguro(cpf)) {
    pCpf.textContent = "CPF não pode ser vazio!";
    pCpf.style.color = "red";
    erro = true;
  }

  if (!dataNascimento?.value || new Date(dataNascimento.value) > new Date()) {
    pdata.textContent = "Data de nascimento inválida!";
    pdata.style.color = "red";
    erro = true;
  }

  if (!validarCPF(cpf.value)) {
    pCpf.textContent = "CPF inválido!";
    pCpf.style.color = "red";
    erro = true;
  }

  if (senha1.value !== senha2.value) {
    psenha.textContent = "As senhas não condizem!";
    psenha.style.color = "red";
    erro = true;
  }

  if (erro) return;

  try {
    const [resUsername, resCpf, resEmail] = await Promise.all([
      fetch(`http://localhost:8080/apiFuncionario/buscarParaCadastroUsername/${username.value}`),
      fetch(`http://localhost:8080/apiFuncionario/buscarParaCadastroCpf/${cpf.value}`),
      fetch(`http://localhost:8080/apiFuncionario/buscarParaCadastroEmail/${email.value}`)
    ]);

    if (await isDuplicado(resUsername)) {
      pUsername.textContent = "Este Username já está em uso!";
      pUsername.style.color = "red";
      erro = true;
    }

    if (await isDuplicado(resCpf)) {
      pCpf.textContent = "Este CPF já está em uso!";
      pCpf.style.color = "red";
      erro = true;
    }

    if (await isDuplicado(resEmail)) {
      pEmail.textContent = "Este Email já está em uso!";
      pEmail.style.color = "red";
      erro = true;
    }

    if (erro) return;

  } catch (e) {
    console.error("Erro ao verificar duplicatas:", e);
    pMessage.textContent = "Erro ao verificar duplicatas.";
    pMessage.style.color = "red";
    return;
  }

  const funcionarioAtualizado = {
    id: idUser,
    nome: getValorSeguro(nome),
    cargo: getValorSeguro(cargo),
    dataNascimento: dataNascimento?.value || "",
    cpf: getValorSeguro(cpf),
    username: getValorSeguro(username),
    email: getValorSeguro(email),
    senha: getValorSeguro(senha1)
  };

  if (Object.values(funcionarioAtualizado).some(v => v === null || v === undefined)) {
    pMessage.textContent = "Há valores inválidos no formulário!";
    pMessage.style.color = "red";
    return;
  }

  console.log("Enviando funcionário atualizado:", funcionarioAtualizado);

  try {
    const res = await fetch('http://localhost:8080/apiFuncionario/atualizar', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(funcionarioAtualizado)
    });

    if (res.ok) {
      pMessage.textContent = "Funcionário atualizado com sucesso!";
      pMessage.style.color = "green";
      senha1.value = "";
      senha2.value = "";
    } else {
      pMessage.textContent = "Erro ao atualizar funcionário.";
      pMessage.style.color = "red";
    }
  } catch (error) {
    console.error(error);
    pMessage.textContent = "Erro ao atualizar funcionário.";
    pMessage.style.color = "red";
  }
});