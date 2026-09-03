const { fontawesomeSubset } = require('fontawesome-subset');

const solid = [
  'arrow-right', 'arrow-right-from-bracket', 'arrow-turn-up',
  'arrow-up-right-from-square', 'bowl-food', 'caret-left', 'caret-right',
  'circle-check', 'circle-chevron-left', 'circle-chevron-right',
  'circle-exclamation', 'circle-info', 'circle-question', 'circle-xmark',
  'clapperboard', 'face-frown-open', 'filter', 'heart', 'heart-crack',
  'lock', 'magnifying-glass', 'microphone-lines', 'paper-plane',
  'pen-to-square', 'plus', 'reply', 'robot', 'search', 'share-nodes',
  'spinner', 'star', 'star-half-stroke', 'stop', 'triangle-exclamation',
  'user', 'utensils', 'video', 'x', 'xmark',
];

const regular = [
  'clock', 'lightbulb', 'pen-to-square', 'trash-can', 'envelope', 'user',
  'star', 'heart',
];

const brands = [
  'github', 'instagram', 'linkedin-in', 'tiktok', 'whatsapp', 'youtube',
];

fontawesomeSubset(
  { solid, regular, brands },
  'src/assets/fontawesome-subset',
  { package: 'free', targetFormats: ['woff2'] },
).then(() => {
  console.log('Subset gerado com sucesso!');
}).catch((err) => {
  console.error('Erro ao gerar subset:', err);
  process.exit(1);
});