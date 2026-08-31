import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { type LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Code2,
  Globe2,
  Info,
  MonitorCog,
  RotateCcw,
  Sparkles,
  Target,
  TimerReset,
  Trophy,
  Zap,
  X,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

type CategoryKey = 'programming' | 'fundamentals' | 'knowledge';
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type DifficultyFilter = 'Mixed' | Difficulty;
type QuizPhase = 'select' | 'instructions' | 'quiz' | 'result';

type Question = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  difficulty?: Difficulty;
};

type Category = {
  key: CategoryKey;
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  softAccent: string;
};

const questionBank: Record<CategoryKey, Question[]> = {
  programming: [
    {
      prompt: 'Which data structure follows the Last In, First Out principle?',
      options: ['Queue', 'Stack', 'Linked list', 'Binary tree'],
      answer: 1,
      explanation: 'A stack removes the most recently added item first, just like a stack of plates.',
    },
    {
      prompt: 'What does CSS stand for?',
      options: ['Computer Style Sheets', 'Creative Style Syntax', 'Cascading Style Sheets', 'Colorful Styling System'],
      answer: 2,
      explanation: 'CSS means Cascading Style Sheets, the language used to style structured web content.',
    },
    {
      prompt: 'Which JavaScript method creates a new array by transforming every item?',
      options: ['filter()', 'reduce()', 'forEach()', 'map()'],
      answer: 3,
      explanation: 'map() returns a new array containing the result of calling a function on every element.',
    },
    {
      prompt: 'What is the time complexity of looking up a value by key in an average hash table?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      answer: 0,
      explanation: 'With a good hash function and few collisions, hash table lookup is constant time on average.',
    },
    {
      prompt: 'In Git, which command records staged changes as a new snapshot?',
      options: ['git branch', 'git commit', 'git merge', 'git stash'],
      answer: 1,
      explanation: 'git commit takes the staged changes and records them in the repository history.',
    },
    {
      prompt: 'Which keyword declares a block-scoped variable that can be reassigned in JavaScript?',
      options: ['const', 'let', 'var', 'static'],
      answer: 1,
      explanation: 'let creates a block-scoped variable whose value can be reassigned later.',
    },
    {
      prompt: 'What does HTML primarily describe?',
      options: ['The structure of web content', 'The color palette of a website', 'The server database', 'The network connection'],
      answer: 0,
      explanation: 'HTML provides the semantic structure and content of a web page.',
    },
    {
      prompt: 'Which programming paradigm organizes code around objects containing data and behavior?',
      options: ['Procedural programming', 'Functional programming', 'Object-oriented programming', 'Logic programming'],
      answer: 2,
      explanation: 'Object-oriented programming models software as objects that bundle state and behavior.',
    },
    {
      prompt: 'What is the purpose of a version control system such as Git?',
      options: ['To compress images', 'To track changes to code', 'To host email accounts', 'To compile hardware drivers'],
      answer: 1,
      explanation: 'Version control records changes so developers can collaborate and restore earlier versions.',
    },
    {
      prompt: 'Which of these is a JavaScript primitive value?',
      options: ['Promise', 'Array', 'Symbol', 'Function'],
      answer: 2,
      explanation: 'Symbol is one of JavaScript’s primitive types, alongside string, number, bigint, boolean, undefined, and null.',
    },
  ],
  fundamentals: [
    {
      prompt: 'Which component is often described as the “brain” of a computer?',
      options: ['RAM', 'SSD', 'CPU', 'Power supply'],
      answer: 2,
      explanation: 'The CPU executes instructions and performs the calculations that make programs run.',
    },
    {
      prompt: 'What is the primary purpose of an operating system?',
      options: ['Create websites', 'Manage hardware and software resources', 'Increase internet speed', 'Store only photos'],
      answer: 1,
      explanation: 'An operating system coordinates hardware, applications, files, and user interaction.',
    },
    {
      prompt: 'Which unit is the smallest basic unit of digital information?',
      options: ['Byte', 'Bit', 'Pixel', 'Nibble'],
      answer: 1,
      explanation: 'A bit represents a single binary value: 0 or 1. Eight bits make one byte.',
    },
    {
      prompt: 'Which device forwards data packets between different networks?',
      options: ['Monitor', 'Router', 'Keyboard', 'Printer'],
      answer: 1,
      explanation: 'A router directs packets between networks, such as your local network and the internet.',
    },
    {
      prompt: 'What does “URL” identify on the web?',
      options: ['A user’s password', 'A physical cable', 'The address of a resource', 'A processor type'],
      answer: 2,
      explanation: 'A Uniform Resource Locator specifies where a resource lives and how to access it.',
    },
    {
      prompt: 'What does RAM provide to a computer?',
      options: ['Permanent file storage', 'Temporary working memory', 'A physical internet connection', 'Power conversion'],
      answer: 1,
      explanation: 'RAM temporarily holds data and instructions that the CPU is actively using.',
    },
    {
      prompt: 'Which storage medium has no moving parts?',
      options: ['Floppy disk', 'Hard disk drive', 'Solid-state drive', 'Tape drive'],
      answer: 2,
      explanation: 'Solid-state drives use flash memory and have no spinning disks or moving read heads.',
    },
    {
      prompt: 'What is the binary representation of the decimal number 2?',
      options: ['01', '10', '11', '100'],
      answer: 1,
      explanation: 'In binary, 2 is written as 10: one two and zero ones.',
    },
    {
      prompt: 'Which protocol is commonly used to securely browse websites?',
      options: ['HTTP', 'HTTPS', 'FTP', 'SMTP'],
      answer: 1,
      explanation: 'HTTPS adds encryption and authentication to HTTP connections.',
    },
    {
      prompt: 'What is a computer network’s IP address used to identify?',
      options: ['A device or network interface', 'A keyboard layout', 'A file type', 'A screen resolution'],
      answer: 0,
      explanation: 'An IP address identifies a device or interface so data can be routed to it.',
    },
  ],
  knowledge: [
    {
      prompt: 'Which ocean is the largest on Earth?',
      options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
      answer: 3,
      explanation: 'The Pacific Ocean covers more area than all of Earth’s landmasses combined.',
    },
    {
      prompt: 'What is the capital city of Canada?',
      options: ['Toronto', 'Ottawa', 'Vancouver', 'Montreal'],
      answer: 1,
      explanation: 'Ottawa, located in Ontario on the Ottawa River, has been Canada’s capital since 1857.',
    },
    {
      prompt: 'Which element has the chemical symbol Au?',
      options: ['Silver', 'Gold', 'Argon', 'Aluminium'],
      answer: 1,
      explanation: 'Au comes from the Latin word aurum, meaning gold.',
    },
    {
      prompt: 'In which year did the first human land on the Moon?',
      options: ['1965', '1969', '1972', '1959'],
      answer: 1,
      explanation: 'Apollo 11 landed on the Moon in July 1969, with Neil Armstrong and Buzz Aldrin walking on its surface.',
    },
    {
      prompt: 'Which artist painted The Starry Night?',
      options: ['Claude Monet', 'Pablo Picasso', 'Vincent van Gogh', 'Georgia O’Keeffe'],
      answer: 2,
      explanation: 'Vincent van Gogh painted The Starry Night in 1889 while staying at an asylum in Saint-Rémy.',
    },
    {
      prompt: 'How many continents are commonly recognized on Earth?',
      options: ['Five', 'Six', 'Seven', 'Eight'],
      answer: 2,
      explanation: 'The commonly taught model recognizes seven continents.',
    },
    {
      prompt: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Mercury'],
      answer: 1,
      explanation: 'Iron minerals in Mars’s soil give the planet its distinctive reddish appearance.',
    },
    {
      prompt: 'What is the hardest natural substance?',
      options: ['Quartz', 'Iron', 'Diamond', 'Granite'],
      answer: 2,
      explanation: 'Diamond is the hardest naturally occurring material on the Mohs hardness scale.',
    },
    {
      prompt: 'Which language has the most native speakers worldwide?',
      options: ['English', 'Spanish', 'Mandarin Chinese', 'Hindi'],
      answer: 2,
      explanation: 'Mandarin Chinese has the largest number of native speakers.',
    },
    {
      prompt: 'What is the largest organ in the human body?',
      options: ['The liver', 'The skin', 'The heart', 'The lungs'],
      answer: 1,
      explanation: 'The skin is the body’s largest organ and protects the tissues beneath it.',
    },
  ],
};

