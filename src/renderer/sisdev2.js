const inputCPF = document.getElementById("inputcpf");

function formatarCPF(value) {
  let cpf = value.replace(/\D/g, ""); // Remove tudo que não é dígito

  if (cpf.length > 11) cpf = cpf.slice(0, 11); // Limita a 11 dígitos

  if (cpf.length > 9) {
    cpf = cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
  } else if (cpf.length > 6) {
    cpf = cpf.replace(/^(\d{3})(\d{3})(\d{1,3})$/, "$1.$2.$3");
  } else if (cpf.length > 3) {
    cpf = cpf.replace(/^(\d{3})(\d{1,3})$/, "$1.$2");
  }

  return cpf;
}

inputCPF.addEventListener("input", (e) => {
  const input = e.target;
  const originalLength = input.value.length;
  const originalCursor = input.selectionStart;

  const formatted = formatarCPF(input.value);
  input.value = formatted;

  const newLength = formatted.length;
  let newCursorPosition = originalCursor + (newLength - originalLength);

  // Ajusta o cursor para não travar antes dos pontos ou traço
  if (
    (formatted.charAt(newCursorPosition - 1) === "." ||
      formatted.charAt(newCursorPosition - 1) === "-") &&
    e.inputType !== "deleteContentBackward"
  ) {
    newCursorPosition++;
  }

  input.setSelectionRange(newCursorPosition, newCursorPosition);
});

document.getElementById("pesquisa").addEventListener("click", () => {
  const nome = document.getElementById("inputnome").value.trim();
  const cpf = inputCPF.value.replace(/\D/g, ""); // CPF sem máscara

  // Remove o listener anterior para evitar múltiplos redirecionamentos
  const imgLogin = document.getElementById("imglogin");
  imgLogin.replaceWith(imgLogin.cloneNode(true));
  document.getElementById("imglogin").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  fetch(`http://localhost:8080/apiCliente/buscarsisdev2/${encodeURIComponent(nome)}/${cpf}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const resposta = document.getElementById("presposta");
      resposta.textContent = "Cliente encontrado com sucesso";
      resposta.style.color = "green";

      setTimeout(() => {
        function calcularIdade(dataNascimentoStr) {
          const [dia, mes, ano] = dataNascimentoStr.split("/").map(Number);
          const dataNascimento = new Date(ano, mes - 1, dia);
          const hoje = new Date();

          let idade = hoje.getFullYear() - dataNascimento.getFullYear();

          if (
            hoje.getMonth() < dataNascimento.getMonth() ||
            (hoje.getMonth() === dataNascimento.getMonth() &&
              hoje.getDate() < dataNascimento.getDate())
          ) {
            idade--;
          }

          return idade;
        }

        const cpfEncode = encodeURIComponent(data.cpf);

        if (calcularIdade(data.datanascimento1) >= 18) {
          window.location.href = `maiorIdade1.html?cpf=${cpfEncode}`;
        } else {
          window.location.href = `menorIdade1.html?cpf=${cpfEncode}`;
        }
      }, 3000);
    })
    .catch((error) => {
      console.error("Erro ao buscar cliente:", error);
      const resposta = document.getElementById("presposta");
      resposta.textContent = "Erro ao buscar cliente. Verifique os dados e tente novamente.";
      resposta.style.color = "red";
    });
});
