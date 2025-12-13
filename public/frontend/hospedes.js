function exibirMensagem(tipo, texto) {
  const msg = document.getElementById("mensagem");
  msg.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${texto}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

// ===============================
// LISTAR HÓSPEDES
// ===============================
function carregarHospedes() {
  fetch('http://localhost:3000/hospedes')
    .then(response => response.json())
    .then(data => {
      const tabela = document.getElementById("lista-hospedes");
      tabela.innerHTML = "";

      data.forEach(h => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${h.id}</td>
          <td>${h.nome}</td>
          <td>${h.cpf}</td>
          <td>${h.telefone}</td>
          <td>${h.email}</td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="editarHospede(${h.id})">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="deletarHospede(${h.id})">Excluir</button>
          </td>
        `;

        tabela.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Erro ao buscar hóspedes:', error);
      exibirMensagem("danger", "Erro ao carregar hóspedes");
    });
}

// ===============================
// DELETAR HÓSPEDE
// ===============================

async function deletarHospede(id) {
    const confirmDelete = confirm("Tem certeza que deseja deletar este hóspede?");
    if (!confirmDelete) return;

    try {
        const response = await fetch(`/hospedes/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            // Aqui garante que a mensagem DO BACKEND vai aparecer
            alert(data.error || "A exclusão do hóspede só é permitida se ele não tiver uma reserva vinculada. Delete a reserva primeiro.");
            return;
        }

        alert("Hóspede deletado com sucesso!");
        carregarHospedes(); // Atualiza a lista automaticamente
    } catch (error) {
        console.error("Erro ao tentar deletar hóspede:", error);
        alert("Erro inesperado ao deletar.");
    }
}

// abrir modal e preencher campos com os dados do hóspede
async function editarHospede(id) {
  try {
    // chama o backend para obter os dados do hóspede
    const res = await fetch(`/hospedes/${id}`);
    const data = await res.json();

    // se o backend retornou erro (nosso backend usa "erro")
    if (!res.ok) {
      alert(data.erro || "Não foi possível carregar o hóspede.");
      return;
    }

    // preenche o formulário do modal
    document.getElementById("edit-id").value = data.id;
    document.getElementById("edit-nome").value = data.nome || "";
    document.getElementById("edit-cpf").value = data.cpf || "";
    document.getElementById("edit-telefone").value = data.telefone || "";
    document.getElementById("edit-email").value = data.email || "";

    // inicializa e mostra o modal (Bootstrap 5)
    const modalEl = document.getElementById("modalEditar");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

  } catch (err) {
    console.error("Erro ao carregar hóspede para edição:", err);
    alert("Erro ao carregar dados do hóspede. Verifique o console.");
  }
}

async function salvarEdicao() {
  const id = document.getElementById("edit-id").value;

  const dados = {
    nome: document.getElementById("edit-nome").value,
    cpf: document.getElementById("edit-cpf").value,
    telefone: document.getElementById("edit-telefone").value,
    email: document.getElementById("edit-email").value
  };

  try {
    const res = await fetch(`/hospedes/${id}`, {
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
    carregarHospedes();

    // fecha modal Bootstrap
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("modalEditar")
    );
    modal.hide();

  } catch (err) {
    console.error("Erro ao salvar edição:", err);
    alert("Erro interno ao atualizar.");
  }
}

// Carregar tabela ao abrir a página
carregarHospedes();

function cadastrarHospede() {
  const dados = {
    nome: document.getElementById("cad-nome").value,
    cpf: document.getElementById("cad-cpf").value,
    telefone: document.getElementById("cad-telefone").value,
    email: document.getElementById("cad-email").value
  };

  // Validação básica
  if (!dados.nome || !dados.cpf || !dados.telefone || !dados.email) {
    alert("Preencha todos os campos!");
    return;
  }

  fetch("http://localhost:3000/hospedes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  })
    .then(async res => {
      const resposta = await res.json();

      if (!res.ok) {
        alert(resposta.erro || "Erro ao cadastrar hóspede.");
        return;
      }

      alert("Hóspede cadastrado com sucesso!");

      // Limpar campos
      document.getElementById("cad-nome").value = "";
      document.getElementById("cad-cpf").value = "";
      document.getElementById("cad-telefone").value = "";
      document.getElementById("cad-email").value = "";

      carregarHospedes(); // atualiza tabela
    })
    .catch(err => {
      console.error(err);
      alert("Erro interno ao cadastrar hóspede.");
    });
}
