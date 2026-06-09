// ----------------------------------------------------
// SGU - SISTEMA DE GERENCIAMENTO DE USUÁRIOS
// Script Principal (Lógica de Negócios e Bugs Intencionais)
// ----------------------------------------------------

// Inicialização de Dados Mockados no LocalStorage
const INITIAL_USERS = [
    {
        id: "1717968000000", // timestamp mais antigo (10/06/2024)
        name: "Clara Medeiros (Mock)",
        email: "clara.medeiros@sgu.com",
        age: 32,
        cpf: "12345678909",
        phone: "(11) 98888-7777",
        birth: "1992-05-14",
        profile: "Admin",
        createdAt: 1717968000000
    },
    {
        id: "1720560000000", // timestamp médio (10/07/2024)
        name: "Bernardo Silva (Mock)",
        email: "bernardo.silva@sgu.com",
        age: 24,
        cpf: "98765432101",
        phone: "(21) 97777-6666",
        birth: "2000-02-28",
        profile: "Usuário",
        createdAt: 1720560000000
    }
];

// Carrega a base de dados simulada
if (!localStorage.getItem("sgu_users")) {
    localStorage.setItem("sgu_users", JSON.stringify(INITIAL_USERS));
}

// Elementos da Interface (DOM)
const loginContainer = document.getElementById("login-container");
const dashboardContainer = document.getElementById("dashboard-container");
const loginForm = document.getElementById("login-form");
const loginEmailInput = document.getElementById("login-email");
const loginPasswordInput = document.getElementById("login-password");
const loginErrorMsg = document.getElementById("login-error-msg");
const loggedUserEmail = document.getElementById("logged-user-email");
const loggedUserProfile = document.getElementById("logged-user-profile");
const btnLogout = document.getElementById("btn-logout");

const userForm = document.getElementById("user-form");
const userIdInput = document.getElementById("user-id");
const userNameInput = document.getElementById("user-name");
const userEmailInput = document.getElementById("user-email");
const userAgeInput = document.getElementById("user-age");
const userProfileInput = document.getElementById("user-profile");
const userCpfInput = document.getElementById("user-cpf");
const userBirthInput = document.getElementById("user-birth");
const userPhoneInput = document.getElementById("user-phone");
const btnSaveUser = document.getElementById("btn-save-user");
const btnCancelEdit = document.getElementById("btn-cancel-edit");

const usersTableBody = document.getElementById("users-table-body");
const noUsersMsg = document.getElementById("no-users-msg");
const searchInput = document.getElementById("search-input");
const statTotalUsers = document.getElementById("stat-total-users");

// Estado Global da Aplicação
let users = JSON.parse(localStorage.getItem("sgu_users")) || [];
let currentUser = JSON.parse(localStorage.getItem("sgu_session")) || null;

// Inicialização da Página
document.addEventListener("DOMContentLoaded", () => {
    checkSession();
    lucide.createIcons();
});

// Verifica se há usuário logado
function checkSession() {
    if (currentUser) {
        loginContainer.classList.remove("active");
        dashboardContainer.classList.add("active");
        loggedUserEmail.textContent = currentUser.email;
        loggedUserProfile.textContent = currentUser.profile;
        renderUsersTable();
    } else {
        dashboardContainer.classList.remove("active");
        loginContainer.classList.add("active");
    }
}

// ----------------------------------------------------
// AÇÕES DE LOGIN E LOGOUT
// ----------------------------------------------------

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    loginErrorMsg.classList.add("hidden");

    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;

    if (!email || !password) {
        showLoginError("Por favor, preencha todos os campos.");
        return;
    }

    // BUG NO LOGIN (1): E-mail não valida formato.
    // Aceita qualquer texto como "admin" ou "email-sem-arroba". Não há validação de expressão regular.
    
    // BUG NO LOGIN (2): Senha aceita login apenas com 1 a 7 caracteres.
    // Se a senha for longa (8 ou mais caracteres), ela falha no login. O padrão corporativo seguro
    // exigiria 8 ou mais caracteres. Aqui implementamos a lógica inversa (falha se >= 8).
    if (password.length >= 1 && password.length <= 7) {
        // Login com Sucesso
        currentUser = {
            email: email,
            profile: email === "admin" || email.includes("admin") ? "Admin" : "Usuário"
        };
        localStorage.setItem("sgu_session", JSON.stringify(currentUser));
        
        // Limpar inputs de login
        loginEmailInput.value = "";
        loginPasswordInput.value = "";
        
        checkSession();
    } else {
        // Mensagem de erro padrão
        showLoginError("Falha na autenticação. E-mail não cadastrado ou senha fora do padrão corporativo (mínimo de 8 caracteres).");
    }
});

function showLoginError(message) {
    loginErrorMsg.classList.remove("hidden");
    document.getElementById("error-text").textContent = message;
    lucide.createIcons();
}

