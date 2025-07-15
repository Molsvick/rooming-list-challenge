# rooming-list-challenge
This repository contains automated UI tests for the Rooming List Management application, developed using Playwright and TypeScript. It includes tests for search, filtering, UI responsiveness, and various event card functionalities.

Rooming List Challenge - Playwright UI Automation Setup Guide

This guide provides a step-by-step process to get the Playwright UI automation project up and running on your local machine.

********************************************************************************
STEP 1: Prerequisites
********************************************************************************
Ensure you have the following installed on your system:

- Node.js (LTS version recommended):
  You can download it from: https://nodejs.org/en/download/
  To verify your Node.js version, open your terminal/command prompt and run:
  node -v

- npm (comes with Node.js):
  To verify your npm version, run:
  npm -v

- Git:
  You can download and install Git from: https://git-scm.com/downloads
  To verify your Git version, run:
  git --version

********************************************************************************
STEP 2: Clone the Repository
********************************************************************************
Open your terminal or command prompt and execute the following commands to clone the project:

First, clone the repository:
git clone https://github.com/SantiagoLloret/rooming-list-challenge.git

Then, navigate into the project directory:
cd rooming-list-challenge

********************************************************************************
STEP 3: Install Dependencies
********************************************************************************
With your terminal inside the 'rooming-list-challenge' project directory, run the following command to install all necessary project dependencies, including Playwright and its browser binaries:

npm install

This command will download all packages listed in 'package.json' and set up Playwright's browsers (Chromium, Firefox, WebKit).

********************************************************************************
STEP 4: Prepare Your Application HTML (Crucial)
********************************************************************************
The Playwright tests assume that your application's HTML file is accessible locally.
Ensure your main application HTML file (e.g., 'index.html' which contains the UI we're testing) is located in the root directory of your 'rooming-list-challenge' project.
The tests use 'page.goto('./index.html')' to load the UI for testing. If your HTML file is elsewhere or needs to be served via a local server, adjust the 'baseURL' in 'page-objects/basePage.ts' accordingly, or start your local server before running tests.

********************************************************************************
STEP 5: Run the Tests
********************************************************************************
Ensure your terminal is still in the root directory of the 'rooming-list-challenge' project.

----------------------------------------
Option A: Run All Tests (Headless Mode)
----------------------------------------
To execute all tests in headless mode (browsers will not open visually):
npx playwright test

----------------------------------------
Option B: Run All Tests (Headed Mode)
----------------------------------------
To run all tests and see the browser UI during execution (useful for observation and debugging):
npx playwright test --headed

----------------------------------------
Option C: Run Specific Test File
----------------------------------------
To run tests only from a particular file (e.g., 'roomingList.spec.ts'):
npx playwright test tests/roomingList.spec.ts

----------------------------------------
Option D: Run Tests by Title (Partial Match)
----------------------------------------
To run tests whose titles (or describe blocks) contain a specific string (case-insensitive):
npx playwright test -g "Search and Filters Integration"

----------------------------------------
Option E: Run a Single Test by Full Title
----------------------------------------
To run a very specific test case:
npx playwright test tests/roomingList.spec.ts -g "T022-Verify if search and filters work together"
(Adjust the test file path and the exact title string as needed.)

----------------------------------------
Option F: Debug Tests (Interactive UI Debugger)
----------------------------------------
To open the Playwright UI Inspector, allowing you to step through tests, inspect locators, and view action logs:
npx playwright test --debug

----------------------------------------
Option G: Debug Tests (Node.js Debugger)
----------------------------------------
For advanced debugging with Node.js's built-in debugger:
Add 'debugger;' anywhere in your test code where you want to pause. Then run:
node --inspect-brk node_modules/.bin/playwright test
Open 'chrome://inspect' in your Chrome browser and click "Open dedicated DevTools for Node".

********************************************************************************
END OF SETUP GUIDE
********************************************************************************
