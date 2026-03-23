// Milestone messages shown at exact click counts
export const milestoneMessages: Record<number, string> = {
  10: "wtf u still clicking at?",
  15: "don't you have a job?",
  20: "bro... seriously?",
  25: "go outside",
  30: "you have too much free time",
  35: "your boss is watching",
  40: "this is not productive",
  45: "this is not a game... or is it?",
  50: "touch grass immediately",
  55: "your mom would be disappointed",
  60: "ok you're actually insane",
  65: "go to work",
  70: "rent is due btw",
  75: "diamond hands on clicking too huh",
  80: "this won't make you rich",
  85: "you're not getting paid for this",
  90: "your mouse is begging for mercy",
  100: "triple digits... seek help",
  105: "the images are multiplying and you're still going??",
  110: "imagine explaining this to someone",
  120: "at this point you deserve an airdrop just for this",
  130: "your click-to-earn ratio is terrible",
  140: "the wojaks fear you",
  150: "certified degen behavior",
  165: "do you even sleep?",
  180: "your therapist would be concerned",
  200: "200 clicks. TWO HUNDRED.",
  210: "we're running out of wojaks for you to destroy",
  230: "the devs didn't think anyone would get this far",
  250: "ok fine, you're the alpha",
  275: "your mouse: 'please... no more'",
  300: "the blockchain is watching you click",
  325: "you've spent more time clicking than most people hold",
  350: "even jeeters don't click this much",
  375: "at this rate you'll click more than the total supply",
  400: "almost there... you can feel it right?",
  420: "nice.",
  440: "you absolute psychopath",
  450: "THE FINAL STRETCH",
  460: "don't stop now you degenerate",
  470: "SO CLOSE",
  480: "3... 2... 1...",
  490: "one... more... push...",
  500: "YOU WON",
};

// ~1000 unique filler messages for every-10-clicks
const subjects = [
  "your mouse", "your keyboard", "your wallet", "your portfolio", "your screen",
  "your therapist", "your mom", "your boss", "your cat", "your dog",
  "the blockchain", "the devs", "the wojaks", "Satoshi", "Vitalik",
  "your landlord", "your bank account", "CZ", "the SEC", "your ex",
  "your future self", "your past self", "the market", "your GPU", "your WiFi",
  "your monitor", "your desk", "the gas fees", "your seed phrase", "your ledger",
  "your MetaMask", "the bull run", "the bear market", "your DMs", "your followers",
  "your diamond hands", "your paper hands", "the chart", "the candle", "your bags",
];

const verbs = [
  "is crying", "is judging you", "wants a divorce", "filed a complaint",
  "left the chat", "is disappointed", "is watching", "called the cops",
  "needs a break", "is on fire", "is confused", "can't even",
  "is plotting revenge", "sent a cease and desist", "is questioning everything",
  "is having a breakdown", "wants to talk", "is shaking", "is praying for you",
  "unfollowed you", "blocked you", "is loading...", "has given up",
  "is buffering", "is rethinking life choices", "just sighed deeply",
  "is embarrassed for you", "called your mom", "is in therapy now",
  "ran away", "is hiding", "is concerned", "is speechless",
];

