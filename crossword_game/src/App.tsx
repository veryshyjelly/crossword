import './App.css'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useRef, useState } from 'react'
import { DateInput, DateValue } from '@mantine/dates'
import HandwritingCanvas from './handwriting.canvas';
import { ActionIcon, Button, Center, Group, Select, Stack, Text } from '@mantine/core';
import Confetti from '@tholman/confetti';
import { CluesInput, CrosswordGrid, CrosswordProvider, CrosswordProviderImperative, DirectionClues, ThemeProvider } from '@jaredreisinger/react-crossword'
import { getDataFromXd, updateCanvasPosition, isAllowedBinarySearch } from './utils';
import { fakeData } from './fakeData';
import { TbEraser, TbRestore } from 'react-icons/tb'

const BASE_URL = import.meta.env.VITE_BASE_URL;

type Crossword = {
  id: string,
  date: string,
  title: string,
  puzzle: string,
  publisher: string,
  editor: string | undefined,
  author: string | undefined,
  copyright: string | undefined,
}


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
  const crossword = useRef<CrosswordProviderImperative>(null);
  const handCanvas = useRef<HandwritingCanvas>(null);
  const [publishers, setPublishers] = useState<string[]>([]);
  const [dates, setDates] = useState<Dayjs[]>([]);
  const [publisher, setPublisher] = useState<string | null>();
  const [date, setDate] = useState<DateValue>();
  const [crossData, setCrossData] = useState<Crossword | null>();
  const [data, setData] = useState<CluesInput | null>(null);
  const [key, setKey] = useState("guesses");
  const allowedMonths = new Set(dates.map(d => d.format("YYYY-MM")));
  const allowedYears = new Set(dates.map(d => d.format("YYYY")));
  const [isExploding, setIsExploding] = useState(false);


  const onPublisherChange = (pub: string | null) => {
    setPublisher(pub)
    if (pub) {
      fetch(`${BASE_URL}/dates?publisher=${pub}`)
        .then(v => v.json())
        .then(v => {
          // @ts-ignore
          setDates(v.map(date => dayjs(date).startOf('day')).sort((a, b) => a.unix() - b.unix()))
          setDate(dayjs(v[0]).toDate())
        })
    }
  }

  const eraseCurrent = () => {
    let cv = handCanvas.current;
    crossword.current?.setGuess(cv?.i || 0, cv?.j || 0, "");
  }

  const onSubmit = () => {
    fetch(`${BASE_URL}/puzzle?publisher=${publisher}&date=${dayjs(date).format("YYYY-MM-DD")}`)
      .then(r => r.json())
      .then(v => {
        console.log(v);
        setKey(v.id);
        let datam = getDataFromXd(v.puzzle)
        setData(datam)
        setCrossData(v);
        window.history.pushState({ data: datam, key: v.id, crossData: crossData }, "", "puzzle")
      })
  }


  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        // Restore state when moving forward/backward
        setData(event.state.data);
        setKey(event.state.key);
        setCrossData(event.state.crossData);
      } else {
        // Destroy state (back to selection screen)
        setData(null);
        setKey("guesses");
        setCrossData(null);
      }
    };

    window.addEventListener("popstate", handlePopState);

    const input: HTMLElement | null = document.querySelector('[aria-label="crossword-input"]');
    if (!input) return

    // @ts-ignore
    const canvas: HTMLCanvasElement = document.getElementById("handwriting");

    if (!input || !canvas) return;

    handCanvas.current = new HandwritingCanvas(canvas, {
      strokeColor: "rgb(220, 186, 102)",
      lineWidth: 2,
      onClick: () => { input.click(); console.log("clicked") },
    });

    const updatePosition = () => updateCanvasPosition(handCanvas, crossword);

    window.addEventListener("resize", updatePosition);

    const observer = new MutationObserver(updatePosition);
    observer.observe(input, { attributes: true, attributeFilter: ["style"] });

    updatePosition(); // Initial positioning

    // Fetch publishers
    fetch(`${BASE_URL}/publishers`)
      .then((v) => v.json())
      .then((v) => setPublishers(v));

    // Cleanup function
    return () => {
      handCanvas.current?.destroy();
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("resize", updatePosition);
      observer.disconnect();
    };
  }, []); // Runs only on mount

  return (
    <>

      {isExploding && <Confetti total={99} style={{ display: isExploding ? "unset" : "none" }} />}

      {!data &&
        <Center style={{
          border: "1px solid var(--phillipinesilver)",
          height: window.innerHeight - 40,
          borderRadius: "20px",
        }}>
          <Stack>
            <Text fw={500} fz={24} mx={"auto"}> Crossword Puzzle </Text>
            <Select
              searchable
              label="Publisher"
              placeholder='Pick value'
              data={publishers}
              value={publisher}
              onChange={onPublisherChange}
            />
            <DateInput
              label="Date"
              value={date}
              onChange={setDate}
              excludeDate={(date) => !isAllowedBinarySearch(date, dates)}
              placeholder='Select Date'
              valueFormat='YYYY-DD-MM'
              getMonthControlProps={(month) => {
                return { disabled: !allowedMonths.has(dayjs(month).format("YYYY-MM")) }
              }}
              getYearControlProps={(year) => {
                return { disabled: !allowedYears.has(dayjs(year).format("YYYY")) }
              }}
            />
            <Button mx={"auto"} mt={"md"} color='green' onClick={onSubmit}> Go </Button>
          </Stack>
        </Center >
      }

      <Center style={{
        position: data ? "unset" : "absolute",
        top: 0,
        border: "1px solid var(--phillipinesilver)",
        borderRadius: "20px",
        visibility: data ? 'visible' : 'hidden'
      }}>
        <Stack>
          <Text mx={"auto"}>{crossData?.title}</Text>
          <ThemeProvider theme={darkTheme}>
            <CrosswordProvider storageKey={key} useStorage data={data || fakeData} ref={crossword}
              onCrosswordComplete={(v) => setIsExploding(v)}>
              <Group wrap='nowrap' align='flex-start'>
                <div style={{ width: `50em` }}>
                  <CrosswordGrid />
                </div>
                <Stack>
                  <Group ml={"auto"} mr={20} mb={-40}>
                    <ActionIcon color='transparent' onClick={() => crossword.current?.reset()}>
                      <TbRestore color='white' /></ActionIcon>
                    <ActionIcon color='transparent' onClick={() => eraseCurrent()}>
                      <TbEraser color='white' /></ActionIcon>
                  </Group>
                  <Group my={-20} wrap='nowrap' align='flex-start'>
                    <DirectionClues direction="across" />
                    <DirectionClues direction="down" />
                  </Group>
                </Stack>
              </Group>
            </CrosswordProvider>
          </ThemeProvider>
          <canvas id='handwriting' />
        </Stack>
      </Center>

    </>
  )
}

export default App
