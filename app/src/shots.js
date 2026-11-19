// Fixed scenes for screenshots: ?shot=cover / duo / portrait / editor.
// `photo` picks the sample (samples/<photo>.jpg), `caption` sets the title,
// `grade` and `layout` override the preset. window.__shotReady is set once
// the scene has been painted.

const PRESETS = {
  cover: {
    layout: 'trio', grade: 'sunset',
    title: 'VICE CITY', tagline: 'Welcome back to Vice City',
    photo: 'pier',
  },
  duo: {
    layout: 'duo', grade: 'neon',
    title: 'NEON NIGHTS', tagline: 'The city never sleeps',
    photo: 'boulevard',
  },
  portrait: {
    layout: 'trio', grade: 'golden',
    title: 'GOLDEN HOUR', tagline: 'Chase the sunset',
    photo: 'pier',
  },
  editor: {
    layout: 'trio', grade: 'sunset',
    title: 'VICE CITY', tagline: 'Welcome back to Vice City',
    photo: 'pier',
  },
};

/** The preset for the current URL, or null when no ?shot= is given. */
export function shotPreset() {
  const query = new URLSearchParams(location.search);
  const shot = query.get('shot');
  if (!shot || !Object.hasOwn(PRESETS, shot)) return null;
  const base = PRESETS[shot];
  return {
    shot,
    layout: query.get('layout') || base.layout,
    grade: query.get('grade') || base.grade,
    title: query.get('caption') || base.title,
    tagline: query.get('tagline') || base.tagline,
    photo: query.get('photo') || base.photo,
  };
}

/** Mark the shot done after two animation frames, so the paint lands. */
export function markShotReady() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
