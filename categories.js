/**
 * LeadFlow CRM — Categories page (CRUD)
 */
(function () {
  "use strict";

  var LF = window.LeadFlow;
  var session = LF.initAppShell("categories");
  if (!session) return;

  var searchQuery = "";
  var deleteCategoryId = null;
  var selectedColor = "#60A5FA";

  var categoryGrid = document.getElementById("categoryGrid");
  var categoryForm = document.getElementById("categoryForm");
  var categoryEditId = document.getElementById("categoryEditId");
  var categoryName = document.getElementById("categoryName");
  var categoryDescription = document.getElementById("categoryDescription");
  var categoryColor = document.getElementById("categoryColor");
  var colorPicker = document.getElementById("colorPicker");

  function render() {
    var categories = LF.getCategories().filter(function (c) {
      if (!searchQuery) return true;
      var q = searchQuery.toLowerCase();
      return c.name.toLowerCase().indexOf(q) !== -1 || (c.description || "").toLowerCase().indexOf(q) !== -1;
    });

    if (categories.length === 0) {
      categoryGrid.innerHTML = '<div class="table-empty" style="grid-column:1/-1"><i class="fa-solid fa-tags"></i>No categories match your search.</div>';
      return;
    }

    categoryGrid.innerHTML = categories.map(function (c) {
      return (
        '<article class="category-card" style="--cat-color:' + c.color + '">' +
        '<div class="category-card__header">' +
        '<span class="category-card__name">' + LF.escapeHtml(c.name) + "</span>" +
        '<span class="badge badge--neutral">' + (c.leadCount || 0) + " leads</span>" +
        "</div>" +
        '<p class="category-card__desc">' + LF.escapeHtml(c.description || "No description.") + "</p>" +
        '<div class="category-card__actions">' +
        '<button type="button" class="btn btn--ghost btn--sm" data-edit="' + c.id + '"><i class="fa-solid fa-pen"></i> Edit</button>' +
        (c.name !== "Other"
          ? '<button type="button" class="btn btn--ghost btn--sm" data-delete="' + c.id + '" data-name="' + LF.escapeHtml(c.name) + '" style="color:var(--red)"><i class="fa-solid fa-trash"></i> Delete</button>'
          : "") +
        "</div></article>"
      );
    }).join("");
  }

  function openModal(editCat) {
    if (editCat) {
      document.getElementById("categoryModalTitle").textContent = "Edit Category";
      categoryEditId.value = editCat.id;
      categoryName.value = editCat.name;
      categoryDescription.value = editCat.description || "";
      setColor(editCat.color);
      if (editCat.name === "Other") categoryName.readOnly = true;
      else categoryName.readOnly = false;
    } else {
      document.getElementById("categoryModalTitle").textContent = "Add Category";
      categoryEditId.value = "";
      categoryForm.reset();
      categoryName.readOnly = false;
      setColor("#60A5FA");
    }
    LF.openModal("categoryModal");
  }

  function setColor(color) {
    selectedColor = color;
    categoryColor.value = color;
    colorPicker.querySelectorAll(".color-swatch").forEach(function (sw) {
      sw.classList.toggle("color-swatch--selected", sw.getAttribute("data-color") === color);
    });
  }

  function saveCategory() {
    var name = categoryName.value.trim();
    if (!name) { LF.showToast("Category name is required.", "error"); return; }

    var data = { name: name, description: categoryDescription.value.trim(), color: selectedColor };
    var editId = categoryEditId.value;
    var result;

    if (editId) {
      result = LF.updateCategory(editId, data, session);
    } else {
      result = LF.addCategory(data, session);
    }

    if (result && result.error) { LF.showToast(result.error, "error"); return; }
    LF.showToast(editId ? "Category updated." : "Category created.", "success");
    LF.closeModal("categoryModal");
    render();
  }

  LF.bindModalClosers();

  document.getElementById("addCategoryBtn").addEventListener("click", function () { openModal(null); });
  document.getElementById("saveCategoryBtn").addEventListener("click", saveCategory);

  colorPicker.addEventListener("click", function (e) {
    var sw = e.target.closest(".color-swatch");
    if (sw) setColor(sw.getAttribute("data-color"));
  });

  categoryGrid.addEventListener("click", function (e) {
    var editBtn = e.target.closest("[data-edit]");
    if (editBtn) {
      var cat = LF.getCategories().find(function (c) { return c.id === editBtn.getAttribute("data-edit"); });
      if (cat) openModal(cat);
      return;
    }
    var delBtn = e.target.closest("[data-delete]");
    if (delBtn) {
      deleteCategoryId = delBtn.getAttribute("data-delete");
      document.getElementById("deleteCategoryName").textContent = delBtn.getAttribute("data-name");
      LF.openModal("deleteCategoryModal");
    }
  });

  document.getElementById("confirmDeleteCategoryBtn").addEventListener("click", function () {
    var result = LF.deleteCategory(deleteCategoryId, session);
    if (result && result.error) LF.showToast(result.error, "error");
    else LF.showToast("Category deleted.", "success");
    deleteCategoryId = null;
    LF.closeModal("deleteCategoryModal");
    render();
  });

  var globalSearch = document.getElementById("globalSearch");
  if (globalSearch) {
    globalSearch.addEventListener("input", function () {
      searchQuery = globalSearch.value;
      render();
    });
  }

  render();
})();
