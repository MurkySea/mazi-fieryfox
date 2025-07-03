const companions = {
  selene: {
    name: "Selene Graytail",
    title: "Moonlit Guardian",
    bio: "A steadfast and loyal ally who protects with quiet grace.",
    image: "https://via.placeholder.com/100?text=Selene"
  },
  nyx: {
    name: "Nyx Shadowtail",
    title: "Whisper of the Night",
    bio: "Cunning and sly, she moves like a shadow in moonlight.",
    image: "https://via.placeholder.com/100?text=Nyx"
  },
  lilith: {
    name: "Lilith Flamesworn",
    title: "Emberheart Sorceress",
    bio: "Her fiery presence is as dangerous as it is alluring.",
    image: "https://via.placeholder.com/100?text=Lilith"
  },
  felina: {
    name: "Felina Moonshade",
    title: "Twilight Whisperer",
    bio: "A gentle spirit who draws power from the stars.",
    image: "https://via.placeholder.com/100?text=Felina"
  }
};

function openCharacterCard(id) {
  const companion = companions[id];
  document.getElementById('cardImage').src = companion.image;
  document.getElementById('cardName').textContent = companion.name;
  document.getElementById('cardTitle').textContent = companion.title;
  document.getElementById('cardBio').textContent = companion.bio;
  document.getElementById('characterModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('characterModal').classList.add('hidden');
}
