const Step1 = ({ onNext }) => {
  const [value, setValue] = useState('');

  return (
    <div>
      <h1>Step 1</h1>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={onNext}>Next</button>
    </div>
  );
}