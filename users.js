/**
 * LeadFlow CRM — User management (Admin only)
 */
(function () {
  "use strict";

  var LF = window.LeadFlow;
  var session = LF.initAppShell("users");
  if (!session) return;

  if (!LF.isAdmin(session)) {
    document.getElementById("accessDenied").hidden = false;
    document.getElementById("addUserBtn").disabled = true;
    document.getElementById("userGrid").innerHTML = "";
    return;
  }

  var searchQuery = "";
  var deleteUserId = null;

  var userGrid = document.getElementById("userGrid");
  var userEditId = document.getElementById("userEditId");

  function getLeadCount(username) {
    return LF.getLeads().filter(function (l) { return l.addedBy === username; }).length;
  }

  function render() {
    var users = LF.getUsers().filter(function (u) {
      if (!searchQuery) return true;
      var q = searchQuery.toLowerCase();
      return [u.username, u.name, u.email, u.role, u.department].join(" ").toLowerCase().indexOf(q) !== -1;
    });

    userGrid.innerHTML = users.map(function (u) {
      var isSelf = u.id === session.userId;
      return (
        '<article class="user-card">' +
        '<div class="user-card__top">' +
        '<span class="user-card__avatar" style="background:' + u.avatarColor + '">' + u.username.charAt(0).toUpperCase() + "</span>" +
        "<div><div class=\"user-card__name\">" + LF.escapeHtml(u.name) +
        (u.role === "admin" ? ' <span class="badge badge--accent">Admin</span>' : "") +
        "</div><div class=\"user-card__title\">" + LF.escapeHtml(u.title || "—") + "</div></div></div>" +
        '<div class="user-card__meta">' +
        '<div><i class="fa-solid fa-at"></i>' + LF.escapeHtml(u.username) + "</div>" +
        '<div><i class="fa-solid fa-envelope"></i>' + LF.escapeHtml(u.email || "—") + "</div>" +
        '<div><i class="fa-solid fa-building"></i>' + LF.escapeHtml(u.department || "—") + "</div>" +
        '<div><i class="fa-solid fa-chart-line"></i>' + getLeadCount(u.username) + " leads</div>" +
        "</div>" +
        '<div class="category-card__actions">' +
        '<button type="button" class="btn btn--ghost btn--sm" data-edit="' + u.id + '"><i class="fa-solid fa-pen"></i> Edit</button>' +
        (!isSelf
          ? '<button type="button" class="btn btn--ghost btn--sm" data-delete="' + u.id + '" data-name="' + LF.escapeHtml(u.name) + '" style="color:var(--red)"><i class="fa-solid fa-trash"></i> Delete</button>'
          : '<span class="badge badge--neutral">Current user</span>') +
        "</div></article>"
      );
    }).join("");
  }

  function openModal(user) {
    document.getElementById("passwordHint").hidden = !user;
    if (user) {
      document.getElementById("userModalTitle").textContent = "Edit User";
      userEditId.value = user.id;
      document.getElementById("userUsername").value = user.username;
      document.getElementById("userUsername").readOnly = true;
      document.getElementById("userPassword").value = "";
      document.getElementById("userPassword").required = false;
      document.getElementById("userName").value = user.name;
      document.getElementById("userEmail").value = user.email || "";
      document.getElementById("userPhone").value = user.phone || "";
      document.getElementById("userRole").value = user.role;
      document.getElementById("userTitle").value = user.title || "";
      document.getElementById("userDepartment").value = user.department || "";
      document.getElementById("userBio").value = user.bio || "";
    } else {
      document.getElementById("userModalTitle").textContent = "Add User";
      userEditId.value = "";
      document.getElementById("userForm").reset();
      document.getElementById("userUsername").readOnly = false;
      document.getElementById("userPassword").required = true;
    }
    LF.openModal("userModal");
  }

  function saveUser() {
    var editId = userEditId.value;
    var username = document.getElementById("userUsername").value.trim();
    var password = document.getElementById("userPassword").value;
    var name = document.getElementById("userName").value.trim();

    if (!username || !name) { LF.showToast("Username and full name are required.", "error"); return; }
    if (!editId && (!password || password.length < 6)) {
      LF.showToast("Password must be at least 6 characters.", "error");
      return;
    }

    var users = LF.getUsers();

    if (!editId && users.some(function (u) { return u.username.toLowerCase() === username.toLowerCase(); })) {
      LF.showToast("Username already exists.", "error");
      return;
    }

    var data = {
      username: username,
      name: name,
      email: document.getElementById("userEmail").value.trim(),
      phone: document.getElementById("userPhone").value.trim(),
      role: document.getElementById("userRole").value,
      title: document.getElementById("userTitle").value.trim(),
      department: document.getElementById("userDepartment").value.trim(),
      bio: document.getElementById("userBio").value.trim(),
    };

    if (editId) {
      var idx = users.findIndex(function (u) { return u.id === editId; });
      if (idx === -1) return;
      users[idx] = Object.assign({}, users[idx], data);
      if (password) users[idx].password = password;
      LF.saveUsers(users);
      LF.logActivity("user", "User \"" + name + "\" updated.", session.username);
      LF.showToast("User updated.", "success");
    } else {
      var colors = ["#60A5FA", "#34D399", "#C084FC", "#FBBF24", "#F87171"];
      users.push(Object.assign({}, data, {
        id: LF.uid("usr"),
        password: password,
        avatarColor: colors[users.length % colors.length],
        createdAt: new Date().toISOString(),
        lastLogin: null,
      }));
      LF.saveUsers(users);
      LF.logActivity("user", "User \"" + name + "\" created.", session.username);
      LF.showToast("User created.", "success");
    }

    LF.closeModal("userModal");
    render();
  }

  function deleteUser() {
    if (!deleteUserId) return;
    var users = LF.getUsers();
    var user = users.find(function (u) { return u.id === deleteUserId; });
    if (!user) return;
    if (user.id === session.userId) { LF.showToast("Cannot delete your own account.", "error"); return; }
    var adminCount = users.filter(function (u) { return u.role === "admin"; }).length;
    if (user.role === "admin" && adminCount <= 1) {
      LF.showToast("Cannot delete the only administrator.", "error");
      LF.closeModal("deleteUserModal");
      return;
    }
    LF.saveUsers(users.filter(function (u) { return u.id !== deleteUserId; }));
    LF.logActivity("user", "User \"" + user.name + "\" deleted.", session.username);
    LF.showToast("User deleted.", "success");
    deleteUserId = null;
    LF.closeModal("deleteUserModal");
    render();
  }

  LF.bindModalClosers();
  document.getElementById("addUserBtn").addEventListener("click", function () { openModal(null); });
  document.getElementById("saveUserBtn").addEventListener("click", saveUser);

  userGrid.addEventListener("click", function (e) {
    var editBtn = e.target.closest("[data-edit]");
    if (editBtn) {
      var u = LF.getUsers().find(function (x) { return x.id === editBtn.getAttribute("data-edit"); });
      if (u) openModal(u);
      return;
    }
    var delBtn = e.target.closest("[data-delete]");
    if (delBtn) {
      deleteUserId = delBtn.getAttribute("data-delete");
      document.getElementById("deleteUserName").textContent = delBtn.getAttribute("data-name");
      LF.openModal("deleteUserModal");
    }
  });

  document.getElementById("confirmDeleteUserBtn").addEventListener("click", deleteUser);

  document.getElementById("globalSearch").addEventListener("input", function (e) {
    searchQuery = e.target.value;
    render();
  });

  render();
})();
