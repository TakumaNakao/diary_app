import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import './Calendar.css';

const Calendar = () => {
    const navigate = useNavigate();
    const { entries } = useDiary();
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        return days;
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day) => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;
        navigate(`/day/${dateStr}`);
    };

    const renderDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Previous month's empty cells
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-prev-${i}`} className="calendar-day empty"></div>);
        }

        // Days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const dayStr = String(i).padStart(2, '0');
            const dateStr = `${year}-${month}-${dayStr}`;

            // Check if any entry exists for this date
            const hasEntry = Object.values(entries).some(entry => entry.date === dateStr);

            const isToday = new Date().toDateString() === new Date(year, currentDate.getMonth(), i).toDateString();

            days.push(
                <div
                    key={i}
                    className={`calendar-day ${hasEntry ? 'has-entry' : ''} ${isToday ? 'is-today' : ''}`}
                    onClick={() => handleDateClick(i)}
                >
                    <span className="day-number">{i}</span>
                    {hasEntry && <div className="entry-indicator"></div>}
                </div>
            );
        }

        // Fill remaining cells to complete 42 cells (6 weeks)
        const totalCells = firstDay + daysInMonth;
        const remainingCells = 42 - totalCells;

        for (let i = 0; i < remainingCells; i++) {
            days.push(<div key={`empty-next-${i}`} className="calendar-day empty"></div>);
        }

        return days;
    };

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button onClick={prevMonth} className="btn btn-ghost"><ChevronLeft /></button>
                <h2>
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={nextMonth} className="btn btn-ghost"><ChevronRight /></button>
            </div>
            <div className="calendar-grid">
                <div className="weekday">Sun</div>
                <div className="weekday">Mon</div>
                <div className="weekday">Tue</div>
                <div className="weekday">Wed</div>
                <div className="weekday">Thu</div>
                <div className="weekday">Fri</div>
                <div className="weekday">Sat</div>
                {renderDays()}
            </div>
        </div>
    );
};

export default Calendar;
