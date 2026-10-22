import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

// CanvasKit (the wasm build of Skia) must be ready before any module touches Skia,
// so the router entry loads only after it. `npm run web` copies canvaskit.wasm into public/.
LoadSkiaWeb({ locateFile: (file: string) => `/${file}` }).then(
  () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- must run after CanvasKit loads
    require('expo-router/entry');
  },
  () => {
    const root = document.getElementById('root');
    if (root) root.textContent = 'The game could not start: canvaskit.wasm did not load.';
  },
);
