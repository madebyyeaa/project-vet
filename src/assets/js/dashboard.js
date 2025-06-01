(() => {
  const { jsPDF } = window.jspdf;

  // ELEMENTS
  const burgerBtn = document.getElementById('burger-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
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

  // Helper functions for localStorage user & records
  const clearLoggedInUser  = () => localStorage.removeItem('loggedInUser ');

  const isLoggedIn = () => !!localStorage.getItem('loggedInUser ');

  const getLoggedInUser  = () => JSON.parse(localStorage.getItem('loggedInUser ') || 'null');

  const getRecords = () => {
    const records = localStorage.getItem('medicalRecords');
    return records ? JSON.parse(records) : [];
  };

  const saveRecords = (records) => localStorage.setItem('medicalRecords', JSON.stringify(records));

  // Utilities
  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const escapeHtml = (text) => text.replace(/[&<>"']/g, (m) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[m];
  });

  // Navigation & Sections
  const showSection = (sectionId) => {
    sections.forEach((section) => {
      section.classList.toggle('active', section.id === sectionId);
    });
    navButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.section === sectionId);
      btn.setAttribute('aria-current', btn.dataset.section === sectionId ? 'page' : 'false');
    });
  };

  // Record Form Handling
  const clearRecordForm = () => {
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
  };

  const renderRecordsTable = () => {
    const filterText = searchInput.value.trim().toLowerCase();
    let records = getRecords();
    if (filterText) {
      records = records.filter((r) =>
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
          <button class="btn-edit" aria-label="Edit rekam jejak ${escapeHtml(record.animalName)}" data-index="${index}">Edit</button>
          <button class="btn-delete" aria-label="Hapus rekam jejak ${escapeHtml(record.animalName)}" data-index="${index}">Delete</button>
          <button class="btn-pdf" aria-label="Cetak PDF rekam jejak ${escapeHtml(record.animalName)}" data-index="${index}">PDF</button>
        </td>
      `;
      recordsTableBody.appendChild(tr);
    });
  };

  // PDF Generator
  const generatePDF = (record) => {
    const doc = new jsPDF();
    const marginLeft = 15;
    let y = 10;

    doc.setFontSize(18);
    doc.text('Rekam Jejak Medis Hewan', 105, y, { align: 'center' });
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

    const fileName = `rekam_medis_${record.animalName.replace(/\s+/g, '_').toLowerCase()}.pdf`;
    doc.save(fileName);
  };

  // Sidebar functions
  const closeSidebar = () => {
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
    burgerBtn.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('show');
  };

  const openSidebar = () => {
    sidebar.classList.add('open');
    sidebar.setAttribute('aria-hidden', 'false');
    burgerBtn.setAttribute('aria-expanded', 'true');
    overlay.classList.add('show');
  };

  const toggleSidebar = () => {
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };

  // Initialization
  const initApp = () => {
    if (!isLoggedIn()) {
      window.location.href = 'login_page.html';
      return;
    }
    const user = getLoggedInUser ();
    welcomeMessage.textContent = `Selamat datang, ${user.fullname}!`;
    showSection('records-section');
    renderRecordsTable();
    clearRecordForm();

    // Close sidebar on nav button click (mobile)
    navButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        showSection(btn.dataset.section);
        if (window.innerWidth < 600) {
          closeSidebar();
        }
      });
    });
  };

  // Event Listeners
  burgerBtn.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', closeSidebar);
  logoutBtn.addEventListener('click', () => {
    clearLoggedInUser ();
    window.location.href = 'login_page.html';
  });

  cancelEditBtn.addEventListener('click', (e) => {
    e.preventDefault();
    clearRecordForm();
  });

  recordForm.addEventListener('submit', (e) => {
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

    if (!animalName || !animalBreed || !animalAge || !animalGender || !ownerName || !ownerPhone || !ownerAddress || !anamnesa || !diagnosis || !therapy) {
      alert('Semua field harus diisi dengan benar.');
      return;
    }

    let records = getRecords();
    const currentTimestamp = new Date().toISOString();

    if (id === '') {
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
        timestamp: currentTimestamp,
      });
    } else {
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
          timestamp: currentTimestamp,
        };
      }
    }
    saveRecords(records);
    clearRecordForm();
    renderRecordsTable();
  });

  recordsTableBody.addEventListener('click', (e) => {
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

  searchInput.addEventListener('input', renderRecordsTable);

  // Jalankan inisialisasi aplikasi
  initApp();
})();