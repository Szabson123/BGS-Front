import React, { useState, useEffect } from "react";
import type { Breakdown } from "../types/breakdown";
import "../styles/ReviewCalendar.css";
import {
  FaAngleLeft as AngleLeft,
  FaAngleRight as AngleRight,
} from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { ReviewCalendarElement } from "./ReviewCalendarElement";

interface ReviewCalendarProps {
  data: Breakdown[];
  isLoading: boolean;
  onStatusChange?: (breakdownId: number, newStatus: string) => void;
}

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isToday: boolean;
}

// Dane testowe z nakładającymi się godzinami (np. id 1, 8 i 9 w poniedziałek)
const MOCK_BREAKDOWNS = [
  // --- TYDZIEŃ 13-19 KWIETNIA 2026 (Poprzedni) ---
  {
    id: 101,
    machineName: "Tokarka T-100",
    requesterFirstName: "Jan",
    requesterLastName: "Kowalski",
    startTime: "2026-04-14T08:00:00",
    endTime: "2026-04-14T11:00:00",
  },
  {
    id: 102,
    machineName: "Frezarka F-50",
    requesterFirstName: "Anna",
    requesterLastName: "Nowak",
    startTime: "2026-04-16T14:00:00",
    endTime: "2026-04-16T16:30:00",
  },

  // --- TYDZIEŃ 20-26 KWIETNIA 2026 (Ten co mieliśmy - dużo kolizji) ---
  {
    id: 1,
    machineName: "Prasa P-200",
    requesterFirstName: "Marek",
    requesterLastName: "Nowak",
    startTime: "2026-04-20T07:00:00",
    endTime: "2026-04-20T10:30:00",
  },
  {
    id: 8,
    machineName: "Wiertarka X",
    requesterFirstName: "Jan",
    requesterLastName: "Kos",
    startTime: "2026-04-20T08:00:00",
    endTime: "2026-04-20T11:00:00",
  },
  {
    id: 9,
    machineName: "Frezarka Y",
    requesterFirstName: "Ola",
    requesterLastName: "As",
    startTime: "2026-04-20T09:00:00",
    endTime: "2026-04-20T12:00:00",
  },

  {
    id: 2,
    machineName: "Wiertarka CNC",
    requesterFirstName: "Adam",
    requesterLastName: "Zieliński",
    startTime: "2026-04-21T10:00:00",
    endTime: "2026-04-21T14:30:00",
  },

  {
    id: 3,
    machineName: "Linia A1",
    requesterFirstName: "Kuba",
    requesterLastName: "Kowalski",
    startTime: "2026-04-22T15:00:00",
    endTime: "2026-04-22T18:00:00",
  },
  {
    id: 10,
    machineName: "Linia A2 (Kolizja)",
    requesterFirstName: "Ewa",
    requesterLastName: "Lis",
    startTime: "2026-04-22T16:00:00",
    endTime: "2026-04-22T19:00:00",
  },

  {
    id: 4,
    machineName: "Robot S",
    requesterFirstName: "Piotr",
    requesterLastName: "Wiśniewski",
    startTime: "2026-04-23T08:30:00",
    endTime: "2026-04-23T11:00:00",
  },
  {
    id: 5,
    machineName: "Kompresor",
    requesterFirstName: "Robert",
    requesterLastName: "Lewandowski",
    startTime: "2026-04-24T12:00:00",
    endTime: "2026-04-24T15:00:00",
  },
  {
    id: 6,
    machineName: "Suwnica B",
    requesterFirstName: "Kamil",
    requesterLastName: "Ślimak",
    startTime: "2026-04-25T09:00:00",
    endTime: "2026-04-25T13:00:00",
  },
  {
    id: 7,
    machineName: "Wentylacja",
    requesterFirstName: "Łukasz",
    requesterLastName: "Podolski",
    startTime: "2026-04-26T14:00:00",
    endTime: "2026-04-26T17:30:00",
  },

  // --- TYDZIEŃ 27 KWIETNIA - 03 MAJA 2026 (Przełom miesięcy) ---
  {
    id: 201,
    machineName: "Podnośnik P-10",
    requesterFirstName: "Darek",
    requesterLastName: "Wójcik",
    startTime: "2026-04-27T06:00:00",
    endTime: "2026-04-27T09:00:00",
  },
  {
    id: 202,
    machineName: "Piec Hartowniczy",
    requesterFirstName: "Szymon",
    requesterLastName: "Król",
    startTime: "2026-04-29T10:00:00",
    endTime: "2026-04-29T15:00:00",
  },
  {
    id: 203,
    machineName: "Zasilacz Awaryjny",
    requesterFirstName: "Beata",
    requesterLastName: "Pawlak",
    startTime: "2026-05-01T08:00:00", // To już Maj!
    endTime: "2026-05-01T12:00:00",
  },
  {
    id: 204,
    machineName: "Brama Wjazdowa",
    requesterFirstName: "Marcin",
    requesterLastName: "Gortat",
    startTime: "2026-05-03T18:00:00", // Niedziela w Maju
    endTime: "2026-05-03T21:00:00",
  },
];

