'use client';
import React, { useEffect, useState } from 'react';

const StarIcon = ({
  filled,
  hovered,
  readonly,
  size
}: {
  filled: boolean;
  hovered: boolean;
  readonly?: boolean;
  size: number;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 42 39"
    fill={filled ? '#FFC107' : hovered ? '#FFC107' : 'rgb(203, 211, 227)'}
    className={`transition-colors duration-200 ${readonly ? '' : 'cursor-pointer'}`}
  >
    <path d="M41.7614 15.0517C41.4903 14.2572 40.7464 13.6929 39.8663 13.6177L27.9119 12.5894L23.1848 2.10749C22.8362 1.3393 22.0424 0.842041 21.1605 0.842041C20.2785 0.842041 19.4847 1.3393 19.1362 2.10928L14.4091 12.5894L2.45273 13.6177C1.57424 13.6947 0.832267 14.2572 0.559556 15.0517C0.286845 15.8463 0.5387 16.7177 1.20326 17.2671L10.2394 24.7747L7.57484 35.8943C7.37987 36.7119 7.71483 37.557 8.43089 38.0474C8.81579 38.3108 9.26609 38.445 9.72019 38.445C10.1117 38.445 10.5001 38.345 10.8486 38.1474L21.1605 32.3087L31.4685 38.1474C32.2228 38.5773 33.1737 38.5381 33.8882 38.0474C34.6045 37.5555 34.9392 36.7101 34.7442 35.8943L32.0797 24.7747L41.1158 17.2686C41.7804 16.7177 42.0341 15.8478 41.7614 15.0517Z" />
  </svg>
);

type CustomRatingPropsType = {
  initialRating?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
};

const CustomRating = ({
  initialRating = 0,
  onRatingChange,
  readonly = false,
  size = 32 // Default size of 32px
}: CustomRatingPropsType) => {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const handleClick = (value: number) => {
    if (readonly) return;

    setRating(value);
    onRatingChange?.(value);
  };

  const handleMouseEnter = (star: number) => {
    if (readonly) return;
    setHoveredRating(star);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoveredRating(0);
  };

  return (
    <div className={`flex gap-1 ${readonly ? 'pointer-events-none' : ''}`}>
      {[1, 2, 3, 4, 5].map(star => (
        <div
          key={star}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
        >
          <StarIcon
            filled={star <= rating}
            hovered={star <= hoveredRating}
            readonly={readonly}
            size={size}
          />
        </div>
      ))}
    </div>
  );
};

export default CustomRating;