const extraProgrammingQuestions: Question[] = [
  { prompt: 'What does async/await make easier to work with in JavaScript?', options: ['Promises', 'CSS selectors', 'HTML attributes', 'Database indexes'], answer: 0, explanation: 'async/await provides readable syntax for consuming promise-based asynchronous work.', difficulty: 'Medium' },
  { prompt: 'Which practice best prevents SQL injection?', options: ['Parameterized queries', 'String concatenation', 'Client-side validation only', 'Longer table names'], answer: 0, explanation: 'Parameterized queries keep user input separate from executable SQL syntax.', difficulty: 'Hard' },
  { prompt: 'What is the time complexity of binary search on a sorted array?', options: ['O(log n)', 'O(1)', 'O(n)', 'O(n log n)'], answer: 0, explanation: 'Binary search halves the remaining search space after each comparison.', difficulty: 'Medium' },
  { prompt: 'What is a closure in JavaScript?', options: ['A function with access to its lexical scope', 'A closed browser tab', 'A type of loop', 'A CSS layout rule'], answer: 0, explanation: 'A closure preserves access to variables from the scope where the function was created.', difficulty: 'Hard' },
  { prompt: 'Which HTML element is most appropriate for a standalone blog post?', options: ['<article>', '<span>', '<b>', '<div>'], answer: 0, explanation: 'The article element represents a self-contained composition that can stand on its own.', difficulty: 'Easy' },
  { prompt: 'What does it mean for a REST API to be stateless?', options: ['Each request contains the context needed to process it', 'The server never returns data', 'The API only accepts GET requests', 'Requests must be encrypted'], answer: 0, explanation: 'A stateless server does not rely on stored client session context between requests.', difficulty: 'Medium' },
  { prompt: 'What does the JavaScript operator === compare?', options: ['Value and type', 'Value only', 'Type only', 'Memory address only'], answer: 0, explanation: 'Strict equality avoids the type coercion performed by ==.', difficulty: 'Easy' },
  { prompt: 'What does recursion mean in programming?', options: ['A function calls itself', 'A loop runs once', 'A variable changes type', 'A class has no methods'], answer: 0, explanation: 'A recursive function solves a problem by calling itself on a smaller version of that problem.', difficulty: 'Medium' },
  { prompt: 'What does an HTTP 404 response indicate?', options: ['The requested resource was not found', 'The request succeeded', 'The server is restarting', 'The user is unauthorized'], answer: 0, explanation: 'A 404 means the server could not find the requested resource.', difficulty: 'Easy' },
  { prompt: 'What is npm primarily used for?', options: ['Managing JavaScript packages', 'Editing images', 'Compiling C programs', 'Hosting DNS records'], answer: 0, explanation: 'npm installs, updates, and publishes packages for the JavaScript ecosystem.', difficulty: 'Easy' },
  { prompt: 'What is event bubbling in the DOM?', options: ['An event travels from a target toward its ancestors', 'An event repeats forever', 'A page refreshes automatically', 'A promise resolves twice'], answer: 0, explanation: 'Bubbling lets an event move from the originating element up through its parent elements.', difficulty: 'Hard' },
  { prompt: 'Which property is guaranteed by the “A” in ACID transactions?', options: ['Atomicity', 'Availability', 'Addressability', 'Adaptability'], answer: 0, explanation: 'Atomicity means a transaction completes fully or has no effect.', difficulty: 'Hard' },
  { prompt: 'Why do React applications use a virtual DOM?', options: ['To reduce costly direct DOM updates', 'To replace JavaScript', 'To store passwords', 'To create server routes'], answer: 0, explanation: 'React compares virtual trees and applies only necessary changes to the browser DOM.', difficulty: 'Medium' },
  { prompt: 'What does the dependency inversion principle recommend?', options: ['High-level modules should not depend directly on low-level details', 'Every class should have one method', 'Variables should never be reassigned', 'All code should be global'], answer: 0, explanation: 'Dependency inversion encourages abstractions between high-level policy and implementation details.', difficulty: 'Hard' },
  { prompt: 'Which transport protocol provides reliable, ordered delivery?', options: ['TCP', 'UDP', 'ICMP', 'ARP'], answer: 0, explanation: 'TCP handles ordering, retransmission, and delivery confirmation.', difficulty: 'Hard' },
  { prompt: 'What problem does CORS help a browser manage?', options: ['Cross-origin web requests', 'Image compression', 'Database backups', 'CPU scheduling'], answer: 0, explanation: 'CORS controls whether a browser may allow a page to request resources from another origin.', difficulty: 'Medium' },
  { prompt: 'Which CSS property distributes flex items along the main axis?', options: ['justify-content', 'align-items', 'place-content', 'flex-wrap'], answer: 0, explanation: 'justify-content controls how free space is distributed along a flex container’s main axis.', difficulty: 'Medium' },
  { prompt: 'What does git rebase do?', options: ['Replays commits onto a new base commit', 'Deletes all branches', 'Uploads files to a CDN', 'Encrypts a repository'], answer: 0, explanation: 'Rebase moves a branch by replaying its commits on top of another base.', difficulty: 'Hard' },
  { prompt: 'What is JSON designed to represent?', options: ['Structured data interchange', 'Raster images', 'Audio waveforms', 'Operating system kernels'], answer: 0, explanation: 'JSON is a text format commonly used to exchange structured data between systems.', difficulty: 'Easy' },
  { prompt: 'What is the purpose of a unit test?', options: ['To verify a small piece of code in isolation', 'To deploy an application', 'To style a component', 'To replace source control'], answer: 0, explanation: 'Unit tests check focused behavior quickly and help catch regressions.', difficulty: 'Easy' },
];

