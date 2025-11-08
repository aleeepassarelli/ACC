/* =====================================================
   VISUALIZADOR DE ALINHAMENTO v1.1.0 (Frontend)
   =====================================================
   - Conecta-se ao backend 'tools/api-endpoint.py'
   - Requer 'alignment-visualizer.html' e 'alignment-visualizer.css'
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- Configuração ---
    const API_URL = 'http://localhost:8000/api/v1/analyze-alignment';
    
    // --- Elementos do DOM ---
    const agentNameInput = document.getElementById('agent-name-input');
    const domainInput = document.getElementById('domain-input');
    const container = document.getElementById('alignment-visualizer-container');

    /**
     * Função Debounce
     * Evita chamadas de API excessivas a cada tecla pressionada.
     */
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    /**
     * Função Principal: Chama a API e dispara a renderização.
     */
    const handleAnalysis = async () => {
        const agentName = agentNameInput.value.trim();
        const domain = domainInput.value.trim();

        // Validação mínima para evitar chamadas vazias
        if (!agentName || domain.length < 10) {
            container.innerHTML = '<p class="info">Digite um Nome de Agente e um Domínio (mín. 10 caracteres).</p>';
            return;
        }

        container.innerHTML = '<p class="loading">Analisando...</p>';

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    agent_name: agentName,
                    domain: domain
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Erro de servidor');
            }

            const data = await response.json();
            renderReport(data);

        } catch (error) {
            console.error('Falha ao buscar análise:', error);
            renderError(error.message);
        }
    };

    /**
     * Renderiza o relatório visual completo no container.
     */
    const renderReport = (data) => {
        // Limpa o container
        container.innerHTML = '';

        // 1. Seção de Métricas Principais
        container.innerHTML += `
            <div class="metrics-summary">
                <div class="metric-box">
                    <span class="metric-label">Densidade Semântica (SD)</span>
                    <span class="metric-value">${data.semantic_density.toFixed(3)}</span>
                </div>
                <div class="metric-box">
                    <span class="metric-label">Palavras (Nome)</span>
                    <span class="metric-value">${data.word_count}</span>
                </div>
            </div>
        `;

        // 2. Seção de Análise de Keywords
        let keywordsHtml = `
            <h2>📊 Alinhamento por Termo do Domínio</h2>
            <div class="keyword-list">
        `;

        data.keywords_analysis.forEach(keyword => {
            // Converte o alinhamento (0.0-1.0) para uma porcentagem (0-100)
            const alignmentPercent = Math.max(0, Math.min(100, keyword.alignment * 100));

            keywordsHtml += `
                <div class="keyword-item">
                    <div class="keyword-header">
                        <span class="keyword-word">${keyword.word}</span>
                        <span class="keyword-alignment-score">${keyword.alignment.toFixed(3)}</span>
                    </div>
                    <div class="keyword-bar-container">
                        <div class="keyword-bar-fill" style="width: ${alignmentPercent}%;"></div>
                    </div>
                    <div class="keyword-meta">
                        Tipo: ${keyword.type} | Contribuição: ${keyword.contribution.toFixed(3)}
                    </div>
                </div>
            `;
        });

        keywordsHtml += '</div>'; // Fecha .keyword-list
        container.innerHTML += keywordsHtml;

        // 3. Seção de Insights e Recomendações
        let insightsHtml = '<h2>💡 Insights e Recomendações</h2>';

        if (data.top_contributors && data.top_contributors.length > 0) {
            insightsHtml += `
                <div class="insight-box">
                    <span class="insight-label">✅ Top Contributors:</span>
                    <span class="insight-value">${data.top_contributors.join(', ')}</span>
                </div>
            `;
        }

        if (data.weak_links && data.weak_links.length > 0) {
            insightsHtml += `
                <div class="insight-box">
                    <span class="insight-label">⚠️ Weak Links:</span>
                    <span class="insight-value">${data.weak_links.join(', ')}</span>
                </div>
            `;
        }

        if (data.recommendations && data.recommendations.length > 0) {
            insightsHtml += '<div class="recommendations">';
            data.recommendations.forEach(rec => {
                insightsHtml += `<p class="rec-item">${rec}</p>`;
            });
            insightsHtml += '</div>';
        }

        container.innerHTML += insightsHtml;
    };

    /**
     * Renderiza uma mensagem de erro no container.
     */
    const renderError = (message) => {
        container.innerHTML = `<p class="error">Falha na Análise: ${message}. O backend Python está rodando? (python tools/api-endpoint.py)</p>`;
    };

    // --- Event Listeners ---
    // Adiciona o "debounce" aos inputs
    const debouncedAnalysis = debounce(handleAnalysis, 500);
    agentNameInput.addEventListener('input', debouncedAnalysis);
    domainInput.addEventListener('keyup', debouncedAnalysis);
});
