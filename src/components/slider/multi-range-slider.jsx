import React, { useCallback, useEffect, useState, useRef } from "react";
import "./multiRangeSlider.css";
import { formatPrice } from "@/utils";

const MultiRangeSlider = ({ min, max, onChange, reset }) => {
  console.log("min, max:", min, max);
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);
  const minValRef = useRef(null);
  const maxValRef = useRef(null);
  const range = useRef(null);
  const debounceTimeout = useRef(null); // Ref to store the timeout

  // Update min value when input is changed
  const handleMinPriceChange = (event) => {
    const value = Math.min(+event.target.value, maxVal - 1); // Ensure min doesn't exceed max
    setMinVal(value);
  };

  // Update max value when input is changed
  const handleMaxPriceChange = (event) => {
    const value = Math.max(+event.target.value, minVal + 1); // Ensure max is greater than min
    setMaxVal(value);
  };

  // Convert to percentage
  const getPercent = useCallback(
    (value) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Effect to handle the reset functionality
  useEffect(() => {
    if (reset) {
      setMinVal(min);
      setMaxVal(max);
    }
  }, [reset, min, max]);

  // Set width of the range to decrease from the left side
  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(minVal);
      const maxPercent = getPercent(+maxValRef.current.value);

      if (range.current) {
        range.current.style.left = `${minPercent}%`;
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value);
      const maxPercent = getPercent(maxVal);

      if (range.current) {
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [maxVal, getPercent]);

  // Use debounce to delay calling onChange
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      onChange({ min: minVal, max: maxVal });
    }, 300); // Delay of 300ms to trigger onChange

    return () => clearTimeout(debounceTimeout.current);
  }, [minVal, maxVal, onChange]);

  return (
    <div className="flex items-center justify-between gap-10">
      <div className="flex gap-4 mt-4">
        <div className="flex flex-col w-1/2">
          <input
            type="number"
            id="min-price"
            value={minVal}
            onChange={handleMinPriceChange} // Update min value
            className="border p-2 rounded"
            min={min}
            max={maxVal - 1} // Ensure min doesn't exceed max
          />
        </div>

        <div className="flex flex-col w-1/2">
          <input
            type="number"
            id="max-price"
            value={maxVal}
            onChange={handleMaxPriceChange} // Update max value
            className="border p-2 rounded"
            min={minVal + 1} // Ensure max is greater than min
            max={max}
          />
        </div>
      </div>
      <div className="flex items-center justify-center">
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          ref={minValRef}
          onChange={(event) => {
            const value = Math.min(+event.target.value, maxVal - 1);
            setMinVal(value);
            event.target.value = value.toString();
          }}
          className={`thumb thumb--zindex-3 ${
            minVal > max - 100 ? "thumb--zindex-5" : ""
          }`}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          ref={maxValRef}
          onChange={(event) => {
            const value = Math.max(+event.target.value, minVal + 1);
            setMaxVal(value);
            event.target.value = value.toString();
          }}
          className="thumb thumb--zindex-4"
        />

        <div className="slider">
          <div className="slider__track" />
          <div ref={range} className="slider__range" />
          <div className="slider__left-value text-gray-700">
            {formatPrice(minVal)}
          </div>
          <div className="slider__right-value text-gray-700">
            {formatPrice(maxVal)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiRangeSlider;