const extraFundamentalsQuestions: Question[] = [
  { prompt: 'What is CPU clock speed commonly measured in?', options: ['Hertz', 'Bytes', 'Pixels', 'Volts'], answer: 0, explanation: 'Clock speed is measured in hertz, meaning cycles per second.', difficulty: 'Medium' },
  { prompt: 'Which board connects a computer’s major components?', options: ['Motherboard', 'Sound card', 'Heat sink', 'Power cable'], answer: 0, explanation: 'The motherboard provides the main communication pathways between components.', difficulty: 'Hard' },
  { prompt: 'What does a GPU specialize in?', options: ['Parallel graphics and visual computation', 'Long-term file storage', 'Power regulation', 'Typing input'], answer: 0, explanation: 'A graphics processing unit is optimized for highly parallel visual workloads.', difficulty: 'Hard' },
  { prompt: 'What is the role of BIOS or UEFI during startup?', options: ['Initialize hardware and begin the boot process', 'Edit documents', 'Stream video', 'Route internet packets'], answer: 0, explanation: 'Firmware checks and initializes hardware before handing control to an operating system.', difficulty: 'Medium' },
  { prompt: 'Which service translates domain names into IP addresses?', options: ['DNS', 'DHCP', 'NTP', 'SSH'], answer: 0, explanation: 'The Domain Name System resolves names such as example.com to IP addresses.', difficulty: 'Hard' },
  { prompt: 'What is the main purpose of a firewall?', options: ['Control network traffic based on rules', 'Increase screen brightness', 'Defragment RAM', 'Compress audio'], answer: 0, explanation: 'A firewall permits or blocks traffic according to security rules.', difficulty: 'Easy' },
  { prompt: 'What does virtualization allow one physical machine to do?', options: ['Run multiple isolated virtual machines', 'Double its screen size', 'Remove its operating system', 'Avoid all software updates'], answer: 0, explanation: 'Virtualization abstracts hardware so multiple isolated environments can share one host.', difficulty: 'Medium' },
  { prompt: 'What is the kernel?', options: ['The core of an operating system', 'A browser extension', 'A type of cable', 'A spreadsheet formula'], answer: 0, explanation: 'The kernel manages low-level resources such as memory, processes, and devices.', difficulty: 'Medium' },
  { prompt: 'Which connector is commonly used for modern peripherals and charging?', options: ['USB', 'VGA', 'PS/2', 'DVI'], answer: 0, explanation: 'USB is a widely used standard for data transfer and device power.', difficulty: 'Easy' },
  { prompt: 'Which pair best describes input and output devices?', options: ['Keyboard and monitor', 'Router and firewall', 'CPU and RAM', 'SSD and motherboard'], answer: 0, explanation: 'A keyboard sends input and a monitor presents output to the user.', difficulty: 'Hard' },
  { prompt: 'What does cloud computing primarily provide?', options: ['On-demand computing resources over a network', 'Only local file storage', 'A faster keyboard', 'A replacement for all software'], answer: 0, explanation: 'Cloud services provide remote access to computing, storage, and other resources.', difficulty: 'Easy' },
  { prompt: 'How many bits are in an IPv6 address?', options: ['128', '32', '64', '256'], answer: 0, explanation: 'IPv6 uses 128-bit addresses, creating a much larger address space than IPv4.', difficulty: 'Medium' },
  { prompt: 'What is a primary key in a database table?', options: ['A column or set of columns that uniquely identifies a row', 'A backup copy of the table', 'A password for the database', 'The last row inserted'], answer: 0, explanation: 'A primary key ensures each record can be uniquely identified.', difficulty: 'Hard' },
  { prompt: 'What does OCR technology do?', options: ['Converts text in images into machine-readable text', 'Encrypts hard drives', 'Measures CPU heat', 'Creates network routes'], answer: 0, explanation: 'Optical character recognition identifies characters in images.', difficulty: 'Hard' },
  { prompt: 'What does a file extension usually indicate?', options: ['The format or type of a file', 'Its physical location', 'The owner’s password', 'Its monitor brightness'], answer: 0, explanation: 'Extensions such as .pdf or .jpg help software identify how to interpret a file.', difficulty: 'Easy' },
  { prompt: 'What is a process in an operating system?', options: ['A program that is currently executing', 'A permanent hardware component', 'A network cable', 'A type of file extension'], answer: 0, explanation: 'A process is an active instance of a program with allocated system resources.', difficulty: 'Medium' },
  { prompt: 'What does a compiler generally do?', options: ['Translates source code into a lower-level form', 'Cleans a monitor', 'Creates user accounts', 'Routes packets'], answer: 0, explanation: 'A compiler transforms source code into machine code or another executable representation.', difficulty: 'Easy' },
  { prompt: 'What is a network packet?', options: ['A formatted unit of data sent across a network', 'A power adapter', 'A screen pixel', 'A CPU instruction only'], answer: 0, explanation: 'Networks break larger messages into packets for transmission and reassembly.', difficulty: 'Medium' },
  { prompt: 'What does RAID commonly combine?', options: ['Multiple storage drives for performance or redundancy', 'Several monitors for color', 'Multiple keyboards for input', 'Different operating systems into one kernel'], answer: 0, explanation: 'RAID arranges drives to improve resilience, speed, or both depending on the level.', difficulty: 'Hard' },
  { prompt: 'What does two-factor authentication add to a login?', options: ['A second independent verification factor', 'A second username', 'A duplicate password', 'A faster internet connection'], answer: 0, explanation: '2FA combines a password with another factor such as a device or biometric.', difficulty: 'Easy' },
];

