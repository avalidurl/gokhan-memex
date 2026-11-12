"use strict";

function setStatus(el, text, kind) {
  el.textContent = text;
  el.className = "status" + (kind ? " is-" + kind : "");
}

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("join");
  var email = document.getElementById("email");
  var status = document.getElementById("status");
  var signup = document.getElementById("signup");
  var closeBtn = document.getElementById("close-signup");
  var openMenu = document.getElementById("menu-signup");
  var openIcon = document.getElementById("icon-signup");
  var btn = form && form.querySelector("button[type=submit]");
  if (!form || !email || !status || !signup) return;

  function setSignupOpen(open) {
    signup.hidden = !open;
    if (openIcon) openIcon.hidden = open;
    if (open) {
      email.focus();
    } else if (openIcon) {
      openIcon.focus();
    }
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", function () { setSignupOpen(false); });
  }
  if (openMenu) {
    openMenu.addEventListener("click", function () { setSignupOpen(true); });
  }
  if (openIcon) {
    openIcon.addEventListener("click", function () { setSignupOpen(true); });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !signup.hidden) setSignupOpen(false);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var value = email.value.trim();
    if (!value) {
      setStatus(status, "REJECTED.", "err");
      email.focus();
      return;
    }

    btn.disabled = true;
    setStatus(status, "", null);

    fetch("/jesus/join", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: value,
        offering: form.elements.offering ? form.elements.offering.value : "",
      }),
    })
      .then(function (r) { return r.json().then(function (data) { return { r: r, data: data }; }); })
      .then(function (out) {
        if (out.r.ok && out.data && out.data.already) {
          setStatus(status, "ALREADY ON FILE.", "dup");
          btn.disabled = false;
          return;
        }
        if (out.r.ok && out.data && out.data.ok) {
          setStatus(status, "ACCEPTED.", "ok");
          email.disabled = true;
          return;
        }
        setStatus(status, "REJECTED.", "err");
        btn.disabled = false;
      })
      .catch(function () {
        setStatus(status, "REJECTED.", "err");
        btn.disabled = false;
      });
  });
});
