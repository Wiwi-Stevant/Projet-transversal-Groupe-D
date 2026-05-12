function loadUsers() {
  fetch('/api/users')
    .then(res => res.json())
    .then(users => {
      const list = document.getElementById('list');
      list.innerHTML = '';
      users.forEach(user => {
        const isActive = user.isActive !== false;
        const roleLabel = user.role === 'teacher' ? 'Professeur' : 'Étudiant';

        const li = document.createElement('li');
        li.className = 'group flex items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 shadow-sm shadow-slate-950/40 hover:border-indigo-400/80 hover:bg-slate-900 transition';
        li.innerHTML = `
          <div class="flex flex-col">
            <span class="font-medium leading-tight">${user.nom} ${user.prenom}</span>
            <span class="text-[11px] uppercase tracking-wide text-slate-500">
              ${roleLabel} · ${isActive ? 'Actif' : 'Inactif'} · ID&nbsp;#${user.id}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              data-action="toggle"
              class="inline-flex items-center justify-center rounded-full border border-emerald-500/70 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-200 shadow-sm shadow-emerald-900/40 hover:bg-emerald-500/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition"
              title="Activer / désactiver cet utilisateur"
            >
              ${isActive ? 'Désactiver' : 'Activer'}
            </button>
            <button
              data-action="delete"
              class="inline-flex h-7 w-7 items-center justify-center rounded-full border border-rose-500/60 bg-rose-500/10 text-[11px] font-semibold text-rose-200 shadow-sm shadow-rose-900/40 hover:bg-rose-500/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition"
              title="Supprimer cet utilisateur"
            >
              X
            </button>
          </div>`;

        const toggleBtn = li.querySelector('[data-action="toggle"]');
        const deleteBtn = li.querySelector('[data-action="delete"]');

        toggleBtn.addEventListener('click', () => {
          fetch(`/api/users/${user.id}/toggle-active`, { method: 'PATCH' })
            .then(() => loadUsers());
        });

        deleteBtn.addEventListener('click', () => {
          fetch(`/api/users/${user.id}`, { method: 'DELETE' })
            .then(() => loadUsers());
        });

        list.appendChild(li);
      });
    });
}

document.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();

  const nomInput = document.getElementById('nom');
  const prenomInput = document.getElementById('prenom');
  const roleSelect = document.getElementById('role');
  const errorEl = document.getElementById('form-error');

  const nom = nomInput.value.trim();
  const prenom = prenomInput.value.trim();
  const role = roleSelect.value;

  // Réinitialiser message d'erreur
  if (errorEl) {
    errorEl.classList.add('hidden');
  }

  // Validation simple : les deux champs doivent être remplis
  if (!nom || !prenom) {
    if (errorEl) {
      errorEl.textContent = 'Nom et prénom sont obligatoires.';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  // Validation du format : uniquement lettres (avec accents), apostrophe et tiret
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
  if (!nameRegex.test(nom) || !nameRegex.test(prenom)) {
    if (errorEl) {
      errorEl.textContent = "Seules les lettres (avec ou sans accents), l'apostrophe (') et le tiret du 6 (-) sont autorisés.";
      errorEl.classList.remove('hidden');
    }
    return;
  }

  fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nom, prenom, role })
  }).then(() => {
    nomInput.value = '';
    prenomInput.value = '';
    roleSelect.value = 'student';
    if (errorEl) {
      errorEl.classList.add('hidden');
    }
    loadUsers();
  });
});

loadUsers();
