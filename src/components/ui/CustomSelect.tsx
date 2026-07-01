"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select option",
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find currently selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Select Header Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-zinc-950/80 border ${
          isOpen ? "border-rose-500/80 ring-1 ring-rose-500/30" : "border-zinc-800 hover:border-zinc-700"
        } text-zinc-300 rounded-xl text-xs font-semibold focus:outline-none transition-all duration-300 cursor-pointer select-none text-left`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-300 flex-shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-rose-500" : ""
          }`}
        />
      </button>

      {/* Options Dropdown Overlay */}
      {isOpen && (
        <div className="absolute z-40 left-0 right-0 mt-2 p-1.5 bg-zinc-950/95 border border-zinc-850 rounded-2xl shadow-xl shadow-black/60 max-h-80 overflow-y-auto no-scrollbar animate-scale-in delay-0 backdrop-blur-xl">
          <div className="space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer select-none ${
                    isSelected
                      ? "bg-rose-600 text-white font-semibold"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