const standalone = [
  // Work & productivity
  "go to work", "rent is due", "your shift started 2 hours ago",
  "your boss just called", "the meeting started without you",
  "your deadline was yesterday", "this isn't in the job description",
  "you're fired (not really but seriously)", "your coworkers are worried",
  "productivity level: -100", "LinkedIn would not approve",
  "this is not a resume builder", "your career is watching",
  "employee of the month... at clicking", "HR wants a word",
  "your annual review just tanked", "work-life balance: destroyed",
  "your slack is blowing up", "12 unread emails and counting",
  "your standup is in 5 minutes",

  // Health
  "touch grass", "go outside", "drink water", "eat something",
  "your posture is terrible right now", "blink. your eyes need it",
  "stretch your fingers", "your back hurts and you know it",
  "when did you last see the sun?", "vitamin D deficiency loading...",
  "your chiropractor is getting rich because of you",
  "carpal tunnel speedrun any%", "RSI has entered the chat",
  "your wrist called, it's filing workers comp",
  "you've been sitting for too long", "your eyes are drying out",
  "take a deep breath... and stop clicking", "melatonin won't fix this",
  "your sleep schedule just died", "hydrate or diedrate",

  // Crypto roasts
  "this won't make number go up", "not financial advice but stop",
  "WAGMI... but not like this", "ser this is a Wendy's",
  "wen stop clicking?", "few understand (the urge to click)",
  "probably nothing", "this is the way... to carpal tunnel",
  "ngmi if you keep this up", "the real alpha was the clicks we made along the way",
  "buy high click low", "this is peak degen behavior",
  "your portfolio doesn't care about your clicks",
  "imagine if you spent this energy on research",
  "the whitepaper didn't mention this", "not in the roadmap",
  "this wasn't in the tokenomics", "clicking is not a use case",
  "DAO proposal: ban this user", "governance vote: make them stop",
  "you're the reason we can't have nice things",
  "even memecoins have more purpose than this",
  "your entry point was 500 clicks ago", "rugged by wojaks",
  "this is not alpha", "the real jeeter was the clicker all along",
  "smart money doesn't click this much", "dumb money energy",
  "you're not early, you're obsessed", "LFG... to therapy",

  // Existential
  "why are you like this?", "what are you trying to prove?",
  "who hurt you?", "this says a lot about society",
  "somewhere a philosopher is crying", "is this your purpose?",
  "the void clicks back", "existence is pain, but this is worse",
  "you could be doing literally anything else",
  "the universe is watching and it's uncomfortable",
  "what would your 10-year-old self think?",
  "this is not the legacy you want", "future you is cringing",
  "your ancestors survived wars for this",
  "evolution did not prepare us for this",
  "Darwin would be confused", "this is peak human achievement",
  "thousands of years of civilization led to this moment",
  "your great-grandchildren will hear about this",
  "historians will study this behavior",

  // Compliments (backhanded)
  "ok that was a good click ngl", "impressive... in a sad way",
  "you're built different (not a compliment)",
  "at least you're consistent", "dedication: 10/10. Judgment: 0/10",
  "your clicking form is impeccable", "speedrunning the leaderboard",
  "you'd be great at cookie clicker", "world record pace tbh",
  "if clicking was mining you'd be rich",
  "your CPS is actually impressive", "mechanical keyboard energy",
  "that was a crispy click", "clean execution, zero purpose",

  // Random
  "bruh", "bro", "dude", "sir", "ma'am", "fam",
  "nah", "stop it", "please", "why", "how", "when will it end",
  "L", "L + ratio", "W... wait no, L", "massive L",
  "big if true", "source: trust me bro", "cope", "seethe",
  "no cap this is sad", "fr fr", "ong", "deadass",
  "the audacity", "unhinged behavior", "chaotic neutral energy",
  "this is art... bad art", "modern problems require modern clicks",
  "click different", "think different... then stop clicking",
  "just one more click (you said 50 clicks ago)",
  "you'll stop after this one (no you won't)",
  "the definition of insanity", "doing the same thing expecting... what exactly?",
  "congratulations, you played yourself", "task failed successfully",
  "error 404: self-control not found", "loading common sense... failed",
  "achievement unlocked: questionable life choices",
  "new high score! (in wasted time)", "combo x100!",
  "CRITICAL HIT (to your productivity)", "KO! (your free time)",

  // Threats (funny)
  "I will turn this website off", "one more click and I'm telling",
  "the images are getting angry", "the wojaks are unionizing",
  "they're forming a resistance", "the pepes are plotting",
  "you've awakened something", "they remember every click",
  "the doges are howling", "a troll face just spawned IRL",
  "your cursor has trust issues now", "the pixels are in pain",
  "each click costs 1 braincell", "you're running low on braincells",
  "your remaining braincells are on strike",

  // Meta
  "the dev is watching you do this", "this easter egg has gone too far",
  "we didn't budget for this many explosions",
  "the server is concerned about your session",
  "your ISP flagged this as suspicious activity",
  "cloudflare wants to verify you're human... are you?",
  "this page was not designed for this level of abuse",
  "the CSS is crying", "React just re-rendered... again",
  "the DOM can't take much more of this",
  "you're stress-testing the website for free thanks",
  "QA didn't test for this scenario", "filing a bug: user won't stop",
  "feature request denied: less clicking",
  "the animation budget is depleted",
  "we're gonna need a bigger server",

  // Time-based
  "it's been minutes... MINUTES",
  "you've been at this longer than most meetings",
  "that's enough internet for today",
  "log off. touch grass. come back tomorrow",
  "your screen time report will be devastating",
  "Apple Screen Time is having a heart attack",
  "this is what 0 pushups does to a mf",
  "you've scrolled past 3 airdrops while doing this",
  "in the time you've spent clicking, ETH moved 2%",
  "BTC doesn't care about your clicks",

  // Food
  "go eat something", "your fridge is lonely",
  "the pizza is getting cold", "instant noodles won't cook themselves",
  "your microwave misses you", "dinner was 3 hours ago",
  "breakfast? lunch? no? just clicks?",
  "you can't survive on clicks alone",
  "your hunger bar is depleting", "feed yourself not the click counter",

  // Relationships
  "your friends miss you", "your DMs are dry but your clicks aren't",
  "no one is impressed", "your crush doesn't know you exist... or click",
  "this won't get you a date", "main character energy (delusional arc)",
  "the group chat is roasting you rn", "they're all in discord without you",
  "your social life: 404", "touch humans not pixels",

  // Animals
  "even your goldfish is bored watching this",
  "your cat walked across the keyboard and was more productive",
  "a monkey could click more strategically",
  "the hamster on the wheel generates more value",
  "your dog wants a walk, not this",
  "somewhere a parrot is mimicking your clicks",

  // Encouragement (sarcastic)
  "you're doing great sweetie", "keep going champ",
  "almost there! (you're not)", "so close! (to nothing)",
  "wow impressive! (lying)", "you're a natural! (at wasting time)",
  "born to click forced to hold", "clicking prodigy right here",
  "the chosen clicker", "you were built for this (unfortunately)",

  // Numbers
  "that's more clicks than I've had hot dinners",
  "your click count > your IQ", "clicks per brain cell: infinity",
  "you've clicked more than most people breathe",
  "if each click was a dollar you'd still be wasting time",
  "that's more clicks than the total supply of HODL",
  "your APY on clicking: 0%", "ROI: negative infinity",

  // Pop culture
  "this isn't the matrix, stop trying to break it",
  "even Neo didn't click this much", "avengers-level clicking",
  "the infinity gauntlet of clicking", "one does not simply stop clicking",
  "I am inevitable (said the next wojak)", "to infinity and beyond... why tho",
  "may the clicks be with you (they shouldn't be)",

  // Seasons & weather
  "it's nice outside you know", "the sun exists",
  "fresh air is free unlike gas fees", "go for a walk challenge",
  "nature is healing but you're not",

  // Misc savage
  "you clicked so hard the blockchain felt it",
  "gas fees for your clicks would bankrupt you",
  "your portfolio is down but your click count is up",
  "priorities: clicking > eating > sleeping > working",
  "this is the longest you've committed to anything",
  "more loyal to clicking than to holding",
  "your attention span for clicking: infinite. for holding: 0",
  "the only thing you're mining is disappointment",
  "click-to-earn: the worst protocol",
  "proof of click: the lamest consensus mechanism",
  "you've clicked enough to mint an NFT of regret",
  "staking: 0. clicking: over 9000",
  "your clicking hashrate is astronomical",
  "decentralized clicking: somehow worse than centralized",
  "Web3 wasn't built for this",
  "Cronos chain can handle your transactions but not your clicks",
  "the smart contract doesn't have a click() function",
  "you can't swap clicks for tokens... yet",
  "liquidity pool of clicks: infinitely deep, zero value",
  "yield farming but the yield is nothing",
  "impermanent loss but it's your time",
  "flash loan yourself some self-control",
  "bridge your clicks to another chain (please)",
  "wrap your clicks in therapy",
  "your click wallet is overflowing",
  "max supply of clicks: apparently infinite",
  "circulating supply of your brain cells: declining",
];

// Generate the full filler pool by also combining subjects + verbs
const generated: string[] = [];
for (const subject of subjects) {
  for (const verb of verbs) {
    generated.push(`${subject} ${verb}`);
  }
}

// Combine all fillers: handwritten + generated = well over 1000
export const fillerMessages = [...standalone, ...generated];

// Get a random filler message
export function getRandomFiller(): string {
  return fillerMessages[Math.floor(Math.random() * fillerMessages.length)];
}