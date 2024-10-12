import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SportsContext = createContext();

export const useSportsContext = () => useContext(SportsContext);

export const SportsProvider = ({ children }) => {
  const [sportsData, setSportsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const defaultSportsData = {
    nfl: {
      id: 1,
      icon: "american-football-outline",
      name: "NFL",
      sport: "football",
      league: "nfl",
    },
    ncaaf: {
      id: 2,
      icon: "american-football-outline",
      name: "CFB",
      sport: "football",
      league: "college-football",
    },
    mlb: {
      id: 3,
      icon: "baseball-outline",
      name: "MLB",
      sport: "baseball",
      league: "mlb",
    },
    nhl: {
      id: 4,
      icon: "hockey-puck",
      name: "NHL",
      sport: "hockey",
      league: "nhl",
    },
    nba: {
      id: 5,
      icon: "basketball-outline",
      name: "NBA",
      sport: "basketball",
      league: "nba",
    },
    wnba: {
      id: 6,
      icon: "basketball-outline",
      name: "WNBA",
      sport: "basketball",
      league: "wnba",
    },
    ncaab: {
      id: 7,
      icon: "basketball-outline",
      name: "CBB",
      sport: "basketball",
      league: "mens-college-basketball",
    },
    mls: {
      id: 8,
      icon: "football-outline",
      name: "MLS",
      sport: "soccer",
      league: "usa.1",
    },
  };

  useEffect(() => {
    loadSportsOrder();
  }, []);

  const loadSportsOrder = async () => {
    setIsLoading(true);
    try {
      const savedOrder = await AsyncStorage.getItem('sportsOrder');
      if (savedOrder) {
        setSportsData(JSON.parse(savedOrder));
      } else {
        setSportsData(defaultSportsData);
      }
    } catch (error) {
      console.error('Error loading sports order:', error);
      setSportsData(defaultSportsData);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSportsOrder = async (newOrder) => {
    try {
      const updatedSportsData = {};
      newOrder.forEach((sport, index) => {
        updatedSportsData[sport.league] = { ...sport, id: index + 1 };
      });
      setSportsData(updatedSportsData);
      await AsyncStorage.setItem('sportsOrder', JSON.stringify(updatedSportsData));
    } catch (error) {
      console.error('Error saving sports order:', error);
      // Optionally, you can add a fallback here, such as reverting to the previous state
    }
  };

  if (isLoading) {
    // You can return a loading indicator here if needed
    return null;
  }

  return (
    <SportsContext.Provider value={{ sportsData, updateSportsOrder }}>
      {children}
    </SportsContext.Provider>
  );
};
