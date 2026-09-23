/* =====================================================
   Khadija Siddiqui — Home & Online Tutor  |  main.js
   3D hero scene (Three.js), tilt cards, nav, reveal
   ===================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav: scroll state + mobile toggle ---------- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function onScrollNav() {
    if (window.scrollY > 24) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 3D tilt cards ---------- */
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canHover && !prefersReducedMotion) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var max = parseFloat(card.getAttribute('data-tilt-max')) || 10;
      var rect = null;

      function move(e) {
        rect = rect || card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var rx = (0.5 - y) * max;
        var ry = (x - 0.5) * max;
        card.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateZ(0)';
        card.style.setProperty('--sx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--sy', (y * 100).toFixed(1) + '%');
      }
      function leave() {
        rect = null;
        card.style.transform = '';
      }
      card.addEventListener('mouseenter', function () { rect = card.getBoundingClientRect(); });
      card.addEventListener('mousemove', move);
      card.addEventListener('mouseleave', leave);
    });
  }

  /* ---------- Three.js hero scene ---------- */
  var canvas = document.getElementById('hero3d');
  if (!canvas || typeof THREE === 'undefined') return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (err) {
    return; // WebGL unavailable — hero still works without the scene
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  var key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(5, 8, 10);
  scene.add(key);
  var fill = new THREE.PointLight(0x9b82ea, 1.4, 60);
  fill.position.set(-8, -4, 6);
  scene.add(fill);

  var palette = [0x5b3fb8, 0x7455d6, 0x9b82ea, 0xc2b1f6, 0xa78bfa];
  function mat(color, opts) {
    return new THREE.MeshStandardMaterial(Object.assign({
      color: color, roughness: 0.35, metalness: 0.15,
      transparent: true, opacity: 0.92
    }, opts || {}));
  }

  var floaters = [];  // { mesh, speed, phase, rot }

  /* Book: cover + pages */
  function makeBook(size, color) {
    var g = new THREE.Group();
    var cover = new THREE.Mesh(new THREE.BoxGeometry(size, size * 1.3, size * 0.22), mat(color));
    var pages = new THREE.Mesh(new THREE.BoxGeometry(size * 0.92, size * 1.22, size * 0.16), mat(0xffffff, { roughness: 0.8, metalness: 0 }));
    pages.position.x = size * 0.06;
    pages.position.z = 0;
    var spine = new THREE.Mesh(new THREE.BoxGeometry(size * 0.06, size * 1.3, size * 0.22), mat(0x2a1a5e));
    spine.position.x = -size * 0.5;
    g.add(pages); g.add(cover); g.add(spine);
    cover.position.z = 0.0001;
    return g;
  }

  /* Graduation cap */
  function makeCap(size) {
    var g = new THREE.Group();
    var board = new THREE.Mesh(new THREE.BoxGeometry(size * 1.6, size * 0.08, size * 1.6), mat(0x3b2483));
    var crown = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.55, size * 0.6, size * 0.45, 32), mat(0x4e33a8));
    crown.position.y = -size * 0.25;
    var button = new THREE.Mesh(new THREE.SphereGeometry(size * 0.08, 16, 16), mat(0xffd166));
    button.position.y = size * 0.08;
    var tassel = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.02, size * 0.02, size * 0.8, 8), mat(0xffd166));
    tassel.position.set(size * 0.7, -size * 0.3, size * 0.7);
    var tasselEnd = new THREE.Mesh(new THREE.SphereGeometry(size * 0.07, 12, 12), mat(0xffd166));
    tasselEnd.position.set(size * 0.7, -size * 0.7, size * 0.7);
    g.add(board, crown, button, tassel, tasselEnd);
    return g;
  }

  /* DNA helix — a nod to Biotechnology */
  function makeHelix(length, radius, turns) {
    var g = new THREE.Group();
    var steps = 26;
    var sphereGeo = new THREE.SphereGeometry(0.16, 16, 16);
    var barGeo = new THREE.CylinderGeometry(0.04, 0.04, radius * 2, 8);
    var m1 = mat(0x7455d6), m2 = mat(0xc2b1f6), mb = mat(0xffffff, { opacity: 0.8 });
    for (var i = 0; i < steps; i++) {
      var t = i / (steps - 1);
      var y = (t - 0.5) * length;
      var a = t * Math.PI * 2 * turns;
      var x1 = Math.cos(a) * radius, z1 = Math.sin(a) * radius;
      var s1 = new THREE.Mesh(sphereGeo, m1); s1.position.set(x1, y, z1);
      var s2 = new THREE.Mesh(sphereGeo, m2); s2.position.set(-x1, y, -z1);
      var bar = new THREE.Mesh(barGeo, mb);
      bar.position.set(0, y, 0);
      bar.rotation.z = Math.PI / 2;
      bar.rotation.y = -a;
      g.add(s1, s2, bar);
    }
    return g;
  }

  function addFloater(mesh, x, y, z, speed, rot) {
    mesh.position.set(x, y, z);
    scene.add(mesh);
    floaters.push({
      mesh: mesh, baseY: y, baseX: x,
      speed: speed || 1, phase: Math.random() * Math.PI * 2,
      rot: rot || new THREE.Vector3(0.002, 0.004, 0.001)
    });
  }

  // Layout objects around the right/edges so text stays readable
  // Camera at z=14 / fov 50 sees roughly x ±10.4, y ±6.5 at z=0 on a 16:10 screen.
  // Keep the big pieces in the outer margins so the headline and card stay clean.
  var helix = makeHelix(7, 1.1, 2.2);
  helix.rotation.z = 0.35;
  addFloater(helix, 10.8, 0.2, -3, 0.6, new THREE.Vector3(0, 0.006, 0));

  var book1 = makeBook(1.3, 0x7455d6);
  book1.rotation.set(0.3, -0.5, 0.2);
  addFloater(book1, -9.8, 3.4, -3, 1.1, new THREE.Vector3(0.003, 0.005, 0.002));

  var book2 = makeBook(0.95, 0x9b82ea);
  book2.rotation.set(-0.2, 0.6, -0.3);
  addFloater(book2, -9, -4.2, -1, 0.9, new THREE.Vector3(0.004, -0.004, 0.002));

  var cap = makeCap(1.1);
  cap.rotation.set(0.2, 0.4, -0.1);
  addFloater(cap, 1.6, 5.6, -2, 0.8, new THREE.Vector3(0.002, 0.006, 0.001));

  // Low-poly shapes for depth
  var shapes = [
    { geo: new THREE.IcosahedronGeometry(0.7, 0), pos: [-3.5, 6.2, -6] },
    { geo: new THREE.OctahedronGeometry(0.6, 0), pos: [9.5, -4.4, -4] },
    { geo: new THREE.TorusGeometry(0.6, 0.2, 12, 40), pos: [0.6, -5.8, -3] },
    { geo: new THREE.DodecahedronGeometry(0.5, 0), pos: [-11, -0.5, -6] },
    { geo: new THREE.TorusKnotGeometry(0.42, 0.13, 80, 12), pos: [9.5, 5.5, -6] },
    { geo: new THREE.IcosahedronGeometry(0.4, 0), pos: [-1, -1.5, -10] }
  ];
  shapes.forEach(function (s, i) {
    var m = new THREE.Mesh(s.geo, mat(palette[i % palette.length], { flatShading: true, opacity: 0.8 }));
    addFloater(m, s.pos[0], s.pos[1], s.pos[2], 0.7 + Math.random() * 0.6,
      new THREE.Vector3(0.003 + Math.random() * 0.004, 0.003 + Math.random() * 0.004, 0.002));
  });

  // Particle field
  var pCount = 260;
  var pPos = new Float32Array(pCount * 3);
  for (var p = 0; p < pCount; p++) {
    pPos[p * 3] = (Math.random() - 0.5) * 36;
    pPos[p * 3 + 1] = (Math.random() - 0.5) * 22;
    pPos[p * 3 + 2] = -2 - Math.random() * 14;
  }
  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  var particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0x7455d6, size: 0.07, transparent: true, opacity: 0.55, sizeAttenuation: true
  }));
  scene.add(particles);

  /* ---------- Sizing ---------- */
  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    // Push objects out on narrow screens so they sit around the content
    var narrow = w < 960;
    helix.position.x = narrow ? 4.2 : 10.8;
    helix.position.y = narrow ? -7.5 : 0.2;
    helix.scale.setScalar(narrow ? 0.6 : 1);
    cap.position.x = narrow ? -3.8 : 1.6;
    cap.position.y = narrow ? 7 : 5.6;
    cap.scale.setScalar(narrow ? 0.8 : 1);
    book1.position.x = narrow ? -4.4 : -9.8;
    book1.position.y = narrow ? -8 : 3.4;
    book1.scale.setScalar(narrow ? 0.75 : 1);
    book2.position.x = narrow ? 4.4 : -9;
    book2.position.y = narrow ? 7.4 : -4.2;
    book2.scale.setScalar(narrow ? 0.8 : 1);
    floaters.forEach(function (f) { f.baseX = f.mesh.position.x; f.baseY = f.mesh.position.y; });
  }
  window.addEventListener('resize', resize);
  resize();

  /* ---------- Pointer parallax ---------- */
  var targetX = 0, targetY = 0, curX = 0, curY = 0;
  window.addEventListener('mousemove', function (e) {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ---------- Render loop (paused when hero is off-screen) ---------- */
  var running = true;
  var heroEl = document.getElementById('top');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting;
      if (running) requestAnimationFrame(tick);
    }, { threshold: 0.02 }).observe(heroEl);
  }

  var clock = new THREE.Clock();
  function tick() {
    if (!running) return;
    var t = clock.getElapsedTime();

    if (!prefersReducedMotion) {
      floaters.forEach(function (f) {
        f.mesh.position.y = f.baseY + Math.sin(t * f.speed + f.phase) * 0.45;
        f.mesh.position.x = f.baseX + Math.cos(t * f.speed * 0.6 + f.phase) * 0.2;
        f.mesh.rotation.x += f.rot.x;
        f.mesh.rotation.y += f.rot.y;
        f.mesh.rotation.z += f.rot.z;
      });
      particles.rotation.y = t * 0.015;
      particles.position.y = Math.sin(t * 0.2) * 0.3;

      curX += (targetX - curX) * 0.04;
      curY += (targetY - curY) * 0.04;
      camera.position.x = curX * 1.2;
      camera.position.y = -curY * 0.8;
      camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
})();
