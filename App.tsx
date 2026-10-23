
import React, { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ScreenName =
  | "home"
  | "explore"
  | "missions"
  | "vocabulary"
  | "profile"
  | "country"
  | "daily"
  | "achievements"
  | "rewards"
  | "dialogues";

type Country = {
  id: string;
  name: string;
  flag: string;
  heroImage: string;
  description: string;
  cities: string[];
  landmarks: string[];
  foods: string[];
  music: string[];
  movies: string[];
  curiosities: string[];
  places: { name: string; image: string; caption: string }[];
  expressions: { english: string; pt: string }[];
  categories: string[];
};

type Mission = {
  id: string;
  categoryId: string;
  title: string;
  context: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  translation: string;
  vocabulary: string[];
  xp: number;
};

type Word = {
  id: string;
  word: string;
  translation: string;
  category: string;
};

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
};

type Reward = {
  id: string;
  name: string;
  category: string;
  benefit: string;
  cost: number;
  location: string;
};

type Dialog = {
  id: string;
  title: string;
  context: string;
  lines: { speaker: string; english: string; pt: string }[];
};

type ProgressState = {
  name: string;
  avatar: string;
  xp: number;
  completedMissions: string[];
  learnedWords: string[];
  favorites: string[];
  exploredCountryIds: string[];
  unlockedRewards: string[];
  studyStreak: boolean[];
  dailyChallengeCompletedDate: string | null;
};

const STORAGE_KEY = "worldify-demo-progress-v1";

const countries: Country[] = [
  {
    id: "united-states",
    name: "United States",
    flag: "🇺🇸",
    heroImage:
      "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1200&q=80",
    description:
      "A destination with iconic cities, diverse culture, world-class museums, and practical English used in travel, business and everyday life.",
    cities: ["New York", "Los Angeles", "Chicago", "Miami"],
    landmarks: ["Statue of Liberty", "Grand Canyon", "Times Square", "Golden Gate"],
    foods: ["Burger", "BBQ", "Pizza", "Hot dog"],
    music: ["Taylor Swift", "Ariana Grande", "Kendrick Lamar"],
    movies: ["The Devil Wears Prada", "The Social Network", "Friends"],
    curiosities: [
      "The United States has dozens of cultural regions.",
      "New York City is one of the most international cities in the world.",
      "English in the US is shaped by regional accents and everyday slang.",
    ],
    places: [
      {
        name: "New York",
        image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=900&q=80",
        caption: "Times Square and city life",
      },
      {
        name: "San Francisco",
        image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=900&q=80",
        caption: "The Golden Gate Bridge",
      },
      {
        name: "Grand Canyon",
        image: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=900&q=80",
        caption: "A vast natural wonder",
      },
    ],
    expressions: [
      { english: "Can you give me directions?", pt: "Você pode me dar direções?" },
      { english: "I’m here on vacation.", pt: "Estou aqui de férias." },
      { english: "What time is the boarding call?", pt: "Que horas é a chamada para embarque?" },
    ],
    categories: ["Airport", "Hotel", "Restaurant", "Transportation", "Shopping"],
  },
  {
    id: "united-kingdom",
    name: "United Kingdom",
    flag: "🇬🇧",
    heroImage:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
    description:
      "The UK mixes history, lively cities, and practical vocabulary for travel, accommodation, and transport in a modern and international setting.",
    cities: ["London", "Edinburgh", "Manchester", "Birmingham"],
    landmarks: ["Big Ben", "Tower Bridge", "Stonehenge", "Buckingham Palace"],
    foods: ["Fish and chips", "Sunday roast", "Pudding", "Tea"],
    music: ["Coldplay", "Adele", "The Beatles"],
    movies: ["Harry Potter", "Paddington", "Notting Hill"],
    curiosities: [
      "The UK uses British English spelling and phrases.",
      "London is known for its museums and public transport network.",
      "Many travelers practice questions about queues, routes, and reservations.",
    ],
    places: [
      {
        name: "London",
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80",
        caption: "The Thames and historic landmarks",
      },
      {
        name: "Tower Bridge",
        image: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=900&q=80",
        caption: "An iconic London crossing",
      },
      {
        name: "Edinburgh",
        image: "https://images.unsplash.com/photo-1506377585622-bedcbb027afc?auto=format&fit=crop&w=900&q=80",
        caption: "Old Town and castle views",
      },
    ],
    expressions: [
      { english: "I would like to check in.", pt: "Eu gostaria de fazer o check-in." },
      { english: "Is this the right platform?", pt: "Este é o platform certo?" },
      { english: "Could I have the bill, please?", pt: "Posso ter a conta, por favor?" },
    ],
    categories: ["Hotel", "Restaurant", "Transportation", "Tourism"],
  },
  {
    id: "canada",
    name: "Canada",
    flag: "🇨🇦",
    heroImage:
      "https://images.unsplash.com/photo-1503614472-8c93d56cd2?auto=format&fit=crop&w=1200&q=80",
    description:
      "Canada is ideal for practicing friendly English in city, nature, and adventure contexts, with a welcoming and multilingual atmosphere.",
    cities: ["Toronto", "Vancouver", "Montreal", "Calgary"],
    landmarks: ["Niagara Falls", "CN Tower", "Banff", "Quebec Old Town"],
    foods: ["Poutine", "Maple syrup", "Sushi", "Bagels"],
    music: ["The Weeknd", "Drake", "Alessia Cara"],
    movies: ["Mean Girls", "The Revenant", "Arrival"],
    curiosities: [
      "Canada is known for its bilingual signage and welcoming culture.",
      "Many travelers use English for tourism and public transportation.",
      "The country is full of national parks and city neighborhoods.",
    ],
    places: [
      {
        name: "Banff",
        image: "https://images.unsplash.com/photo-1503614472-8c93d56cd2?auto=format&fit=crop&w=900&q=80",
        caption: "Turquoise lakes and the Rockies",
      },
      {
        name: "Toronto",
        image: "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=900&q=80",
        caption: "A lively waterfront city",
      },
      {
        name: "Niagara Falls",
        image: "https://images.unsplash.com/photo-1489447068241-b3490214e879?auto=format&fit=crop&w=900&q=80",
        caption: "One of the world's great waterfalls",
      },
    ],
    expressions: [
      { english: "What time does the tour start?", pt: "A que horas começa o tour?" },
      { english: "I am looking for the nearest station.", pt: "Estou procurando a estação mais próxima." },
      { english: "Can I pay by card?", pt: "Posso pagar com cartão?" },
    ],
    categories: ["Transportation", "Tourism", "Shopping", "Hotel"],
  },
  {
    id: "australia",
    name: "Australia",
    flag: "🇦🇺",
    heroImage:
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80",
    description:
      "Australia blends beach culture, city life, and outdoor experiences, offering useful travel English for casual conversations and exploration.",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth"],
    landmarks: ["Sydney Opera House", "Great Barrier Reef", "Uluru", "Bondi Beach"],
    foods: ["Vegemite toast", "Seafood", "Meat pie", "Lamington"],
    music: ["Tame Impala", "The Kid LAROI", "Sia"],
    movies: ["Mad Max", "Finding Nemo", "The Great Gatsby"],
    curiosities: [
      "Australia is famous for its beaches and natural landscapes.",
      "Travel English often focuses on directions, transport, and bookings.",
      "The local lifestyle is informal and very friendly.",
    ],
    places: [
      {
        name: "Sydney",
        image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=900&q=80",
        caption: "Harbour views and the Opera House",
      },
      {
        name: "Great Barrier Reef",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
        caption: "A spectacular underwater world",
      },
      {
        name: "Uluru",
        image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=900&q=80",
        caption: "Sacred desert landscape",
      },
    ],
    expressions: [
      { english: "Is there a direct bus to the city center?", pt: "Existe um ônibus direto para o centro da cidade?" },
      { english: "I booked a room for two nights.", pt: "Reservei um quarto por duas noites." },
      { english: "Could you recommend a local restaurant?", pt: "Você poderia recomendar um restaurante local?" },
    ],
    categories: ["Transportation", "Hotel", "Restaurant", "Tourism"],
  },
];

