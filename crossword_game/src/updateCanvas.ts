import { RefObject, } from 'react'
import HandwritingCanvas from './handwriting.canvas';
import { CrosswordProviderImperative } from '@jaredreisinger/react-crossword'

export function updateCanvasPosition(
    canvas: RefObject<HandwritingCanvas | null>,
    crossword: RefObject<CrosswordProviderImperative | null>,
    width: number,
    height: number,
    resize: boolean,
) {
    if (!canvas.current) return;
    let c = canvas.current.canvas;

    // @ts-ignore
    const input: HTMLElement = document.querySelector('[aria-label="crossword-input"]');
    // @ts-ignore
    let ix = Math.round(input.style.top.split(/[%(]/)[1] * height / 100)
    // @ts-ignore
    let jx = Math.round(input.style.left.split(/[%(]/)[1] * width / 100)

    // Get input's position
    const rect = input.getBoundingClientRect();
    c.style.position = "absolute";
    c.style.top = `${rect.top}px`;
    c.style.left = `${rect.left}px`;

    if (resize) {
        // @ts-ignore
        c.width = rect.width;
        // @ts-ignore
        c.height = rect.height;
    } else {
        canvas.current.onRecognize = (results) => {
            console.log(`results: ${results}`)
            if (canvas.current) {
                let cv = canvas.current;
                let i = cv.i, j = cv.j;
                if (results) {
                    console.log(`setting guess ${results[0]} ${i} ${j}`)
                    crossword.current?.setGuess(i, j, results[0]);
                }
                cv.i = ix;
                cv.j = jx;
            }
        }
        canvas.current.recognize();
        canvas.current.eraseCanvas();
    }
}