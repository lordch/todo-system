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
  
  folderFilter.addEventListener('change', loadTasks);
  checkedFilter.addEventListener('change', loadTasks);
  
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(loadTasks, 300);
  });
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
  
  // Group by file
  const byFile = new Map();
  state.tasks.forEach(t => {
    if (!byFile.has(t.file)) byFile.set(t.file, []);
    byFile.get(t.file).push(t);
  });
  
  container.innerHTML = '';
  
  byFile.forEach((tasks, file) => {
    const group = document.createElement('div');
    group.className = 'file-group';
    
    const header = document.createElement('h2');
    header.textContent = file;
    header.onclick = () => group.classList.toggle('collapsed');
    group.appendChild(header);
    
    const tasksDiv = document.createElement('div');
    tasksDiv.className = 'tasks';
    
    tasks.forEach(t => {
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
      tasksDiv.appendChild(div);
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

init();
