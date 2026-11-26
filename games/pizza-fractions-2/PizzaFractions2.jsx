'use client';

import { useEffect, useReducer, useRef, useState } from 'react';

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const pick = (items) => items[Math.floor(Math.random() * items.length)];
const CAMERA_DISTANCE = 4.2;

function createOrder(round) {
  if (round < 4) {
    const denominator = pick([2, 3, 4, 6, 8]);
    const numerator = 1 + Math.floor(Math.random() * (denominator - 1));
    return { kind: 'simple', slices: denominator, target: numerator, numerator, denominator };
  }

  if (round < 7) {
    const denominator = pick([2, 3, 4]);
    const numerator = 1 + Math.floor(Math.random() * (denominator - 1));
    const slices = pick([4, 6, 8, 12].filter((value) => value > denominator && value % denominator === 0));
    return {
      kind: 'equivalent',
      slices,
      target: (numerator * slices) / denominator,
      numerator,
      denominator,
    };
  }

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const slices = pick([6, 8, 12]);
    const denominators = [2, 3, 4, 6, 8, 12].filter((value) => value < slices && slices % value === 0);
    const firstDenominator = pick(denominators);
    const secondDenominator = pick(denominators);
    const firstNumerator = 1 + Math.floor(Math.random() * (firstDenominator - 1));
    const secondNumerator = 1 + Math.floor(Math.random() * (secondDenominator - 1));
    const target = (firstNumerator * slices) / firstDenominator
      + (secondNumerator * slices) / secondDenominator;

    if (firstDenominator !== secondDenominator && target < slices) {
      return {
        kind: 'addition',
        slices,
        target,
        firstNumerator,
        firstDenominator,
        secondNumerator,
        secondDenominator,
      };
    }
  }

  return {
    kind: 'addition',
    slices: 8,
    target: 6,
    firstNumerator: 1,
    firstDenominator: 2,
    secondNumerator: 1,
    secondDenominator: 4,
  };
}

function Fraction({ numerator, denominator }) {
  return (
    <span className="pf2-fraction">
      <b>{numerator}</b>
      <i>{denominator}</i>
    </span>
  );
}

function SimplifiedFraction({ numerator, denominator }) {
  const divisor = gcd(numerator, denominator);
  if (numerator === denominator) return <> = 1 whole</>;
  if (divisor <= 1) return null;
  return <> = <Fraction numerator={numerator / divisor} denominator={denominator / divisor} /></>;
}

function OrderText({ order }) {
  if (!order) return <>A fresh order is on its way.</>;
  if (order.kind === 'simple') {
    return <>Customer wants <Fraction numerator={order.numerator} denominator={order.denominator} /> of the pizza.</>;
  }
  if (order.kind === 'equivalent') {
    return (
      <>
        Customer wants <Fraction numerator={order.numerator} denominator={order.denominator} />.
        This pizza has {order.slices} slices. How many slices is that?
      </>
    );
  }
  return (
    <>
      Customer wants <Fraction numerator={order.firstNumerator} denominator={order.firstDenominator} />
      {' + '}
      <Fraction numerator={order.secondNumerator} denominator={order.secondDenominator} />.
      This pizza has {order.slices} slices.
    </>
  );
}

