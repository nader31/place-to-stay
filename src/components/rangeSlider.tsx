import clsx from "clsx";
import React, { useState } from "react";
import ReactSlider from "react-slider";
import type { ReactSliderProps } from "react-slider";
const RangeSlider = <T extends number | readonly number[]>(
  _props: ReactSliderProps<T> & { displayPrice?: boolean }
) => {
  const isVertical = _props.orientation === "vertical";

  const displayPrice = _props.displayPrice;

  const [isHovered, setIsHovered] = useState(false);

  return (
    <ReactSlider
      {..._props}
      renderThumb={(props, state) => (
        <div
          {...props}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
          className={clsx(
            !isVertical && "h-full",
            isVertical && "w-full",
            "flex aspect-square cursor-grab items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white focus:outline-none"
          )}
        >
          {isHovered && !!displayPrice && (
            <div className="absolute mb-14 rounded-full bg-black px-2 py-1">
              {state.valueNow}
            </div>
          )}
        </div>
      )}
      renderTrack={(props, state) => {
        const points = Array.isArray(state.value) ? state.value.length : null;
        const isMulti = points && points > 0;
        const isLast = isMulti ? state.index === points : state.index === 1;
        const isFirst = state.index === 0;
        return (
          <div
            {...props}
            className={clsx(
              !isVertical
                ? "top-1/2 h-1/4 -translate-y-1/2"
                : "left-1/2 w-1/4 -translate-x-1/2",
              "rounded-full",
              (isMulti ? isFirst || isLast : isLast) && "bg-gray-200",
              (isMulti ? !isFirst || !isLast : isFirst) && "bg-rose-600"
            )}
          ></div>
        );
      }}
    />
  );
};
export default RangeSlider;
