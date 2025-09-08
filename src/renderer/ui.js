/* eslint-disable no-inner-declarations */
/* eslint-disable prettier/prettier */

const nomedousuario = document.getElementById('nomeDeUsuario');
const nomeCompleto = document.getElementById('nomeCompleto');
const idade = document.getElementById('idade');
const dataNascimentoCampo = document.getElementById('dataNascimentoCampo');
const cargo1 = document.getElementById('cargo1');
const email1 = document.getElementById('email');
const imgPerson = document.getElementById('imgperson');

const params = new URLSearchParams(window.location.search);
const aa1 = params.get("nome");
const aa2 = params.get("idade");
let datausername = "";

document.getElementById('imglogin').addEventListener('click', () => {
  window.location.href = "index.html";
});

// --- Função para atualizar a imagem do usuário específica ---
function atualizarImagemUsuario(username) {
  if (!imgPerson) return;

  fetch(`http://localhost:8080/api/upload/imagem/${username}`)
    .then(res => {
        // Verifica se a resposta é um sucesso e se é uma imagem
        if (!res.ok) {
            throw new Error('Imagem não encontrada para este usuário');
        }
        return res.blob(); // Obtém a imagem como um Blob
    })
    .then(blob => {
        const imageUrl = URL.createObjectURL(blob); // Cria uma URL local para o Blob
        imgPerson.src = imageUrl;
    })
    .catch(err => {
        console.error('Erro ao obter imagem do usuário:', err);
        imgPerson.src = "./assets/Ellipse 1.png"; // Imagem padrão em caso de erro
    });
}

window.addEventListener('DOMContentLoaded', () => {
  if (!aa1 || !aa2) {
    console.error('Parâmetros nome ou idade não encontrados na URL.');
    return;
  }

  fetch(`http://localhost:8080/apiFuncionario/login/${aa1}/${aa2}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro na requisição: ' + response.status);
      }
      return response.json();
    })
    .then((data) => {
      datausername = data.username;

      if (data.username && data.nome && data.cargo && data.email) {
        nomedousuario.textContent = data.username;
        nomeCompleto.textContent = data.nome;

        if (data.dataNascimento1) {
          function formatarDataNascimento(dataNascimento) {
            const partesData = dataNascimento.split('-');
            return `${partesData[2]}/${partesData[1]}/${partesData[0]}`;
          }

          const dataNascimentoFormatada = formatarDataNascimento(data.dataNascimento1);
          dataNascimentoCampo.textContent = dataNascimentoFormatada;

          function calcularIdade(dataNascimento) {
            const partesData = dataNascimento.split('-');
            const nascimento = new Date(partesData[0], partesData[1] - 1, partesData[2]);
            const hoje = new Date();
            let idade1 = hoje.getFullYear() - nascimento.getFullYear();
            const mesAtual = hoje.getMonth();
            const mesNascimento = nascimento.getMonth();
            const diaAtual = hoje.getDate();
            const diaNascimento = nascimento.getDate();

            if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
              idade1--;
            }

            return idade1.toString();
          }

          const idadeCalculada = calcularIdade(data.dataNascimento1);
          if (new Date().getFullYear() === new Date(data.dataNascimento1).getFullYear()) {
            idade.textContent = "0 Anos";
          } else {
            idade.textContent = idadeCalculada + " Anos";
          }
        } else {
          idade.textContent = "Data de nascimento não disponível";
          dataNascimentoCampo.textContent = "Data não informada";
        }

        cargo1.textContent = data.cargo;
        email1.textContent = data.email;
      } else {
        console.error('Dados incompletos retornados:', data);
      }

      // --- Atualiza a imagem do usuário pelo username ---
      atualizarImagemUsuario(datausername);

    })
    .catch((error) => {
      console.error('Erro ao buscar funcionários:', error);
    });
});

// --- Navegação ---
document.getElementById('btndeletaccout').addEventListener("click", () => {
  const url = "deletaccount.html?nome=" + encodeURIComponent(datausername) +
              "&cpf=" + encodeURIComponent(aa2);
  window.location.href = url;
});

document.getElementById('sisdev').addEventListener("click", () => {
  const url = "sistemDev2.html?nome=" + encodeURIComponent(datausername) +
              "&cpf=" + encodeURIComponent(aa2);
  window.location.href = url;
});

document.getElementById('attinfo').addEventListener("click", ()=> {
  const url = "atualizar.html?nome=" + encodeURIComponent(datausername) +
              "&cpf=" + encodeURIComponent(aa2);
  window.location.href = url;
});