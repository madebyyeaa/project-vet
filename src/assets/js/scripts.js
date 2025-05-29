(() => {
  const {
    jsPDF
  } = window.jspdf;

  const loginPage = document.getElementById('login-page');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');
  const welcomeMessage = document.getElementById('welcome-message');
  const navButtons = document.querySelectorAll('nav#sidebar .nav-btn');
  const sections = document.querySelectorAll('main#main-panel > section');
  const recordForm = document.getElementById('record-form');
  const recordIdInput = document.getElementById('record-id');

  const animalNameInput = document.getElementById('animal-name');
  const animalBreedInput = document.getElementById('animal-breed');
  const animalAgeInput = document.getElementById('animal-age');
  const animalGenderInput = document.getElementById('animal-gender');
  const ownerNameInput = document.getElementById('owner-name');
  const ownerPhoneInput = document.getElementById('owner-phone');
  const ownerAddressInput = document.getElementById('owner-address');
  const anamnesaInput = document.getElementById('anamnesa');
  const diagnosisInput = document.getElementById('diagnosis');
  const therapyInput = document.getElementById('therapy');

  const saveRecordBtn = document.getElementById('save-record-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const recordsTableBody = document.getElementById('records-table-body');
  const recordsInfo = document.getElementById('records-info');
  const searchInput = document.getElementById('search-records');

  // User data
  const defaultUser = {
    username: 'vetadmin',
    password: 'vet123',
    fullname: 'Drh. Delsa Nataya Honnesy Saragih'
  };
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([defaultUser]));
  }

  function isLoggedIn() {
    return !!localStorage.getItem('loggedInUser');
  }

  function getLoggedInUser() {
    return JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  }

  function setLoggedInUser(user) {
    localStorage.setItem('loggedInUser', JSON.stringify(user));
  }

  function clearLoggedInUser() {
    localStorage.removeItem('loggedInUser');
  }

  function showSection(sectionId) {
    sections.forEach(section => {
      section.style.display = (section.id === sectionId) ? 'block' : 'none';
    });
    navButtons.forEach(btn => {
      if (btn.dataset.section === sectionId) {
        btn.classList.add('active');
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.classList.remove('active');
        btn.removeAttribute('aria-current');
      }
    });
  }

  // Records management
  function getRecords() {
    let records = localStorage.getItem('medicalRecords');
    return records ? JSON.parse(records) : [];
  }

  function saveRecords(records) {
    localStorage.setItem('medicalRecords', JSON.stringify(records));
  }

  function formatDateTime(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    const pad = n => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function(m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[m];
    });
  }

  function clearRecordForm() {
    recordIdInput.value = '';
    animalNameInput.value = '';
    animalBreedInput.value = '';
    animalAgeInput.value = '';
    animalGenderInput.value = '';
    ownerNameInput.value = '';
    ownerPhoneInput.value = '';
    ownerAddressInput.value = '';
    anamnesaInput.value = '';
    diagnosisInput.value = '';
    therapyInput.value = '';
    saveRecordBtn.textContent = 'Tambah Rekam Jejak';
    cancelEditBtn.style.display = 'none';
  }

  function renderRecordsTable() {
    const filterText = searchInput.value.trim().toLowerCase();
    let records = getRecords();
    if (filterText) {
      records = records.filter(r =>
        r.animalName.toLowerCase().includes(filterText) ||
        r.animalBreed.toLowerCase().includes(filterText) ||
        r.animalAge.toLowerCase().includes(filterText) ||
        r.animalGender.toLowerCase().includes(filterText) ||
        r.ownerName.toLowerCase().includes(filterText) ||
        r.ownerPhone.toLowerCase().includes(filterText) ||
        r.ownerAddress.toLowerCase().includes(filterText) ||
        r.anamnesa.toLowerCase().includes(filterText) ||
        r.diagnosis.toLowerCase().includes(filterText) ||
        r.therapy.toLowerCase().includes(filterText)
      );
    }

    recordsTableBody.innerHTML = '';
    if (records.length === 0) {
      recordsInfo.textContent = filterText ? 'Tidak ada rekam jejak yang cocok dengan pencarian.' : 'Belum ada rekam jejak medis.';
      return;
    } else {
      recordsInfo.textContent = filterText ? `Menampilkan ${records.length} hasil pencarian.` : `Total rekam jejak medis: ${records.length}`;
    }

    records.forEach((record, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(record.animalName)}</td>
        <td>${escapeHtml(record.animalBreed)}</td>
        <td>${escapeHtml(record.animalAge)}</td>
        <td>${escapeHtml(record.animalGender)}</td>
        <td>${escapeHtml(record.ownerName)}</td>
        <td>${escapeHtml(record.ownerPhone)}</td>
        <td>${escapeHtml(record.ownerAddress)}</td>
        <td>${escapeHtml(record.anamnesa)}</td>
        <td>${escapeHtml(record.diagnosis)}</td>
        <td>${escapeHtml(record.therapy)}</td>
        <td>${formatDateTime(record.timestamp)}</td>
        <td>
          <button class="btn-edit" aria-label="Edit record ${escapeHtml(record.animalName)}" data-index="${index}">Edit</button>
          <button class="btn-delete" aria-label="Delete record ${escapeHtml(record.animalName)}" data-index="${index}">Delete</button>
          <button class="btn-pdf" aria-label="Cetak PDF record ${escapeHtml(record.animalName)}" data-index="${index}">Cetak PDF</button>
        </td>
      `;
      recordsTableBody.appendChild(tr);
    });
  }

  // PDF generation function
  function generatePDF(record) {
    const doc = new jsPDF();
    const marginLeft = 15;
    let y = 10;

    doc.setFontSize(18);
    doc.text('Rekam Jejak Medis Hewan', 105, y, null, null, 'center');
    y += 10;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, 195, y);
    y += 10;

    const lineHeight = 8;
    doc.setFontSize(12);

    const addLine = (label, value) => {
      doc.setFont(undefined, 'bold');
      doc.text(label + ':', marginLeft, y);
      doc.setFont(undefined, 'normal');
      doc.text(String(value), marginLeft + 50, y);
      y += lineHeight;
    };

    addLine('Nama Hewan', record.animalName);
    addLine('Jenis / Ras', record.animalBreed);
    addLine('Umur', record.animalAge);
    addLine('Jenis Kelamin', record.animalGender);
    addLine('Nama Pemilik', record.ownerName);
    addLine('No. HP', record.ownerPhone);
    addLine('Alamat', record.ownerAddress);
    y += 5;
    doc.setFont(undefined, 'bold');
    doc.text('Anamnesa dan Pemeriksaan Fisik:', marginLeft, y);
    y += 7;
    doc.setFont(undefined, 'normal');
    const anamnesaLines = doc.splitTextToSize(record.anamnesa, 180);
    doc.text(anamnesaLines, marginLeft, y);
    y += anamnesaLines.length * lineHeight;

    y += 5;
    doc.setFont(undefined, 'bold');
    doc.text('Diagnosis:', marginLeft, y);
    y += 7;
    doc.setFont(undefined, 'normal');
    const diagnosisLines = doc.splitTextToSize(record.diagnosis, 180);
    doc.text(diagnosisLines, marginLeft, y);
    y += diagnosisLines.length * lineHeight;

    y += 5;
    doc.setFont(undefined, 'bold');
    doc.text('Terapi:', marginLeft, y);
    y += 7;
    doc.setFont(undefined, 'normal');
    const therapyLines = doc.splitTextToSize(record.therapy, 180);
    doc.text(therapyLines, marginLeft, y);
    y += therapyLines.length * lineHeight;

    y += 10;
    doc.setFont(undefined, 'bold');
    doc.text('Tanggal & Waktu:', marginLeft, y);
    doc.setFont(undefined, 'normal');
    doc.text(formatDateTime(record.timestamp), marginLeft + 50, y);

    doc.save(`rekam_medis_${record.animalName.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  }

  function initApp() {
    if (isLoggedIn()) {
      loginPage.style.display = 'none';
      dashboard.style.display = 'block';
      const user = getLoggedInUser();
      // welcomeMessage.textContent = `Selamat datang, ${user.fullname}!`;
      showSection('records-section');
      renderRecordsTable();
    } else {
      loginPage.style.display = 'block';
      dashboard.style.display = 'none';
      loginForm.reset();
      loginError.textContent = '';
    }
  }

  // Event listeners

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    loginError.textContent = '';
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const matchedUser = users.find(u => u.username === username && u.password === password);
    if (matchedUser) {
      setLoggedInUser(matchedUser);
      initApp();
    } else {
      loginError.textContent = 'Username atau password salah.';
    }
  });

  logoutBtn.addEventListener('click', () => {
    clearLoggedInUser();
    initApp();
  });

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      showSection(btn.dataset.section);
    });
  });

  cancelEditBtn.addEventListener('click', e => {
    e.preventDefault();
    clearRecordForm();
  });

  recordForm.addEventListener('submit', e => {
    e.preventDefault();
    const id = recordIdInput.value;
    const animalName = animalNameInput.value.trim();
    const animalBreed = animalBreedInput.value.trim();
    const animalAge = animalAgeInput.value.trim();
    const animalGender = animalGenderInput.value;
    const ownerName = ownerNameInput.value.trim();
    const ownerPhone = ownerPhoneInput.value.trim();
    const ownerAddress = ownerAddressInput.value.trim();
    const anamnesa = anamnesaInput.value.trim();
    const diagnosis = diagnosisInput.value.trim();
    const therapy = therapyInput.value.trim();

    // Basic validation
    if (!animalName || !animalBreed || !animalAge || !animalGender || !ownerName || !ownerPhone || !ownerAddress || !anamnesa || !diagnosis || !therapy) {
      alert('Semua field harus diisi dengan benar.');
      return;
    }

    let records = getRecords();
    const currentTimestamp = new Date().toISOString();

    if (id === '') {
      // Add new record with timestamp
      records.push({
        animalName,
        animalBreed,
        animalAge,
        animalGender,
        ownerName,
        ownerPhone,
        ownerAddress,
        anamnesa,
        diagnosis,
        therapy,
        timestamp: currentTimestamp
      });
    } else {
      // Edit existing record, update timestamp
      const idx = parseInt(id, 10);
      if (idx >= 0 && idx < records.length) {
        records[idx] = {
          animalName,
          animalBreed,
          animalAge,
          animalGender,
          ownerName,
          ownerPhone,
          ownerAddress,
          anamnesa,
          diagnosis,
          therapy,
          timestamp: currentTimestamp
        };
      }
    }
    saveRecords(records);
    clearRecordForm();
    renderRecordsTable();
  });

  recordsTableBody.addEventListener('click', e => {
    const target = e.target;
    if (target.classList.contains('btn-edit')) {
      const index = target.dataset.index;
      const allRecords = getRecords();
      const record = allRecords[index];
      if (record) {
        recordIdInput.value = index;
        animalNameInput.value = record.animalName;
        animalBreedInput.value = record.animalBreed;
        animalAgeInput.value = record.animalAge;
        animalGenderInput.value = record.animalGender;
        ownerNameInput.value = record.ownerName;
        ownerPhoneInput.value = record.ownerPhone;
        ownerAddressInput.value = record.ownerAddress;
        anamnesaInput.value = record.anamnesa;
        diagnosisInput.value = record.diagnosis;
        therapyInput.value = record.therapy;
        saveRecordBtn.textContent = 'Simpan Perubahan';
        cancelEditBtn.style.display = 'inline-block';
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        animalNameInput.focus();
      }
    } else if (target.classList.contains('btn-delete')) {
      const index = target.dataset.index;
      if (confirm('Apakah Anda yakin ingin menghapus rekam jejak ini?')) {
        let records = getRecords();
        records.splice(index, 1);
        saveRecords(records);
        renderRecordsTable();
        clearRecordForm();
      }
    } else if (target.classList.contains('btn-pdf')) {
      const index = target.dataset.index;
      const records = getRecords();
      const record = records[index];
      if (record) {
        generatePDF(record);
      }
    }
  });

  searchInput.addEventListener('input', () => {
    renderRecordsTable();
  });

  initApp();
})();