import React, { useEffect, useState } from 'react';
import { AiOutlineDoubleLeft, AiOutlineDoubleRight } from "react-icons/ai";
import { IoLocation } from 'react-icons/io5';
import "../assets/css/adan.css";

export const Adan = () => {
  const [location, setLocation] = useState({ lat: null, long: null });
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const [todayPrayerTimes, setTodayPrayerTimes] = useState(null);
  const [date, setDate] = useState({ hijri: null, gregorian: null });
  const [city, setCity] = useState(null);
  const [dayOffset, setDayOffset] = useState(0);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    // Obtenir la géolocalisation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            long: position.coords.longitude,
          };
          // Mise à jour de la localisation et suppression des données en cache si nécessaire
          if (
            newLocation.lat !== location.lat ||
            newLocation.long !== location.long
          ) {
            setLocation(newLocation);
            localStorage.removeItem('monthlyPrayerData');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error("La géolocalisation n'est pas prise en charge par ce navigateur.");
    }

    // Initialisation de l'année et du mois actuels
    const currentDate = new Date();
    setYear(currentDate.getFullYear());
    setMonth(currentDate.getMonth() + 1);
  }, []);

  useEffect(() => {
    const fetchPrayerData = () => {
      const url = `${import.meta.env.VITE_API_URL}?latitude=${location.lat}&longitude=${location.long}&method=2&month=${month}&year=${year}`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          localStorage.setItem('monthlyPrayerData', JSON.stringify(data));
          setDailyPrayerData(data);
          calculateNextPrayer(data);
        })
        .catch((error) => console.error('Error fetching prayer times:', error));
    };
    
    

    const storedData = localStorage.getItem('monthlyPrayerData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setDailyPrayerData(parsedData);
      calculateNextPrayer(parsedData);
    } else if (location.lat && location.long && month && year) {
      fetchPrayerData();
    }
  }, [location, month, year]);

  const setDailyPrayerData = (data) => {
    const today = new Date();
    const targetDate = new Date(today.setDate(today.getDate() + dayOffset));
    const targetDay = targetDate.getDate();

    const targetData = data?.data.find((item) => parseInt(item.date.gregorian.day) === targetDay);
    if (targetData) {
      setTodayPrayerTimes(targetData.timings);
      setDate({
        hijri: `${targetData.date.hijri.weekday.ar} ${targetData.date.hijri.day} ${targetData.date.hijri.month.ar} ${targetData.date.hijri.year}`,
        gregorian: `${targetData.date.gregorian.weekday.en} ${targetData.date.gregorian.day} ${targetData.date.gregorian.month.en} ${targetData.date.gregorian.year}`,
      });
      setCity(targetData.meta.timezone.split("/")[1].split("_").join(" "));
    }
  };

  const calculateNextPrayer = (data) => {
    const today = new Date();
    const prayerTimes = Object.entries(data?.data[today.getDate() - 1].timings).map(
      ([name, time]) => ({
        name,
        time: new Date(`${today.toDateString()} ${time}`)
      })
    );

    const upcomingPrayer = prayerTimes.find(prayer => prayer.time > today);
    if (upcomingPrayer) {
      setNextPrayer(upcomingPrayer.name);
      const remainingTime = Math.floor((upcomingPrayer.time - today) / 1000);
      setTimeRemaining(remainingTime);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => (prevTime > 0 ? prevTime - 1 : prevTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleNextDay = () => {
    setDayOffset((prev) => prev + 1);
    setDailyPrayerData(JSON.parse(localStorage.getItem('monthlyPrayerData')));
  };

  const handlePrevDay = () => {
    setDayOffset((prev) => prev - 1);
    setDailyPrayerData(JSON.parse(localStorage.getItem('monthlyPrayerData')));
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };


  function getTime(time) {
      const timeArray = time.split(' ');
      return timeArray[0];
  }
  return (
    <React.Fragment>
      <section className="adan-container">
        <div className="wrapper md:px-20 lg:px-40 d-flex justify-content-between flex-column">
          <div className="text-white text-center">
            <IoLocation /> <span className="text-white mx-2 mt-4">{city}</span>
          </div>
          <div className="header bg-transparent d-flex align-items-center justify-content-between mb-3">
            <AiOutlineDoubleLeft onClick={handlePrevDay} className="text-white d-flex prev icon-btn" />
            <div className="text-white text-center">
              <p className="d-flex date-text">{date?.hijri}</p>
              <p className="d-flex date-text">{date?.gregorian}</p>
            </div>
            <AiOutlineDoubleRight onClick={handleNextDay} className="text-white d-flex next icon-btn" />
          </div>

          <div className="prayer-info-container">
            <h3 className="next-prayer text-center">
              <p>{nextPrayer}</p>
              {formatTime(timeRemaining)}
            </h3>
          </div>
          {todayPrayerTimes ? (
            <div className="prayer-info">
              <ul className="list-group">
                <li className="list-group-item prayer-time d-flex justify-content-between"><strong>Fajr</strong>  <span> {getTime(todayPrayerTimes.Fajr)} </span></li>
                <li className="list-group-item prayer-time d-flex justify-content-between"><strong>Dhuhr</strong> <span>  {getTime(todayPrayerTimes.Dhuhr)} </span></li>
                <li className="list-group-item prayer-time d-flex justify-content-between"><strong>Asr</strong>  <span> {getTime(todayPrayerTimes.Asr)}</span></li>
                <li className="list-group-item prayer-time d-flex justify-content-between"><strong>Maghrib</strong>  <span> {getTime(todayPrayerTimes.Maghrib)}</span></li>
                <li className="list-group-item prayer-time d-flex justify-content-between"><strong>Isha</strong>  <span> {getTime(todayPrayerTimes.Isha)}</span></li>
              </ul>
            </div>
          ) : (
            <p className="text-white loading-text">Chargement des horaires de prière...</p>
          )}
        </div>
      </section>

   
    </React.Fragment>
  );
};
