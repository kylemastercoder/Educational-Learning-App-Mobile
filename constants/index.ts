/* eslint-disable import/no-unresolved */

import arrowDown from "@/assets/icons/arrow-down.png";
import arrowUp from "@/assets/icons/arrow-up.png";
import backArrow from "@/assets/icons/back-arrow.png";
import chat from "@/assets/icons/chat.png";
import checkmark from "@/assets/icons/check.png";
import close from "@/assets/icons/close.png";
import dollar from "@/assets/icons/dollar.png";
import email from "@/assets/icons/email.png";
import eyecross from "@/assets/icons/eyecross.png";
import eye from "@/assets/icons/eye.png";
import google from "@/assets/icons/google.png";
import home from "@/assets/icons/home.png";
import list from "@/assets/icons/list.png";
import lock from "@/assets/icons/lock.png";
import map from "@/assets/icons/map.png";
import marker from "@/assets/icons/marker.png";
import out from "@/assets/icons/out.png";
import person from "@/assets/icons/person.png";
import pin from "@/assets/icons/pin.png";
import point from "@/assets/icons/point.png";
import profile from "@/assets/icons/profile.png";
import search from "@/assets/icons/search.png";
import selectedMarker from "@/assets/icons/selected-marker.png";
import star from "@/assets/icons/star.png";
import target from "@/assets/icons/target.png";
import edit from "@/assets/icons/edit.png";
import to from "@/assets/icons/to.png";
import check from "@/assets/images/check.png";
import getStarted from "@/assets/images/get-started.png";
import message from "@/assets/images/message.png";
import noResult from "@/assets/images/no-result.png";
import onboarding1 from "@/assets/animations/animation1.json";
import onboarding2 from "@/assets/animations/animation2.json";
import onboarding3 from "@/assets/animations/animation3.json";
import quiz from "@/assets/animations/quiz.json";
import signUpBg from "@/assets/images/signup-bg.png";
import loading from "@/assets/sounds/loading.mp3";
import error from "@/assets/sounds/error.mp3";
import success from "@/assets/sounds/success.mp3";

export const images = {
  getStarted,
  signUpBg,
  check,
  noResult,
  message,
};

export const sounds = {
  loading,
  error,
  success,
};

export const animations = {
  onboarding1,
  onboarding2,
  onboarding3,
  quiz,
};

export const icons = {
  arrowDown,
  edit,
  arrowUp,
  backArrow,
  chat,
  checkmark,
  close,
  dollar,
  email,
  eyecross,
  eye,
  google,
  home,
  list,
  lock,
  map,
  marker,
  out,
  person,
  pin,
  point,
  profile,
  search,
  selectedMarker,
  star,
  target,
  to,
};

export const onboarding = [
  {
    id: 1,
    title: "Learn Programming with C Language",
    description:
      "Master the fundamentals of programming with C, a powerful and versatile language for building efficient software.",
    image: animations.onboarding1,
  },
  {
    id: 2,
    title: "Dive into C Programming",
    description:
      "Unlock the potential of C programming with hands-on projects and real-world examples, designed to build your coding confidence.",
    image: animations.onboarding2,
  },
  {
    id: 3,
    title: "C Programming Essentials",
    description:
      "Explore the core concepts of C programming, from variables to data structures, and lay a strong foundation for your software development journey.",
    image: animations.onboarding3,
  },
];

export const data = {
  onboarding,
};

export const PredefinedQuestions = [
  {
    title: "Basic Syntax",
    message: "What is the syntax for declaring a variable in C?",
  },
  {
    title: "Data Types",
    message: "What are the basic data types available in C? Provide examples.",
  },
  {
    title: "Control Structures",
    message: "How do you write a basic `for` loop in C? Provide an example.",
  },
  {
    title: "Functions",
    message: "How do you define and call a function in C? Provide an example.",
  },
  {
    title: "Arrays",
    message:
      "How do you declare and initialize an array in C? Provide an example.",
  },
  {
    title: "Pointers",
    message:
      "What is a pointer in C and how do you use it? Provide an example.",
  },
  {
    title: "Structs",
    message: "How do you define and use a `struct` in C? Provide an example.",
  },
];