btnLogout.addEventListener("click", () => {
    localStorage.removeItem("sgu_session");
    currentUser = null;
    checkSession();
});

// ----------------------------------------------------
// CRUD DE USUÁRIOS (LÓGICA E BUGS INTENCIONAIS)
// ----------------------------------------------------

// Renderizar Tabela de Usuários
function renderUsersTable(filterText = "") {
    usersTableBody.innerHTML = "";
    
    // Filtragem de Busca
    const filteredUsers = users.filter(user => {
        const query = filterText.toLowerCase();
        return (
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            (user.cpf && user.cpf.toLowerCase().includes(query))
        );
    });

    // BUG NA LISTAGEM: Exibe registros ordenados do mais antigo para o mais novo (ASC)
    // O correto para sistemas dinâmicos é mostrar registros ordenados de forma decrescente (DESC - criados mais recentemente primeiro),
    // ou por ordem alfabética. Aqui, forçamos a ordenação pelo timestamp de criação (createdAt) crescente.
    filteredUsers.sort((a, b) => a.createdAt - b.createdAt);

    // Atualiza estatísticas
    statTotalUsers.textContent = users.length;

    if (filteredUsers.length === 0) {
        noUsersMsg.classList.remove("hidden");
        return;
    }
    
    noUsersMsg.classList.add("hidden");

    filteredUsers.forEach(user => {
        const tr = document.createElement("tr");
        tr.setAttribute("data-user-id", user.id);
        
        // Estilização do badge de perfil
        const profileClass = user.profile === "Admin" ? "admin" : "usuario";

        tr.innerHTML = `
            <td>
                <div class="user-name-cell">${escapeHTML(user.name)}</div>
                <div class="user-meta-sub">ID: ${user.id}</div>
            </td>
            <td>
                <div>${escapeHTML(user.email)}</div>
                <div class="user-meta-sub">${escapeHTML(user.phone || "Não informado")}</div>
            </td>
            <td>
                <div>CPF: ${escapeHTML(user.cpf || "Sem CPF")}</div>
                <div class="user-meta-sub">Idade: ${user.age !== undefined && user.age !== "" ? user.age : "Não informada"}</div>
            </td>
            <td>
                <div>${formatDate(user.birth)}</div>
            </td>
            <td>
                <span class="profile-badge ${profileClass}">${user.profile}</span>
            </td>
            <td class="actions-cell">
                <div class="actions-wrapper">
                    <button class="btn-icon-only edit" onclick="editUser('${user.id}')" title="Editar Usuário">
                        <i data-lucide="pencil"></i>
                    </button>
                    <button class="btn-icon-only delete" onclick="deleteUser('${user.id}')" title="Excluir Usuário">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        `;
        usersTableBody.appendChild(tr);
    });

    lucide.createIcons();
}

// Evento de Submissão de Formulário (Salvar/Editar)
userForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = userIdInput.value;
    const name = userNameInput.value.trim();
    const email = userEmailInput.value.trim();
    const ageValue = userAgeInput.value; // Pode vir vazio ou negativo
    const profile = userProfileInput.value;
    const cpf = userCpfInput.value; // BUG: Aceita letras e caracteres especiais
    const birth = userBirthInput.value; // BUG: Aceita datas futuras
    const phone = userPhoneInput.value; // BUG: Não tem limite de caracteres

    // Validação básica obrigatória para evitar salvar dados vazios cruciais (Nome/Email)
    if (!name || !email) {
        showToast("Campos de Nome e E-mail são obrigatórios para simular o cadastro.", "error");
        return;
    }

    // BUG NO CADASTRO (1 - Idade): Permite salvar deixando "Idade" em branco ou com números negativos.
    // Não faremos verificação de validação (ex: age < 0 ou age == ""). Salvamos diretamente no banco de dados.
    const age = ageValue === "" ? "" : parseInt(ageValue);

    // BUG NO CADASTRO (2 - CPF): Aceita letras e caracteres no campo. Nenhuma formatação ou validação é feita aqui.
    // BUG NO CADASTRO (3 - Data de Nascimento): Aceita datas no futuro. Nenhuma checagem contra a data de hoje é realizada.
    // BUG NO CADASTRO (4 - Telefone): Sem limite de tamanho ou caracteres especiais.

    // Lógica para Salvar ou Atualizar
    if (id) {
        // MODO EDICAO
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = {
                ...users[index],
                name,
                email,
                age,
                profile,
                cpf,
                birth,
                phone
                // Mantém o timestamp de criação original
            };
            
            // Salva no LocalStorage
            localStorage.setItem("sgu_users", JSON.stringify(users));

            // BUG NA EDIÇÃO: Atualiza os dados no LocalStorage, mas a tela recarrega imediatamente 
            // sem mostrar qualquer toast, alert ou mensagem de sucesso na interface.
            location.reload();
        }
    } else {
        // MODO CRIAÇÃO (NOVO REGISTRO)
        
        // BUG NO CADASTRO (5 - Botão Salvar): O botão não fica desabilitado durante o clique.
        // Simulamos o bug executando a criação imediatamente. Se o aluno automatizar múltiplos clicks 
        // rápidos (ou disparar requisições repetidas), registros duplicados idênticos serão salvos 
        // no LocalStorage porque não desabilitamos o botão e nem verificamos duplicidade.
        
        const newUser = {
            id: Date.now().toString() + Math.floor(Math.random() * 100),
            name,
            email,
            age,
            profile,
            cpf,
            birth,
            phone,
            createdAt: Date.now()
        };

        users.push(newUser);
        localStorage.setItem("sgu_users", JSON.stringify(users));
        
        // Limpar formulário e atualizar listagem
        resetForm();
        renderUsersTable();
    }
});

