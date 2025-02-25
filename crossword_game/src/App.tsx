import { useRef } from 'react'
import { CrosswordGrid, CrosswordProvider, CrosswordProviderImperative, DirectionClues, ThemeProvider } from '@jaredreisinger/react-crossword'
import './App.css'
import HandwritingCanvas from './handwriting.canvas';
import { updateCanvasPosition } from './updateCanvas';

const clue = '';

const data = {
  across: {
    1: { clue: 'This', answer: 'XXX', row: 0, col: 0 },
    4: { clue: 'is', answer: 'XXX', row: 0, col: 4 },
    7: { clue: 'not', answer: 'XXX', row: 1, col: 0 },
    8: { clue: 'a', answer: 'XXXX', row: 1, col: 4 },
    10: { clue: 'real', answer: 'XX', row: 2, col: 0 },
    11: { clue: 'crossword,', answer: 'XX', row: 2, col: 3 }, 12: { clue: 'it', answer: 'XX', row: 2, col: 6 },
    13: { clue: 'is', answer: 'XXXXXX', row: 3, col: 0 },
    16: { clue: 'only', answer: 'XXXXXX', row: 4, col: 2 },
    19: { clue: 'showing', answer: 'XX', row: 5, col: 0 },
    21: { clue: 'the', answer: 'XX', row: 5, col: 3 },
    22: { clue: 'kind', answer: 'XX', row: 5, col: 6 },
    23: { clue: 'of', answer: 'XXXX', row: 6, col: 0 },
    25: { clue: 'thing', answer: 'XXX', row: 6, col: 5 },
    26: { clue: 'you', answer: 'XXX', row: 7, col: 1 },
    27: { clue: 'can', answer: 'XXX', row: 7, col: 5 },
  },
  down: {
    1: { clue: 'create.', answer: 'XXXX', row: 0, col: 0 },
    2: { clue: 'All', answer: 'XXXX', row: 0, col: 1 },
    3: { clue: 'of', answer: 'XX', row: 0, col: 2 },
    4: { clue: 'the', answer: 'XXXXXX', row: 0, col: 4 },
    5: { clue: 'answers', answer: 'XX', row: 0, col: 5 },
    6: { clue: 'are', answer: 'XXX', row: 0, col: 6 },
    9: { clue: '"X"', answer: 'XX', row: 1, col: 7 },
  },
};

const darkTheme = {
  gridBackground: 'transparent',
  cellBackground: 'var(--black)',
  numberColor: 'var(--phillipinesilver)',
  cellBorder: 'var(--lightgray)',
  textColor: 'var(--earthyellow)',
  focusBackground: 'var(--metallicblue)',
  highlightBackground: 'var(--grayishblue)',
  allowNonSquare: true
};

function App() {
  const [cheight, cwidth] = [8, 8];
  const crossword = useRef<CrosswordProviderImperative>(null);
  let handCanvas = useRef<HandwritingCanvas>(null);


  window.onload = () => {
    // @ts-ignore
    const input: HTMLElement = document.querySelector('[aria-label="crossword-input"]');

    // @ts-ignore
    const canvas: HTMLCanvasElement = document.getElementById("handwriting");
    handCanvas.current = new HandwritingCanvas(canvas, {
      strokeColor: 'rgb(220, 186, 102)',
      lineWidth: 4,
      onClick: () => input.click()
    });

    window.addEventListener("resize", () =>
      updateCanvasPosition(handCanvas, crossword, cheight, cwidth, true));

    const observer = new MutationObserver(() =>
      updateCanvasPosition(handCanvas, crossword, cheight, cwidth, false));
    observer.observe(input, { attributes: true, attributeFilter: ["style"] });

    updateCanvasPosition(handCanvas, crossword, cheight, cwidth, true);
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ThemeProvider theme={darkTheme}>
        <CrosswordProvider data={data} ref={crossword}>
          <div style={{ display: 'flex', gap: '2em' }}>
            <div style={{
              marginLeft: "15%",
              width: `${cwidth * 4}em`,
              border: '1px solid rgb(96, 96, 96)',
            }}>
              <CrosswordGrid />
            </div>
            <DirectionClues direction="across" />
            <DirectionClues direction="down" />
          </div>
        </CrosswordProvider>
      </ThemeProvider>
      <canvas id='handwriting' />
    </div>
  )
}

export default App