const extraKnowledgeQuestions: Question[] = [
  { prompt: 'Who wrote the play Hamlet?', options: ['William Shakespeare', 'Charles Dickens', 'Jane Austen', 'Leo Tolstoy'], answer: 0, explanation: 'Hamlet is one of William Shakespeare’s tragedies.', difficulty: 'Easy' },
  { prompt: 'Which is the largest hot desert in the world?', options: ['The Sahara', 'The Gobi', 'The Kalahari', 'The Atacama'], answer: 0, explanation: 'The Sahara spans much of North Africa and is the world’s largest hot desert.', difficulty: 'Medium' },
  { prompt: 'What process do green plants use to convert light into chemical energy?', options: ['Photosynthesis', 'Respiration', 'Fermentation', 'Transpiration'], answer: 0, explanation: 'Photosynthesis uses light energy to help produce sugars from carbon dioxide and water.', difficulty: 'Hard' },
  { prompt: 'Which planet is the largest in our solar system?', options: ['Jupiter', 'Saturn', 'Neptune', 'Earth'], answer: 0, explanation: 'Jupiter is the largest planet by both mass and diameter.', difficulty: 'Hard' },
  { prompt: 'Who painted the Mona Lisa?', options: ['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Donatello'], answer: 0, explanation: 'Leonardo da Vinci painted the Mona Lisa during the Italian Renaissance.', difficulty: 'Hard' },
  { prompt: 'At sea level, water boils at what temperature on the Celsius scale?', options: ['100°C', '0°C', '50°C', '212°F'], answer: 0, explanation: 'At standard atmospheric pressure, water boils at 100 degrees Celsius.', difficulty: 'Hard' },
  { prompt: 'What is the currency of Japan?', options: ['Yen', 'Won', 'Rupee', 'Ringgit'], answer: 0, explanation: 'The yen is Japan’s official currency.', difficulty: 'Medium' },
  { prompt: 'Who composed the Ninth Symphony?', options: ['Ludwig van Beethoven', 'Johann Bach', 'Wolfgang Mozart', 'Frédéric Chopin'], answer: 0, explanation: 'Beethoven’s Ninth Symphony premiered in 1824.', difficulty: 'Easy' },
  { prompt: 'What is the approximate speed of light in a vacuum?', options: ['300,000 km/s', '30,000 km/s', '3,000 km/s', '3,000,000 km/s'], answer: 0, explanation: 'Light travels at approximately 299,792 kilometers per second in a vacuum.', difficulty: 'Medium' },
  { prompt: 'Which rainforest is the largest in the world?', options: ['The Amazon rainforest', 'The Congo rainforest', 'The Daintree', 'The Valdivian rainforest'], answer: 0, explanation: 'The Amazon rainforest is the largest tropical rainforest by area.', difficulty: 'Medium' },
  { prompt: 'In which year did World War II end?', options: ['1945', '1939', '1941', '1950'], answer: 0, explanation: 'World War II ended in 1945 after the Axis powers surrendered.', difficulty: 'Easy' },
  { prompt: 'What is the smallest prime number?', options: ['2', '0', '1', '3'], answer: 0, explanation: '2 is the only even prime number and the smallest prime.', difficulty: 'Hard' },
  { prompt: 'Which mountain is the highest above sea level?', options: ['Mount Everest', 'K2', 'Kangchenjunga', 'Mont Blanc'], answer: 0, explanation: 'Mount Everest reaches 8,848.86 meters above sea level.', difficulty: 'Hard' },
  { prompt: 'Which vitamin is produced in the skin in response to sunlight?', options: ['Vitamin D', 'Vitamin A', 'Vitamin C', 'Vitamin K'], answer: 0, explanation: 'Sunlight helps the skin synthesize vitamin D.', difficulty: 'Easy' },
  { prompt: 'What shape is the DNA molecule commonly described as?', options: ['A double helix', 'A single ring', 'A flat sheet', 'A triple cube'], answer: 0, explanation: 'DNA consists of two complementary strands twisted into a double helix.', difficulty: 'Medium' },
  { prompt: 'The Great Wall is located in which country?', options: ['China', 'India', 'Mongolia', 'South Korea'], answer: 0, explanation: 'The Great Wall is a historic series of fortifications across northern China.', difficulty: 'Easy' },
  { prompt: 'Which instrument typically has 88 keys?', options: ['Piano', 'Violin', 'Flute', 'Trumpet'], answer: 0, explanation: 'A standard modern piano has 88 keys.', difficulty: 'Hard' },
  { prompt: 'What is the largest mammal on Earth?', options: ['Blue whale', 'African elephant', 'Giraffe', 'Sperm whale'], answer: 0, explanation: 'The blue whale is the largest animal known to have lived.', difficulty: 'Easy' },
  { prompt: 'In which year was the United Nations founded?', options: ['1945', '1919', '1939', '1955'], answer: 0, explanation: 'The United Nations was established in 1945 after World War II.', difficulty: 'Medium' },
  { prompt: 'What is the primary gas found in Earth’s atmosphere?', options: ['Nitrogen', 'Oxygen', 'Carbon dioxide', 'Hydrogen'], answer: 0, explanation: 'Nitrogen makes up about 78 percent of Earth’s atmosphere.', difficulty: 'Medium' },
];

questionBank.programming.push(...extraProgrammingQuestions);
questionBank.fundamentals.push(...extraFundamentalsQuestions);
questionBank.knowledge.push(...extraKnowledgeQuestions);

const difficultyLabels: DifficultyFilter[] = ['Mixed', 'Easy', 'Medium', 'Hard'];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function inferredDifficulty(index: number): Difficulty {
  if (index < 4) return 'Easy';
  if (index < 7) return 'Medium';
  return 'Hard';
}

function prepareQuestions(categoryKey: CategoryKey, difficulty: DifficultyFilter): Question[] {
  const normalized = questionBank[categoryKey].map((question, index) => ({
    ...question,
    difficulty: question.difficulty ?? inferredDifficulty(index),
  }));
  const pool = difficulty === 'Mixed'
    ? normalized
    : normalized.filter((question) => question.difficulty === difficulty);

  return shuffle(pool).slice(0, 10).map((question) => {
    const optionPairs = shuffle(question.options.map((text, index) => ({ text, index })));
    return {
      ...question,
      options: optionPairs.map((option) => option.text),
      answer: optionPairs.findIndex((option) => option.index === question.answer),
    };
  });
}

const categories: Category[] = [
  {
    key: 'programming',
    title: 'Programming',
    eyebrow: 'Build your edge',
    description: 'Logic, languages, and the craft behind the screen.',
    icon: Code2,
    accent: 'bg-[#d9f66c] text-[#26331a]',
    softAccent: 'bg-[#f0f8ca]',
  },
  {
    key: 'fundamentals',
    title: 'Computer Fundamentals',
    eyebrow: 'Know the machine',
    description: 'The hardware, systems, and concepts under it all.',
    icon: MonitorCog,
    accent: 'bg-[#ffc2b5] text-[#4d2520]',
    softAccent: 'bg-[#fff0eb]',
  },
  {
    key: 'knowledge',
    title: 'General Knowledge',
    eyebrow: 'Stay curious',
    description: 'A quick tour through the things worth knowing.',
    icon: Globe2,
    accent: 'bg-[#b8e4eb] text-[#153a43]',
    softAccent: 'bg-[#eaf7f8]',
  },
];

const queryClient = new QueryClient();

function Logo({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="button-logo-home"
      className="group flex items-center gap-3 text-left"
      aria-label="Return to category selection"
    >
      <span className="relative flex size-10 items-center justify-center rounded-[13px] bg-[#d9f66c] text-[#26331a] shadow-[4px_4px_0_#26331a] transition-transform duration-200 group-hover:-translate-y-0.5">
        <BrainCircuit size={22} strokeWidth={2.5} />
        <span className="absolute -right-1 -top-1 size-2 rounded-full bg-[#ff8c78]" />
      </span>
      <span>
        <span className="block text-[15px] font-bold leading-none tracking-[-0.03em] text-[#202b3d]">quickwit</span>
        <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.22em] text-[#6c7480]">test your signal</span>
      </span>
    </button>
  );
}

