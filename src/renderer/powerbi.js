const params = new URLSearchParams(window.location.search);
const aa3 = params.get("nome");
const aa4 = params.get("idade");

console.log(aa3);
console.log(aa4);
document.getElementById("voltar").addEventListener("click", () => {
    const url = "sistemDev2.html?nome=" + encodeURIComponent(aa3) + 
              "&cpf=" + encodeURIComponent(aa4);
  window.location.href = url;
})