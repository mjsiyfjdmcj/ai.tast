// Google Search Integration for AI Assistant
class GoogleSearchBot {
    constructor() {
        this.cx = 'f3d29faa34e134b8b';
        this.apiKey = 'YOUR_API_KEY'; // Replace with actual API key
        this.isSearching = false;
    }

    // Search Google CSE and return results
    async searchGoogle(query) {
        if (this.isSearching) return 'অনুসন্ধান চলছে, অপেক্ষা করুন...';
        
        this.isSearching = true;
        
        try {
            const url = `https://www.googleapis.com/customsearch/v1?key=${this.apiKey}&cx=${this.cx}&q=${encodeURIComponent(query)}&hl=bn`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.items) {
                this.isSearching = false;
                return this.formatResults(data.items, query);
            }
            
            this.isSearching = false;
            return 'দুঃখিত, কোনো ফলাফল পাওয়া যায়নি।';
            
        } catch (error) {
            this.isSearching = false;
            return 'সার্চ করতে সমস্যা হয়েছে। নিচের সার্চ বক্স ব্যবহার করুন।';
        }
    }

    // Parse Google search results
    parseGoogleResults(html) {
        const results = [];
        
        // Simple text extraction from search results
        const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
        
        // Extract relevant information
        const sentences = textContent.split('.').filter(sentence => 
            sentence.length > 20 && sentence.length < 200
        );
        
        return sentences.slice(0, 3); // Return top 3 relevant sentences
    }

    // Format search results for display
    formatResults(results, query) {
        if (results.length === 0) {
            return `"${query}" সম্পর্কে কোনো তথ্য পাওয়া যায়নি।`;
        }

        let response = `🔍 "${query}" সম্পর্কে গুগল থেকে প্রাপ্ত তথ্য:\n\n`;
        
        results.forEach((result, index) => {
            response += `${index + 1}. ${result.trim()}\n\n`;
        });
        
        response += '📌 আরও জানতে গুগলে সার্চ করুন।';
        
        return response;
    }

    // Check if query needs Google search
    needsGoogleSearch(question) {
        const searchKeywords = [
            'খোঁজ', 'সার্চ', 'গুগল', 'তথ্য', 'জান', 'বল', 'কী', 'কে', 'কোথায়', 
            'কখন', 'কিভাবে', 'কেন', 'সম্পর্কে', 'নিউজ', 'খবর', 'আপডেট'
        ];
        
        return searchKeywords.some(keyword => 
            question.toLowerCase().includes(keyword)
        );
    }
}

// Initialize Google Search Bot
const googleBot = new GoogleSearchBot();

// Enhanced AI response function with Google search
async function getEnhancedAIResponse(question) {
    // First try local knowledge base
    const localResponse = findBestResponse(question);
    
    // If local response is generic and question seems to need search
    if (localResponse.includes('দুঃখিত') || googleBot.needsGoogleSearch(question)) {
        const searchResponse = await googleBot.searchGoogle(question);
        return searchResponse;
    }
    
    return localResponse;
}

// Update the askAI function to use enhanced response
async function askAIEnhanced() {
    // Check if code verification is still visible
    if (document.getElementById('code-verification').style.display !== 'none') {
        alert('প্রথমে পাস কোড দিন!');
        return;
    }
    
    const input = document.getElementById('ai-input');
    const question = input.value.trim();
    
    if (!question) return;

    const chat = document.getElementById('ai-chat');
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-message';
    userMsg.innerHTML = `<strong>আপনি:</strong> ${question}`;
    userMsg.style.background = '#e3f2fd';
    chat.appendChild(userMsg);
    
    // Clear input
    input.value = '';
    
    // Add loading message
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'ai-message';
    loadingMsg.innerHTML = '<strong>AI:</strong> গুগল থেকে তথ্য খোঁজ করছি... 🔍';
    chat.appendChild(loadingMsg);
    
    // Scroll to bottom
    chat.scrollTop = chat.scrollHeight;
    
    // Generate enhanced AI response
    try {
        const response = await getEnhancedAIResponse(question);
        loadingMsg.innerHTML = `<strong>AI:</strong> ${response}`;
    } catch (error) {
        loadingMsg.innerHTML = '<strong>AI:</strong> দুঃখিত, কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।';
    }
    
    chat.scrollTop = chat.scrollHeight;
}