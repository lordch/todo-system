// State
const state = {
  tasks: [],
  original: new Map(),
  current: new Map(),
  folders: []
};

// Elements
const $ = (sel) => document.querySelector(sel);
const folderFilter = $('#folder-filter');
const checkedFilter = $('#checked-filter');
const searchInput = $('#search');

// Init
async function init() {
  await loadTasks();
  await checkSyncStatus();
  
  folderFilter.addEventListener('change', loadTasks);
  checkedFilter.addEventListener('change', loadTasks);
  
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(loadTasks, 300);
  });
}

async function checkSyncStatus() {
  try {
    const resp = await fetch('/api/sync/status');
    const data = await resp.json();
    
    if (data.is_railway) {
      const syncBtn = $('#sync-btn');
      const syncStatus = $('#sync-status');
      
      syncBtn.style.display = 'inline-block';
      syncStatus.style.display = 'inline';
      
      if (data.last_sync) {
        const ago = timeSince(new Date(data.last_sync));
        syncStatus.textContent = ` · Sync: ${ago} temu`;
      } else {
        syncStatus.textContent = ' · Sync: nigdy';
      }
      
      if (data.pending_changes) {
        syncBtn.textContent = '🔄 Sync *';
        syncBtn.style.background = '#e94560';
      }
    }
  } catch (err) {
    console.log('Sync status unavailable');
  }
}

function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

// Load tasks from API
async function loadTasks() {
  $('#loading').style.display = 'block';
  $('#empty').style.display = 'none';
  $('#tasks').innerHTML = '';
  
  const params = new URLSearchParams();
  if (folderFilter.value) params.set('path', folderFilter.value);
  if (checkedFilter.value !== 'all') params.set('checked', checkedFilter.value);
  if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
  
  try {
    const resp = await fetch('/api/tasks?' + params);
    const data = await resp.json();
    
    state.tasks = data.tasks || [];
    state.folders = data.folders || [];
    
    // Reset state
    state.original.clear();
    state.current.clear();
    state.tasks.forEach(t => {
      const id = `${t.file}:${t.line}`;
      state.original.set(id, t.checked);
      state.current.set(id, t.checked);
    });
    
    // Update folder dropdown
    updateFolderDropdown();
    
    render();
  } catch (err) {
    console.error(err);
    $('#loading').style.display = 'none';
    $('#empty').textContent = 'Błąd ładowania: ' + err.message;
    $('#empty').style.display = 'block';
  }
}

function updateFolderDropdown() {
  const currentValue = folderFilter.value;
  const options = ['<option value="">Wszystkie foldery</option>'];
  
  state.folders.forEach(f => {
    options.push(`<option value="${f}/">${f}</option>`);
  });
  
  folderFilter.innerHTML = options.join('');
  folderFilter.value = currentValue;
}

function render() {
  $('#loading').style.display = 'none';
  const container = $('#tasks');
  const empty = $('#empty');
  
  if (state.tasks.length === 0) {
    empty.textContent = 'Brak zadań';
    empty.style.display = 'block';
    updateStats();
    return;
  }
  
  empty.style.display = 'none';
  
  // Group by file, then by section
  const byFile = new Map();
  state.tasks.forEach(t => {
    if (!byFile.has(t.file)) byFile.set(t.file, []);
    byFile.get(t.file).push(t);
  });
  
  // Dla każdego pliku, pogrupuj po sekcjach
  byFile.forEach((tasks, file) => {
    const bySection = new Map();
    tasks.forEach(t => {
      const sectionKey = t.section ? t.section.title : '(bez sekcji)';
      if (!bySection.has(sectionKey)) bySection.set(sectionKey, []);
      bySection.get(sectionKey).push(t);
    });
    byFile.set(file, bySection);
  });
  
  container.innerHTML = '';
  
  byFile.forEach((bySectionMap, file) => {
    const group = document.createElement('div');
    group.className = 'file-group';
    
    const header = document.createElement('h2');
    
    const filename = document.createElement('span');
    filename.className = 'filename';
    filename.textContent = file;
    filename.onclick = () => group.classList.toggle('collapsed');
    
    const addBtn = document.createElement('button');
    addBtn.className = 'add-task-btn';
    addBtn.textContent = '+';
    addBtn.onclick = (e) => {
      e.stopPropagation();
      toggleAddTaskForm(group, file);
    };
    
    header.appendChild(filename);
    header.appendChild(addBtn);
    group.appendChild(header);
    
    // Formularz dodawania taska
    const form = document.createElement('div');
    form.className = 'add-task-form';
    form.innerHTML = `
      <input type="text" placeholder="Nowy task..." class="new-task-input">
      <button onclick="addTask('${file}', this)">Dodaj</button>
    `;
    group.appendChild(form);
    
    const tasksDiv = document.createElement('div');
    tasksDiv.className = 'tasks';
    
    // Renderuj sekcje
    bySectionMap.forEach((sectionTasks, sectionName) => {
      if (sectionName !== '(bez sekcji)') {
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'section-header';
        sectionHeader.textContent = sectionName;
        sectionHeader.onclick = () => sectionHeader.nextElementSibling.classList.toggle('collapsed');
        tasksDiv.appendChild(sectionHeader);
      }
      
      const sectionDiv = document.createElement('div');
      sectionDiv.className = 'section-tasks';
      
      sectionTasks.forEach(t => {
        const id = `${t.file}:${t.line}`;
        const isChecked = state.current.get(id);
        const wasChanged = isChecked !== state.original.get(id);
        
        const div = document.createElement('div');
        div.className = 'task' + (isChecked ? ' checked' : '') + (wasChanged ? ' changed' : '');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'cb-' + id.replace(/[^a-z0-9]/gi, '_');
        checkbox.checked = isChecked;
        checkbox.addEventListener('change', () => toggle(t));
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = t.text.replace(/^-\s*\[.\]\s*/, '');
        
        const lineNum = document.createElement('span');
        lineNum.className = 'line-num';
        lineNum.textContent = 'L' + t.line;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        div.appendChild(lineNum);
        sectionDiv.appendChild(div);
      });
      
      tasksDiv.appendChild(sectionDiv);
    });
    
    group.appendChild(tasksDiv);
    container.appendChild(group);
  });
  
  updateStats();
}

