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
            document.getElementById("inputnome").value = data.nome; 
            document.getElementById("inputcpf").value = formatarCPF(data.cpf);   
            document.getElementById("inputrg").value = formatarRG(data.rg);
            document.getElementById("inputestado").value = data.estadoCivil;
            document.getElementById("inputsexo").value = data.sexo;
            document.getElementById("inputemail").value = data.email
            document.getElementById("inputtelefone").value = data.telefone;
            document.getElementById("inputcelular").value = data.celular;

        })
})