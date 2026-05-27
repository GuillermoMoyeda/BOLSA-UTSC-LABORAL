requireAuth(['alumno']);

        // --- LÓGICA DE ZENQUOTES API + TRADUCCIÓN A ESPAÑOL ---
        let quoteInterval;
        const QUOTE_TIME_MS = 10000;
        
        async function fetchQuote() {
            const textEl = document.getElementById('quoteText');
            const authorEl = document.getElementById('quoteAuthor');
            const progressEl = document.getElementById('quoteProgress');
            
            // Ocultar textos temporalmente mientras carga
            textEl.style.opacity = 0.3;
            authorEl.style.opacity = 0.3;
            
            // Reiniciar animación de la barra
            progressEl.style.transition = 'none';
            progressEl.style.width = '0%';
            
            try {
                // 1. Obtención de Frase mediante la API Oficial de ZenQuotes
                // (Usamos corsproxy.io porque AllOrigins presenta bloqueos CORS estrictos. Este proxy devuelve la respuesta directa)
                const zenUrl = 'https://zenquotes.io/api/random?t=' + Date.now();
                const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(zenUrl);
                
                const zenRes = await fetch(proxyUrl);
                const zenData = await zenRes.json();
                
                // Extraer el de array JSON directamente
                const quoteObj = zenData[0];
                
                const englishQuote = quoteObj.q;
                const author = quoteObj.a;

                // 2. Traducción al Español (Vía API externa MyMemory gratuita)
                const transUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishQuote)}&langpair=en|es`;
                const transRes = await fetch(transUrl);
                const transData = await transRes.json();
                
                let spanishQuote = englishQuote; // Fallback al inglés si la traducción no responde
                if(transData && transData.responseData && transData.responseData.translatedText) {
                    // Ciertas APIs retornan comillas codificadas como &#39;, corregimos
                    spanishQuote = transData.responseData.translatedText.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
                }

                // 3. Renderizado animado
                textEl.style.opacity = 0;
                authorEl.style.opacity = 0;
                
                setTimeout(() => {
                    textEl.textContent = `"${spanishQuote}"`;
                    authorEl.textContent = `- ${author}`;
                    textEl.style.opacity = 1;
                    authorEl.style.opacity = 1;
                }, 300);

            } catch (error) {
                console.error("Error al obtener o traducir de ZenQuotes:", error);
                // Pequeño fallback de seguridad
                setTimeout(() => {
                    textEl.textContent = '"La disciplina es el puente entre las metas y el éxito."';
                    authorEl.textContent = "- Jim Rohn";
                    textEl.style.opacity = 1;
                    authorEl.style.opacity = 1;
                }, 300);
            }

            // Iniciar animación de la barra de progreso de tiempo
            setTimeout(() => {
                progressEl.style.transition = `width ${QUOTE_TIME_MS}ms linear`;
                progressEl.style.width = '100%';
            }, 50);

            // Planear la siguiente frase
            clearInterval(quoteInterval);
            quoteInterval = setInterval(fetchQuote, QUOTE_TIME_MS);
        }

        // Ejecutar en el momento que la página esté lista
        fetchQuote();