function CategoryPicker({
  onStart,
}: {
  onStart: (category: CategoryKey) => void;
}) {
  return (
    <main className="quiz-grid min-h-[calc(100dvh-81px)] overflow-hidden">
      <section className="mx-auto grid max-w-[1240px] gap-12 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.04fr_.96fr] lg:items-center lg:gap-20 lg:px-12 lg:pb-24 lg:pt-20">
        <div className="relative quiz-entrance">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ccd2d5] bg-[#f9f7ef]/80 px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[#59636e]">
            <Sparkles size={13} className="text-[#ef735f]" />
            01 / choose your lane
          </div>
          <h1 className="max-w-[680px] text-[clamp(3.25rem,8vw,7.4rem)] font-bold leading-[.88] tracking-[-0.085em] text-[#202b3d]">
            Make your
            <span className="relative mx-2 inline-block whitespace-nowrap text-[#202b3d]">
              brain
              <span className="absolute -bottom-1 left-0 h-3 w-full -rotate-2 bg-[#d9f66c] mix-blend-multiply sm:h-5" />
            </span>
            <br />
            <span className="text-[#ef735f]">work.</span>
          </h1>
          <p className="mt-8 max-w-[480px] text-base leading-7 text-[#646d77] sm:text-lg">
            Ten sharp questions. Thirty seconds each. Pick a subject and find out what sticks when the clock is running.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5 font-mono text-[10px] uppercase tracking-[0.15em] text-[#7b8389]">
            <span className="flex items-center gap-2"><Clock3 size={15} className="text-[#ef735f]" /> 30 sec / question</span>
            <span className="flex items-center gap-2"><Target size={15} className="text-[#ef735f]" /> instant review</span>
          </div>
          <div className="pointer-events-none absolute -right-4 -top-7 hidden size-24 rotate-12 rounded-[28px] border-2 border-[#ef735f]/40 lg:block">
            <div className="absolute -bottom-3 -left-3 size-6 rounded-full bg-[#ef735f]" />
          </div>
        </div>

        <div className="relative grid gap-3 quiz-entrance quiz-entrance-delay-1">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <button
                key={category.key}
                type="button"
                onClick={() => onStart(category.key)}
                data-testid={`button-start-${category.key}`}
                className="quiz-category-card group relative flex w-full items-center gap-4 overflow-hidden rounded-[22px] border border-[#d5d8d2] bg-[#fbfaf4] p-4 text-left shadow-[0_2px_0_rgba(32,43,61,.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#202b3d] hover:shadow-[6px_7px_0_#202b3d] focus-visible:-translate-y-1 sm:gap-5 sm:p-5"
              >
                <span className={`flex size-14 shrink-0 items-center justify-center rounded-[17px] ${category.accent} transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105`}>
                  <Icon size={25} strokeWidth={1.9} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.15em] text-[#899098]">{category.eyebrow}</span>
                  <span className="block truncate text-lg font-bold tracking-[-0.04em] text-[#202b3d] sm:text-xl">{category.title}</span>
                  <span className="mt-1 block max-w-[330px] text-xs leading-5 text-[#727a83]">{category.description}</span>
                </span>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#d8dcd6] text-[#7b8389] transition-all duration-300 group-hover:border-[#202b3d] group-hover:bg-[#202b3d] group-hover:text-[#fbfaf4]">
                  <ChevronRight size={18} />
                </span>
                <span className="absolute right-5 top-3 font-mono text-[10px] text-[#b1b5b3]">0{index + 1}</span>
              </button>
            );
          })}
          <div className="mt-3 flex items-center justify-between px-1 font-mono text-[10px] uppercase tracking-[0.13em] text-[#929990]">
            <span>30 question bank / 10 per round</span>
            <span>No profile required</span>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1240px] px-5 pb-12 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-4 border-t border-[#d6d9d2] pt-5 text-xs text-[#7b8389] sm:flex-row sm:items-center">
          <span className="font-mono uppercase tracking-[0.12em]">A tiny practice ritual for curious people.</span>
          <span className="flex items-center gap-2"><CircleHelp size={14} /> No sign-up. No noise.</span>
        </div>
      </section>
    </main>
  );
}

