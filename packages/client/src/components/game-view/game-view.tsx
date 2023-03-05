import {
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
  WheelEventHandler,
} from 'react';
import styles from './game-view.module.pcss';
import cn from 'classnames';
import { ColorPicker } from 'components/color-picker';
import { renderPath } from './utils/render-path';
import { gameData } from './utils/game-data';
import { formColors } from './utils/form-colors';
// import { useDebounce } from 'components/hooks/use-debounce';

const HARD_CODE_POINTS = '2440';
const HARD_CODE_TIME = '2м:39с';
const CANVAS_SIZE = 400;

export const GameView: FC<{ gameId?: string }> = ({ gameId }) => {
  const [colors, setColors] = useState(() => formColors(gameData));
  const [activeId, setActiveId] = useState<number>(-1);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [transformOrigin, setTransformOrigin] = useState({
    y: CANVAS_SIZE,
    x: CANVAS_SIZE,
  });

  const refCanvas = useRef<HTMLCanvasElement>(null);
  const refField = useRef<HTMLDivElement>(null);
  const refResizable = useRef<HTMLDivElement>(null);

  if (!colors || !gameId) {
    throw new Error('!');
  }

  // основная функция рисования
  const draw = useCallback(() => {
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    renderPath(ctx, gameData.numbers);
    gameData.paths.forEach((path) => {
      renderPath(ctx, path);
    });
  }, [ctx]);

  // увеличиваем средствами css=GPU родителя канвас для того чтобы он занимал всю
  // игровую область и слушаем ресайз окна
  const resizeField = () => {
    if (!refField.current || !refCanvas.current) {
      return;
    }
    const { width, height, top } = refField.current.getBoundingClientRect();

    const availableWidth = Math.min(
      width,
      height,
      document.documentElement.clientHeight - top - 24
    );

    const scale = availableWidth / CANVAS_SIZE;

    if (!refResizable?.current) return;
    refResizable.current.style.transform = `scale(${scale})`;
  };

  useEffect(() => {
    resizeField();
    window.addEventListener('resize', resizeField);
    return () => window.removeEventListener('resize', resizeField);
  }, []);

  // колбек вынесен на этот уровень для того, чтобы он получал актуальное значение
  // activeId, при этом оборачивание в useCallback не сработает
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pathClickHandler = (e: MouseEvent) => {
    if (!ctx || activeId < 0) return;
    for (const pathItem of gameData.paths) {
      if (ctx.isPointInPath(pathItem.path, e.offsetX, e.offsetY)) {
        if (activeId !== pathItem.colorID || pathItem.completed) {
          break;
        }
        pathItem.completed = true;

        const renewedColors = colors.map((color) => {
          if (color.id === activeId && color.completed !== color.items) {
            color.completed += 1;
            color.progress = Math.floor((color.completed / color.items) * 100);
          }
          return color;
        });

        setColors(renewedColors);
        draw();
        break;
      }
    }
  };

  // сохраняем в стейт контекст, паттерн заливки, вешаем слушатель клика и запускаем
  // функцию рисования
  useEffect(() => {
    const canvasElement = refCanvas.current;
    if (!canvasElement) {
      throw new Error('no canvas HTML element found');
    }
    const context = canvasElement.getContext('2d');
    if (!context) {
      throw new Error('cannot get 2d context from Element');
    }

    setCtx(context);

    canvasElement.addEventListener('click', pathClickHandler);
    draw();
    return () => canvasElement.removeEventListener('click', pathClickHandler);
  }, [pathClickHandler, draw]);

  // слушаем смену цвета
  useEffect(() => {
    gameData.paths.forEach((item) => {
      if (item.colorID === activeId) {
        item.chosen = true;
      } else {
        item.chosen = false;
      }
    });
    draw();
  }, [activeId, draw]);

  // слушаем колесико мыши и, если мышка над канвасом,
  // приближаем / отдаляем картинку через стейт zoom
  const handleWheelEvent: WheelEventHandler<HTMLCanvasElement> = (e) => {
    e.stopPropagation();
    if (e.target !== refCanvas.current) {
      return;
    }
    let newZoom;
    if (e.deltaY > 0) {
      newZoom = Math.max(1, zoom - 0.05);
    } else {
      newZoom = Math.min(1.5, zoom + 0.05);
    }

    const { top, left } = refCanvas.current.getBoundingClientRect();

    setTransformOrigin({
      x: e.clientX - left,
      y: e.clientY - top,
    });
    setZoom(newZoom);
    draw();
  };

  return (
    <div>
      <div className={cn(styles.points)}>
        <p className="text-menu">{HARD_CODE_POINTS}</p>
        <p className="text-menu">{HARD_CODE_TIME}</p>
      </div>

      <div className={styles.game}>
        <ColorPicker
          colors={colors.map(({ progress, id, color }) => {
            return { id, progress, color };
          })}
          selected={activeId}
          onSelect={(key) => setActiveId(key)}
        />
        <div ref={refField} className={styles.gameField}>
          <div ref={refResizable} className={styles.canvasWrap}>
            <canvas
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: `${transformOrigin.x}px ${transformOrigin.y}px`,
              }}
              onWheel={handleWheelEvent}
              ref={refCanvas}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
