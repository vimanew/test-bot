const { cmd } = require('../command');
const Hiru = require('hirunews-scrap');
const Esana = require('@sl-code-lords/esana-news');


let activeGroups = {};
let lastNewsTitles = {};

async function getLatestNews() {
    let newsData = [];
    
    // Hiru News
    try {
        const hiruApi = new Hiru();
        const hiruNews = await hiruApi.BreakingNews();
        newsData.push({
            title: hiruNews.results.title,
            content: hiruNews.results.news,
            date: hiruNews.results.date
        });
    } catch (err) {
        console.error(`Error fetching Hiru News: ${err.message}`);
    }

    // Esana News
    try {
        const esanaApi = new Esana();
        const esanaNews = await esanaApi.getLatestNews(); 
        if (esanaNews && esanaNews.title && esanaNews.description && esanaNews.publishedAt) {
            newsData.push({
                title: esanaNews.title,
                content: esanaNews.description,
                date: esanaNews.publishedAt
            });
        } else {
            console.error("Error: Esana News returned invalid data.");
        }
    } catch (err) {
        console.error(`Error fetching Esana News: ${err.message}`);
    }

    return newsData;
}

// Function to check for and post new news to the group
async function checkAndPostNews(conn, groupId) {
    const latestNews = await getLatestNews();
    latestNews.forEach(async (newsItem) => {
        if (!lastNewsTitles[groupId]) {
            lastNewsTitles[groupId] = [];
        }

        if (!lastNewsTitles[groupId].includes(newsItem.title)) {
            await conn.sendMessage(groupId, { 
                text: `📰 *${newsItem.title}*\n${newsItem.content}\n${newsItem.date}\n*Queen Spriky MD News*`
            });
            lastNewsTitles[groupId].push(newsItem.title);

            if (lastNewsTitles[groupId].length > 100) {
                lastNewsTitles[groupId].shift();
            }
        }
    });
}


async function getHiruNews() {
    try {
        const hiruApi = new Hiru();
        const hiruNews = await hiruApi.BreakingNews();
        return {
            title: hiruNews.results.title,
            content: hiruNews.results.news,
            date: hiruNews.results.date
        };
    } catch (err) {
        console.error(`Error fetching Hiru News: ${err.message}`);
        return null;
    }
}

// Command for Hiru news
cmd({
    pattern: "hirunews",
    desc: "Fetch the latest news from Hiru",
    react: "📰",
    category: "news",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    const hiruNews = await getHiruNews();
    if (hiruNews) {
        await conn.sendMessage(from, { 
            text: `📰 *${hiruNews.title}*\n${hiruNews.content}\n${hiruNews.date} \n*Queen Spriky MD News*` 
        });
    } else {
        await conn.sendMessage(from, { text: "Failed to fetch Hiru News." });
    }
});
  
// Command to activate the general news service in the group
cmd({
    pattern: "sprikynews",
    desc: "Enable Sri Lankan news updates in this group",
    isGroup: true,
    react: "📰",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, participants }) => {
    try {
        if (isGroup) {
            const isAdmin = participants.some(p => p.id === mek.sender && p.admin);
            const isBotOwner = mek.sender === conn.user.jid;

            if (isAdmin || isBotOwner) {
                if (!activeGroups[from]) {
                    activeGroups[from] = true;

                    await conn.sendMessage(from, { text: "📰 24/7 News Activated." });

                    if (!activeGroups['interval']) {
                        activeGroups['interval'] = setInterval(async () => {
                            for (const groupId in activeGroups) {
                                if (activeGroups[groupId] && groupId !== 'interval') {
                                    await checkAndPostNews(conn, groupId);
                                }
                            }
                        }, 60000); // Check for news every 60 seconds
                    }

                } else {
                    await conn.sendMessage(from, { text: "📰 24/7 News Already Activated." });
                }
            } else {
                await conn.sendMessage(from, { text: "🚫 This command can only be used by group admins or the bot owner." });
            }
        } else {
            await conn.sendMessage(from, { text: "This command can only be used in groups." });
        }
    } catch (e) {
        console.error(`Error in sprikynews command: ${e.message}`);
        await conn.sendMessage(from, { text: "Failed to activate the news service." });
    }
});

// Command to disable the news service
cmd({
    pattern: "stopsprikynews",
    desc: "Disable Sri Lankan news updates in this group",
    isGroup: true,
    react: "🛑",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, participants }) => {
    try {
        if (isGroup) {
            const isAdmin = participants.some(p => p.id === mek.sender && p.admin);
            const isBotOwner = mek.sender === conn.user.jid;

            if (isAdmin || isBotOwner) {
                if (activeGroups[from]) {
                    delete activeGroups[from];
                    await conn.sendMessage(from, { text: "🛑 24/7 News Deactivated." });

                    if (Object.keys(activeGroups).length === 1 && activeGroups['interval']) {
                        clearInterval(activeGroups['interval']);
                        delete activeGroups['interval'];
                    }
                } else {
                    await conn.sendMessage(from, { text: "🛑 24/7 News is not active in this group." });
                }
            } else {
                await conn.sendMessage(from, { text: "🚫 This command can only be used by group admins or the bot owner." });
            }
        } else {
            await conn.sendMessage(from, { text: "This command can only be used in groups." });
        }
    } catch (e) {
        console.error(`Error in stopsprikynews command: ${e.message}`);
        await conn.sendMessage(from, { text: "Failed to deactivate the news service." });
    }
});

// Command to check if the news service is active
cmd({
    pattern: "checksprikynews",
    desc: "Check if the Sri Lankan news service is active in this group",
    isGroup: true,
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    if (activeGroups[from]) {
        await conn.sendMessage(from, { text: "📰 The 24/7 news service is currently active in this group." });
    } else {
        await conn.sendMessage(from, { text: "🛑 The 24/7 news service is not active in this group." });
    }
});