function InstructionsView({
  category,
  difficulty,
  onDifficultyChange,
  onBegin,
  onBack,
}: {
  category: Category;
  difficulty: DifficultyFilter;
  onDifficultyChange: (difficulty: DifficultyFilter) => void;
  onBegin: () => void;
  onBack: () => void;
}) {
  const Icon = category.icon;
  const counts = difficultyLabels.slice(1).map((level) => ({
    level,
    count: questionBank[category.key].filter((question, index) => (question.difficulty ?? inferredDifficulty(index)) === level).length,
  }));

  return (
    <main className="quiz-grid min-h-[calc(100dvh-81px)] px-5 pb-16 pt-8 sm:px-8 lg:px-12 lg:pt-14">
      <div className="mx-auto max-w-[900px]">
        <button type="button" onClick={onBack} data-testid="button-back-to-categories" className="mb-9 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#69727a] transition-colors hover:text-[#202b3d]">
          <ArrowLeft size={15} /> categories
        </button>
        <section className="overflow-hidden rounded-[30px] border border-[#d6d8d2] bg-[#fbfaf4] shadow-[8px_9px_0_#d9f66c] quiz-entrance">
          <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_.86fr] lg:gap-14 lg:p-14">
            <div>
              <div className={`mb-6 flex size-14 items-center justify-center rounded-[17px] ${category.accent}`}><Icon size={27} /></div>
              <span className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#ef735f]">Before you begin</span>
              <h1 className="mt-3 text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[.9] tracking-[-0.08em] text-[#202b3d]">{category.title}</h1>
              <p className="mt-6 max-w-[450px] text-base leading-7 text-[#68717a]">Ten questions picked from a deeper bank. Choose your pace, trust your instincts, and keep your signal clear.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="flex items-center gap-2 rounded-full bg-[#e9e7dd] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#59636e]"><BookOpen size={14} /> 10 random questions</span>
                <span className="flex items-center gap-2 rounded-full bg-[#e9e7dd] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#59636e]"><Clock3 size={14} /> 30 sec each</span>
              </div>
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#7c858c]"><Zap size={14} className="text-[#ef735f]" /> Choose difficulty</div>
                <div className="grid gap-2">
                  {difficultyLabels.map((level) => {
                    const count = level === 'Mixed' ? questionBank[category.key].length : counts.find((item) => item.level === level)?.count ?? 0;
                    const isActive = difficulty === level;
                    return (
                      <button key={level} type="button" onClick={() => onDifficultyChange(level)} data-testid={`button-difficulty-${level.toLowerCase()}`} aria-pressed={isActive} className={`flex items-center justify-between rounded-[16px] border px-4 py-3 text-left transition-all ${isActive ? 'border-[#202b3d] bg-[#d9f66c] shadow-[3px_3px_0_#202b3d]' : 'border-[#d6d8d2] bg-[#f3f1e9] hover:border-[#202b3d]'}`}>
                        <span className="font-semibold text-[#202b3d]">{level}</span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.11em] text-[#798188]">{count} available</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-8">
                <div className="mb-4 flex gap-3 rounded-[16px] bg-[#f3f1e9] p-4 text-xs leading-5 text-[#69727a]">
                  <Info size={16} className="mt-0.5 shrink-0 text-[#ef735f]" />
                  <span>You can check each answer once. A question left unanswered when the timer ends counts as wrong.</span>
                </div>
                <button type="button" onClick={onBegin} data-testid="button-begin-quiz" className="group flex w-full items-center justify-center gap-3 rounded-full bg-[#202b3d] px-5 py-3.5 text-sm font-bold text-[#fbfaf4] transition-all hover:gap-4 hover:bg-[#33445a]">
                  Start quiz <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function QuizView({
  category,
  questions,
  currentIndex,
  timeLeft,
  selectedAnswer,
  isSubmitted,
  onSelect,
  onSubmit,
  onNext,
  onBack,
}: {
  category: Category;
  questions: Question[];
  currentIndex: number;
  timeLeft: number;
  selectedAnswer: number | null;
  isSubmitted: boolean;
  onSelect: (index: number) => void;
  onSubmit: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isUrgent = timeLeft <= 8;
  const Icon = category.icon;

  return (
    <main className="min-h-[calc(100dvh-81px)] bg-[#f3f1e9] px-5 pb-12 pt-6 sm:px-8 lg:px-12 lg:pt-10">
      <div className="mx-auto max-w-[1080px]">
        <div className="mb-7 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            data-testid="button-quit-quiz"
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#69727a] transition-colors hover:text-[#202b3d]"
          >
            <ArrowLeft size={15} /> categories
          </button>
          <div className="flex items-center gap-2 rounded-full bg-[#e9e7dd] px-3 py-2 text-xs font-semibold text-[#48515b]">
            <Icon size={14} />
            <span>{category.title}</span>
          </div>
        </div>

        <div className="mb-10">
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[#7c858c]">
            <span data-testid="text-question-progress">Question {currentIndex + 1} of {questions.length}</span>
            <span className={isUrgent ? 'font-bold text-[#e26351]' : ''}>keep your signal clear</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#dddcd4]" aria-label={`Question ${currentIndex + 1} of ${questions.length}`}>
            <div className="h-full rounded-full bg-[#202b3d] transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_330px] lg:gap-16">
          <section key={currentIndex} className="quiz-pop quiz-question-transition" aria-labelledby="question-prompt">
            <div className="mb-8">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#ef735f]">Think it through</span>
                <span data-testid="text-question-difficulty" className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${question.difficulty === 'Easy' ? 'bg-[#e5f7a0] text-[#52602f]' : question.difficulty === 'Medium' ? 'bg-[#b8e4eb] text-[#153a43]' : 'bg-[#ffc2b5] text-[#6c3027]'}`}>{question.difficulty}</span>
              </div>
              <h1 id="question-prompt" data-testid="text-question-prompt" className="max-w-[720px] text-[clamp(2rem,4.5vw,4.25rem)] font-bold leading-[.98] tracking-[-0.075em] text-[#202b3d]">
                {question.prompt}
              </h1>
            </div>

              <div className="grid gap-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const letter = String.fromCharCode(65 + index);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onSelect(index)}
                    disabled={selectedAnswer !== null || isSubmitted}
                    data-testid={`button-answer-${index}`}
                    aria-pressed={isSelected}
                    className={`quiz-answer-option group flex min-h-[66px] items-center gap-4 rounded-[17px] border px-4 text-left transition-all duration-200 sm:px-5 ${isSubmitted && index === question.answer ? 'answer-correct border-[#789b24] bg-[#e5f7a0] shadow-[4px_4px_0_#789b24]' : ''} ${isSubmitted && isSelected && index !== question.answer ? 'answer-incorrect border-[#e26351] bg-[#ffc2b5] shadow-[4px_4px_0_#e26351]' : ''} ${!isSubmitted && isSelected ? 'border-[#202b3d] bg-[#d9f66c] shadow-[4px_4px_0_#202b3d]' : ''} ${!isSubmitted && !isSelected ? 'border-[#d6d8d2] bg-[#fbfaf4] hover:-translate-y-0.5 hover:border-[#202b3d] hover:bg-[#fdfcf8]' : ''}`}
                  >
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-medium transition-colors ${isSelected ? 'bg-[#202b3d] text-[#d9f66c]' : 'bg-[#e8e8df] text-[#667078] group-hover:bg-[#202b3d] group-hover:text-[#fbfaf4]'}`}>
                      {isSubmitted && index === question.answer ? <Check size={15} /> : isSubmitted && isSelected ? <X size={15} /> : letter}
                    </span>
                    <span className="text-sm font-medium leading-5 text-[#303b49] sm:text-base">{option}</span>
                    {isSubmitted && index === question.answer && <Check size={18} className="ml-auto shrink-0 text-[#67821e]" />}
                    {isSubmitted && isSelected && index !== question.answer && <X size={18} className="ml-auto shrink-0 text-[#d06452]" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#899098]">
                {selectedAnswer === null ? 'Select one answer' : isSubmitted ? (selectedAnswer === question.answer ? 'Correct answer' : 'Not quite — answer reviewed') : 'Answer locked in'}
              </span>
              {!isSubmitted ? (
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={selectedAnswer === null}
                  data-testid="button-submit-answer"
                  className="group flex items-center gap-3 rounded-full bg-[#202b3d] px-5 py-3 text-sm font-bold text-[#fbfaf4] transition-all duration-200 hover:gap-4 hover:bg-[#33445a] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Check answer <Check size={17} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onNext}
                  data-testid="button-next-question"
                  className="group flex items-center gap-3 rounded-full bg-[#202b3d] px-5 py-3 text-sm font-bold text-[#fbfaf4] transition-all duration-200 hover:gap-4 hover:bg-[#33445a]"
                >
                  {currentIndex === questions.length - 1 ? 'See results' : 'Next question'}
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              )}
            </div>
          </section>

          <aside className="flex flex-col gap-4 lg:pt-2">
            <div className={`relative overflow-hidden rounded-[24px] border p-6 ${isUrgent ? 'border-[#ef735f] bg-[#fff0eb]' : 'border-[#d6d8d2] bg-[#fbfaf4]'}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#798188]">Time remaining</span>
                <Clock3 size={18} className={isUrgent ? 'text-[#e26351]' : 'text-[#202b3d]'} />
              </div>
              <div className={`mt-4 flex items-baseline gap-2 ${isUrgent ? 'timer-urgent text-[#e26351]' : 'text-[#202b3d]'}`}>
                <span data-testid="text-time-left" className="font-mono text-6xl font-medium tracking-[-0.1em]">{String(timeLeft).padStart(2, '0')}</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.13em] text-[#8a9194]">seconds</span>
              </div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#deded7]">
                <div className={`h-full rounded-full transition-[width,background-color] duration-700 ${isUrgent ? 'bg-[#ef735f]' : 'bg-[#202b3d]'}`} style={{ width: `${(timeLeft / 30) * 100}%` }} />
              </div>
              {isUrgent && <p className="mt-3 text-xs font-medium text-[#db6554]">Trust your first instinct.</p>}
            </div>
            <div className="hidden rounded-[24px] bg-[#202b3d] p-6 text-[#f3f1e9] lg:block">
              <div className="mb-8 flex size-9 items-center justify-center rounded-xl bg-[#d9f66c] text-[#202b3d]"><Sparkles size={18} /></div>
              <p className="text-lg font-semibold leading-6 tracking-[-0.035em]">Fast recall is a skill. You are training it right now.</p>
              <p className="mt-3 font-mono text-[10px] uppercase leading-4 tracking-[0.13em] text-[#a9b0b1]">one question at a time</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ResultView({
  category,
  questions,
  answers,
  totalTimeUsed,
  timedOutCount,
  onTryAgain,
  onBackHome,
}: {
  category: Category;
  questions: Question[];
  answers: (number | null)[];
  totalTimeUsed: number;
  timedOutCount: number;
  onTryAgain: () => void;
  onBackHome: () => void;
}) {
  const score = questions.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0);
  const percentage = Math.round((score / questions.length) * 100);
  const wrongCount = questions.length - score;
  const attemptedCount = answers.filter((answer) => answer !== undefined).length;
  const message = percentage === 100
    ? 'Crystal clear. You nailed every signal.'
    : percentage >= 80
      ? 'Strong signal. Your recall is sharp.'
      : percentage >= 60
        ? 'Good signal. Keep building your edge.'
        : percentage >= 40
          ? 'You are getting there. A little more practice will sharpen the signal.'
          : 'Every round is a rep. Keep going and the signal will get stronger.';
  const correctCount = questions.filter((question, index) => answers[index] === question.answer).length;

  return (
    <main className="min-h-[calc(100dvh-81px)] bg-[#f3f1e9] px-5 pb-16 pt-8 sm:px-8 lg:px-12 lg:pt-12">
      <div className="mx-auto max-w-[1040px]">
        <div className="mb-10 flex items-center justify-between gap-4 quiz-entrance">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#ef735f]">Round complete</span>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#202b3d] sm:text-4xl">Here’s your readout.</h1>
          </div>
           <button type="button" onClick={onBackHome} data-testid="button-back-home-top" className="hidden items-center gap-2 rounded-full border border-[#cfd3cc] bg-[#fbfaf4] px-4 py-2.5 text-xs font-bold text-[#394554] transition-colors hover:border-[#202b3d] hover:bg-[#202b3d] hover:text-[#fbfaf4] sm:flex">
             <ArrowLeft size={14} /> Back to home
          </button>
        </div>

        <section className="quiz-result-reveal grid overflow-hidden rounded-[28px] bg-[#202b3d] text-[#f3f1e9] shadow-[8px_9px_0_#d9f66c] sm:grid-cols-[.95fr_1.05fr]">
          <div className="relative overflow-hidden p-7 sm:p-10">
            <div className="absolute -right-16 -top-20 size-56 rounded-full border-[36px] border-[#33445a] opacity-60" />
            <div className="relative">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#b4bdba]"><Trophy size={15} className="text-[#d9f66c]" /> {category.title}</div>
              <div className="mt-10 flex items-end gap-3">
                <span data-testid="text-score" className="text-[clamp(5rem,12vw,9rem)] font-bold leading-[.75] tracking-[-0.12em] text-[#d9f66c]">{score}</span>
                <span className="mb-1 font-mono text-xs uppercase tracking-[0.15em] text-[#aeb6b5]">/ {questions.length}<br />correct</span>
              </div>
              <p data-testid="text-performance-message" className="mt-8 max-w-[290px] text-2xl font-semibold leading-7 tracking-[-0.05em]">{message}</p>
               <div className="mt-8 flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#e6e9df]">
                <span data-testid="text-score-percentage">{percentage}% accuracy</span>
                <span className="size-1 rounded-full bg-[#ef735f]" />
                 <span>{correctCount} of {questions.length} correct</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between bg-[#d9f66c] p-7 text-[#202b3d] sm:p-10">
            <div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#202b3d] text-[#d9f66c]"><Target size={22} /></div>
               <h2 className="mt-8 max-w-[390px] text-[clamp(2rem,4vw,3.8rem)] font-bold leading-[.94] tracking-[-0.08em]">Progress is a practice, not a verdict.</h2>
               <p className="mt-5 max-w-[370px] text-sm leading-6 text-[#52602f]">Every answer gives you a cleaner signal about what to revisit next. Run it again when you’re ready.</p>
                <div className="mt-7 grid grid-cols-2 gap-3">
                 <div className="rounded-2xl bg-[#c4e95d] p-4">
                   <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-[#52602f]">Correct</span>
                   <span data-testid="text-correct-count" className="mt-1 block text-3xl font-bold tracking-[-0.07em]">{correctCount}</span>
                 </div>
                 <div className="rounded-2xl bg-[#ffc2b5] p-4">
                   <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-[#6c3027]">Wrong</span>
                   <span data-testid="text-wrong-count" className="mt-1 block text-3xl font-bold tracking-[-0.07em]">{wrongCount}</span>
                 </div>
               </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#edf4c9] p-4">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-[#52602f]">Attempted</span>
                    <span data-testid="text-attempted-count" className="mt-1 block text-2xl font-bold tracking-[-0.07em]">{attemptedCount} / {questions.length}</span>
                  </div>
                  <div className="rounded-2xl bg-[#f7efc8] p-4">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-[#52602f]">Time used</span>
                    <span data-testid="text-total-time" className="mt-1 block text-2xl font-bold tracking-[-0.07em]">{totalTimeUsed}s</span>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-[#52602f]">
                    <span>Round progress</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#b9dc50]">
                    <div data-testid="score-progress" className="h-full rounded-full bg-[#202b3d] transition-[width] duration-700" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
                {timedOutCount > 0 && <p className="mt-4 flex items-center gap-2 text-xs font-medium text-[#6c3027]"><Clock3 size={14} /> {timedOutCount} question{timedOutCount === 1 ? '' : 's'} timed out.</p>}
            </div>
             <div className="mt-10 grid gap-3 sm:grid-cols-2">
               <button type="button" onClick={onTryAgain} data-testid="button-try-again" className="flex w-full items-center justify-center gap-3 rounded-full bg-[#202b3d] px-5 py-3.5 text-sm font-bold text-[#f3f1e9] transition-all hover:gap-4 hover:bg-[#33445a]">
                 <RotateCcw size={16} /> Try again
               </button>
               <button type="button" onClick={onBackHome} data-testid="button-back-home" className="flex w-full items-center justify-center gap-3 rounded-full border border-[#202b3d]/20 px-5 py-3.5 text-sm font-bold text-[#202b3d] transition-all hover:bg-[#f3f1e9]">
                 <ArrowLeft size={16} /> Back to home
               </button>
             </div>
          </div>
        </section>

        <section className="mt-16 quiz-entrance quiz-entrance-delay-2">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#ef735f]">02 / review</span>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.055em] text-[#202b3d] sm:text-3xl">What you answered</h2>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#899098]">quick feedback</span>
          </div>
          <div className="grid gap-3">
            {questions.map((question, index) => {
              const selected = answers[index];
              const isCorrect = selected === question.answer;
              return (
                <article key={question.prompt} data-testid={`card-review-${index}`} className="rounded-[19px] border border-[#d6d8d2] bg-[#fbfaf4] p-5 transition-transform hover:-translate-y-0.5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${isCorrect ? 'bg-[#d9f66c] text-[#26331a]' : 'bg-[#ffc2b5] text-[#4d2520]'}`}>
                      {isCorrect ? <Check size={16} strokeWidth={2.5} /> : <X size={16} strokeWidth={2.5} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#899098]">Question {String(index + 1).padStart(2, '0')}</span>
                        <span className={`font-mono text-[10px] uppercase tracking-[0.12em] ${isCorrect ? 'text-[#67821e]' : 'text-[#d06452]'}`}>{isCorrect ? 'correct' : selected === null ? 'timed out' : 'not quite'}</span>
                      </div>
                      <h3 className="text-base font-bold leading-6 tracking-[-0.025em] text-[#303b49] sm:text-lg">{question.prompt}</h3>
                      <p className="mt-3 text-sm leading-6 text-[#747d82]">
                        <span className="font-semibold text-[#4c5760]">Answer:</span> {question.options[question.answer]}
                        {!isCorrect && selected !== null && <span className="ml-2 text-[#d06452]">· You chose {question.options[selected]}</span>}
                      </p>
                      <p className="mt-2 border-l-2 border-[#d9f66c] pl-3 text-xs leading-5 text-[#7b8389]">{question.explanation}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function ConfirmDialog({
  action,
  onCancel,
  onConfirm,
}: {
  action: 'home' | 'retry' | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!action) return null;
  const isRetry = action === 'retry';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202b3d]/45 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="w-full max-w-[420px] rounded-[24px] border border-[#d6d8d2] bg-[#fbfaf4] p-6 shadow-[8px_9px_0_#d9f66c] sm:p-8 quiz-pop">
        <div className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-[#ffc2b5] text-[#6c3027]"><Info size={20} /></div>
        <h2 id="confirm-title" className="text-2xl font-bold tracking-[-0.06em] text-[#202b3d]">{isRetry ? 'Start a fresh round?' : 'Leave this round?'}</h2>
        <p className="mt-3 text-sm leading-6 text-[#69727a]">{isRetry ? 'Your current answers will be cleared and a new set of questions will be selected.' : 'Your current progress will be lost if you return to category selection.'}</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onCancel} data-testid="button-cancel-confirm" className="rounded-full border border-[#cfd3cc] px-4 py-3 text-sm font-bold text-[#394554] transition-colors hover:border-[#202b3d]">Keep going</button>
          <button type="button" onClick={onConfirm} data-testid="button-confirm-action" className="rounded-full bg-[#202b3d] px-4 py-3 text-sm font-bold text-[#fbfaf4] transition-colors hover:bg-[#33445a]">{isRetry ? 'Try again' : 'Back to home'}</button>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const [phase, setPhase] = useState<QuizPhase>('select');
  const [categoryKey, setCategoryKey] = useState<CategoryKey | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('Mixed');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalTimeUsed, setTotalTimeUsed] = useState(0);
  const [timedOutCount, setTimedOutCount] = useState(0);
  const [confirmAction, setConfirmAction] = useState<'home' | 'retry' | null>(null);

  const category = useMemo(() => categories.find((item) => item.key === categoryKey) ?? null, [categoryKey]);

  const goToCategories = useCallback(() => {
    setPhase('select');
    setCategoryKey(null);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setTimeLeft(30);
    setTotalTimeUsed(0);
    setTimedOutCount(0);
    setConfirmAction(null);
  }, []);

  const startQuiz = useCallback((key: CategoryKey) => {
    setCategoryKey(key);
    setDifficulty('Mixed');
    setPhase('instructions');
  }, []);

  const beginQuiz = useCallback(() => {
    if (!categoryKey) return;
    setQuestions(prepareQuestions(categoryKey, difficulty));
    setPhase('quiz');
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setTimeLeft(30);
    setTotalTimeUsed(0);
    setTimedOutCount(0);
  }, [categoryKey, difficulty]);

  const finishQuestion = useCallback((shouldShowFeedback: boolean) => {
    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = selectedAnswer;
    setAnswers(nextAnswers);
    if (shouldShowFeedback) {
      setIsSubmitted(true);
      return;
    }
    setTotalTimeUsed((total) => total + Math.max(0, 30 - timeLeft));
    if (timeLeft === 0) setTimedOutCount((count) => count + 1);
    if (currentIndex >= questions.length - 1) {
      setPhase('result');
      return;
    }
    setCurrentIndex((index) => index + 1);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setTimeLeft(30);
  }, [answers, currentIndex, questions.length, selectedAnswer, timeLeft]);

  const submitAnswer = useCallback(() => {
    if (selectedAnswer === null || isSubmitted) return;
    finishQuestion(true);
  }, [finishQuestion, isSubmitted, selectedAnswer]);

  const advanceQuestion = useCallback(() => finishQuestion(false), [finishQuestion]);

  useEffect(() => {
    if (phase !== 'quiz' || isSubmitted) return;
    const timer = window.setInterval(() => setTimeLeft((value) => Math.max(value - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, [currentIndex, isSubmitted, phase]);

  useEffect(() => {
    if (phase === 'quiz' && timeLeft === 0 && !isSubmitted) finishQuestion(false);
  }, [finishQuestion, isSubmitted, phase, timeLeft]);

  const handleSelect = (index: number) => {
    if (selectedAnswer !== null || isSubmitted) return;
    setSelectedAnswer(index);
  };

  const requestConfirmation = (action: 'home' | 'retry') => setConfirmAction(action);
  const confirm = () => {
    if (confirmAction === 'retry') beginQuiz();
    if (confirmAction === 'home') goToCategories();
  };

  return (
    <div className="quiz-noise min-h-[100dvh] bg-[#f3f1e9]">
      <header className="flex h-[81px] items-center justify-between border-b border-[#d9dcd6] bg-[#f9f7ef]/90 px-5 backdrop-blur-sm sm:px-8 lg:px-12">
        <Logo onClick={() => phase === 'quiz' || phase === 'instructions' ? requestConfirmation('home') : goToCategories()} />
        <div className="flex items-center gap-3">
          {phase === 'select' ? (
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-[#899098] sm:block">A better five minutes</span>
          ) : (
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#899098]"><TimerReset size={14} /> live session</span>
          )}
          <span className="size-2 rounded-full bg-[#d9f66c] shadow-[0_0_0_4px_#edf5c8]" />
        </div>
      </header>
      {phase === 'select' && <CategoryPicker onStart={startQuiz} />}
      {phase === 'instructions' && category && <InstructionsView category={category} difficulty={difficulty} onDifficultyChange={setDifficulty} onBegin={beginQuiz} onBack={goToCategories} />}
      {phase === 'quiz' && category && <QuizView category={category} questions={questions} currentIndex={currentIndex} timeLeft={timeLeft} selectedAnswer={selectedAnswer} isSubmitted={isSubmitted} onSelect={handleSelect} onSubmit={submitAnswer} onNext={advanceQuestion} onBack={() => requestConfirmation('home')} />}
      {phase === 'result' && category && <ResultView category={category} questions={questions} answers={answers} totalTimeUsed={totalTimeUsed} timedOutCount={timedOutCount} onTryAgain={() => requestConfirmation('retry')} onBackHome={() => requestConfirmation('home')} />}
      <ConfirmDialog action={confirmAction} onCancel={() => setConfirmAction(null)} onConfirm={confirm} />
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