const missionCategories = [
  {
    id: "airport",
    icon: "✈️",
    title: "At the Airport",
    description: "Immigration, gates, luggage and boarding conversations.",
    difficulty: "Beginner",
    xp: 80,
  },
  {
    id: "hotel",
    icon: "🏨",
    title: "At the Hotel",
    description: "Reservations, check-in, rooms and everyday requests.",
    difficulty: "Beginner",
    xp: 90,
  },
  {
    id: "restaurant",
    icon: "🍽️",
    title: "At the Restaurant",
    description: "Orders, preferences, bills and polite requests.",
    difficulty: "Intermediate",
    xp: 100,
  },
  {
    id: "transportation",
    icon: "🚇",
    title: "Transportation",
    description: "Trains, buses, taxis and directions.",
    difficulty: "Intermediate",
    xp: 110,
  },
  {
    id: "shopping",
    icon: "🛍️",
    title: "Shopping",
    description: "Prices, sizes, payment and everyday buying phrases.",
    difficulty: "Intermediate",
    xp: 120,
  },
  {
    id: "tourism",
    icon: "🗺️",
    title: "Tourism",
    description: "Museums, landmarks and useful visitor information.",
    difficulty: "Beginner",
    xp: 85,
  },
];

const missions: Mission[] = [
  {
    id: "airport-arrival",
    categoryId: "airport",
    title: "Passport control",
    context: "Arrival at the airport",
    question: "Officer: 'What's the purpose of your visit?'",
    options: [
      "A) I'm here on vacation.",
      "B) I want a hamburger.",
      "C) Where is the hotel?",
    ],
    correctAnswer: "A) I'm here on vacation.",
    explanation:
      "The correct response is natural and directly answers the officer's question about the reason for the trip.",
    translation: "Estou aqui de férias.",
    vocabulary: ["purpose", "visit", "vacation"],
    xp: 80,
  },
  {
    id: "airport-boarding",
    categoryId: "airport",
    title: "Boarding gate",
    context: "At the boarding gate",
    question: "Agent: 'Where is your departure gate?'",
    options: [
      "A) It is on the second floor.",
      "B) I have a suitcase and a backpack.",
      "C) My passport is in the wallet.",
    ],
    correctAnswer: "A) It is on the second floor.",
    explanation:
      "The agent is asking about the gate. Answering with location gives the right information.",
    translation: "Ele está no segundo andar.",
    vocabulary: ["gate", "departure", "floor"],
    xp: 90,
  },
  {
    id: "hotel-checkin",
    categoryId: "hotel",
    title: "Check-in",
    context: "Hotel reception",
    question: "Receptionist: 'Do you have a reservation?'",
    options: [
      "A) Yes, under the name Silva.",
      "B) I am a student.",
      "C) The room is on the left.",
    ],
    correctAnswer: "A) Yes, under the name Silva.",
    explanation:
      "The receptionist asks about a reservation, so confirming the name is the most appropriate answer.",
    translation: "Sim, em nome de Silva.",
    vocabulary: ["reservation", "check-in", "name"],
    xp: 90,
  },
  {
    id: "hotel-request",
    categoryId: "hotel",
    title: "Room request",
    context: "At the hotel desk",
    question: "Receptionist: 'Would you like a room with a view?'",
    options: [
      "A) Yes, a room with a city view would be great.",
      "B) I want a train ticket.",
      "C) The restaurant closes at 9.",
    ],
    correctAnswer: "A) Yes, a room with a city view would be great.",
    explanation:
      "This answer directly responds to the request and shows clear preference about the room type.",
    translation: "Sim, um quarto com vista para a cidade seria ótimo.",
    vocabulary: ["view", "room", "request"],
    xp: 95,
  },
  {
    id: "restaurant-order",
    categoryId: "restaurant",
    title: "Dining order",
    context: "Ordering food",
    question: "Waiter: 'What would you like to order?'",
    options: [
      "A) I would like grilled chicken and a soda.",
      "B) I am from London.",
      "C) The hotel is nearby.",
    ],
    correctAnswer: "A) I would like grilled chicken and a soda.",
    explanation:
      "The waiter is asking for the order, so naming the food and drink is the correct answer.",
    translation: "Eu gostaria de frango grelhado e uma soda.",
    vocabulary: ["order", "grilled", "soda"],
    xp: 100,
  },
  {
    id: "restaurant-bill",
    categoryId: "restaurant",
    title: "The bill",
    context: "Paying at the restaurant",
    question: "Server: 'Would you like the check or dessert?'",
    options: [
      "A) The check, please.",
      "B) The train is late.",
      "C) The room is clean.",
    ],
    correctAnswer: "A) The check, please.",
    explanation:
      "The server is asking about finalizing the payment, so asking for the bill is exactly right.",
    translation: "A conta, por favor.",
    vocabulary: ["bill", "check", "please"],
    xp: 100,
  },
  {
    id: "transport-bus",
    categoryId: "transportation",
    title: "Bus directions",
    context: "Using public transportation",
    question: "Driver: 'Where are you heading?'",
    options: [
      "A) I’m going to the city center.",
      "B) I have a reservation.",
      "C) I need a towel.",
    ],
    correctAnswer: "A) I’m going to the city center.",
    explanation:
      "The driver asks for the destination, so giving the destination is the natural answer.",
    translation: "Vou para o centro da cidade.",
    vocabulary: ["destination", "center", "public transport"],
    xp: 110,
  },
  {
    id: "transport-taxi",
    categoryId: "transportation",
    title: "Taxi ride",
    context: "Taking a taxi",
    question: "Taxi driver: 'Where would you like to go?'",
    options: [
      "A) To the airport, please.",
      "B) I’m hungry.",
      "C) The suitcase is heavy.",
    ],
    correctAnswer: "A) To the airport, please.",
    explanation:
      "The driver needs the destination, so mentioning the airport is the best response.",
    translation: "Para o aeroporto, por favor.",
    vocabulary: ["taxi", "destination", "airport"],
    xp: 110,
  },
  {
    id: "shopping-price",
    categoryId: "shopping",
    title: "Price question",
    context: "Shopping in a store",
    question: "Shop assistant: 'How much is this jacket?'",
    options: [
      "A) It costs 75 dollars.",
      "B) The room is ready.",
      "C) I am leaving tomorrow.",
    ],
    correctAnswer: "A) It costs 75 dollars.",
    explanation:
      "The question asks for price, so giving the amount is exactly correct.",
    translation: "Ele custa 75 dólares.",
    vocabulary: ["cost", "jacket", "dollars"],
    xp: 120,
  },
  {
    id: "shopping-size",
    categoryId: "shopping",
    title: "Size question",
    context: "Buying clothes",
    question: "Salesperson: 'Do you need a larger size?'",
    options: [
      "A) Yes, a size medium would be better.",
      "B) My flight is delayed.",
      "C) The museum closes soon.",
    ],
    correctAnswer: "A) Yes, a size medium would be better.",
    explanation:
      "The question is about size preferences, so answering with a clothing size matches the situation perfectly.",
    translation: "Sim, um tamanho médio seria melhor.",
    vocabulary: ["size", "medium", "clothes"],
    xp: 120,
  },
  {
    id: "tourism-museum",
    categoryId: "tourism",
    title: "Tourist information",
    context: "At a museum",
    question: "Guide: 'How long does the visit normally take?'",
    options: [
      "A) Around two hours.",
      "B) I am checking out.",
      "C) The flight is next week.",
    ],
    correctAnswer: "A) Around two hours.",
    explanation:
      "The guide asks about duration, so the answer should estimate the length of the visit.",
    translation: "Cerca de duas horas.",
    vocabulary: ["visit", "hours", "duration"],
    xp: 85,
  },
  {
    id: "tourism-directions",
    categoryId: "tourism",
    title: "Directions",
    context: "Asking for help in the city",
    question: "Local: 'Could you tell me where the museum is?'",
    options: [
      "A) It is next to the river and the station.",
      "B) I want a salad.",
      "C) My passport is missing.",
    ],
    correctAnswer: "A) It is next to the river and the station.",
    explanation:
      "The correct answer gives a clear location and helps the traveler orient themselves.",
    translation: "Fica ao lado do rio e da estação.",
    vocabulary: ["directions", "museum", "station"],
    xp: 85,
  },
];

