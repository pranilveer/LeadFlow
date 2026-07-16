/**
 * LeadFlow CRM — Authentication page logic
 */
(function () {
  "use strict";

  var LF = window.LeadFlow;

  /* Apply saved theme immediately */
  LF.applyTheme();

  /* Redirect if already authenticated */
  if (LF.getSession()) {
    window.location.href = "dashboard.html";
    return;
  }

  var form = document.getElementById("loginForm");
  var usernameInput = document.getElementById("username");
  var passwordInput = document.getElementById("password");
  var rememberMe = document.getElementById("rememberMe");
  var authAlert = document.getElementById("authAlert");
  var authAlertMessage = document.getElementById("authAlertMessage");
  var usernameError = document.getElementById("usernameError");
  var passwordError = document.getElementById("passwordError");
  var togglePassword = document.getElementById("togglePassword");
  var togglePasswordIcon = document.getElementById("togglePasswordIcon");
  var togglePasswordText = document.getElementById("togglePasswordText");
  var themeToggle = document.getElementById("themeToggle");
  var loginSubmit = document.getElementById("loginSubmit");

  function showAlert(message) {
    authAlertMessage.textContent = message;
    authAlert.hidden = false;
  }

  function hideAlert() {
    authAlert.hidden = true;
  }

  function clearFieldErrors() {
    usernameError.hidden = true;
    passwordError.hidden = true;
    usernameInput.classList.remove("input--error");
    passwordInput.classList.remove("input--error");
  }

  function setFieldError(el, errorEl, message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
    el.classList.add("input--error");
  }

  function validateForm() {
    clearFieldErrors();
    hideAlert();
    var valid = true;

    if (!usernameInput.value.trim()) {
      setFieldError(usernameInput, usernameError, "Username is required.");
      valid = false;
    }

    if (!passwordInput.value) {
      setFieldError(passwordInput, passwordError, "Password is required.");
      valid = false;
    } else if (passwordInput.value.length < 6) {
      setFieldError(passwordInput, passwordError, "Password must be at least 6 characters.");
      valid = false;
    }

    return valid;
  }

  function attemptLogin(username, password) {
    if (!validateForm()) return;

    loginSubmit.disabled = true;
    loginSubmit.querySelector(".btn__label").textContent = "Signing in…";

    /* Brief delay for polished UX */
    setTimeout(function () {
      var user = LF.authenticate(username, password);
      if (!user) {
        showAlert("Invalid username or password. Try a demo account below.");
        loginSubmit.disabled = false;
        loginSubmit.querySelector(".btn__label").textContent = "Continue to dashboard";
        return;
      }

      LF.setSession(user, rememberMe.checked);
      window.location.href = "dashboard.html";
    }, 400);
  }

  /* Form submit */
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      attemptLogin(usernameInput.value, passwordInput.value);
    });
  }

  /* Password visibility toggle */
  if (togglePassword) {
    togglePassword.addEventListener("click", function () {
      var isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      togglePasswordIcon.className = isPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
      togglePasswordText.textContent = isPassword ? "Hide" : "Show";
    });
  }

  /* Demo account quick-fill */
  document.querySelectorAll(".demo-account").forEach(function (btn) {
    btn.addEventListener("click", function () {
      usernameInput.value = btn.getAttribute("data-username");
      passwordInput.value = btn.getAttribute("data-password");
      clearFieldErrors();
      hideAlert();
      usernameInput.focus();
    });
  });

  /* Theme toggle */
  if (themeToggle) {
    themeToggle.addEventListener("click", LF.toggleTheme);
  }

  /* Restore remembered username */
  try {
    var remembered = localStorage.getItem("leadflow_remember_user");
    if (remembered) {
      usernameInput.value = remembered;
      rememberMe.checked = true;
    }
  } catch (e) { /* silent */ }

  if (rememberMe) {
    rememberMe.addEventListener("change", function () {
      if (!rememberMe.checked) localStorage.removeItem("leadflow_remember_user");
    });
  }

  if (form) {
    form.addEventListener("submit", function () {
      if (rememberMe && rememberMe.checked) {
        localStorage.setItem("leadflow_remember_user", usernameInput.value.trim());
      } else {
        localStorage.removeItem("leadflow_remember_user");
      }
    });
  }
})();
