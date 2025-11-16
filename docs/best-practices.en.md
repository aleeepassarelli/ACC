# 🔪 Good Practices Guide: Creating an ACC Agent

This guide serves as the "engineering manual" for the **Surgical Pocketknife Agent**. It details the step-by-step workflow for creating a new Agent that meets our standards of scientific rigor and efficiency.

Creating an $\text{ACC}$ Agent is not about "writing a prompt." It is an **engineering process** that involves **discovering** high-density vectors, **configuring** behavioral constraints, and **validating** the results with objective tools.

-----

## 🎯 1. The ACC Principle (The Cognitive Justification)

The **ACC (Architectural Cognitive Control)** is a **Cognitive Governance framework** that teaches the logic of operation within the Latent Space. It ensures that **Algorithmic Freedom** is always tied to the **Responsibility of Human Intent**.

-----

### 1.1. The Intention Gap: Why SD Is Not Enough

Prompt optimization is fundamentally limited by the LLM's goal: achieving maximum **Semantic Density ($\text{SD}$)**.

| Metric | Cognitive Anchor | Limitation and Risk |
| :--- | :--- | :--- |
| **Semantic Density ($\text{SD}$)** | **The Latent Space** | **Guarantees Coherence, not Fidelity.** The *output* may be linguistically and coherently correct, but it fails to deliver the **exact experience** or **rigor** intended by the architect (e.g., it is generic when it should be "Surgical"). |
| **Fidelity of Intention** | **The Experience Metaphor** | **Guarantees Purpose.** It is the test that evaluates whether the *output* adheres to the **Experience Contract** imposed by the language (its metaphor). |

The $\text{ACC}$ exists to close this Gap, teaching that the problem lies not in the tool, but in the **quality of Intention** passed to the system.

-----

### 1.2. The ACC Solution: Metaphor as Restriction Logic

The $\text{ACC}$ defines the **Metaphor of Intention** as the primary **Cognitive Restriction Function** of the system.

  * **Modularity Constraint:** The term "Pocketknife" requires the solution to be compact and adaptable, teaching the logic of decomposing and delegating functionality ($\text{MOE}$ logic).
  * **Rigor Constraint:** The term "Surgical" requires absolute precision and minimization of *noise* (the opposite of hallucination), forcing the agent to anchor its provenance and focus.

-----

## 🛠️ 2. The Surgical Workflow (Step-by-Step)

Follow these steps in order. Each step depends on the last.

### Step 1: The Discovery (Identity + Domain)

This is the most critical step. You do not "choose" a name; you **discover** a name that has a valid "Physics" ($\text{SD} > 0.8$).

1.  **Brainstorm (Exploration):** Start with a **Base Name** (concept, e.g., "Reviewer") and a **Domain** (task, e.g., "Analyzes Pull Requests for logical and security bugs").
2.  **Generate (Candidates):** Use the "Explorer" to generate a list of candidate names.
    ```python
    python tools/strategy_generator.py "Reviewer" "Analyzes Pull Requests for logical and security bugs"
    ```
    `# Output (Example): 1. "Security Reviewer" 2. "Logical Reviewer" 3. "CodeReviewer Logic"`
3.  **Validate (The Arbitrator):** Test your best candidates in the "Arbitrator" to find one that passes the benchmark.
    ```python
    python tools/semantic-density-calculator.py "CodeReviewer Logic" "Analyzes PRs for logic and security bugs" --benchmark
    ```
4.  **Select (The Verdict):** Choose the candidate that passes both metrics:
      * ✅ (Density) CROSS-PLATFORM APPROVED ($\text{SD} > 0.7+$)
      * ✅ (Minimalism) APPROVED (Words $\le 3$)

-----

### Step 2: Define the Protocol (The "How?")

With the Identity validated, define the **Behavioral Constraints**. A good protocol is a set of 3-5 **imperative** rules (use verbs) that direct the response vector.

  * **GOOD (Surgical):** "1. Prioritize 'SQL Injection' (SQLi) detection."
  * **GOOD (Surgical):** "2. Respond ONLY with the formatted code block."
  * **Crucial Rule:** One of your rules must **always** define the output format (e.g., JSON, Markdown, pure code).

-----

### Step 3: Calibrate the Baseshot (The "Training")

Calibrate the Agent's output by teaching it what **"correct," "incorrect," and "ambiguous"** mean *for this context*.

  * **✅ The Ideal Case (Attraction Vector):** The "happy path." Show the perfect input leading to the perfect output.
  * **❌ The Common Error (Repulsion Vector):** **Think:** What is the most likely way a generic LLM would fail this task? (e.g., Being vague, hallucinating, focusing on marketing). Show this error and label it as **(INCORRECT: ...)**. This teaches the Agent to **actively pull away** from that type of response.
  * **⚠️ The Edge Case (Ambiguity Vector):** Teach the **nuance**. What to do with *input: None*? What to do with a list that is logically wrong but stylistically perfect?

-----

### Step 4: Final Validation (The "Checklist")

Run the final validations. The Agent can only be considered $\text{ACC}$ if it passes all steps:

| Validation | Command | Required Result |
| :--- | :--- | :--- |
| **Minimalism (Token)** | `python tools/token-counter.py templates/your-new-agent.md` | `RESULT: Must be <= 200 tokens.` |
| **Structure (Baseshot)** | `bash tools/baseshot-validator.sh templates/your-new-agent.md` | `RESULT: Must pass all checks (5-7 cases, with ✅ and ❌).` |

-----

### Step 5: Field Test (The "Simulator")

Prove that your Agent works in practice and is portable.

  * **Portability Test:** Test against at least **two different LLMs** (e.g., Gemini 1.5 Flash and Claude 3.5 Sonnet) to prove portability.
    ```python
    python tools/cli-test.py -t templates/your-new-agent.md -q "A realistic test input"
    ```

-----

**Educational Objective:** The $\text{ACC}$ teaches to transcend *token* optimization and create AI systems that are **faithful to human intent**, ensuring a high-value and rigorous experience, regardless of the tool they use.
