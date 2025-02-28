import { RefObject } from "react";
import HandwritingCanvas from "./handwriting.canvas";
import { CluesInput, CrosswordProviderImperative } from "@jaredreisinger/react-crossword";
import { xdToJSON } from "xd-crossword-tools";
import dayjs, { Dayjs } from "dayjs";

export const updateCanvasPosition = (
    canvas: RefObject<HandwritingCanvas | null>,
    crossword: RefObject<CrosswordProviderImperative | null>
) => {
    if (!canvas.current) return;
    let c = canvas.current.canvas;

    // @ts-ignore
    const input: HTMLElement | null | undefined = document.querySelector('[aria-label="crossword-input"]');
    if (!input) return

    // @ts-ignore
    let { width: w, height: h } = document.querySelector(".crossword svg").viewBox.baseVal;
    let ix = Math.round(+input.style.top.split(/[%(]/)[1] * h / 1000)
    let jx = Math.round(+input.style.left.split(/[%(]/)[1] * w / 1000)

    // Get input's position
    const rect = input.getBoundingClientRect();
    Object.assign(c.style, { position: "absolute", top: `${rect.top}px`, left: `${rect.left}px` })
    Object.assign(c, { width: rect.width, height: rect.height })

    canvas.current.onRecognize = (results) => {
        console.log(`results: ${results}`)
        if (canvas.current) {
            let cv = canvas.current;
            if (results) {
                crossword.current?.setGuess(cv.i, cv.j, results[0]);
            }
            cv.i = ix;
            cv.j = jx;
        }
    }
    canvas.current.recognize();
    canvas.current.eraseCanvas();
}

export const isAllowedBinarySearch = (date: Date, dates: Dayjs[]) => {
    let left = 0, right = dates.length - 1;
    const target = dayjs(date).startOf("day").unix();

    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        let midDate = dates[mid].unix();

        if (midDate === target) return true;
        if (midDate < target) left = mid + 1;
        else right = mid - 1;
    }
    return false;
};

export const getDataFromXd = (data: string): CluesInput => {
    const crossword = xdToJSON(data)
    const datam = {
        across: crossword.clues.across.reduce((acc, v) => {
            // @ts-ignore
            acc[v.number] = {
                clue: v.body,
                answer: v.answer,
                row: v.position.index,
                col: v.position.col
            };
            return acc
        }, {}),
        down: crossword.clues.down.reduce((acc, v) => {
            // @ts-ignore
            acc[v.number] = {
                clue: v.body,
                answer: v.answer,
                row: v.position.index,
                col: v.position.col
            };
            return acc
        }, {}),
    }
    return datam
}