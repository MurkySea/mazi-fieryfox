import React, { useState } from 'react';
import './CompanionTab.css';

const companions = {
  selene: {
    name: "Selene Graytail",
    title: "Moonlit Guardian",
    bio: "A steadfast and loyal ally who protects with quiet grace.",
    image: "/images/selene.png"
  },
  nyx: {
    name: "Nyx Shadowtail",
    title: "Whisper of the Night",
    bio: "Cunning and sly, she moves like a shadow in moonlight.",
    image: "/images/nyx.png"
  },
  lilith: {
    name: "Lilith Flamesworn",
    title: "Emberheart Sorceress",
    bio: "Her fiery presence is as dangerous as it is alluring.",
    image: "/images/lilith.png"
  },
  felina: {
    name: "Felina Moonshade",
    title: "Twilight Whisperer",
    bio: "A gentle spirit who draws power from the stars.",
    image: "/images/felina.png"
  }
};

export default function CompanionTab() {
  const [selectedCompanion, setSelectedCompanion] = useState(null);

  const openCard = (companionId) => {
    setSelectedCompanion(companions[companionId]);
  };

  const closeCard = () => {
    setSelectedCompanion(null);
  };

  return (
    <div className="companion-tab">
      <h2>Your Companions</h2>

      <div className="companion-list">
        {Object.entries(companions).map(([id, companion]) => (
          <div
            key={id}
            className="companion-card"
            onClick={() => openCard(id)}
          >
            <div className="companion-name">{companion.name}</div>
            <div className="companion-meta">
              <span className="stars">⭐️⭐️</span>
              <span className="trait">💙 {companion.title.split(' ')[0]}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedCompanion && (
        <div className="modal">
          <div className="modal-box">
            <img
              src={selectedCompanion.image}
              alt={selectedCompanion.name}
              className="card-img"
            />
            <h2>{selectedCompanion.name}</h2>
            <h4>{selectedCompanion.title}</h4>
            <p>{selectedCompanion.bio}</p>
            <button onClick={closeCard}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
