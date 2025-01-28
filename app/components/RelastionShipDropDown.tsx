import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface RelationshipDropdownProps {
  selected: string;
  onSelect: (relationship: string) => void;
}

const RELATIONSHIPS = [
  "Parent",
  "Spouse",
  "Sibling",
  "Child",
  "Friend",
  "Guardian",
  "Partner",
  "Relative",
  "Caregiver",
  "Other"
];

const RelationshipDropdown: React.FC<RelationshipDropdownProps> = ({
  selected,
  onSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (relationship: string) => {
    onSelect(relationship);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-gray-900">
          {selected || "Select relationship"}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="max-h-60 overflow-auto">
            {RELATIONSHIPS.map((relationship) => (
              <button
                type="button"
                key={relationship}
                onClick={() => handleSelect(relationship)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
              >
                <span className="text-gray-900">{relationship}</span>
                {selected === relationship && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RelationshipDropdown;