const vocabularyBank: Word[] = [
  { id: "passport", word: "passport", translation: "passaporte", category: "Travel" },
  { id: "boarding-pass", word: "boarding pass", translation: "cartão de embarque", category: "Travel" },
  { id: "reservation", word: "reservation", translation: "reserva", category: "Hotel" },
  { id: "check-in", word: "check-in", translation: "check-in", category: "Hotel" },
  { id: "directions", word: "directions", translation: "direções", category: "City" },
  { id: "menu", word: "menu", translation: "cardápio", category: "Restaurant" },
  { id: "ticket", word: "ticket", translation: "ingresso", category: "Transport" },
  { id: "receipt", word: "receipt", translation: "recibo", category: "Shopping" },
  { id: "sightseeing", word: "sightseeing", translation: "passeio turístico", category: "Tourism" },
  { id: "currency", word: "currency", translation: "moeda", category: "Travel" },
  { id: "luggage", word: "luggage", translation: "bagagem", category: "Travel" },
  { id: "local-guide", word: "local guide", translation: "guia local", category: "Tourism" },
];

const achievementDefinitions: Achievement[] = [
  { id: "first-mission", name: "First mission", description: "Complete the first lesson.", icon: "🎯", requirement: 1 },
  { id: "first-quiz", name: "First quiz", description: "Finish one scenario correctly.", icon: "✅", requirement: 1 },
  { id: "ten-words", name: "Ten words", description: "Save ten new vocabulary words.", icon: "📚", requirement: 10 },
  { id: "first-country", name: "First country", description: "Open a country page.", icon: "🌍", requirement: 1 },
  { id: "five-missions", name: "Five missions", description: "Complete five missions.", icon: "🏅", requirement: 5 },
  { id: "daily-challenge", name: "Daily challenge", description: "Finish the daily challenge.", icon: "🔥", requirement: 1 },
];

const rewardDefinitions: Reward[] = [
  {
    id: "world-hotel",
    name: "World Hotel",
    category: "Hotel",
    benefit: "10% OFF",
    cost: 1000,
    location: "London",
  },
  {
    id: "london-cafe",
    name: "London Café",
    category: "Restaurant",
    benefit: "5% OFF",
    cost: 500,
    location: "London",
  },
  {
    id: "london-museum",
    name: "London Museum",
    category: "Attraction",
    benefit: "15% OFF",
    cost: 800,
    location: "London",
  },
  {
    id: "city-tour",
    name: "City Tour",
    category: "Entertainment",
    benefit: "10% OFF",
    cost: 700,
    location: "London",
  },
];

const dialogues: Dialog[] = [
  {
    id: "immigration",
    title: "Immigration desk",
    context: "Arrival at the airport",
    lines: [
      { speaker: "Officer", english: "What is the purpose of your visit?", pt: "Qual é o motivo da sua visita?" },
      { speaker: "Traveler", english: "I am visiting for tourism.", pt: "Estou visitando por turismo." },
      { speaker: "Officer", english: "Please show your passport and ticket.", pt: "Por favor, mostre seu passaporte e ingresso." },
    ],
  },
  {
    id: "hotel-check-in",
    title: "Hotel check-in",
    context: "Reception desk",
    lines: [
      { speaker: "Receptionist", english: "Good afternoon. Do you have a reservation?", pt: "Boa tarde. Você tem reserva?" },
      { speaker: "Guest", english: "Yes, under the name Morgan.", pt: "Sim, em nome de Morgan." },
      { speaker: "Receptionist", english: "Perfect. Your room is on the 7th floor.", pt: "Perfeito. Seu quarto fica no 7º andar." },
    ],
  },
  {
    id: "restaurant-order",
    title: "Restaurant order",
    context: "Lunch in a cafe",
    lines: [
      { speaker: "Waiter", english: "What would you like to drink?", pt: "O que você gostaria de beber?" },
      { speaker: "Customer", english: "I would like a lemonade and the grilled chicken.", pt: "Eu gostaria de uma limonada e o frango grelhado." },
      { speaker: "Waiter", english: "Wonderful choice. I will bring it shortly.", pt: "Ótima escolha. Vou trazer em breve." },
    ],
  },
  {
    id: "transportation",
    title: "Asking for directions",
    context: "On the street",
    lines: [
      { speaker: "Traveler", english: "Excuse me, could you tell me where the station is?", pt: "Desculpe, você pode me dizer onde fica a estação?" },
      { speaker: "Local", english: "It is two blocks away, near the river.", pt: "Fica a dois quarteirões de distância, perto do rio." },
      { speaker: "Traveler", english: "Thank you very much!", pt: "Muito obrigado!" },
    ],
  },
];

const getLevelFromXp = (xp: number) => Math.floor(xp / 180) + 1;

const getXpProgress = (xp: number) => {
  const currentLevel = getLevelFromXp(xp);
  const levelStart = (currentLevel - 1) * 180;
  const levelEnd = currentLevel * 180;
  const barProgress = ((xp - levelStart) / (levelEnd - levelStart)) * 100;

  return {
    level: currentLevel,
    progress: Math.max(0, Math.min(100, barProgress)),
    nextLevelXp: levelEnd,
    currentLevelStart: levelStart,
  };
};

const todayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const markStudyDay = (streak: boolean[]) => {
  const mondayFirstIndex = (new Date().getDay() + 6) % 7;
  return streak.map((studied, index) => studied || index === mondayFirstIndex);
};

const demoProgress: ProgressState = {
  name: "Alicia",
  avatar: "🌍",
  xp: 760,
  completedMissions: ["airport-arrival", "restaurant-order", "hotel-checkin"],
  learnedWords: ["passport", "reservation", "directions", "menu", "ticket"],
  favorites: ["united-states", "united-kingdom"],
  exploredCountryIds: ["united-states", "united-kingdom"],
  unlockedRewards: ["london-cafe"],
  studyStreak: [true, true, false, true, true, true, false],
  dailyChallengeCompletedDate: null,
};

