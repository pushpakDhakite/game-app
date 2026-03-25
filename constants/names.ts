const RANDOM_NAMES = [
  'LemonLarry',
  'CitrusSally',
  'PuckerPete',
  'ZestyZara',
  'TangyTom',
  'SqueezeSam',
  'LemonyLisa',
  'JuicyJake',
  'FizzyFiona',
  'SourSteve',
  'SweetSue',
  'PulpPaul',
  'RindRachel',
  'GrapefruitGary',
  'LimeLuna',
  'OrangeOliver',
  'PeelPenny',
  'TartTina',
  'ZingZack',
  'FrostyFred',
  'CoolCathy',
  'SplashSid',
  'BubblyBeth',
  'ChillyCharlie',
];

export function getRandomName(): string {
  const index = Math.floor(Math.random() * RANDOM_NAMES.length);
  return RANDOM_NAMES[index];
}
