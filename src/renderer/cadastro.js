document.addEventListener("DOMContentLoaded", () => {
  const nome = document.getElementById('inputnome');
  const cargo = document.getElementById('inputcargo');
  const dataNascimento = document.getElementById('inputdatanascimento');
  const cpf = document.getElementById('inputcpf');
  const username = document.getElementById('inputusername');
  const email = document.getElementById('inputemail');
  const senha1 = document.getElementById('senha1');
  const senha2 = document.getElementById('senha2');

  const pUsername = document.getElementById('pusername');
  const pCpf = document.getElementById('pcpf');
  const pEmail = document.getElementById('pemail');
  const pMessage = document.getElementById('pMessage');

  document.getElementById('imglogin').addEventListener('click', () => {
    window.location.href = "index.html";
  });

  // Função para validar CPF
  function validaCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf.charAt(10));
  }

  function limparMensagens() {
    pMessage.textContent = "";
    pUsername.textContent = "";
    pCpf.textContent = "";
    pEmail.textContent = "";
  }

  async function isDuplicado(res) {
    if (res.status === 404) return false;
    try {
      const data = await res.json();
      return !!data && Object.keys(data).length > 0;
    } catch {
      return true;
    }
  }

  const ps = document.querySelectorAll('p');
  ps.forEach(p => p.style.margin = "0px 0");

  document.getElementById('btnsave').addEventListener('click', async () => {
    console.log(dataNascimento.value)
    let erro = false;
    limparMensagens();

    // Validar CPF
    if (!validaCPF(cpf.value)) {
      pCpf.textContent = "CPF inválido!";
      pCpf.style.color = "red";
      erro = true;
    }

    // Validar data
    const dataValue = dataNascimento.value;
    if (!dataValue || new Date(dataValue) > new Date()) {
      pMessage.textContent = "Data de nascimento inválida!";
      pMessage.style.color = "red";
      erro = true;
    }

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

    } catch (e) {
      console.error("Erro ao verificar duplicatas:", e);
      alert("Erro ao verificar dados duplicados.");
      return;
    }

    if (senha1.value !== senha2.value) {
      pMessage.textContent = "As senhas não condizem!";
      pMessage.style.color = "red";
      erro = true;
    }

    if (erro) return;

    const novoFuncionario = {
      nome: nome.value,
      cargo: cargo.value,
      dataNascimento1: dataNascimento.value, 
      cpf: cpf.value,
      username: username.value,
      email: email.value,
      senha: senha1.value
    };

    try {
      const cadastroRes = await fetch('http://localhost:8080/apiFuncionario/cadastrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novoFuncionario)
      });

      if (cadastroRes.ok) {
        pMessage.textContent = "Funcionário cadastrado com sucesso!";
        pMessage.style.color = "green";
        senha1.value = "";
        senha2.value = "";
      } else {
        pMessage.textContent = "Erro ao cadastrar funcionário.";
        pMessage.style.color = "red";
      }
    } catch (error) {
      console.error(error);
      pMessage.textContent = "Erro ao cadastrar funcionário.";
      pMessage.style.color = "red";
    }
  });
});