function toggle(task) {
  const id = `${task.file}:${task.line}`;
  const current = state.current.get(id);
  state.current.set(id, !current);
  render();
}

function updateStats() {
  $('#total').textContent = state.tasks.length;
  $('#shown').textContent = state.tasks.length;
  
  let changes = 0;
  state.current.forEach((val, id) => {
    if (val !== state.original.get(id)) changes++;
  });
  $('#changes').textContent = changes;
  $('#save-btn').disabled = changes === 0;
}

async function saveChanges() {
  const changes = [];
  
  state.tasks.forEach(t => {
    const id = `${t.file}:${t.line}`;
    const currentChecked = state.current.get(id);
    const originalChecked = state.original.get(id);
    
    if (currentChecked !== originalChecked) {
      changes.push({
        file: t.file,
        line: t.line,
        original_line: t.original_line,
        checked: currentChecked
      });
    }
  });
  
  if (changes.length === 0) {
    alert('Brak zmian do zapisania');
    return;
  }
  
  const btn = $('#save-btn');
  btn.disabled = true;
  btn.textContent = 'Zapisuję...';
  
  try {
    const resp = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ changes })
    });
    
    const result = await resp.json();
    
    if (result.updated && result.updated.length > 0) {
      const summary = result.updated.map(u => `${u.file} L${u.line}: ${u.action}`).join('\n');
      alert(`✅ Zapisano ${result.updated.length} zmian:\n\n${summary}`);
      
      // Reload to get fresh state
      await loadTasks();
    }
    
    if (result.errors && result.errors.length > 0) {
      const errors = result.errors.map(e => `${e.file} L${e.line || ''}: ${e.error}`).join('\n');
      alert(`⚠️ Błędy:\n\n${errors}`);
    }
  } catch (err) {
    alert(`❌ Błąd: ${err.message}`);
  } finally {
    btn.textContent = 'Zapisz';
    updateStats();
  }
}

async function syncGitHub() {
  const btn = $('#sync-btn');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Syncuję...';
  
  try {
    const resp = await fetch('/api/sync', { method: 'POST' });
    const result = await resp.json();
    
    if (result.success) {
      alert('✅ Zsynchronizowane z GitHub');
      await checkSyncStatus();
      await loadTasks();
    } else {
      alert(`❌ Błąd sync:\n${result.error || JSON.stringify(result)}`);
    }
  } catch (err) {
    alert(`❌ Błąd: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

function toggleAddTaskForm(group, file) {
  const form = group.querySelector('.add-task-form');
  const isActive = form.classList.contains('active');
  
  // Zamknij wszystkie inne formularze
  document.querySelectorAll('.add-task-form.active').forEach(f => f.classList.remove('active'));
  
  if (!isActive) {
    form.classList.add('active');
    const input = form.querySelector('.new-task-input');
    input.focus();
    input.value = '';
  }
}

async function addTask(file, button) {
  const form = button.parentElement;
  const input = form.querySelector('.new-task-input');
  const text = input.value.trim();
  
  if (!text) {
    alert('Wpisz treść zadania');
    return;
  }
  
  button.disabled = true;
  button.textContent = 'Dodaję...';
  
  try {
    const resp = await fetch('/api/add-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, text })
    });
    
    const result = await resp.json();
    
    if (result.success) {
      input.value = '';
      form.classList.remove('active');
      await loadTasks();
      alert(`✅ Dodano: ${text}`);
    } else {
      alert(`❌ Błąd: ${result.error}`);
    }
  } catch (err) {
    alert(`❌ Błąd: ${err.message}`);
  } finally {
    button.disabled = false;
    button.textContent = 'Dodaj';
  }
}

init();


