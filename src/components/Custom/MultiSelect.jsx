import { useState, useRef, useEffect } from "react";

export default function MultiSelect({
  label,
  options,
  selected = [],
  setSelected,
  placeholder,
  multiple,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleOption = (option) => {
    if (multiple) {
      if (selected.includes(option)) {
        setSelected(selected.filter((item) => item !== option));
      } else {
        setSelected([...selected, option]);
      }
    } else {
      setSelected(option);
      setOpen(false);
    }
  };

  return (
    <div className="mb-4 relative" ref={dropdownRef}>
      <label className="block text-sm font-medium mb-1 text-gray-600">
        {label}
      </label>

      <div
        className="w-full  border rounded-full border-gray-400 p-2 flex flex-wrap gap-2 cursor-pointer bg-white"
        onClick={() => setOpen(!open)}
      >
        {selected.length === 0 && (
          <span className="text-gray-400">{placeholder}</span>
        )}

        {multiple &&
          selected.map((opt, i) => (
            <span
              key={i}
              className="bg-violet-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {opt}
              <button
               type="button"
                className="text-black font-bold"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(selected.filter((v) => v !== opt));
                }}
              >
                ×
              </button>
            </span>
          ))}
      </div>

      {open && (
        <div className="mt-2 border absolute z-99 w-80 border-gray-200 rounded-xl p-2 bg-white shadow-lg">
          {options.map((opt, idx) => (
            <div
              key={idx}
              className="p-1 px-3 hover:bg-gray-100 cursor-pointer rounded-full flex justify-between"
              onClick={() => toggleOption(opt)}
            >
              <span>{opt}</span>

              {(multiple ? selected.includes(opt) : selected === opt) && (
                <span className="text-purple-600 font-bold">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
