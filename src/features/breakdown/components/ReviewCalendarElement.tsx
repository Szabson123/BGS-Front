import React from "react";
import "../styles/ReviewCalendar.css";

interface ReviewCalendarElementProps {
  start: Date;
  end: Date;
  name: string;
  firstName: string;
  lastName: string;
  width: number;
  styleOverride?: React.CSSProperties;
}

export const ReviewCalendarElement: React.FC<ReviewCalendarElementProps> = ({
  start,
  end,
  name,
  firstName,
  lastName,
  width,
  styleOverride,
}) => {
  let array = [start, end, name, firstName, lastName];
  console.log(array);

  const getElementLeftProp = () => {
    const day = start.getDay() === 0 ? 6 : start.getDay() - 1;
    return day * (100 / 7);
  };

  const getElementStyle = (start: Date, end: Date) => {
    const HOUR_HEIGHT = 60; // musi być zgodne z CSS (.rc-row height)
    const MINUTE_HEIGHT = HOUR_HEIGHT / 60; // czyli 1px za minutę

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const duration = endMinutes - startMinutes;

    return {
      top: `${startMinutes * MINUTE_HEIGHT}px`,
      height: `${duration * MINUTE_HEIGHT}px`,
      position: "absolute" as "absolute",
      left: `${getElementLeftProp()}%`,
      right: 0,
      zIndex: 10,
      width: "100%",
      maxWidth: `${width}%`,
      ...styleOverride,
    };
  };

  return (
    <>
      <div className="rc-element" style={getElementStyle(start, end)}>
        <span>{name}</span>
        <br />
        <span>
          {firstName} {lastName}
        </span>
      </div>
    </>
  );
};
