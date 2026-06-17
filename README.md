# Form & Progression Lab

## Overview

Form & Progression Lab is an AI-powered wellness platform that combines Natural Language Processing (NLP), agentic decision systems, and adaptive analytics to deliver personalized fitness recommendations.

Unlike traditional fitness applications that rely on static workout plans, the platform analyzes user mood, recovery status, fitness goals, and logistical constraints to generate dynamic training protocols that evolve over time. By correlating psychological readiness with physical performance, the system provides holistic wellness insights while balancing recovery needs with long-term progression goals.

Through constraint-based reasoning, sentiment analysis, and historical trend evaluation, Form & Progression Lab creates a continuously adaptive training experience tailored to each user.

---

## What Makes This Different?

Traditional fitness programs follow fixed schedules regardless of how the user feels.

Form & Progression Lab continuously adapts recommendations using:

* Mood and sentiment analysis
* Recovery and soreness monitoring
* Historical performance trends
* Constraint-based reasoning
* Adaptation score generation
* Dynamic workout scaling
* Personalized recovery recommendations

This allows the platform to intelligently adjust training intensity, recommend recovery periods, and optimize progression while reducing the risk of burnout and overtraining.

---

## User Journey

1. User logs mood, recovery status, fitness goals, and daily constraints.
2. NLP pipelines process and analyze user inputs.
3. The decision engine evaluates fatigue, readiness, and historical trends.
4. An Adaptation Score is generated.
5. A personalized workout protocol is created.
6. Session outcomes are tracked to support long-term progression and wellness analytics.

---

## System Architecture

```text
User Input
      │
      ▼
NLP Pipeline
(Text Cleaning • Feature Extraction • Classification • Sentiment Analysis)
      │
      ▼
Agentic Decision Engine
(Constraint Evaluation • Adaptation Scoring • Recommendation Logic)
      │
      ▼
Dynamic Workout Generator
      │
      ▼
Progress Tracking & Analytics
```

---

## Agentic Decision Framework

The platform utilizes an agentic decision framework that evaluates user context and dynamically adjusts training recommendations.

### Inputs

* Mood logs
* Recovery and soreness reports
* Fitness goals
* Time availability
* Equipment constraints
* Historical performance data

### Adaptive Decisions

The system can:

* Scale workout intensity based on readiness and recovery.
* Modify exercise selection when soreness thresholds are reached.
* Adjust workout volume under time constraints.
* Recommend rest or active recovery days when fatigue patterns are detected.
* Balance short-term recovery needs with long-term progression goals.

---

## NLP & Intelligence Pipeline

The platform incorporates a modular NLP workflow designed to transform unstructured user inputs into structured decision signals.

### Core Capabilities

* Text cleaning and preprocessing
* Feature extraction
* Text classification
* Keyword analysis
* Sentiment analysis
* Constraint identification
* Context-aware recommendation support

The pipeline extracts important variables such as mood indicators, soreness levels, target muscle groups, time constraints, and equipment availability to support adaptive decision-making.

---

## Tech Stack

### Frontend

* React
* TypeScript

### Backend

* Python
* Streamlit
* Modular AI Services

### AI & Data

* Natural Language Processing (NLP)
* Text Classification
* Feature Extraction
* Sentiment Analysis
* Agentic Decision Logic
* Adaptive Recommendation Systems
* Model Integrations via Hugging Face

### Infrastructure

* Docker
* Google Cloud Platform (GCP)
* Google Cloud Run
* GitHub Actions
* VPC Networking

---

## Key Engineering Highlights

* Built a modular NLP pipeline for processing natural language wellness inputs.
* Designed an adaptive recommendation engine driven by contextual user signals.
* Implemented heuristic-based agentic decision logic for dynamic workout generation.
* Developed constraint-based reasoning workflows for personalized recommendations.
* Integrated sentiment analysis into fitness adaptation strategies.
* Containerized the application using Docker.
* Deployed scalable services using Google Cloud Run.
* Applied full-stack engineering principles across frontend, backend, AI, and cloud infrastructure.

---

## Future Enhancements

* Longitudinal performance forecasting
* Wearable device integrations
* Multi-agent wellness orchestration
* LLM-powered coaching assistant
* Advanced analytics dashboard
* Enhanced personalization models

---

## Live Demo

🔗 [https://form-progression-lab-851081595655.europe-west2.run.app/]



   ---

## Author

### Built by  Nsisong Akpaikpe as part of an exploration into adaptive wellness intelligence, NLP pipelines, and agentic decision systems.

The project demonstrates the application of AI, full-stack development, cloud deployment, and data-driven decision-making in a real-world wellness use case.
