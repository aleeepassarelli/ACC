# 🎯 ACC v1.1.0
---

# 🔪 Surgical Knife Agent (ACC) Framework
---

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/) [![Validation Score](https://img.shields.io/badge/validation-87%25-brightgreen.svg)](docs/scientific-validation.md) [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.17506950.svg)](https://doi.org/10.5281/zenodo.17506950)

---

**Surgical minimalism for prompt engineering: every word with a purpose, every metric with evidence.**

A scientifically validated framework for creating ultra-efficient LLM agents using **Semantic Density**, **Baseshot Learning**, and **Latent Feature Steering**.

---
[🚀 Quick Start](https://github.com/aleeepassarelli/ACC/tree/main/tools) | [📖 Documentation](https://github.com/aleeepassarelli/ACC/tree/main/docs) | [🧪 Scientific Validation](docs/scientific-validation.md) | [💡 Examples](https://github.com/aleeepassarelli/ACC/tree/main/examples) 
---
https://github.com/aleeepassarelli
Author: Aledev
---

## 🎯 Why This Framework?
### The Common Problem

❌ Verbose prompts (300-500 tokens)
❌ Low replicability between models
❌ Zero scientific validation
❌ Inconsistent results

### The Surgical Solution

✅ <200 tokens with high semantic density
✅ Portable (GPT-4, Claude, Gemini, Llama)
✅ Based on 6 peer-reviewed papers
✅ Quantitative metrics (SD, κ, token count)

### Validated Results

**20-35% better** performance than verbose prompts (Jiang et al. 2023) - **87% consolidated score** (multi-agent validation) - **>0.7 Cohen's Kappa** on replicability tests

---

## 🏗️ The 4-Layer Architecture

┌─────────────────────────────────────────┐
│ 1. IDENTITY (The Who?) │
│ [Function] + [Specific Domain] │
│ Ex: "Semantic Hacker" │
│ Metric: SD >0.8 │
└─────────────────────────────────────────┘
↓
┌─────────────────────────────────────────┐
│ 2. MISSION (The What?) │
│ 1-sentence objective (<30 words) │
│ Ex: "Deconstructs tech offerings..." │
└─────────────────────────────────────────┘
↓
┌─────────────────────────────────────────┐
│ 3. PROTOCOL (The How?) │
│ 3-5 operational guidelines │
│ - Prioritize X │
│ - Validate Y │
└─────────────────────────────────────────┘
↓
┌─────────────────────────────────────────┐
│ 4. BASESHOT (The Examples) │
│ 5-7 cases (positive/negative/edge) │
│ - ✅ Ideal case │
│ - ❌ Common error │
│ - ⚠️ Edge case │
└─────────────────────────────────────────┘

---
## 🚀 Quick Start

```bash
git clone [https://github.com/aleeepassarelli/ACC.git](https://github.com/aleeepassarelli/ACC.git)
cd ACC
pip install -r requirements.txt
