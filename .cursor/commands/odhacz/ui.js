// State
const state = {
  tasks: [],
  original: new Map(),
  current: new Map(),
  folders: [],
  editor: {
    file: null,
    content: null,
    hash: null
  }
};

// Elements
const $ = (sel) => document.querySelector(sel);
const folderFilter = $('#folder-filter');
const checkedFilter = $('#checked-filter');
const searchInput = $('#search');

// Init
async function init() {
  const pullBtn = $('#pull-btn');
  const pushBtn = $('#push-btn');
  const syncBtn = $('#sync-btn');
  const rtEditor = $('#rt-editor');

  if (pullBtn) pullBtn.addEventListener('click', pullChanges);
  if (pushBtn) pushBtn.addEventListener('click', pushChanges);
  if (syncBtn) syncBtn.addEventListener('click', syncGitHub);
  if (rtEditor) {
    rtEditor.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData)?.getData('text/plain') || '';
      document.execCommand('insertText', false, text);
    });
  }

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
      const pullBtn = $('#pull-btn');
      const pushBtn = $('#push-btn');
      const syncBtn = $('#sync-btn');

      if (pullBtn) pullBtn.style.display = 'inline-block';
      if (pushBtn) pushBtn.style.display = 'inline-block';
      if (syncBtn) syncBtn.style.display = 'inline-block';
      
      if (data.pending_changes) {
        if (pushBtn) {
          pushBtn.textContent = 'Push *';
          pushBtn.style.borderColor = '#e94560';
        }
        if (syncBtn) {
          syncBtn.textContent = '🔄 Sync *';
          syncBtn.style.borderColor = '#e94560';
        }
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
    
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '0.5rem';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = '✏️';
    editBtn.onclick = (e) => {
      e.stopPropagation();
      openFileEditor(file);
    };
    
    const addBtn = document.createElement('button');
    addBtn.className = 'add-task-btn';
    addBtn.textContent = '+';
    addBtn.onclick = (e) => {
      e.stopPropagation();
      toggleAddTaskForm(group, file);
    };
    
    actions.appendChild(editBtn);
    actions.appendChild(addBtn);
    
    header.appendChild(filename);
    header.appendChild(actions);
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

async function pullChanges() {
  const btn = $('#pull-btn');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Pull...';
  
  try {
    const resp = await fetch('/api/git/pull', { method: 'POST' });
    const result = await resp.json();
    
    if (result.success) {
      alert('✅ Pobrano zmiany');
      await loadTasks();
    } else {
      alert(`❌ Błąd pull:\n${result.error || JSON.stringify(result)}`);
    }
  } catch (err) {
    alert(`❌ Błąd: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

async function pushChanges() {
  const btn = $('#push-btn');
  if (!btn) return;
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Push...';
  
  try {
    const resp = await fetch('/api/git/push', { method: 'POST' });
    const result = await resp.json();
    
    if (result.success) {
      alert('✅ Wysłano zmiany');
      btn.style.borderColor = ''; // Reset style if it was red
      btn.textContent = 'Push';
    } else {
      alert(`❌ Błąd push:\n${result.error || JSON.stringify(result)}`);
    }
  } catch (err) {
    alert(`❌ Błąd: ${err.message}`);
  } finally {
    btn.disabled = false;
    if (btn.textContent !== 'Push') btn.textContent = originalText;
  }
}

async function syncGitHub() {
  const btn = $('#sync-btn');
  if (!btn) return;
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '🔄 Sync...';

  try {
    const resp = await fetch('/api/sync', { method: 'POST' });
    const result = await resp.json();

    if (result.success) {
      alert('✅ Zsynchronizowane');
      btn.style.borderColor = '';
      btn.textContent = '🔄 Sync';
      await loadTasks();
    } else {
      alert(`❌ Błąd sync:\n${result.error || JSON.stringify(result)}`);
    }
  } catch (err) {
    alert(`❌ Błąd: ${err.message}`);
  } finally {
    btn.disabled = false;
    if (btn.textContent !== '🔄 Sync') btn.textContent = originalText;
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

// File Editor
async function openFileEditor(file) {
  const modal = $('#editor-modal');
  const title = $('#editor-title');
  const textarea = $('#editor-textarea');
  
  title.textContent = `Edycja: ${file}`;
  textarea.value = 'Ładowanie...';
  modal.classList.add('active');
  document.body.classList.add('modal-open');
  
  try {
    const resp = await fetch(`/api/file?path=${encodeURIComponent(file)}`);
    const data = await resp.json();
    
    if (data.error) {
      alert(`Błąd: ${data.error}`);
      closeEditor();
      return;
    }
    
    state.editor.file = file;
    state.editor.content = data.content;
    state.editor.hash = data.hash;
    
    textarea.value = data.content;
    switchTab('edit');
  } catch (err) {
    alert(`Błąd ładowania: ${err.message}`);
    closeEditor();
  }
}

function closeEditor() {
  const modal = $('#editor-modal');
  modal.classList.remove('active');
  document.body.classList.remove('modal-open');
  state.editor = { file: null, content: null, hash: null };
}

function switchTab(tab) {
  // If leaving preview, persist changes back to textarea
  if ($('#preview-panel')?.classList.contains('active')) {
    syncFromRichText();
  }

  document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  
  if (tab === 'edit') {
    document.querySelector('.modal-tab:nth-child(1)').classList.add('active');
    $('#edit-panel').classList.add('active');
  } else if (tab === 'preview') {
    document.querySelector('.modal-tab:nth-child(2)').classList.add('active');
    $('#preview-panel').classList.add('active');
    renderPreview();
  }
}

async function saveFile() {
  const file = state.editor.file;
  if ($('#preview-panel')?.classList.contains('active')) {
    syncFromRichText();
  }
  const content = $('#editor-textarea').value;
  const hash = state.editor.hash;
  
  if (!file) return;
  
  const btn = $('#save-file-btn');
  btn.disabled = true;
  btn.textContent = 'Zapisuję...';
  
  try {
    const resp = await fetch('/api/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, content, original_hash: hash })
    });
    
    const result = await resp.json();
    
    if (result.success) {
      alert(`✅ Zapisano: ${file}`);
      closeEditor();
      await loadTasks();
    } else {
      alert(`❌ Błąd: ${result.error}`);
    }
  } catch (err) {
    alert(`❌ Błąd: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Zapisz';
  }
}

function renderPreview() {
  const content = $('#editor-textarea').value;
  const editor = $('#rt-editor');
  if (!editor) return;
  editor.innerHTML = markdownToHtml(content);
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderInline(md) {
  let s = escapeHtml(md);
  s = s.replace(/`([^`]+?)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
  return s;
}

function markdownToHtml(md) {
  const lines = (md || '').replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let inUl = false;

  const closeUl = () => {
    if (inUl) {
      out.push('</ul>');
      inUl = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/g, '');
    if (!line.trim()) {
      closeUl();
      out.push('<br>');
      continue;
    }

    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      closeUl();
      const level = h[1].length;
      out.push(`<h${level}>${renderInline(h[2])}</h${level}>`);
      continue;
    }

    const cb = line.match(/^\s*-\s*\[([ xX])\]\s+(.*)$/);
    if (cb) {
      if (!inUl) {
        out.push('<ul>');
        inUl = true;
      }
      const checked = cb[1].toLowerCase() === 'x';
      out.push(
        `<li class="rt-li"><input class="rt-checkbox" type="checkbox" ${checked ? 'checked' : ''} contenteditable="false" tabindex="-1"><span>${renderInline(cb[2])}</span></li>`
      );
      continue;
    }

    const li = line.match(/^\s*-\s+(.*)$/);
    if (li) {
      if (!inUl) {
        out.push('<ul>');
        inUl = true;
      }
      out.push(`<li>${renderInline(li[1])}</li>`);
      continue;
    }

    closeUl();
    out.push(`<div>${renderInline(line)}</div>`);
  }

  closeUl();
  return out.join('\n');
}

function htmlToMarkdown(rootEl) {
  const blocks = [];

  const inlineToMd = (el) => {
    const parts = [];
    el.childNodes.forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        parts.push(n.nodeValue || '');
        return;
      }
      if (n.nodeType !== Node.ELEMENT_NODE) return;
      const tag = n.tagName.toLowerCase();
      if (tag === 'strong' || tag === 'b') {
        parts.push(`**${inlineToMd(n)}**`);
      } else if (tag === 'em' || tag === 'i') {
        parts.push(`*${inlineToMd(n)}*`);
      } else if (tag === 'code') {
        parts.push('`' + (n.textContent || '').replace(/`/g, '') + '`');
      } else if (tag === 'br') {
        parts.push('\n');
      } else {
        parts.push(inlineToMd(n));
      }
    });
    return parts.join('');
  };

  const walkBlocks = (el) => {
    el.childNodes.forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        const t = (n.nodeValue || '').trim();
        if (t) blocks.push(t);
        return;
      }
      if (n.nodeType !== Node.ELEMENT_NODE) return;
      const tag = n.tagName.toLowerCase();

      if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
        const level = tag === 'h1' ? '#' : tag === 'h2' ? '##' : '###';
        blocks.push(`${level} ${inlineToMd(n).trim()}`);
        blocks.push('');
        return;
      }

      if (tag === 'ul') {
        n.querySelectorAll(':scope > li').forEach((li) => {
          const cb = li.querySelector('input.rt-checkbox[type="checkbox"]');
          const text = inlineToMd(li).replace(/\n+/g, ' ').trim();
          if (cb) {
            blocks.push(`- [${cb.checked ? 'x' : ' '}] ${text}`);
          } else {
            blocks.push(`- ${text}`);
          }
        });
        blocks.push('');
        return;
      }

      if (tag === 'div' || tag === 'p') {
        const t = inlineToMd(n).trim();
        if (t) blocks.push(t);
        return;
      }

      if (tag === 'br') {
        blocks.push('');
        return;
      }

      walkBlocks(n);
    });
  };

  walkBlocks(rootEl);

  return blocks
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd() + '\n';
}

function syncFromRichText() {
  const editor = $('#rt-editor');
  const textarea = $('#editor-textarea');
  if (!editor || !textarea) return;
  textarea.value = htmlToMarkdown(editor);
}

function rtCmd(cmd) {
  const editor = $('#rt-editor');
  if (!editor) return;
  editor.focus();

  if (cmd === 'code') {
    const sel = window.getSelection();
    const text = sel && sel.toString ? sel.toString() : '';
    if (text) {
      document.execCommand('insertHTML', false, `<code>${escapeHtml(text)}</code>`);
    } else {
      document.execCommand('insertHTML', false, '<code></code>');
    }
    return;
  }

  if (cmd === 'h1' || cmd === 'h2') {
    document.execCommand('formatBlock', false, cmd === 'h1' ? 'H1' : 'H2');
    return;
  }

  if (cmd === 'ul') {
    document.execCommand('insertUnorderedList');
    return;
  }

  document.execCommand(cmd);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 's' && state.editor.file) {
    e.preventDefault();
    saveFile();
  }
  if (e.key === 'Escape' && state.editor.file) {
    closeEditor();
  }
});

init();