// Preparar formulário para Edição
window.editUser = function(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;

    userIdInput.value = user.id;
    userNameInput.value = user.name;
    userEmailInput.value = user.email;
    userAgeInput.value = user.age;
    userProfileInput.value = user.profile;
    userCpfInput.value = user.cpf || "";
    userBirthInput.value = user.birth || "";
    userPhoneInput.value = user.phone || "";

    // Trocar estilo visual para Modo Edição
    document.getElementById("form-title").innerHTML = `<i data-lucide="pencil"></i><span>Editar Usuário</span>`;
    btnSaveUser.innerHTML = `<i data-lucide="save"></i><span>Atualizar Usuário</span>`;
    btnSaveUser.classList.add("btn-secondary");
    btnCancelEdit.classList.remove("hidden");
    
    // Rola para o formulário no mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    lucide.createIcons();
};

// Cancelar Edição
btnCancelEdit.addEventListener("click", () => {
    resetForm();
});

// Limpar Formulário
function resetForm() {
    userIdInput.value = "";
    userForm.reset();
    
    document.getElementById("form-title").innerHTML = `<i data-lucide="user-plus"></i><span>Novo Usuário</span>`;
    btnSaveUser.innerHTML = `<i data-lucide="check"></i><span>Salvar Usuário</span>`;
    btnSaveUser.classList.remove("btn-secondary");
    btnCancelEdit.classList.add("hidden");
    
    lucide.createIcons();
}

// BUG NA EXCLUSÃO: O botão de Exclusão remove o registro imediatamente, sem qualquer diálogo
// de confirmação (sem confirm(), sem modal ou alerta).
window.deleteUser = function(id) {
    // Exclui imediatamente sem confirmação
    users = users.filter(u => u.id !== id);
    localStorage.setItem("sgu_users", JSON.stringify(users));
    
    // Se o usuário excluído estava sendo editado, limpa o formulário
    if (userIdInput.value === id) {
        resetForm();
    }
    
    renderUsersTable();
};

// Pesquisa dinâmica na Tabela
searchInput.addEventListener("input", (e) => {
    renderUsersTable(e.target.value);
});

// ----------------------------------------------------
// FUNÇÕES AUXILIARES
// ----------------------------------------------------

// Formatação de data simples (AAAA-MM-DD -> DD/MM/AAAA)
function formatDate(dateString) {
    if (!dateString) return "Não informada";
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Segurança básica contra XSS nos dados salvos
function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Função para exibir Toast personalizado
function showToast(message, type = 'error') {
    // Cria o container de toasts se não existir
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Cria o elemento do toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Define o ícone de acordo com o tipo
    let iconName = 'alert-circle';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'warning') iconName = 'alert-triangle';

    toast.innerHTML = `
        <div class="toast-icon">
            <i data-lucide="${iconName}"></i>
        </div>
        <div class="toast-content">${escapeHTML(message)}</div>
        <button class="toast-close" title="Fechar">
            <i data-lucide="x"></i>
        </button>
    `;

    container.appendChild(toast);
    
    // Inicializa os ícones do Lucide no novo elemento
    lucide.createIcons({
        attrs: {
            class: 'lucide-icon'
        },
        nameAttr: 'data-lucide',
        node: toast
    });

    // Configura o fechamento automático após 4 segundos
    const autoCloseTimeout = setTimeout(() => {
        closeToast(toast);
    }, 4000);

    // Evento de clique para fechar manualmente
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(autoCloseTimeout);
        closeToast(toast);
    });
}

function closeToast(toast) {
    toast.classList.add('toast-fadeOut');
    toast.addEventListener('transitionend', () => {
        toast.remove();
        
        // Remove o container se estiver vazio
        const container = document.querySelector('.toast-container');
        if (container && container.childElementCount === 0) {
            container.remove();
        }
    });
}

