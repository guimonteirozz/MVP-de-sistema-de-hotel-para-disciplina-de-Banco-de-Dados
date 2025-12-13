function exibirMensagem(tipo, texto) {
  const msg = document.getElementById("mensagem");
  if (!msg) return;

  msg.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${texto}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

// ===============================
// LISTAR QUARTOS
// ===============================
function carregarQuartos() {
  fetch("http://localhost:3000/quartos")
    .then(response => response.json())
    .then(data => {
      const tabela = document.getElementById("lista-quartos");
      tabela.innerHTML = "";

      data.forEach(q => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${q.id}</td>
          <td>${q.numero}</td>
          <td>${q.tipo}</td>
          <td>R$ ${Number(q.diaria).toFixed(2)}</td>
          <td>${q.status}</td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="editarQuarto(${q.id})">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="deletarQuarto(${q.id})">Excluir</button>
          </td>
        `;

        tabela.appendChild(row);
      });
    })
    .catch(error => {
      console.error("Erro ao buscar quartos:", error);
      exibirMensagem("danger", "Erro ao carregar quartos");
    });
}

// Carregar lista ao abrir a página
carregarQuartos();

// ===============================
// DELETAR QUARTO
// ===============================
async function deletarQuarto(id) {
  const confirmDelete = confirm("Tem certeza que deseja deletar este quarto?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`/quartos/${id}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
      // Mensagem vinda do backend (ex: quarto com reserva)
      alert(
        data.erro ||
        "A exclusão do quarto só é permitida se ele não tiver reservas vinculadas."
      );
      return;
    }

    alert("Quarto deletado com sucesso!");
    carregarQuartos(); // Atualiza a lista automaticamente

  } catch (error) {
    console.error("Erro ao tentar deletar quarto:", error);
    alert("Erro inesperado ao deletar quarto.");
  }
}

async function editarQuarto(id) {
  try {
    // chama o backend para obter os dados do hóspede
    const res = await fetch(`/quartos/${id}`);
    const data = await res.json();

    // se o backend retornou erro (nosso backend usa "erro")
    if (!res.ok) {
      alert(data.erro || "Não foi possível carregar o Quarto.");
      return;
    }

    // preenche o formulário do modal
    document.getElementById("edit-id").value = data.id;
    document.getElementById("edit-numero").value = data.numero || "";
    document.getElementById("edit-tipo").value = data.tipo || "";
    document.getElementById("edit-diaria").value = data.diaria || "";
    document.getElementById("edit-status").value = data.status || "";

    // inicializa e mostra o modal (Bootstrap 5)
    const modalEl = document.getElementById("modalEditarQuarto");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

  } catch (err) {
    console.error("Erro ao carregar hóspede para edição:", err);
    alert("Erro ao carregar dados do hóspede. Verifique o console.");
  }
}

async function salvarEdicaoQuarto() {
  const id = document.getElementById("edit-id").value;

  const dados = {
    numero: document.getElementById("edit-numero").value,
    tipo: document.getElementById("edit-tipo").value,
    diaria: document.getElementById("edit-diaria").value,
    status: document.getElementById("edit-status").value
  };

  try {
    const res = await fetch(`/quartos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    const resposta = await res.json();

    // Se der erro, mostrar a mensagem enviada pelo backend
    if (!res.ok) {
      alert(resposta.erro || "Erro ao atualizar hóspede.");
      return;
    }

    // Sucesso
    alert("Hóspede atualizado com sucesso!");

    // Atualiza tabela
    carregarQuartos();

    // fecha modal Bootstrap
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("modalEditarQuarto")
    );
    modal.hide();

  } catch (err) {
    console.error("Erro ao salvar edição:", err);
    alert("Erro interno ao atualizar.");
  }
}

// Carregar tabela ao abrir a página
carregarQuartos();

function cadastrarQuarto() {
  const dados = {
    numero: document.getElementById("cad-numero").value,
    tipo: document.getElementById("cad-tipo").value,
    diaria: document.getElementById("cad-diaria").value, // ✔️
    status: document.getElementById("cad-status").value
  };

  fetch("/quartos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  })
    .then(res => res.json())
    .then(data => {
      if (data.erro) {
        alert(data.erro);
        return;
      }

      alert("Quarto cadastrado com sucesso!");
      carregarQuartos();
    })
    .catch(() => alert("Erro ao cadastrar quarto"));
}
