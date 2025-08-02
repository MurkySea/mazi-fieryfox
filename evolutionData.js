export const evolutionData = {
  selene: [
    { title: 'Wandering Cub', minLevel: 1, image: 'images/selene_1.png' },
    { title: 'Moonlit Vixen', minLevel: 3, image: 'images/selene_2.png', aura: 'aura-moon' },
    { title: 'Celestial Kitsune', minLevel: 5, image: 'images/selene_3.png', aura: 'aura-celestial', bonus: 'lunarBlessing' }
  ],
  nyx: [
    { title: 'Shadow Pup', minLevel: 1, image: 'images/nyx_1.png' },
    { title: 'Night Stalker', minLevel: 4, image: 'images/nyx_2.png', aura: 'aura-shadow', bonus: 'stealthStep' }
  ],
  lilith: [
    { title: 'Cinder Kit', minLevel: 1, image: 'images/lilith_1.png' },
    { title: 'Flame Weaver', minLevel: 3, image: 'images/lilith_2.png', aura: 'aura-fire' }
  ],
  felina: [
    { title: 'Quiet Kit', minLevel: 1, image: 'images/felina_1.png' },
    { title: 'Star Healer', minLevel: 4, image: 'images/felina_2.png', aura: 'aura-starlight', bonus: 'healingPulse' }
  ]
};

if (typeof module !== 'undefined') {
  module.exports = { evolutionData };
}
