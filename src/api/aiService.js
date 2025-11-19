const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';



export async function sendMessage(messages, modelName, onStreamChunk, onStreamEnd) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: modelName,
                messages: messages,
                temperature: 0.7,
                max_tokens: 1024,
                stream: true // akış modu aktif
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(errorData.error?.message || 'API isteği başarısız');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                onStreamEnd(); // akış bitti
                break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.trim().startsWith('data: ')) {
                    const dataStr = line.replace('data: ', '');
                    if (dataStr === '[DONE]') continue;

                    try {
                        const data = JSON.parse(dataStr);
                        const token = data.choices[0]?.delta?.content;
                        if (token) {
                            onStreamChunk(token); // yeni tokenı bileşene gönder
                        }
                    } catch (e) {
                        console.error('Stream parse error:', e);
                    }
                }
            }
        }
    } catch (error) {
        console.error('API Hatası:', error);
        throw error; // hatayı üst bileşene ilet
    }
}