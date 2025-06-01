(function() {
  // Default user data if not exist in localStorage
  const defaultUser  = {
    username: 'vetadmin',
    password: 'vet123',
    fullname: 'Drh. Delsa Nataya Honnesy Saragih'
  };

  // Initialize users in localStorage if not already set
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([defaultUser ]));
  }

  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');

  // Check if user is already logged in
  if (localStorage.getItem('loggedInUser ')) {
    window.location.href = 'dashboard.html'; // Redirect to dashboard if already logged in
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginError.textContent = ''; // Clear previous error message

    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;

    // Validate input
    if (!username || !password) {
      loginError.textContent = 'Username dan password harus diisi.';
      return;
    }

    // Retrieve users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const matchedUser  = users.find(u => u.username === username && u.password === password);

    // Check if user credentials match
    if (matchedUser ) {
      localStorage.setItem('loggedInUser ', JSON.stringify(matchedUser )); // Store logged in user
      window.location.href = 'dashboard.html'; // Redirect to dashboard
    } else {
      loginError.textContent = 'Username atau password salah.'; // Show error message
    }
  });
})();
