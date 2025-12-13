function exibirMensagem(tipo, texto) {
  const msg = document.getElementById("mensagem");
  msg.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${texto}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

async function carregarReservas() {
  try {
    const res = await fetch("http://localhost:3000/reservas");
    const reservas = await res.json();

    const tabela = document.getElementById("lista-reservas");
    tabela.innerHTML = "";

    reservas.forEach(r => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${r.id}</td>
        <td>${r.nome_hospede}</td>
        <td>${r.numero_quarto}</td>
        <td>${r.data_entrada}</td>
        <td>${r.data_saida}</td>
        <td>${r.valor_total}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deletarReserva(${r.id})">
            Excluir
          </button>
        </td>
      `;

      tabela.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    exibirMensagem("danger", "Erro ao carregar reservas");
  }
}

carregarReservas()

async function carregarHospedesSelect() {
  try {
    const res = await fetch("http://localhost:3000/hospedes");
    const hospedes = await res.json();

    const select = document.getElementById("res-hospede");
    select.innerHTML = `<option value="">Selecione o hóspede</option>`;

    hospedes.forEach(h => {
      const option = document.createElement("option");
      option.value = h.id;
      option.textContent = `${h.nome} - CPF: ${h.cpf}`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error(err);
    exibirMensagem("danger", "Erro ao carregar hóspedes");
  }
}
carregarHospedesSelect();

async function carregarQuartosSelect() {
  try {
    const res = await fetch("http://localhost:3000/quartos");
    const quartos = await res.json();

    const select = document.getElementById("res-quarto");
    select.innerHTML = `<option value="">Selecione o quarto</option>`;

    quartos.forEach(q => {
      const option = document.createElement("option");
      option.value = q.id;
      option.textContent = `Quarto ${q.numero} - ${q.tipo} (${q.status})`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error(err);
    exibirMensagem("danger", "Erro ao carregar quartos");
  }
}
carregarQuartosSelect();

async function cadastrarReserva() {
  const dados = {
    id_hospede: document.getElementById("res-hospede").value,
    id_quarto: document.getElementById("res-quarto").value,
    data_entrada: document.getElementById("res-checkin").value,
    data_saida: document.getElementById("res-checkout").value,
  };

  if (!dados.id_hospede || !dados.id_quarto || !dados.data_entrada || !dados.data_saida) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    const resposta = await res.json();

    if (!res.ok) {
      alert(resposta.erro || "Erro ao cadastrar reserva.");
      return;
    }

    alert("Reserva cadastrada com sucesso!");

    // limpar campos
    document.getElementById("res-hospede").value = "";
    document.getElementById("res-quarto").value = "";
    document.getElementById("res-checkin").value = "";
    document.getElementById("res-checkout").value = "";

    carregarReservas();
  } catch (err) {
    console.error(err);
    alert("Erro interno ao cadastrar reserva.");
  }
}

async function deletarReserva(id) {
  if (!confirm("Deseja excluir esta reserva?")) return;

  try {
    const res = await fetch(`http://localhost:3000/reservas/${id}`, {
      method: "DELETE"
    });

    const resposta = await res.json();

    if (!res.ok) {
      alert(resposta.erro || "Erro ao excluir reserva.");
      return;
    }

    alert("Reserva excluída com sucesso!");
    carregarReservas();
  } catch (err) {
    console.error(err);
    alert("Erro interno ao excluir reserva.");
  }
}

