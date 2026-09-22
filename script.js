const tiltCards = document.querySelectorAll('.tilt-card');

const updateTilt = (card, event) => {
  const rect = card.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const rotateY = ((x / rect.width) - 0.5) * 12;
  const rotateX = (0.5 - (y / rect.height)) * 12;

  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
};

const resetTilt = (card) => {
  card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
};

tiltCards.forEach((card) => {
  card.addEventListener('pointermove', (event) => updateTilt(card, event));
  card.addEventListener('pointerleave', () => resetTilt(card));
});
