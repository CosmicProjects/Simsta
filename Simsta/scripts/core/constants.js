// Random username generator
const FIRST_NAMES = ['Emma', 'Olivia', 'Sophia', 'Ava', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn', 'Abigail', 'Emily', 'Elizabeth', 'Mila', 'Ella'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];

// Popular hashtags for auto-posts
const POPULAR_HASHTAGS = [
    '#FYP', '#ForYou', '#Trending', '#Viral', '#Explore', '#Discover',
    '#Love', '#Happy', '#Blessed', '#Grateful', '#Inspired', '#Motivated',
    '#Goals', '#Dreams', '#Success', '#Winning', '#Amazing', '#Incredible',
    '#Beautiful', '#Stunning', '#Perfect', '#Awesome', '#Epic', '#Legendary',
    '#Vibes', '#Energy', '#Positive', '#Good', '#Best', '#Top',
    '#Daily', '#Moment', '#Life', '#Living', '#Lifestyle', '#Inspo',
    '#Creative', '#Art', '#Music', '#Dance', '#Fun', '#Party',
    '#Friends', '#Family', '#Together', '#Community', '#Squad', '#Crew'
];

// Random post content generator
const POST_TEMPLATES = [
    "Just had the best day ever! 🌟",
    "Can't believe how amazing this is! 😍",
    "Who else loves this? 🙌",
    "This is absolutely incredible! 🔥",
    "Feeling blessed and grateful today 🙏",
    "Just discovered something amazing! 💡",
    "This made my day! 😊",
    "Wow, just wow! 🤯",
    "Living my best life right now! ✨",
    "This is what happiness looks like 💕",
    "Absolutely obsessed with this! 😍",
    "Can't stop thinking about this! 🤔",
    "This is pure gold! 🏆",
    "Feeling inspired today! 💪",
    "This is everything! 🎉",
    "Just when I thought it couldn't get better... 🌈",
    "This is the vibe! 🎵",
    "Totally here for this! 👏",
    "This is what dreams are made of! 💭",
    "Absolutely perfect! 👌",
    "This just made my week! 📈",
    "Can't get enough of this! 🔁",
    "This is legendary! 🌟",
    "Feeling the energy! ⚡",
    "This is next level! 🚀",
];

// Bad post templates (low engagement, spam-like, or inappropriate)
const BAD_POST_TEMPLATES = [
    "buy now click here!!!",
    "check out my link 👇👇👇",
    "FREE MONEY CLICK HERE",
    "you won't believe this one weird trick",
    "URGENT: Read this immediately!!!",
    "spam spam spam",
    "follow me follow me follow me",
    "buy my stuff buy my stuff",
    "this is so random lol",
    "nobody cares about this",
    "just posting random stuff",
    "idk what to post",
    "bored af",
    "whatever",
    "meh",
    "not really feeling this",
    "this is boring",
    "nobody will see this anyway",
    "why am i even posting",
    "this makes no sense",
];

// Random video content generator
const VIDEO_TEMPLATES = [
    "Check out this amazing moment! 🎬",
    "You won't believe what happened! 😱",
    "This is insane! 🤯",
    "Best video ever! 🔥",
    "Watch till the end! 👀",
    "This made me laugh so hard! 😂",
    "Absolutely stunning! ✨",
    "This is so satisfying! 😌",
    "Epic moment captured! 🎥",
    "This is pure talent! 🌟",
    "Can't stop watching! 🔁",
    "This is incredible! 🚀",
    "Mind blown! 🤯",
    "This is beautiful! 💫",
    "Viral worthy! 📈",
];

// Random message templates
const MESSAGE_TEMPLATES = [
    "Hey! Love your content! 💕",
    "You're so inspiring! Keep it up! 🌟",
    "Your posts always make my day! 😊",
    "You're amazing! 🔥",
    "Just wanted to say you're awesome! 👏",
    "Your energy is contagious! ✨",
    "I'm obsessed with your content! 😍",
    "You inspire me so much! 💪",
    "Your vibe is immaculate! 👑",
    "You're killing it! 🚀",
    "Your content is everything! 🎉",
    "I'm your biggest fan! 💖",
    "You make the internet better! 🌈",
    "Your creativity is unmatched! 🎨",
    "Keep shining! ⭐",
    "You're a legend! 🏆",
    "Your posts are life-changing! 📈",
    "I love everything you do! 💯",
    "Can we collab sometime? 🤝",
    "Can I get some tips from you? 💡",
    "How do you stay so consistent? 🤔",
    "Your secret to success? 👀",
    "Can you follow me back? 🙏",
    "Would love to work together! 💼",
    "Your content changed my perspective! 🧠",
    "You're my motivation! 🎯",
    "OMG your latest post was FIRE! 🔥🔥",
    "Just binged all your content! 😍",
    "You're literally the best! 👑",
    "This is exactly what I needed! 💯",
    "You get it! 🙌",
    "Absolutely obsessed! 💕",
    "This is genius! 🧠✨",
    "You're changing the game! 🚀",
];

// Shoutout templates based on post content keywords
const SHOUTOUT_TEMPLATES = {
    blessed: ["Sending you all the blessings! 🙏✨", "Your gratitude is inspiring! 💫", "Blessed to have you here! 🌟"],
    grateful: ["Gratitude looks good on you! 🙏", "Your positive energy is contagious! ✨", "Love the grateful vibes! 💕"],
    inspired: ["You inspire us all! 💪", "Your inspiration is everything! 🚀", "Keep inspiring the world! 🌟"],
    amazing: ["You're absolutely amazing! 🔥", "Amazing content, amazing person! 💯", "This is amazing work! 🎉"],
    incredible: ["This is absolutely incredible! 🤯", "Your talent is incredible! ✨", "Incredible energy! 🚀"],
    love: ["We love your content! 💕", "Love this so much! 😍", "Your passion is love! 💖"],
    gold: ["Pure gold! 🏆", "You're golden! ✨", "This is treasure! 💎"],
    legendary: ["Absolutely legendary! 🏆", "You're a legend! 👑", "Legendary vibes! 🌟"],
    perfect: ["Absolutely perfect! 👌", "Perfection! 💯", "This is flawless! ✨"],
    default: ["Great post! 👏", "Love this! 💕", "You're awesome! 🌟", "Keep it up! 🚀", "Amazing! 🔥"]
};

// Platforms for cross-posting
const PLATFORMS = {
    simsta: { id: 'simsta', name: 'Simsta', icon: '📸', color: '#e1306c', engagementBonus: 1.0 },
    simtok: { id: 'simtok', name: 'SimTok', icon: '🎵', color: '#000000', engagementBonus: 1.25 },
    simx: { id: 'simx', name: 'SimX', icon: '🐦', color: '#1da1f2', engagementBonus: 1.15 },
    simthreads: { id: 'simthreads', name: 'SimThreads', icon: '🧵', color: '#000000', engagementBonus: 1.10 }
};
