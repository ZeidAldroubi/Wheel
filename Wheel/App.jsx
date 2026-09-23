import { useState } from 'react';
import './App.css';

const defaultOptions = ['Read a book', 'Go for a walk', 'Cook dinner', 'Watch a movie', 'Play a game'];

// OptionList displays the editable choices and sends changes back to App.
function OptionList({ options, newOption, setNewOption, addOption, removeOption }) {
  // Adds the current input value when the form is submitted.
  const handleSubmit = (event) => {
    event.preventDefault();
    addOption();
  };

  return (
    <section className="option-panel">
      <div className="section-heading">
        <p className="eyebrow">Your choices</p>
      </div>

      <form className="add-option-form" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="new-option">New option</label>
        <input
          id="new-option"
          type="text"
          value={newOption}
          onChange={(event) => setNewOption(event.target.value)}
          placeholder="Add an option..."
        />
        <button type="submit">Add</button>
      </form>

      <ul className="option-list">
        {options.map((option, index) => (
          <li className="option-row" key={`${option}-${index}`}>
            <span className="option-dot" aria-hidden="true" />
            <span>{option}</span>
            <button
              className="remove-button"
              type="button"
              onClick={() => removeOption(index)}
              aria-label={`Remove ${option}`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Wheel is presentational: it derives its segments and animation from props.
function Wheel({ options, isSpinning, result, rotation }) {
  const segmentAngle = options.length ? 360 / options.length : 360;
  const colors = ['#f26b5e', '#f7c957', '#5ab1bb', '#6388d8', '#9b79c7', '#e58b55'];
  const wheelBackground = options.length
    ? `conic-gradient(${options.map((_, index) => `${colors[index % colors.length]} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`).join(', ')})`
    : '#dfe4e8';

  return (
    <section className="wheel-panel" aria-live="polite">
      <div className="pointer" aria-hidden="true" />
      <div
        className={`wheel ${isSpinning ? 'wheel-spinning' : ''}`}
        style={{ '--wheel-background': wheelBackground, transform: `rotate(${rotation}deg)` }}
        aria-label={result ? `Winner: ${result}` : 'Decision wheel'}
      >
        {options.map((option, index) => (
          <div
            className="wheel-segment"
            key={`${option}-segment-${index}`}
            style={{
              '--segment-mid-angle': `${index * segmentAngle + segmentAngle / 2}deg`,
            }}
          >
            <span>{option}</span>
          </div>
        ))}
        <div className="wheel-center" aria-hidden="true" />
      </div>
      {result && !isSpinning && <p className="result-message">Winner: <strong>{result}</strong></p>}
    </section>
  );
}

// App owns shared state and coordinates the option list and wheel.
export default function App() {
  // The choices, input text, latest winner, and animation status all live here.
  const [options, setOptions] = useState(defaultOptions);
  const [newOption, setNewOption] = useState('');
  const [result, setResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Adds a trimmed, non-empty option to the list.
  const addOption = () => {
    const trimmedOption = newOption.trim();
    if (!trimmedOption) return;
    setOptions((currentOptions) => [...currentOptions, trimmedOption]);
    setNewOption('');
  };

  // Removes one option by its position in the mapped list.
  const removeOption = (optionIndex) => {
    setOptions((currentOptions) => currentOptions.filter((_, index) => index !== optionIndex));
  };

  // Picks a winner immediately, then reveals it after the CSS spin finishes.
  const spinWheel = () => {
    if (isSpinning || options.length < 2) return;
    const winningIndex = Math.floor(Math.random() * options.length);
    const winningOption = options[winningIndex];
    const segmentAngle = 360 / options.length;
    const targetRotation = 360 - ((winningIndex + 0.5) * segmentAngle);
    const currentRotation = rotation % 360;
    const alignmentRotation = (targetRotation - currentRotation + 360) % 360;

    setRotation(rotation + 1440 + alignmentRotation);
    setResult(winningOption);
    setIsSpinning(true);
    window.setTimeout(() => {
      setIsSpinning(false);
      setResult(winningOption);
    }, 2200);
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">A little nudge in the right direction</p>
        <h1>Decision Wheel</h1>
        <p className="intro">Put your possibilities in motion and let chance choose the next move.</p>
      </header>

      <div className="app-content">
        <OptionList
          options={options}
          newOption={newOption}
          setNewOption={setNewOption}
          addOption={addOption}
          removeOption={removeOption}
        />

        <section className="decision-panel">
          <Wheel options={options} isSpinning={isSpinning} result={result} rotation={rotation} />
          <button
            className="spin-button"
            type="button"
            onClick={spinWheel}
            disabled={isSpinning || options.length < 2}
          >
            {isSpinning ? 'Choosing...' : 'Spin the wheel'}
          </button>
          {options.length < 2 && <p className="helper-text">Add at least 2 options to spin</p>}
        </section>
      </div>
    </main>
  );
}