export const ReviewCalendar: React.FC<ReviewCalendarProps> = ({
  isLoading,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date("2026-04-20"));

  const calendarType = searchParams.get("type") || "week";
  const HOURS = Array.from({ length: 24 }, (_, i) => i);

  const handleNavigate = (direction: "next" | "prev") => {
    const newDate = new Date(viewDate);
    newDate.setDate(viewDate.getDate() + (direction === "next" ? 7 : -7));
    setViewDate(newDate);
  };

  const updateURL = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    value ? newParams.set(key, value) : newParams.delete(key);
    setSearchParams(newParams, { replace: true });
  };

  const getCurrentWeek = (selectedDate: Date): CalendarDay[] => {
    const dayOfWeek = selectedDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(selectedDate);
    monday.setDate(selectedDate.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        date: d,
        dayNumber: d.getDate(),
        isToday: d.toDateString() === new Date().toDateString(),
      };
    });
  };

  const currentWeekDays = getCurrentWeek(viewDate);
  const firstDay = currentWeekDays[0].date;
  const lastDay = currentWeekDays[6].date;

  const formatMonth = (d: Date) =>
    d.toLocaleDateString("pl-PL", { month: "long" });
  const formatYear = (d: Date) => d.getFullYear();
  let weekRangeDisplay = "";

  if (firstDay.getMonth() === lastDay.getMonth()) {
    weekRangeDisplay = `${firstDay.getDate()}-${lastDay.getDate()} ${formatMonth(firstDay)} ${formatYear(firstDay)}`;
  } else {
    const firstMonthStr = formatMonth(firstDay);
    const lastMonthStr = formatMonth(lastDay);

    if (firstDay.getFullYear() === lastDay.getFullYear()) {
      weekRangeDisplay = `${firstDay.getDate()} ${firstMonthStr} – ${lastDay.getDate().toString()} ${lastMonthStr} ${formatYear(firstDay)}`;
    } else {
      weekRangeDisplay = `${firstDay.getDate()} ${firstMonthStr} ${formatYear(firstDay)} – ${lastDay.getDate().toString()} ${lastMonthStr} ${formatYear(lastDay)}`;
    }
  }

  // Algorytm układania elementów obok siebie (Collision Groups)
  const getPositionedEventsForDay = (events: any[]) => {
    const sorted = [...events].sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
    const columns: any[][] = [];

    sorted.forEach((event) => {
      const eventStart = new Date(event.startTime).getTime();
      let placed = false;

      for (let i = 0; i < columns.length; i++) {
        const lastEventInCol = columns[i][columns[i].length - 1];
        if (new Date(lastEventInCol.endTime).getTime() <= eventStart) {
          columns[i].push(event);
          placed = true;
          break;
        }
      }
      if (!placed) columns.push([event]);
    });

    return columns.flatMap((column, colIdx) =>
      column.map((event) => ({ ...event, colIdx, totalCols: columns.length })),
    );
  };

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading)
    return <div style={{ padding: "20px" }}>Ładowanie danych...</div>;

  return (
    <div className="rc-wrapper">
      <header className="rc-filters">
        <div className="rc-navigators">
          <AngleLeft
            onClick={() => handleNavigate("prev")}
            className="rc-icon"
          />
          <AngleRight
            onClick={() => handleNavigate("next")}
            className="rc-icon"
          />
        </div>
        <div className="rc-filters-days">
          <span>{weekRangeDisplay}</span>
        </div>
        <div className="rc-type-select">
          {["week", "month"].map((type) => (
            <button
              key={type}
              className={`rc-type-button ${calendarType === type ? "selected" : ""}`}
              onClick={() => updateURL("type", type)}
            >
              {type === "week" ? "Tydzień" : "Miesiąc"}
            </button>
          ))}
        </div>
      </header>
      <div className="rc-top">
        {currentWeekDays.map((d, i) => (
          <div key={i} className={`rc-top-day ${d.isToday ? "selected" : ""}`}>
            <span className="rc-day">{d.dayNumber}</span>
            <span className="rc-week-day">
              {d.date
                .toLocaleDateString("pl-PL", { weekday: "long" })
                .toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      <div className="rc-day-grid-wrapper">
        <div className="rc-hours-label">
          {HOURS.map((h) => (
            <div key={h} className="rc-hour">
              <span>{h}:00</span>
            </div>
          ))}
        </div>
        <div className="rc-grid-wrapper">
          {HOURS.map((h) => (
            <div key={h} className="rc-row" />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rc-vertical-line"
              style={{ left: `${(i / 7) * 100}%` }}
            />
          ))}
          <div
            className="rc-current-time-line"
            style={{
              top: currentTime.getHours() * 60 + currentTime.getMinutes(),
            }}
          />
          {currentWeekDays.map((day, dayIdx) => {
            const dayEvents = MOCK_BREAKDOWNS.filter((item) => {
              const d = new Date(item.startTime);
              return d.toDateString() === day.date.toDateString();
            });

            const positioned = getPositionedEventsForDay(dayEvents);

            return positioned.map((item) => {
              const baseWidth = 100 / 7;
              const subWidth = baseWidth / item.totalCols;
              const leftPos = dayIdx * baseWidth + item.colIdx * subWidth;

              return (
                <ReviewCalendarElement
                  key={item.id}
                  start={new Date(item.startTime)}
                  end={new Date(item.endTime)}
                  name={item.machineName}
                  firstName={item.requesterFirstName}
                  lastName={item.requesterLastName}
                  width={subWidth}
                  styleOverride={{
                    left: `${leftPos}%`,
                    width: `${subWidth}%`,
                  }}
                />
              );
            });
          })}
        </div>
      </div>
    </div>
  );
};