export default function PizzaFractions2({ onComplete }) {
  const canvasRef = useRef(null);
  const game = useRef({
    slices: 8,
    target: 0,
    selected: new Set(),
    round: 0,
    tries: 0,
    score: 0,
    streak: 0,
    firstTryCorrect: 0,
    locked: false,
    order: null,
    lift: [],
    paths: [],
    yaw: 0.4,
    rotation: 0.4,
    pitch: 0.95,
    drag: null,
    moved: false,
    width: 0,
    height: 0,
    dpr: 1,
  }).current;
  const [, refresh] = useReducer((value) => value + 1, 0);
  const [screen, setScreen] = useState('start');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const resize = () => {
      game.dpr = Math.min(window.devicePixelRatio || 1, 2);
      const bounds = canvas.getBoundingClientRect();
      game.width = bounds.width;
      game.height = bounds.height;
      canvas.width = Math.round(game.width * game.dpr);
      canvas.height = Math.round(game.height * game.dpr);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const project = (x, y, z) => {
      const yawCos = Math.cos(game.yaw);
      const yawSin = Math.sin(game.yaw);
      const rotatedX = x * yawCos + z * yawSin;
      const rotatedZ = -x * yawSin + z * yawCos;
      const pitchCos = Math.cos(game.pitch);
      const pitchSin = Math.sin(game.pitch);
      const rotatedY = y * pitchCos - rotatedZ * pitchSin;
      const depth = y * pitchSin + rotatedZ * pitchCos;
      const radius = Math.max(50, Math.min(game.width * 0.4, game.height * 0.46));
      const scale = (radius * CAMERA_DISTANCE) / (CAMERA_DISTANCE - depth);
      return [game.width / 2 + rotatedX * scale, game.height * 0.55 - rotatedY * scale, depth];
    };

    const polygon = (points, fill, stroke, lineWidth = 1) => {
      context.beginPath();
      points.forEach(([x, y], index) => {
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.closePath();
      if (fill) {
        context.fillStyle = fill;
        context.fill();
      }
      if (stroke) {
        context.strokeStyle = stroke;
        context.lineWidth = lineWidth;
        context.lineJoin = 'round';
        context.stroke();
      }
    };

    const ellipse = (x, z, radiusX, radiusZ, y, colors, stroke, seed = 0, wobble = 0.04) => {
      const points = Array.from({ length: 28 }, (_, index) => {
        const angle = (index / 28) * Math.PI * 2;
        const variation = 1
          + Math.sin(angle * 3 + seed) * wobble
          + Math.cos(angle * 5 - seed) * wobble * 0.4;
        return project(
          x + Math.cos(angle) * radiusX * variation,
          y,
          z + Math.sin(angle) * radiusZ * variation,
        );
      });
      const center = project(x, y, z);
      const edgeX = project(x + radiusX, y, z);
      const edgeZ = project(x, y, z + radiusZ);
      const radius = Math.max(
        2,
        Math.hypot(edgeX[0] - center[0], edgeX[1] - center[1]),
        Math.hypot(edgeZ[0] - center[0], edgeZ[1] - center[1]),
      );
      const gradient = context.createRadialGradient(
        center[0] - radius * 0.3,
        center[1] - radius * 0.35,
        radius * 0.03,
        center[0],
        center[1],
        radius * 1.2,
      );
      colors.forEach((color, index) => {
        gradient.addColorStop(index / (colors.length - 1), color);
      });
      polygon(points, gradient, stroke);
    };

    const pepperoni = (x, z, y, seed, scale) => {
      ellipse(x, z, 0.078 * scale, 0.066 * scale, y,
        ['#f5795d', '#c94130', '#87221b'], '#782018', seed, 0.095);
      for (let index = 0; index < 3; index += 1) {
        const angle = seed + index * 2.2;
        ellipse(
          x + Math.cos(angle) * 0.022 * scale,
          z + Math.sin(angle) * 0.022 * scale,
          0.008 * scale,
          0.006 * scale,
          y + 0.002,
          ['rgba(255,190,153,.85)', 'rgba(227,100,75,.1)'],
          null,
          seed + index,
          0.015,
        );
      }
    };

    const mushroom = (x, z, y, seed) => {
      ellipse(x, z, 0.066, 0.052, y, ['#fff0d5', '#ddbd91', '#98704d'], '#8d6747', seed, 0.1);
      ellipse(x, z, 0.018, 0.036, y + 0.003, ['#ead5b5', '#b18a60', '#765638'], null, seed + 1, 0.04);
    };

    const olive = (x, z, y, seed) => {
      ellipse(x, z, 0.047, 0.039, y, ['#69784b', '#35452f', '#111c17'], '#18241b', seed, 0.075);
      ellipse(x, z, 0.015, 0.013, y + 0.003, ['#f3cf69', '#c08d3e', '#90612c'], '#795326', seed + 2, 0.025);
    };

    const greenPepper = (centerX, centerZ, y, angle) => {
      const points = [];
      for (let index = 0; index <= 12; index += 1) {
        const t = index / 12;
        const arcAngle = angle + (t - 0.5) * 0.95;
        const radius = 0.09 + Math.sin(t * Math.PI) * 0.008;
        points.push([
          centerX + Math.cos(arcAngle) * (radius + 0.014),
          centerZ + Math.sin(arcAngle) * (radius + 0.014),
        ]);
      }
      for (let index = 12; index >= 0; index -= 1) {
        const t = index / 12;
        const arcAngle = angle + (t - 0.5) * 0.95;
        const radius = 0.09 + Math.sin(t * Math.PI) * 0.008;
        points.push([
          centerX + Math.cos(arcAngle) * (radius - 0.014),
          centerZ + Math.sin(arcAngle) * (radius - 0.014),
        ]);
      }
      const projected = points.map(([x, z]) => project(x, y, z));
      const center = project(centerX, y, centerZ);
      const gradient = context.createRadialGradient(center[0] - 3, center[1] - 3, 1, center[0], center[1], 18);
      gradient.addColorStop(0, '#a3c86b');
      gradient.addColorStop(0.5, '#54863c');
      gradient.addColorStop(1, '#254c27');
      polygon(projected, gradient, '#284b24');
    };

    const drawSlice = (index, count) => {
      const sliceAngle = (Math.PI * 2) / count;
      const gap = 0.035;
      const startAngle = index * sliceAngle + gap;
      const endAngle = (index + 1) * sliceAngle - gap;
      const middleAngle = (startAngle + endAngle) / 2;
      const lift = game.lift[index] || 0;
      const offsetX = Math.cos(middleAngle) * 0.2 * lift;
      const offsetZ = Math.sin(middleAngle) * 0.2 * lift;
      const offsetY = 0.28 * lift;
      const cheeseHeight = 0.09;
      const crustHeight = 0.14;
      const segments = Math.max(8, Math.round(48 / count));
      const point = (radius, angle, height) => project(
        offsetX + Math.cos(angle) * radius,
        offsetY + height,
        offsetZ + Math.sin(angle) * radius,
      );
      const arc = (radius, height, from, to) => Array.from(
        { length: segments + 1 },
        (_, segment) => point(radius, from + ((to - from) * segment) / segments, height),
      );

      for (const angle of [startAngle, endAngle]) {
        polygon([
          point(0, angle, 0),
          point(1, angle, 0),
          point(1, angle, crustHeight),
          point(0, angle, crustHeight),
        ], '#a65e2b');
      }

      const sideGradient = context.createLinearGradient(0, game.height * 0.38, 0, game.height * 0.72);
      sideGradient.addColorStop(0, '#d38a42');
      sideGradient.addColorStop(0.45, '#bd702e');
      sideGradient.addColorStop(1, '#87451f');
      for (let segment = 0; segment < segments; segment += 1) {
        const from = startAngle + ((endAngle - startAngle) * segment) / segments;
        const to = startAngle + ((endAngle - startAngle) * (segment + 1)) / segments;
        polygon([
          point(1, from, 0),
          point(1, to, 0),
          point(1, to, crustHeight),
          point(1, from, crustHeight),
        ], sideGradient);
      }

      const cheeseCenter = project(offsetX, offsetY + cheeseHeight, offsetZ);
      const cheeseEdge = project(offsetX + 0.84, offsetY + cheeseHeight, offsetZ);
      const cheeseRadius = Math.hypot(
        cheeseEdge[0] - cheeseCenter[0],
        cheeseEdge[1] - cheeseCenter[1],
      );
      const cheeseGradient = context.createRadialGradient(
        cheeseCenter[0] - cheeseRadius * 0.25,
        cheeseCenter[1] - cheeseRadius * 0.3,
        1,
        cheeseCenter[0],
        cheeseCenter[1],
        cheeseRadius,
      );
      cheeseGradient.addColorStop(0, '#ffe47c');
      cheeseGradient.addColorStop(0.45, '#f6c448');
      cheeseGradient.addColorStop(0.85, '#eeb13a');
      cheeseGradient.addColorStop(1, '#d98e2e');
      polygon([point(0, startAngle, cheeseHeight), ...arc(0.84, cheeseHeight, startAngle, endAngle)],
        cheeseGradient, '#d18d30');

      const sauceGradient = context.createLinearGradient(
        cheeseCenter[0], cheeseCenter[1] - 10, cheeseCenter[0], cheeseCenter[1] + 20,
      );
      sauceGradient.addColorStop(0, '#d85b34');
      sauceGradient.addColorStop(1, '#a83220');
      polygon([
        ...arc(0.795, cheeseHeight + 0.003, startAngle, endAngle),
        ...arc(0.84, cheeseHeight + 0.003, endAngle, startAngle),
      ], sauceGradient, '#c35a2c', 0.5);

      const toppingY = offsetY + cheeseHeight + 0.012;
      for (let mark = 0; mark < 3; mark += 1) {
        const angle = startAngle + (endAngle - startAngle) * (0.25 + mark * 0.23);
        const radius = 0.19 + (mark % 2) * 0.21;
        ellipse(
          offsetX + Math.cos(angle) * radius,
          offsetZ + Math.sin(angle) * radius,
          0.025,
          0.016,
          toppingY,
          ['rgba(188,91,29,.42)', 'rgba(224,153,52,.15)'],
          null,
          index * 7 + mark,
          0.25,
        );
      }

      const toppingScale = count > 8 ? 0.78 : count > 6 ? 0.9 : 1;
      for (let topping = 0; topping < 2; topping += 1) {
        const radius = topping === 0 ? 0.37 : 0.65;
        const angle = middleAngle + (topping === 0 ? -0.065 : 0.065);
        pepperoni(
          offsetX + Math.cos(angle) * radius,
          offsetZ + Math.sin(angle) * radius,
          toppingY + 0.002,
          index * 11 + topping,
          toppingScale,
        );
      }

      if (count <= 8) {
        if (index % 2 === 0) {
          const angle = middleAngle + 0.12;
          mushroom(
            offsetX + Math.cos(angle) * 0.54,
            offsetZ + Math.sin(angle) * 0.54,
            toppingY + 0.004,
            index,
          );
        }
        if (index % 3 === 0) {
          const angle = middleAngle - 0.13;
          olive(
            offsetX + Math.cos(angle) * 0.23,
            offsetZ + Math.sin(angle) * 0.23,
            toppingY + 0.006,
            index,
          );
        }
        if (index % 2 === 1) {
          const angle = middleAngle + 0.03;
          greenPepper(
            offsetX + Math.cos(angle) * 0.49,
            offsetZ + Math.sin(angle) * 0.49,
            toppingY + 0.008,
            angle + 1,
          );
        }
      }

      for (let leaf = 0; leaf < 3; leaf += 1) {
        const angle = middleAngle + (leaf - 1) * 0.19;
        const radius = 0.17 + leaf * 0.13;
        ellipse(
          offsetX + Math.cos(angle) * radius,
          offsetZ + Math.sin(angle) * radius,
          0.012,
          0.007,
          toppingY + 0.01,
          ['#8aaf50', '#385f2e', '#213c20'],
          null,
          index * 4 + leaf,
          0.08,
        );
      }

      const crustCenter = project(offsetX, offsetY + crustHeight, offsetZ);
      const crustGradient = context.createLinearGradient(
        crustCenter[0] - 15, crustCenter[1] - 30, crustCenter[0] + 15, crustCenter[1] + 25,
      );
      crustGradient.addColorStop(0, '#ffca80');
      crustGradient.addColorStop(0.3, '#eca14c');
      crustGradient.addColorStop(0.7, '#d58435');
      crustGradient.addColorStop(1, '#b66b2b');
      polygon([
        ...arc(0.84, crustHeight, startAngle, endAngle),
        ...arc(1, crustHeight, endAngle, startAngle),
      ], crustGradient, '#a95f28');

      for (let mark = 1; mark <= 3; mark += 1) {
        const angle = startAngle + ((endAngle - startAngle) * mark) / 4;
        const first = point(0.9, angle - 0.025, crustHeight + 0.002);
        const control = point(0.96, angle, crustHeight + 0.003);
        const last = point(0.92, angle + 0.025, crustHeight + 0.002);
        context.beginPath();
        context.moveTo(first[0], first[1]);
        context.quadraticCurveTo(control[0], control[1], last[0], last[1]);
        context.strokeStyle = 'rgba(112,57,25,.35)';
        context.lineWidth = 1.5;
        context.stroke();
      }

      const top = [point(0, startAngle, crustHeight), ...arc(1, crustHeight, startAngle, endAngle)];
      const path = new Path2D();
      top.forEach(([x, y], pointIndex) => {
        if (pointIndex === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      });
      path.closePath();
      if (game.selected.has(index)) polygon(top, null, '#fff8dc', 2.5);
      game.paths.push({ index, path });
    };

    const drawRing = (radius, height, fill, stroke, lineWidth = 1) => {
      const points = Array.from({ length: 72 }, (_, index) => {
        const angle = (index / 72) * Math.PI * 2;
        return project(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      });
      polygon(points, fill, stroke, lineWidth);
    };

    let animationFrame;
    const render = (time) => {
      context.setTransform(game.dpr, 0, 0, game.dpr, 0, 0);
      context.clearRect(0, 0, game.width, game.height);
      game.paths = [];
      const plateCenter = project(0, -0.05, 0);
      const plateEdge = project(1.17, -0.05, 0);
      const plateRadius = Math.hypot(plateEdge[0] - plateCenter[0], plateEdge[1] - plateCenter[1]);
      const plateGradient = context.createRadialGradient(
        plateCenter[0] - plateRadius * 0.2,
        plateCenter[1] - plateRadius * 0.3,
        2,
        plateCenter[0],
        plateCenter[1],
        plateRadius,
      );
      plateGradient.addColorStop(0, '#ffffff');
      plateGradient.addColorStop(0.55, '#f9f4e9');
      plateGradient.addColorStop(1, '#d7cdbd');
      context.save();
      context.shadowColor = 'rgba(0,0,0,.42)';
      context.shadowBlur = 28;
      context.shadowOffsetY = 13;
      drawRing(1.17, -0.05, plateGradient, '#d5cbbb', 2);
      context.restore();
      drawRing(1.05, -0.045, '#e9e0d1', '#d1c5b4');
      drawRing(1.015, -0.035, '#fffaf0', '#e8dece');

      const drawOrder = Array.from({ length: game.slices }, (_, index) => {
        const angle = ((index + 0.5) * Math.PI * 2) / game.slices;
        const depth = project(Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5)[2];
        return [index, depth];
      }).sort((first, second) => first[1] - second[1]);

      drawOrder.forEach(([index]) => {
        const currentLift = game.lift[index] || 0;
        const targetLift = game.selected.has(index) ? 1 : 0;
        game.lift[index] = currentLift + (targetLift - currentLift) * 0.2;
        drawSlice(index, game.slices);
      });
      game.yaw = game.rotation + Math.sin(time / 2200) * 0.07;
      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [game]);

  const onPointerDown = (event) => {
    game.drag = { x: event.clientX };
    game.moved = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!game.drag) return;
    const delta = event.clientX - game.drag.x;
    if (Math.abs(delta) > 3) game.moved = true;
    if (game.moved) {
      game.rotation += delta * 0.012;
      game.drag.x = event.clientX;
    }
  };

  const onPointerUp = (event) => {
    const canvas = event.currentTarget;
    if (game.drag && !game.moved && screen === 'play' && !game.locked) {
      const context = canvas.getContext('2d');
      const bounds = canvas.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      context.setTransform(1, 0, 0, 1, 0, 0);
      for (let pathIndex = game.paths.length - 1; pathIndex >= 0; pathIndex -= 1) {
        const slice = game.paths[pathIndex];
        if (context.isPointInPath(slice.path, x, y)) {
          if (game.selected.has(slice.index)) game.selected.delete(slice.index);
          else game.selected.add(slice.index);
          setMessage(null);
          refresh();
          break;
        }
      }
    }
    game.drag = null;
  };

  const nextOrder = () => {
    if (game.round >= 10) {
      setScreen('end');
      onComplete?.(game.score, Math.round((game.firstTryCorrect / 10) * 100));
      return;
    }
    const order = createOrder(game.round);
    Object.assign(game, {
      order,
      slices: order.slices,
      target: order.target,
      selected: new Set(),
      tries: 0,
      locked: false,
      lift: Array(order.slices).fill(0),
    });
    setMessage(null);
    setScreen('play');
    refresh();
  };

  const startGame = () => {
    Object.assign(game, { round: 0, score: 0, streak: 0, firstTryCorrect: 0 });
    nextOrder();
  };

  const serveOrder = () => {
    if (game.locked) {
      game.round += 1;
      nextOrder();
      return;
    }

    const selectedCount = game.selected.size;
    if (selectedCount === 0) {
      setMessage('Pick at least one slice first.');
      return;
    }

    if (selectedCount === game.target) {
      game.locked = true;
      let points = game.tries > 0 ? 5 : 10;
      if (game.tries > 0) game.streak = 0;
      else {
        game.streak += 1;
        game.firstTryCorrect += 1;
        points += Math.min(game.streak - 1, 4);
      }
      game.score += points;
      setMessage(
        <>
          Perfect serve! <Fraction numerator={game.target} denominator={game.slices} />
          <SimplifiedFraction numerator={game.target} denominator={game.slices} /> &nbsp;+{points} points
        </>,
      );
      refresh();
      return;
    }

    game.tries += 1;
    game.streak = 0;
    if (game.tries >= 3) {
      game.selected = new Set(Array.from({ length: game.target }, (_, index) => index));
      game.locked = true;
      setMessage(`Here’s the answer: ${game.target} slices out of ${game.slices}.`);
    } else {
      setMessage(
        <>
          You served <Fraction numerator={selectedCount} denominator={game.slices} />.
          {selectedCount < game.target ? ' That’s not enough.' : ' That’s too many.'} Try again.
        </>,
      );
    }
    refresh();
  };

  const stars = game.firstTryCorrect >= 9 ? 3 : game.firstTryCorrect >= 6 ? 2 : 1;
  const selectedCount = game.selected.size;

  return (
    <main className="pf2">
      <style>{STYLES}</style>
      <header className="pf2-bar">
        <h1>Pizza Fractions <span>2.0</span></h1>
        <div className="pf2-stats" aria-label="Game stats">
          <span>Score <b>{game.score}</b></span>
          <span>Order <b>{Math.min(game.round + 1, 10)}</b>/10</span>
          <span>Streak <b>{game.streak}</b></span>
        </div>
      </header>

      <canvas
        ref={canvasRef}
        className="pf2-canvas"
        aria-label="A 3D pizza cut into slices. Tap a slice to lift it onto the plate. Drag to spin the pizza."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { game.drag = null; }}
      />

      <section className="pf2-ticket" aria-label="Customer order">
        <div className="pf2-order"><OrderText order={game.order} /></div>
        <div className="pf2-live" aria-live="polite">
          {screen !== 'play'
            ? null
            : selectedCount === 0
              ? 'Tap slices to lift them onto the plate.'
              : <>On the plate: <Fraction numerator={selectedCount} denominator={game.slices} />
                <SimplifiedFraction numerator={selectedCount} denominator={game.slices} /></>}
        </div>
        <div className="pf2-message" role="status" aria-live="polite">{message}</div>
        <button className="pf2-button" onClick={serveOrder} disabled={screen !== 'play'}>
          {game.locked ? (game.round === 9 ? 'See results' : 'Next order') : 'Serve order'}
        </button>
      </section>

      {screen !== 'play' && (
        <div className="pf2-overlay">
          <div className="pf2-card">
            {screen === 'start' ? (
              <>
                <p className="pf2-eyebrow">The dinner rush is on</p>
                <h2>Pizza Fractions <span>2.0</span></h2>
                <p>Read each customer’s order, lift the right number of slices, and serve a perfect pizza. Drag to spin it around.</p>
                <button className="pf2-button" onClick={startGame} autoFocus>Start cooking</button>
              </>
            ) : (
              <>
                <p className="pf2-eyebrow">Your shift is complete</p>
                <h2>Beautifully served!</h2>
                <div className="pf2-stars" aria-label={`${stars} of 3 stars`}>
                  {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
                </div>
                <p>Score: <b>{game.score}</b><br />{game.firstTryCorrect} of 10 correct on the first try.</p>
                <button className="pf2-button" onClick={startGame} autoFocus>Play again</button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

const STYLES = `
.pf2 {
  --ink: #fff0dc;
  --card: #291d16;
  --line: #553b29;
  --accent: #ff806a;
  --gold: #ffbd69;
  isolation: isolate;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 580px;
  overflow: hidden;
  box-sizing: border-box;
  color: var(--ink);
  font-family: ui-rounded, "Arial Rounded MT Bold", "Trebuchet MS", system-ui, sans-serif;
  background:
    radial-gradient(ellipse at 50% 40%, rgba(220,139,66,.13), transparent 48%),
    repeating-linear-gradient(90deg, rgba(255,255,255,.012) 0 1px, transparent 1px 85px),
    linear-gradient(145deg, #151713, #211912 55%, #120f0c);
}
.pf2::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent 0 65px, rgba(255,255,255,.012) 66px, transparent 68px);
}
.pf2 > * { position: relative; z-index: 1; }
.pf2-bar, .pf2-ticket {
  margin: clamp(8px, 2vw, 14px);
  background: linear-gradient(135deg, #302219, #211711);
  border: 1px solid rgba(255,199,133,.13);
  box-shadow: 0 8px 25px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.04);
}
.pf2-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  border-bottom: 3px solid #69432c;
  border-radius: 16px;
}
.pf2 h1 { margin: 0; color: var(--accent); font-size: clamp(20px, 5vw, 30px); letter-spacing: -.04em; }
.pf2 h1 span, .pf2-card h2 span { color: var(--gold); font-size: .68em; letter-spacing: 0; }
.pf2-stats { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: clamp(12px, 2vw, 15px); }
.pf2-stats span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 11px;
  color: #e9d8c3;
  background: rgba(255,255,255,.055);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 999px;
}
.pf2-stats b { color: var(--gold); }
.pf2-canvas {
  display: block;
  flex: 1 1 0;
  width: 100%;
  min-height: 200px;
  touch-action: none;
  cursor: grab;
  filter: drop-shadow(0 12px 18px rgba(0,0,0,.19));
}
.pf2-canvas:active { cursor: grabbing; }
.pf2-ticket {
  display: grid;
  gap: 8px;
  align-content: start;
  padding: clamp(12px, 2.5vw, 20px);
  border-top: 3px solid #765037;
  border-bottom: 4px solid #4b3122;
  border-radius: 17px;
}
.pf2-order { min-height: 1.5em; color: #fff1df; font-size: clamp(18px, 3vw, 26px); font-weight: 800; line-height: 1.4; }
.pf2-live { min-height: 1.5em; color: #f3bd79; font-size: clamp(15px, 2vw, 18px); font-weight: 650; }
.pf2-message { min-height: 1.4em; color: var(--gold); font-size: clamp(15px, 2vw, 18px); font-weight: 750; }
.pf2-fraction { display: inline-flex; flex-direction: column; align-items: center; margin: 0 .2em; vertical-align: middle; line-height: 1.05; font-size: .86em; }
.pf2-fraction b { padding: 0 .28em .1em; border-bottom: .12em solid currentColor; }
.pf2-fraction i { padding-top: .08em; font-style: normal; }
.pf2-button {
  justify-self: start;
  padding: .72em 1.55em;
  color: #fff;
  background: linear-gradient(180deg, #ef5435, #bd2918);
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 12px;
  box-shadow: 0 5px 0 #852219, 0 8px 20px rgba(190,42,24,.2);
  font: inherit;
  font-size: clamp(16px, 2vw, 19px);
  font-weight: 850;
  cursor: pointer;
  transition: transform .18s ease, filter .18s ease, box-shadow .18s ease;
}
.pf2-button:hover:not(:disabled) { filter: brightness(1.13); transform: translateY(-2px); box-shadow: 0 7px 0 #852219, 0 12px 24px rgba(190,42,24,.3); }
.pf2-button:active:not(:disabled) { transform: translateY(3px); box-shadow: 0 2px 0 #852219; }
.pf2-button:disabled { opacity: .42; cursor: not-allowed; }
.pf2-button:focus-visible { outline: 3px solid var(--gold); outline-offset: 3px; }
.pf2-overlay {
  position: absolute;
  z-index: 5;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(12,9,7,.78);
}
.pf2-card {
  width: min(100%, 440px);
  padding: clamp(22px, 5vw, 32px);
  color: var(--ink);
  text-align: center;
  background: linear-gradient(145deg, #3b291d, #241710);
  border: 1px solid rgba(255,194,132,.16);
  border-radius: 22px;
  box-shadow: 0 20px 65px rgba(0,0,0,.45);
}
.pf2-card h2 { margin: 0 0 12px; color: var(--accent); font-size: clamp(28px, 7vw, 38px); line-height: 1.1; }
.pf2-card p { margin: 0 0 18px; line-height: 1.55; }
.pf2-card .pf2-eyebrow { margin-bottom: 8px; color: var(--gold); font-size: .82rem; font-weight: 850; letter-spacing: .13em; text-transform: uppercase; }
.pf2-stars { margin: 0 0 12px; color: #e0a100; font-size: 40px; letter-spacing: 6px; }
@media (max-width: 600px) {
  .pf2 { min-height: 560px; }
  .pf2-bar { padding: 10px 12px; gap: 9px; }
  .pf2-stats { width: 100%; justify-content: space-between; gap: 4px; }
  .pf2-stats span { gap: 4px; padding: 6px 8px; font-size: 12px; }
  .pf2-ticket { gap: 7px; padding: 12px; }
  .pf2-button { width: 100%; }
}
@media (max-height: 700px) {
  .pf2 { min-height: 0; }
  .pf2-ticket { gap: 5px; padding: 10px 14px; }
  .pf2-order { font-size: 19px; }
  .pf2-canvas { min-height: 130px; }
}
@media (prefers-reduced-motion: reduce) {
  .pf2-button { transition: none; }
  .pf2-button:hover:not(:disabled), .pf2-button:active:not(:disabled) { transform: none; }
}
`;