export default function App() {
  const [screen, setScreen] = useState<ScreenName>("home");
  const [progress, setProgress] = useState<ProgressState>(demoProgress);
  const [search, setSearch] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState<string>("united-states");
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("airport");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [dailyAnswer, setDailyAnswer] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function loadProgress() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<ProgressState>;
          setProgress({
            ...demoProgress,
            ...parsed,
            exploredCountryIds: parsed.exploredCountryIds ?? parsed.favorites ?? [],
          });
        }
      } catch (error) {
        console.warn("Unable to load progress", error);
      } finally {
        setHydrated(true);
      }
    }

    loadProgress();
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress)).catch((error) => {
      console.warn("Unable to save progress", error);
    });
  }, [progress, hydrated]);

  const xpInfo = useMemo(() => getXpProgress(progress.xp), [progress.xp]);

  const completedMissionCount = progress.completedMissions.length;
  const learnedWordCount = progress.learnedWords.length;
  const unlockedRewardsCount = progress.unlockedRewards.length;
  const exploredCountries = progress.exploredCountryIds.length;

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.categories.some((category) => category.toLowerCase().includes(search.toLowerCase()))
  );

  const achievements = achievementDefinitions.map((achievement) => {
    const count =
      achievement.id === "first-mission"
        ? completedMissionCount
        : achievement.id === "first-quiz"
        ? completedMissionCount
        : achievement.id === "ten-words"
        ? learnedWordCount
        : achievement.id === "first-country"
        ? exploredCountries
        : achievement.id === "five-missions"
        ? completedMissionCount
        : progress.dailyChallengeCompletedDate ? 1 : 0;

    return { ...achievement, unlocked: count >= achievement.requirement };
  });

  const openCountry = (countryId: string) => {
    setSelectedCountryId(countryId);
    setProgress((prev) => ({
      ...prev,
      exploredCountryIds: prev.exploredCountryIds.includes(countryId)
        ? prev.exploredCountryIds
        : [...prev.exploredCountryIds, countryId],
    }));
    setScreen("country");
  };

  const openMissionCategory = (categoryName: string) => {
    const normalizedName = categoryName.toLowerCase();
    const category = missionCategories.find((item) =>
      item.title.toLowerCase().includes(normalizedName)
    );

    if (!category) {
      Alert.alert("Categoria indisponível", "Ainda não há uma missão para esta categoria.");
      return;
    }

    setSelectedCategoryId(category.id);
    setSelectedMissionId(null);
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setScreen("missions");
  };

  const toggleFavorite = (countryId: string) => {
    setProgress((prev) => {
      const exists = prev.favorites.includes(countryId);
      return {
        ...prev,
        favorites: exists
          ? prev.favorites.filter((id) => id !== countryId)
          : [...prev.favorites, countryId],
      };
    });
  };

  const addXp = (amount: number, missionId?: string) => {
    setProgress((prev) => {
      const nextCompleted = missionId
        ? prev.completedMissions.includes(missionId)
          ? prev.completedMissions
          : [...prev.completedMissions, missionId]
        : prev.completedMissions;

      return {
        ...prev,
        xp: prev.xp + amount,
        completedMissions: nextCompleted,
      };
    });
  };

  const addWord = (wordId: string) => {
    setProgress((prev) => {
      const word = vocabularyBank.find((item) => item.id === wordId);
      if (!word || prev.learnedWords.includes(word.id)) return prev;

      return {
        ...prev,
        learnedWords: [...prev.learnedWords, word.id],
        xp: prev.xp + 20,
        studyStreak: markStudyDay(prev.studyStreak),
      };
    });
  };

  const handleMissionAnswer = (mission: Mission, answer: string) => {
    if (progress.completedMissions.includes(mission.id)) {
      Alert.alert("Missão concluída", "Você já recebeu XP por esta atividade.");
      return;
    }

    const isCorrect = answer === mission.correctAnswer;
    const xpGained = isCorrect ? mission.xp : 0;

    setSelectedAnswer(answer);
    setAnswerSubmitted(true);

    setProgress((prev) => ({
      ...prev,
      xp: prev.xp + xpGained,
      completedMissions: isCorrect
        ? [...new Set([...prev.completedMissions, mission.id])]
        : prev.completedMissions,
      studyStreak: isCorrect ? markStudyDay(prev.studyStreak) : prev.studyStreak,
    }));

    if (isCorrect) {
      Alert.alert("Resposta correta!", `${mission.explanation} +${mission.xp} XP`);
    } else {
      Alert.alert(
        "Resposta incorreta",
        `A resposta correta é: ${mission.correctAnswer}. ${mission.explanation}`
      );
    }
  };

  const completeDailyChallenge = () => {
    const today = todayString();
    if (progress.dailyChallengeCompletedDate === today) {
      Alert.alert("Desafio concluído", "Você já recebeu +25 XP hoje.");
      return;
    }

    if (dailyAnswer !== "Yes, please. That would be great.") {
      Alert.alert("Tente novamente", "Escolha a resposta que confirma que deseja incluir o café da manhã.");
      return;
    }

    setProgress((prev) => ({
      ...prev,
      xp: prev.xp + 25,
      dailyChallengeCompletedDate: today,
      studyStreak: markStudyDay(prev.studyStreak),
    }));

    Alert.alert("Desafio do dia concluído", "Você ganhou +25 XP!");
  };

  const unlockReward = (reward: Reward) => {
    if (progress.unlockedRewards.includes(reward.id)) {
      Alert.alert("Recompensa já desbloqueada", "Você já ativou este benefício.");
      return;
    }

    if (progress.xp < reward.cost) {
      Alert.alert("Saldo insuficiente", `Você precisa de ${reward.cost - progress.xp} XP a mais.`);
      return;
    }

    setProgress((prev) => ({
      ...prev,
      xp: prev.xp - reward.cost,
      unlockedRewards: [...prev.unlockedRewards, reward.id],
    }));

    Alert.alert("Recompensa desbloqueada", `${reward.name} foi ativado com sucesso.`);
  };

  const currentMission = missions.find((mission) => mission.id === selectedMissionId) ?? missions[0];
  const selectedCountry = countries.find((country) => country.id === selectedCountryId) ?? countries[0];

  const studyDays = [
    { day: "Seg" },
    { day: "Ter" },
    { day: "Qua" },
    { day: "Qui" },
    { day: "Sex" },
    { day: "Sáb" },
    { day: "Dom" },
  ].map((item, index) => ({
    ...item,
    active: progress.studyStreak[index] ?? false,
  }));

  const actionButtons = [
    { label: "Explore", screen: "explore" as ScreenName, icon: "compass" },
    { label: "Missions", screen: "missions" as ScreenName, icon: "flag" },
    { label: "Vocabulary", screen: "vocabulary" as ScreenName, icon: "book" },
    { label: "Rewards", screen: "rewards" as ScreenName, icon: "gift" },
    { label: "Dialogues", screen: "dialogues" as ScreenName, icon: "chatbubble-ellipses" },
  ];

  const renderHome = () => (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <View style={styles.heroCard}>
        <Image
          source={{ uri: selectedCountry.heroImage }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay} />

        <View style={styles.heroContent}>
          <Text style={styles.logo}>WORLDIFY</Text>
          <Text style={styles.heroSlogan}>Learn English. Explore the world.</Text>

          <View style={styles.userRow}>
            <Text style={styles.avatar}>{progress.avatar}</Text>
            <View>
              <Text style={styles.greeting}>Olá, {progress.name}!</Text>
              <Text style={styles.subtitle}>Seu próximo destino é {selectedCountry.name}.</Text>
            </View>
          </View>

          <View style={styles.travelPills}>
            <Text style={styles.pill}>🌍 Culture</Text>
            <Text style={styles.pill}>🎧 Music</Text>
            <Text style={styles.pill}>🗣️ English</Text>
          </View>
        </View>
      </View>

      <View style={styles.featuredCard}>
        <Text style={styles.sectionTitle}>Destination of the moment</Text>
        <TouchableOpacity style={styles.featuredButton} onPress={() => openCountry(selectedCountry.id)}>
          <Image source={{ uri: selectedCountry.heroImage }} style={styles.featuredImage} resizeMode="cover" />
          <View style={styles.featuredInfo}>
            <Text style={styles.featuredFlag}>{selectedCountry.flag}</Text>
            <Text style={styles.featuredTitle}>{selectedCountry.name}</Text>
            <Text style={styles.featuredDescription}>{selectedCountry.description}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <Text style={styles.badge}>{xpInfo.level} lvl</Text>
        </View>
        <Text style={styles.xpText}>{progress.xp} XP</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${xpInfo.progress}%` }]} />
        </View>
        <Text style={styles.progressHint}>Next level: {xpInfo.nextLevelXp - progress.xp} XP remaining</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Missions</Text>
          <Text style={styles.statValue}>{completedMissionCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Words</Text>
          <Text style={styles.statValue}>{learnedWordCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Rewards</Text>
          <Text style={styles.statValue}>{unlockedRewardsCount}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Study streak</Text>
        <View style={styles.streakRow}>
          {studyDays.map((day) => (
            <View key={day.day} style={[styles.dayChip, day.active && styles.dayChipActive]}>
              <Text style={[styles.dayText, day.active && styles.dayTextActive]}>{day.day}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.destinationStripWrap}>
        <Text style={styles.sectionTitle}>Popular countries</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destinationStrip}>
          {countries.map((country) => (
            <TouchableOpacity key={country.id} style={styles.destinationCard} onPress={() => openCountry(country.id)}>
              <Image source={{ uri: country.heroImage }} style={styles.destinationImage} resizeMode="cover" />
              <View style={styles.destinationMeta}>
                <Text style={styles.destinationFlag}>{country.flag}</Text>
                <Text style={styles.destinationName}>{country.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recommended mission</Text>
        <Text style={styles.missionTitle}>{missions[0].title}</Text>
        <Text style={styles.missionContext}>{missions[0].context}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => { setSelectedMissionId(missions[0].id); setSelectedCategoryId(missions[0].categoryId); setSelectedAnswer(null); setAnswerSubmitted(false); setScreen("missions"); }}>
          <Text style={styles.primaryButtonText}>Open mission</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Daily challenge</Text>
          <Text style={styles.challengeState}>{progress.dailyChallengeCompletedDate === todayString() ? "Done" : "Open"}</Text>
        </View>
        <Text style={styles.challengeText}>Practice a real travel conversation and earn +25 XP.</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen("daily")}>
          <Text style={styles.secondaryButtonText}>Start daily challenge</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        <View style={styles.listBlock}>
          {progress.completedMissions.slice(0, 3).map((id) => (
            <Text key={id} style={styles.listItem}>• {missions.find((m) => m.id === id)?.title ?? "Mission"}</Text>
          ))}
        </View>
      </View>

      <View style={styles.quickGrid}>
        {actionButtons.map((action) => (
          <TouchableOpacity key={action.label} style={styles.quickButton} onPress={() => setScreen(action.screen)}>
            <Ionicons name={action.icon as any} size={20} color="#0c2744" />
            <Text style={styles.quickButtonText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderExplore = () => (
    <View style={styles.page}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSubtitle}>Choose a destination</Text>
      </View>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search by country or category"
        style={styles.searchInput}
        placeholderTextColor="#7e8caa"
      />
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredCountries.map((country) => {
          const isFavorite = progress.favorites.includes(country.id);
          return (
            <TouchableOpacity key={country.id} style={styles.countryCard} onPress={() => openCountry(country.id)}>
              <Image source={{ uri: country.heroImage }} style={styles.countryImage} resizeMode="cover" />
              <View style={styles.countryInfo}>
                <View style={styles.rowBetween}>
                  <Text style={styles.countryFlag}>{country.flag}</Text>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={isFavorite ? `Remove ${country.name} from favorites` : `Add ${country.name} to favorites`}
                    onPress={(event) => {
                      event.stopPropagation();
                      toggleFavorite(country.id);
                    }}
                  >
                    <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#ef476f" : "#dfe6f6"} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.countryName}>{country.name}</Text>
                <Text style={styles.countryDescription}>{country.description}</Text>
                <View style={styles.chipRow}>
                  {country.categories.slice(0, 3).map((category) => (
                    <View key={category} style={styles.chip}>
                      <Text style={styles.chipText}>{category}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        {filteredCountries.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🧭</Text>
            <Text style={styles.emptyStateTitle}>No destinations found</Text>
            <Text style={styles.emptyStateText}>Try another country or category.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderCountry = () => (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <TouchableOpacity onPress={() => setScreen("explore")} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Image source={{ uri: selectedCountry.heroImage }} style={styles.countryHero} resizeMode="cover" />
      <View style={styles.countryDetailCard}>
        <Text style={styles.countryHeroTitle}>{selectedCountry.flag} {selectedCountry.name}</Text>
        <Text style={styles.countryDescription}>{selectedCountry.description}</Text>

        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>Postcards from {selectedCountry.name}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.placeGallery}>
            {selectedCountry.places.map((place) => (
              <View key={place.name} style={styles.placeCard}>
                <Image source={{ uri: place.image }} style={styles.placeImage} resizeMode="cover" />
                <View style={styles.placeCaption}>
                  <Text style={styles.placeName}>{place.name}</Text>
                  <Text style={styles.placeDescription}>{place.caption}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>Main cities</Text>
          <View style={styles.chipRow}>
            {selectedCountry.cities.map((city) => (
              <View key={city} style={styles.chip}><Text style={styles.chipText}>{city}</Text></View>
            ))}
          </View>
        </View>

        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>Landmarks</Text>
          <View style={styles.chipRow}>
            {selectedCountry.landmarks.map((item) => (
              <View key={item} style={styles.chip}><Text style={styles.chipText}>{item}</Text></View>
            ))}
          </View>
        </View>

        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>Typical foods</Text>
          <View style={styles.chipRow}>
            {selectedCountry.foods.map((item) => (
              <View key={item} style={styles.chip}><Text style={styles.chipText}>{item}</Text></View>
            ))}
          </View>
        </View>

        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>Music and entertainment</Text>
          <View style={styles.chipRow}>
            {selectedCountry.music.concat(selectedCountry.movies).map((item) => (
              <View key={item} style={styles.chip}><Text style={styles.chipText}>{item}</Text></View>
            ))}
          </View>
        </View>

        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>Useful expressions</Text>
          {selectedCountry.expressions.map((expression) => (
            <View key={expression.english} style={styles.expressionCard}>
              <Text style={styles.expressionEnglish}>{expression.english}</Text>
              <Text style={styles.expressionPt}>{expression.pt}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>Practice categories</Text>
          <View style={styles.chipRow}>
            {selectedCountry.categories.map((category) => (
              <TouchableOpacity key={category} style={styles.categoryButton} onPress={() => openMissionCategory(category)}>
                <Text style={styles.categoryButtonText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderMissions = () => (
    <View style={styles.page}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Missions</Text>
        <Text style={styles.headerSubtitle}>Real-life scenarios</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryTabs}>
        {missionCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryTab, selectedCategoryId === category.id && styles.categoryTabActive]}
            onPress={() => {
              setSelectedCategoryId(category.id);
              setSelectedMissionId(null);
              setSelectedAnswer(null);
              setAnswerSubmitted(false);
            }}
          >
            <Text>{category.icon}</Text>
            <Text style={[styles.categoryTabText, selectedCategoryId === category.id && styles.categoryTabTextActive]}>{category.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.listContent}>
        {missions
          .filter((mission) => mission.categoryId === selectedCategoryId)
          .map((mission) => {
            const isDone = progress.completedMissions.includes(mission.id);
            return (
              <View key={mission.id} style={styles.missionCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.missionTitle}>{mission.title}</Text>
                  <Text style={styles.badge}>{mission.xp} XP</Text>
                </View>
                <Text style={styles.missionContext}>{mission.context}</Text>
                <Text style={styles.missionQuestion}>{mission.question}</Text>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    setSelectedMissionId(mission.id);
                    setSelectedAnswer(isDone ? mission.correctAnswer : null);
                    setAnswerSubmitted(isDone);
                  }}
                >
                  <Text style={styles.secondaryButtonText}>{isDone ? "Review" : "Solve"}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
      </ScrollView>

      {currentMission && selectedMissionId && (
        <View style={styles.missionDetailCard}>
          <Text style={styles.sectionTitle}>{currentMission.title}</Text>
          <Text style={styles.missionQuestion}>{currentMission.question}</Text>
          {currentMission.options.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = answerSubmitted && option === currentMission.correctAnswer;
            const isWrong = answerSubmitted && option === selectedAnswer && option !== currentMission.correctAnswer;

            return (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, isSelected && styles.optionButtonSelected, isCorrect && styles.optionButtonCorrect, isWrong && styles.optionButtonWrong]}
                onPress={() => {
                  if (progress.completedMissions.includes(currentMission.id)) return;
                  setSelectedAnswer(option);
                  setAnswerSubmitted(false);
                }}
                disabled={progress.completedMissions.includes(currentMission.id)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            );
          })}

          {selectedAnswer !== null && !answerSubmitted && !progress.completedMissions.includes(currentMission.id) && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => handleMissionAnswer(currentMission, selectedAnswer)}
            >
              <Text style={styles.primaryButtonText}>Confirm answer</Text>
            </TouchableOpacity>
          )}

          {answerSubmitted && selectedAnswer !== null && (
            <View style={styles.resultCard}>
              <Text style={styles.resultHeading}>{selectedAnswer === currentMission.correctAnswer ? "Correct answer" : "Check the answer"}</Text>
              <Text style={styles.resultText}>Correct: {currentMission.correctAnswer}</Text>
              <Text style={styles.resultText}>Translation: {currentMission.translation}</Text>
              <Text style={styles.resultText}>{currentMission.explanation}</Text>
              <Text style={styles.resultText}>Vocabulary: {currentMission.vocabulary.join(", ")}</Text>
              {!progress.completedMissions.includes(currentMission.id) && selectedAnswer !== currentMission.correctAnswer && (
                <Text style={styles.tryAgainText}>Choose another option and try again.</Text>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderVocabulary = () => (
    <View style={styles.page}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Vocabulary</Text>
        <Text style={styles.headerSubtitle}>{progress.learnedWords.length} saved words</Text>
      </View>
      <ScrollView contentContainerStyle={styles.listContent}>
        {vocabularyBank.map((item) => {
          const saved = progress.learnedWords.includes(item.id);
          return (
            <View key={item.id} style={styles.wordCard}>
              <View>
                <Text style={styles.wordTitle}>{item.word}</Text>
                <Text style={styles.wordTranslation}>{item.translation}</Text>
              </View>
              <TouchableOpacity
                style={[styles.secondaryButton, saved && styles.secondaryButtonDisabled]}
                onPress={() => addWord(item.id)}
                disabled={saved}
              >
                <Text style={styles.secondaryButtonText}>{saved ? "Saved" : "Save"}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderProfile = () => (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <View style={styles.profileHeader}>
        <Text style={styles.avatarLarge}>{progress.avatar}</Text>
        <TouchableOpacity
          style={styles.editAvatarButton}
          onPress={() => {
            const avatars = ["🌍", "✈️", "🧭", "🎓", "🌟"];
            const currentIndex = avatars.indexOf(progress.avatar);
            setProgress((prev) => ({
              ...prev,
              avatar: avatars[(currentIndex + 1) % avatars.length],
            }));
          }}
        >
          <Text style={styles.editAvatarText}>Change avatar</Text>
        </TouchableOpacity>
        <TextInput
          accessibilityLabel="Your profile name"
          value={progress.name}
          onChangeText={(name) => setProgress((prev) => ({ ...prev, name }))}
          placeholder="Your name"
          placeholderTextColor="#7e8caa"
          style={styles.profileNameInput}
          maxLength={24}
        />
        <Text style={styles.profileMeta}>Level {xpInfo.level} • {progress.xp} XP</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Learning progress</Text>
        <Text style={styles.profileMeta}>Countries explored: {exploredCountries}</Text>
        <Text style={styles.profileMeta}>Missions completed: {completedMissionCount}</Text>
        <Text style={styles.profileMeta}>Vocabulary learned: {learnedWordCount}</Text>
        <Text style={styles.profileMeta}>Rewards unlocked: {unlockedRewardsCount}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen("achievements")}>
          <Text style={styles.primaryButtonText}>Achievements</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen("rewards")}>
          <Text style={styles.secondaryButtonText}>Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen("dialogues")}>
          <Text style={styles.secondaryButtonText}>Practice dialogues</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Conquistas</Text>
        {achievements.map((achievement) => (
          <View key={achievement.id} style={styles.achievementItem}>
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.achievementName}>{achievement.name}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
            </View>
            <Text style={[styles.achievementStatus, achievement.unlocked && styles.achievementUnlocked]}>
              {achievement.unlocked ? "Unlocked" : "Locked"}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderAchievements = () => (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <TouchableOpacity onPress={() => setScreen("profile")} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Profile</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Achievements</Text>
      {achievements.map((achievement) => (
        <View key={achievement.id} style={styles.rewardCard}>
          <Text style={styles.rewardTitle}>{achievement.icon} {achievement.name}</Text>
          <Text style={styles.rewardMeta}>{achievement.description}</Text>
          <Text style={styles.rewardMeta}>Requirement: {achievement.requirement}</Text>
          <Text style={[styles.achievementStatus, achievement.unlocked && styles.achievementUnlocked]}>
            {achievement.unlocked ? "Unlocked" : "Locked"}
          </Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderRewards = () => (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <TouchableOpacity onPress={() => setScreen("profile")} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Profile</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Rewards</Text>
      <Text style={styles.rewardHint}>Demo rewards. They are not real commercial partnerships.</Text>
      {rewardDefinitions.map((reward) => {
        const unlocked = progress.unlockedRewards.includes(reward.id);
        return (
          <View key={reward.id} style={styles.rewardCard}>
            <Text style={styles.rewardTitle}>{reward.name}</Text>
            <Text style={styles.rewardMeta}>{reward.category}</Text>
            <Text style={styles.rewardMeta}>{reward.location}</Text>
            <Text style={styles.rewardBenefit}>{reward.benefit}</Text>
            <Text style={styles.rewardCost}>{reward.cost} XP</Text>
            <TouchableOpacity
              style={[styles.primaryButton, unlocked && styles.ghostButton]}
              onPress={() => unlockReward(reward)}
              disabled={unlocked}
            >
              <Text style={styles.primaryButtonText}>{unlocked ? "Unlocked" : "Unlock"}</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );

  const renderDaily = () => (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <TouchableOpacity onPress={() => setScreen("home")} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Home</Text>
      </TouchableOpacity>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Daily challenge</Text>
        <Text style={styles.challengeText}>Complete a small travel scenario and earn +25 XP once per day.</Text>
        <Text style={styles.challengeQuestion}>Situation: You are at the hotel reception. The staff asks: "Would you like breakfast included in the room?"</Text>
        {[
          "Yes, please. That would be great.",
          "No, I would like to book a taxi.",
          "Where is the nearest museum?",
        ].map((answer) => (
          <TouchableOpacity
            key={answer}
            style={[
              styles.optionButton,
              dailyAnswer === answer && styles.optionButtonSelected,
              progress.dailyChallengeCompletedDate === todayString() &&
                answer === "Yes, please. That would be great." &&
                styles.optionButtonCorrect,
            ]}
            onPress={() => setDailyAnswer(answer)}
            disabled={progress.dailyChallengeCompletedDate === todayString()}
          >
            <Text style={styles.optionText}>{answer}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.primaryButton, progress.dailyChallengeCompletedDate === todayString() && styles.ghostButton]}
          onPress={completeDailyChallenge}
          disabled={progress.dailyChallengeCompletedDate === todayString()}
        >
          <Text style={styles.primaryButtonText}>
            {progress.dailyChallengeCompletedDate === todayString() ? "Completed today · +25 XP" : "Check answer"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderDialogues = () => (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <TouchableOpacity onPress={() => setScreen("home")} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Home</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Dialogues</Text>
      {dialogues.map((dialog) => (
        <View key={dialog.id} style={styles.card}>
          <Text style={styles.sectionTitle}>{dialog.title}</Text>
          <Text style={styles.dialogContext}>{dialog.context}</Text>
          {dialog.lines.map((line) => (
            <View key={`${dialog.id}-${line.speaker}-${line.english}`} style={styles.dialogLine}>
              <Text style={styles.dialogSpeaker}>{line.speaker}</Text>
              <Text style={styles.dialogEnglish}>{line.english}</Text>
              <Text style={styles.dialogPt}>{line.pt}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  const renderScreen = () => {
    switch (screen) {
      case "explore":
        return renderExplore();
      case "missions":
        return renderMissions();
      case "vocabulary":
        return renderVocabulary();
      case "profile":
        return renderProfile();
      case "country":
        return renderCountry();
      case "daily":
        return renderDaily();
      case "achievements":
        return renderAchievements();
      case "rewards":
        return renderRewards();
      case "dialogues":
        return renderDialogues();
      case "home":
      default:
        return renderHome();
    }
  };

  const activeTab =
    screen === "country"
      ? "explore"
      : ["daily", "achievements", "rewards", "dialogues"].includes(screen)
      ? "home"
      : screen;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <StatusBar barStyle="light-content" backgroundColor="#081a2c" />
        {renderScreen()}

        <SafeAreaView style={styles.tabBar} edges={["bottom"]}>
          {[
            { key: "home", label: "Home", icon: "home" },
            { key: "explore", label: "Explore", icon: "compass" },
            { key: "missions", label: "Missions", icon: "flag" },
            { key: "vocabulary", label: "Vocabulary", icon: "book" },
            { key: "profile", label: "Profile", icon: "person" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
              onPress={() => setScreen(tab.key as ScreenName)}
              accessibilityRole="button"
              accessibilityState={{ selected: activeTab === tab.key }}
              accessibilityLabel={`${tab.label} tab`}
            >
              <Ionicons name={tab.icon as any} size={18} color={activeTab === tab.key ? "#081a2c" : "#b7c9ea"} />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061827",
  },
  page: {
    flex: 1,
    backgroundColor: "#061827",
  },
  pageContent: {
    padding: 18,
    paddingBottom: 104,
  },
  listContent: {
    padding: 18,
    paddingBottom: 104,
  },
  heroCard: {
    backgroundColor: "#0d2442",
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(78, 143, 226, 0.35)",
    marginBottom: 18,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  heroImage: {
    width: "100%",
    height: 260,
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(7, 27, 45, 0.48)",
  },
  heroContent: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    padding: 20,
    justifyContent: "flex-end",
  },
  logo: {
    fontSize: 28,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 1,
  },
  heroSlogan: {
    color: "#eaf3ff",
    fontSize: 14,
    marginTop: 6,
    marginBottom: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  travelPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
  },
  pill: {
    backgroundColor: "rgba(21, 209, 191, 0.18)",
    borderColor: "rgba(21, 209, 191, 0.55)",
    borderWidth: 1,
    borderRadius: 999,
    color: "#e9fffc",
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
    overflow: "hidden",
    fontSize: 11,
    fontWeight: "700",
  },
  featuredCard: {
    backgroundColor: "#0d2442",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1a4276",
  },
  featuredButton: {
    marginTop: 8,
    overflow: "hidden",
    borderRadius: 18,
    backgroundColor: "#102e4d",
  },
  featuredImage: {
    width: "100%",
    height: 150,
  },
  featuredInfo: {
    padding: 14,
  },
  featuredFlag: {
    fontSize: 26,
  },
  featuredTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  featuredDescription: {
    color: "#c7d7f3",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },
  destinationStripWrap: {
    backgroundColor: "#0d2442",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1a4276",
  },
  destinationStrip: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  destinationCard: {
    width: 170,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#112d4e",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#1d4a7d",
  },
  destinationImage: {
    width: "100%",
    height: 120,
  },
  destinationMeta: {
    padding: 10,
  },
  destinationFlag: {
    fontSize: 22,
  },
  destinationName: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  avatar: {
    fontSize: 28,
    marginRight: 12,
  },
  avatarLarge: {
    fontSize: 54,
    marginBottom: 8,
  },
  greeting: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    color: "#b7c9ea",
    fontSize: 12,
  },
  card: {
    backgroundColor: "#0d2442",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(80, 140, 210, 0.38)",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  sectionTitle: {
    fontSize: 16,
    color: "#f2f7ff",
    fontWeight: "800",
    marginBottom: 8,
  },
  badge: {
    backgroundColor: "#16c2b5",
    borderRadius: 999,
    color: "#031521",
    fontWeight: "800",
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    overflow: "hidden",
  },
  xpText: {
    marginTop: 8,
    fontSize: 28,
    color: "#ffffff",
    fontWeight: "900",
  },
  progressTrack: {
    height: 10,
    backgroundColor: "#153459",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#15d1bf",
    borderRadius: 10,
  },
  progressHint: {
    color: "#b7c9ea",
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#0f2c4a",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "rgba(118, 158, 216, 0.28)",
    alignItems: "center",
  },
  statLabel: {
    color: "#cfe1ff",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  statValue: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
  },
  streakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  dayChip: {
    backgroundColor: "#122d4d",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 38,
    alignItems: "center",
  },
  dayChipActive: {
    backgroundColor: "#15d1bf",
  },
  dayText: {
    color: "#b7c9ea",
    fontWeight: "700",
    fontSize: 11,
  },
  dayTextActive: {
    color: "#051d2d",
  },
  missionTitle: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "800",
    marginBottom: 4,
  },
  missionContext: {
    color: "#bfd0ee",
    fontSize: 12,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: "#15d1bf",
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
    elevation: 4,
    shadowColor: "#15d1bf",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  primaryButtonText: {
    color: "#051d2d",
    fontWeight: "800",
    fontSize: 14,
  },
  secondaryButton: {
    borderColor: "#15d1bf",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "rgba(21, 209, 191, 0.06)",
  },
  secondaryButtonText: {
    color: "#15d1bf",
    fontWeight: "800",
    fontSize: 14,
  },
  secondaryButtonDisabled: {
    opacity: 0.5,
  },
  challengeState: {
    color: "#7df2d5",
    fontSize: 12,
    fontWeight: "700",
  },
  challengeText: {
    color: "#dce9ff",
    fontSize: 14,
    marginTop: 8,
  },
  challengeQuestion: {
    color: "#f5f9ff",
    fontSize: 14,
    marginTop: 12,
    lineHeight: 22,
  },
  listBlock: {
    marginTop: 10,
  },
  listItem: {
    color: "#dfeaff",
    fontSize: 13,
    lineHeight: 22,
    marginBottom: 4,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  quickButton: {
    backgroundColor: "#eaf4ff",
    borderRadius: 20,
    width: "48%",
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(17, 67, 113, 0.12)",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  quickButtonText: {
    color: "#0d2442",
    fontWeight: "800",
    marginTop: 6,
    fontSize: 13,
  },
  headerBar: {
    backgroundColor: "#0d2442",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(93, 135, 199, 0.45)",
    elevation: 3,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#b7c9ea",
    fontSize: 12,
    marginTop: 4,
  },
  searchInput: {
    backgroundColor: "#112f4d",
    borderColor: "#173a66",
    borderWidth: 1,
    borderRadius: 14,
    color: "#f2f7ff",
    marginHorizontal: 18,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  countryCard: {
    backgroundColor: "#0d2442",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#184b80",
    marginBottom: 16,
  },
  countryImage: {
    width: "100%",
    height: 180,
  },
  countryInfo: {
    padding: 16,
  },
  countryFlag: {
    fontSize: 26,
  },
  countryName: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  countryDescription: {
    color: "#c9d8ef",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
  },
  chip: {
    backgroundColor: "#16375a",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: "#e4edf9",
    fontSize: 11,
    fontWeight: "700",
  },
  countryHero: {
    width: "100%",
    height: 220,
    marginTop: 18,
    borderRadius: 18,
  },
  countryDetailCard: {
    backgroundColor: "#0d2442",
    borderRadius: 18,
    padding: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "rgba(93, 155, 231, 0.3)",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  countryHeroTitle: {
    fontSize: 28,
    color: "#ffffff",
    fontWeight: "900",
    marginBottom: 8,
  },
  sectionGroup: {
    marginTop: 20,
  },
  placeGallery: {
    paddingTop: 6,
    paddingBottom: 4,
  },
  placeCard: {
    width: 220,
    backgroundColor: "#102e4d",
    borderRadius: 18,
    overflow: "hidden",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(121, 165, 220, 0.32)",
  },
  placeImage: {
    width: "100%",
    height: 132,
  },
  placeCaption: {
    padding: 12,
  },
  placeName: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
  },
  placeDescription: {
    color: "#bfd0ee",
    fontSize: 11,
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
    backgroundColor: "#0d2442",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#184b80",
  },
  emptyStateIcon: {
    fontSize: 38,
    marginBottom: 10,
  },
  emptyStateTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
  },
  emptyStateText: {
    color: "#bfd0ee",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
  expressionCard: {
    backgroundColor: "#122d4d",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  expressionEnglish: {
    color: "#f3f7ff",
    fontWeight: "700",
    fontSize: 13,
  },
  expressionPt: {
    color: "#bfd0ee",
    fontSize: 12,
    marginTop: 4,
  },
  categoryButton: {
    backgroundColor: "#143d68",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonText: {
    color: "#edf5ff",
    fontSize: 11,
    fontWeight: "700",
  },
  categoryTabs: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  categoryTab: {
    backgroundColor: "#0d2442",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#214d7f",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
    alignItems: "center",
    minWidth: 100,
  },
  categoryTabActive: {
    backgroundColor: "#15d1bf",
  },
  categoryTabText: {
    color: "#dfeaff",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  categoryTabTextActive: {
    color: "#041a2a",
  },
  missionCard: {
    backgroundColor: "#0d2442",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#184b80",
  },
  missionQuestion: {
    color: "#edf6ff",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 6,
  },
  missionDetailCard: {
    backgroundColor: "#0d2442",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#184b80",
  },
  optionButton: {
    backgroundColor: "#102e4d",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#183f6d",
    marginTop: 8,
  },
  optionButtonSelected: {
    borderColor: "#15d1bf",
  },
  optionButtonCorrect: {
    backgroundColor: "#0e563d",
    borderColor: "#65f6bf",
  },
  optionButtonWrong: {
    backgroundColor: "#52212a",
    borderColor: "#ff8a9c",
  },
  optionText: {
    color: "#edf6ff",
    fontSize: 14,
  },
  resultCard: {
    backgroundColor: "#112d4e",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  resultHeading: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 8,
  },
  resultText: {
    color: "#dfeaff",
    fontSize: 12,
    marginBottom: 4,
  },
  tryAgainText: {
    color: "#ffd479",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },
  wordCard: {
    backgroundColor: "#0d2442",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1a4276",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wordTitle: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 17,
  },
  wordTranslation: {
    color: "#bfd0ee",
    fontSize: 12,
    marginTop: 4,
  },
  profileHeader: {
    backgroundColor: "#0d2442",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#184b80",
    marginBottom: 16,
  },
  profileName: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "900",
  },
  profileMeta: {
    color: "#dfeaff",
    fontSize: 13,
    marginTop: 5,
  },
  profileNameInput: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    minWidth: 180,
    paddingVertical: 4,
    borderBottomColor: "#15d1bf",
    borderBottomWidth: 1,
    marginTop: 4,
  },
  editAvatarButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#16375a",
    marginBottom: 8,
  },
  editAvatarText: {
    color: "#7df2d5",
    fontWeight: "700",
    fontSize: 11,
  },
  achievementItem: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#153a63",
    paddingVertical: 10,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  achievementName: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14,
  },
  achievementDescription: {
    color: "#bfd0ee",
    fontSize: 12,
    marginTop: 2,
  },
  achievementStatus: {
    color: "#dfeaff",
    fontSize: 11,
    fontWeight: "700",
  },
  achievementUnlocked: {
    color: "#7df2d5",
  },
  rewardCard: {
    backgroundColor: "#0d2442",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#184b80",
  },
  rewardTitle: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 20,
  },
  rewardMeta: {
    color: "#bfd0ee",
    fontSize: 12,
    marginTop: 4,
  },
  rewardBenefit: {
    color: "#7df2d5",
    fontWeight: "800",
    fontSize: 16,
    marginTop: 10,
  },
  rewardCost: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  rewardHint: {
    color: "#bfd0ee",
    fontSize: 12,
    marginBottom: 14,
  },
  ghostButton: {
    backgroundColor: "#153a63",
  },
  backButton: {
    marginTop: 10,
    marginLeft: 18,
    marginBottom: 2,
  },
  backButtonText: {
    color: "#7df2d5",
    fontWeight: "700",
    fontSize: 14,
  },
  dialogContext: {
    color: "#bfd0ee",
    fontSize: 12,
    marginBottom: 12,
  },
  dialogLine: {
    backgroundColor: "#122d4d",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  dialogSpeaker: {
    color: "#7df2d5",
    fontWeight: "800",
    fontSize: 12,
  },
  dialogEnglish: {
    color: "#f3f7ff",
    fontSize: 13,
    marginTop: 4,
  },
  dialogPt: {
    color: "#bfd0ee",
    fontSize: 12,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#091d31",
    borderTopWidth: 1,
    borderTopColor: "rgba(115, 155, 210, 0.35)",
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 8,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -6 },
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    borderRadius: 14,
  },
  tabButtonActive: {
    backgroundColor: "#15d1bf",
  },
  tabText: {
    color: "#b7c9ea",
    fontWeight: "700",
    fontSize: 11,
    marginTop: 4,
  },
  tabTextActive: {
    color: "#051d2d",
  },
});
